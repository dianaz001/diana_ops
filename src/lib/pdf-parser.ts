import { pdfjsLib } from './pdf-worker-setup';
import type { LabReport, LabCategory, LabResult, LabStatus, Person } from '../types/health';

interface TextItem {
  str: string;
  x: number;
  y: number;
  width: number;
}

/** Position-aware text extraction from a page's text content layer */
function extractPositionAwareText(items: TextItem[]): string {
  if (items.length === 0) return '';

  // Sort by y descending (top of page first), then x ascending (left to right)
  items.sort((a, b) => {
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > 3) return yDiff;
    return a.x - b.x;
  });

  // Group items into lines based on y-position
  const lines: TextItem[][] = [];
  let currentLine: TextItem[] = [items[0]];
  let currentY = items[0].y;

  for (let j = 1; j < items.length; j++) {
    if (Math.abs(items[j].y - currentY) > 3) {
      lines.push(currentLine);
      currentLine = [items[j]];
      currentY = items[j].y;
    } else {
      currentLine.push(items[j]);
    }
  }
  lines.push(currentLine);

  // Convert lines to text, using spacing to separate columns
  const pageLines: string[] = [];
  for (const line of lines) {
    line.sort((a, b) => a.x - b.x);
    let lineText = '';
    for (let j = 0; j < line.length; j++) {
      if (j > 0) {
        const gap = line[j].x - (line[j - 1].x + line[j - 1].width);
        lineText += gap > 10 ? '\t' : (gap > 2 ? ' ' : '');
      }
      lineText += line[j].str;
    }
    pageLines.push(lineText);
  }
  return pageLines.join('\n');
}

/** Extract text from annotations (form fields, widget annotations) */
async function extractAnnotationText(page: { getAnnotations: () => Promise<any[]> }): Promise<string[]> {
  try {
    const annotations = await page.getAnnotations();
    const texts: string[] = [];
    for (const annot of annotations) {
      // Widget annotations (form fields) may contain values
      if (annot.fieldValue) {
        texts.push(String(annot.fieldValue));
      }
      // Some annotations have contents
      if (annot.contents) {
        texts.push(String(annot.contents));
      }
      // Rich text content
      if (annot.alternativeText) {
        texts.push(String(annot.alternativeText));
      }
    }
    return texts;
  } catch {
    return [];
  }
}

/** Try to extract text from the operator list (for text rendered via canvas operations) */
async function extractOperatorListText(page: { getOperatorList: () => Promise<{ fnArray: number[]; argsArray: any[] }> }): Promise<string[]> {
  try {
    const opList = await page.getOperatorList();
    const texts: string[] = [];
    // OPS.showText = 35, OPS.showSpacedText = 36, OPS.nextLineShowText = 37
    const textOps = new Set([35, 36, 37]);
    for (let i = 0; i < opList.fnArray.length; i++) {
      if (textOps.has(opList.fnArray[i])) {
        const args = opList.argsArray[i];
        if (Array.isArray(args)) {
          for (const arg of args) {
            if (typeof arg === 'string') {
              texts.push(arg);
            } else if (Array.isArray(arg)) {
              // showSpacedText has array of [string, number, string, number, ...]
              const parts = arg.filter((a: unknown) => typeof a === 'string');
              if (parts.length > 0) texts.push(parts.join(''));
            }
          }
        }
      }
    }
    return texts;
  } catch {
    return [];
  }
}

/** Extract all text from a PDF file, trying multiple extraction methods */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);

    // Method 1: Standard text content with position awareness
    const content = await page.getTextContent({ includeMarkedContent: true } as Parameters<typeof page.getTextContent>[0]);
    const items: TextItem[] = [];
    for (const item of content.items) {
      if (!('str' in item) || !('transform' in item)) continue;
      const typedItem = item as { str: string; transform: number[]; width: number };
      if (!typedItem.str.trim()) continue;
      items.push({
        str: typedItem.str,
        x: typedItem.transform[4],
        y: typedItem.transform[5],
        width: typedItem.width,
      });
    }
    let pageText = extractPositionAwareText(items);

    // Method 2: Try annotations if text content yielded very little
    const annotTexts = await extractAnnotationText(page);
    if (annotTexts.length > 0) {
      pageText += '\n---ANNOTATIONS---\n' + annotTexts.join('\n');
    }

    // Method 3: Try operator list if still very little text
    if (items.length < 10) {
      const opTexts = await extractOperatorListText(page);
      if (opTexts.length > 0) {
        pageText += '\n---OPLIST---\n' + opTexts.join('\n');
      }
    }

    pages.push(pageText);
  }

  return pages.join('\n---PAGE---\n');
}

/** Parse text that user pasted manually (from their PDF viewer's copy-paste) */
export function parseFromPastedText(text: string, fileName: string): LabReport | null {
  return parseLifeLabsReport(text, fileName);
}

// Common test name normalization map
const TEST_NAME_MAP: Record<string, string> = {
  'hdl cholesterol': 'HDL Cholesterol (Good)',
  'hdl-cholesterol': 'HDL Cholesterol (Good)',
  'hdl chol': 'HDL Cholesterol (Good)',
  'ldl cholesterol': 'LDL Cholesterol (Calculated)',
  'ldl cholesterol (calculated)': 'LDL Cholesterol (Calculated)',
  'ldl chol calculated': 'LDL Cholesterol (Calculated)',
  'non-hdl cholesterol': 'Non-HDL Cholesterol',
  'non hdl cholesterol': 'Non-HDL Cholesterol',
  'chol/hdl ratio': 'Chol/HDL Ratio',
  'cholesterol/hdl ratio': 'Chol/HDL Ratio',
  'cholesterol ratio': 'Chol/HDL Ratio',
  'total cholesterol': 'Total Cholesterol',
  'cholesterol': 'Total Cholesterol',
  'triglycerides': 'Triglycerides',
  'triglyceride': 'Triglycerides',
  'hemoglobin a1c': 'Hemoglobin A1C',
  'hba1c': 'Hemoglobin A1C',
  'a1c': 'Hemoglobin A1C',
  'glycated hemoglobin': 'Hemoglobin A1C',
  'creatinine': 'Creatinine',
  'egfr': 'eGFR (Kidney Function)',
  'estimated gfr': 'eGFR (Kidney Function)',
  'egfr (ckd-epi)': 'eGFR (Kidney Function)',
  'bilirubin total': 'Bilirubin Total',
  'bilirubin': 'Bilirubin Total',
  'alkaline phosphatase': 'Alkaline Phosphatase (ALP)',
  'alp': 'Alkaline Phosphatase (ALP)',
  'alt': 'ALT (Liver)',
  'alanine aminotransferase': 'ALT (Liver)',
  'ggt': 'Gamma Glutamyl Transferase (GGT)',
  'gamma glutamyl transferase': 'Gamma Glutamyl Transferase (GGT)',
  'vitamin b12': 'Vitamin B12',
  'b12': 'Vitamin B12',
  'ferritin': 'Ferritin',
  'tsh': 'TSH',
  'thyroid stimulating hormone': 'TSH',
  'free t3': 'Free T3',
  'free t4': 'Free T4',
  'hemoglobin': 'Hemoglobin',
  'hematocrit': 'Hematocrit',
  'leukocytes': 'Leukocytes (WBC)',
  'wbc': 'Leukocytes (WBC)',
  'white blood cells': 'Leukocytes (WBC)',
  'erythrocytes': 'Erythrocytes (RBC)',
  'rbc': 'Erythrocytes (RBC)',
  'red blood cells': 'Erythrocytes (RBC)',
  'platelets': 'Platelets',
  'platelet count': 'Platelets',
  'mcv': 'MCV',
  'mean corpuscular volume': 'MCV',
  'neutrophils': 'Neutrophils',
};

// Category detection patterns
const CATEGORY_PATTERNS: { id: string; name: string; icon: string; keywords: string[] }[] = [
  {
    id: 'lipids',
    name: 'Lipid Assessment (Cholesterol)',
    icon: '🩸',
    keywords: ['cholesterol', 'hdl', 'ldl', 'triglyceride', 'lipid', 'chol/hdl'],
  },
  {
    id: 'metabolic',
    name: 'Metabolic, Liver & Kidney Function',
    icon: '🧪',
    keywords: ['a1c', 'creatinine', 'egfr', 'bilirubin', 'alp', 'alt', 'ggt', 'glucose', 'alkaline'],
  },
  {
    id: 'vitamins',
    name: 'Vitamins, Iron & Thyroid',
    icon: '🧬',
    keywords: ['b12', 'vitamin', 'ferritin', 'tsh', 'free t3', 'free t4', 'iron', 'thyroid'],
  },
  {
    id: 'cbc',
    name: 'Complete Blood Count (CBC)',
    icon: '🔬',
    keywords: ['hemoglobin', 'hematocrit', 'wbc', 'rbc', 'platelet', 'mcv', 'neutrophil', 'leukocyte', 'erythrocyte'],
  },
  {
    id: 'urinalysis',
    name: 'Urinalysis & Cytology',
    icon: '💧',
    keywords: ['urine', 'urinalysis', 'hpv', 'cytology', 'specific gravity'],
  },
];

function normalizeTestName(raw: string): string {
  const lower = raw.toLowerCase().trim();
  return TEST_NAME_MAP[lower] || raw.trim();
}

function categorizeTest(testName: string): string {
  const lower = testName.toLowerCase();
  for (const cat of CATEGORY_PATTERNS) {
    if (cat.keywords.some((kw) => lower.includes(kw))) {
      return cat.id;
    }
  }
  return 'other';
}

function determineStatus(value: number | undefined, refRange: string | undefined, flag: string): { status: LabStatus; statusLabel: string } {
  if (flag === 'H' || flag === 'HH') {
    return { status: flag === 'HH' ? 'danger' : 'warning', statusLabel: 'High' };
  }
  if (flag === 'L' || flag === 'LL') {
    return { status: flag === 'LL' ? 'danger' : 'warning', statusLabel: 'Low' };
  }
  if (flag === 'A' || flag === 'ABN') {
    return { status: 'warning', statusLabel: 'Abnormal' };
  }

  // Try to check against reference range
  if (value !== undefined && refRange) {
    const rangeMatch = refRange.match(/([\d.]+)\s*-\s*([\d.]+)/);
    if (rangeMatch) {
      const low = parseFloat(rangeMatch[1]);
      const high = parseFloat(rangeMatch[2]);
      if (value < low) return { status: 'warning', statusLabel: 'Low' };
      if (value > high) return { status: 'warning', statusLabel: 'High' };
    }
    const lessThanMatch = refRange.match(/<\s*([\d.]+)/);
    if (lessThanMatch) {
      const max = parseFloat(lessThanMatch[1]);
      if (value > max) return { status: 'warning', statusLabel: 'High' };
    }
    const greaterThanMatch = refRange.match(/>\s*([\d.]+)/);
    if (greaterThanMatch) {
      const min = parseFloat(greaterThanMatch[1]);
      if (value < min) return { status: 'warning', statusLabel: 'Low' };
    }
  }

  return { status: 'normal', statusLabel: 'Normal' };
}

function extractNumericValue(valueStr: string): number | undefined {
  const match = valueStr.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : undefined;
}

function extractUnit(valueStr: string): string {
  const match = valueStr.match(/[\d.]+\s*(.+)/);
  return match ? match[1].trim() : '';
}

function detectPerson(text: string): Person | undefined {
  const upper = text.toUpperCase();
  if (upper.includes('ELIZABETH') || upper.includes(' LIZ ') || upper.includes('ZARAZA, LIZ') || upper.includes('LIZ ZARAZA') || upper.includes('MIRYAM') || upper.includes('RIVERA')) {
    return 'liz';
  }
  if (upper.includes('JULIAN') || upper.includes('ZARAZA, JULIAN')) {
    return 'julian';
  }
  return undefined;
}

function extractDate(text: string): string | undefined {
  // Try to find a collection/reported date first (not DOB or printed date)
  const collectedMatch = text.match(/(?:collected|reported|collection date|received)[:\s]*(\d{4}-\d{2}-\d{2})/i);
  if (collectedMatch) return collectedMatch[1];
  const collectedMatch2 = text.match(/(?:collected|reported|collection date|received)[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/i);
  if (collectedMatch2) {
    const d = new Date(collectedMatch2[1]);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }

  // "Printed on YYYY-MM-DD" - use as fallback (report print date)
  const printedMatch = text.match(/Printed on\s+(\d{4}-\d{2}-\d{2})/i);
  if (printedMatch) return printedMatch[1];

  // Generic ISO date - but skip DOB
  const isoMatch = text.match(/(?<!DOB:\s*)(\d{4}-\d{2}-\d{2})(?!.*DOB)/);
  if (isoMatch) return isoMatch[1];

  // Pattern: DD/MM/YYYY or MM/DD/YYYY
  const slashMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const [, a, b, year] = slashMatch;
    // Assume DD/MM/YYYY for Canadian labs
    const day = parseInt(a) > 12 ? a : b;
    const month = parseInt(a) > 12 ? b : a;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Pattern: Mon DD, YYYY (e.g., "Feb 12, 2026")
  const monthNames: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  };
  const namedMatch = text.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i);
  if (namedMatch) {
    const month = monthNames[namedMatch[1].toLowerCase().slice(0, 3)];
    const day = namedMatch[2].padStart(2, '0');
    return `${namedMatch[3]}-${month}-${day}`;
  }

  return undefined;
}

function extractReportId(text: string): string {
  // LifeLabs format: look for report number patterns
  const patterns = [
    /(?:report|accession|requisition)[:\s#]*([A-Z0-9-]+)/i,
    /(\d{4}-[A-Z]{2}\d{5,})/,
    /([A-Z]{2,}\d{6,})/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return `RPT-${Date.now()}`;
}

function extractProvider(text: string): string {
  if (text.toUpperCase().includes('LIFELABS')) return 'LifeLabs';
  if (text.toUpperCase().includes('DYNACARE')) return 'Dynacare';
  const providerMatch = text.match(/(?:laboratory|lab|provider)[:\s]*([^\n]+)/i);
  return providerMatch ? providerMatch[1].trim() : 'Unknown Lab';
}

function extractOrderedBy(text: string): string {
  const patterns = [
    /(?:ordered by|requesting physician|physician|doctor|dr\.?)[:\s]*([^\n]+)/i,
    /(?:collected by|practitioner)[:\s]*([^\n]+)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return 'Unknown';
}

/**
 * Parse a single line that looks like a test result.
 * Handles both tab-separated columns and space-separated formats.
 * Common formats:
 *   Tab-separated: "Test Name\tValue\tUnit\tRef Range\tFlag"
 *   Space-separated: "Test Name  1.23  mmol/L  0.50 - 2.00"
 */
function parseResultLine(line: string): { testName: string; value: string; unit: string; refRange: string; flag: string } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length < 3) return null;

  // Skip header/footer lines
  const skipPatterns = /^(patient|printed|page|share your|displayed|network|for reference|test name|component|result|reference|status|flag|collected|reported|ordered|requisition|accession|specimen|sex:|age:|dob:)/i;
  if (skipPatterns.test(trimmed)) return null;

  // Try tab-separated columns first (from position-aware extraction)
  if (trimmed.includes('\t')) {
    const cols = trimmed.split('\t').map((c) => c.trim()).filter(Boolean);
    if (cols.length >= 2) {
      return parseColumns(cols);
    }
  }

  // Try space-separated with clean structure
  const clean = trimmed.replace(/\s+/g, ' ');

  // Pattern: "Test Name  1.23  mmol/L  0.50 - 2.00  H"
  const structuredMatch = clean.match(
    /^(.+?)\s+([\d.<>]+)\s+([a-zA-Z/%]+(?:\/[a-zA-Z]+)?(?:\s*x\s*E\d+\/[a-zA-Z]+)?)\s*([\d.]+ ?- ?[\d.]+\s*[a-zA-Z/%]*(?:\/[a-zA-Z]+)?)?\s*([HLA]{0,2})?$/i
  );
  if (structuredMatch) {
    return {
      testName: structuredMatch[1].trim(),
      value: `${structuredMatch[2]} ${structuredMatch[3]}`,
      unit: structuredMatch[3],
      refRange: structuredMatch[4] || '',
      flag: structuredMatch[5] || '',
    };
  }

  // Pattern: "Test Name  1.23  mmol/L"
  const simpleMatch = clean.match(
    /^(.+?)\s+([\d.<>]+)\s+([a-zA-Z/%]+(?:\/[a-zA-Z]+)?)/
  );
  if (simpleMatch) {
    return {
      testName: simpleMatch[1].trim(),
      value: `${simpleMatch[2]} ${simpleMatch[3]}`,
      unit: simpleMatch[3],
      refRange: '',
      flag: '',
    };
  }

  // Pattern for qualitative results: "Test Name  NEGATIVE"
  const qualMatch = clean.match(
    /^(.+?)\s+(NEGATIVE|POSITIVE|NO GROWTH|NORMAL|ABNORMAL|REACTIVE|NON-REACTIVE|DETECTED|NOT DETECTED|ABSENT|PRESENT|TRACE|CLEAR|YELLOW|STRAW)/i
  );
  if (qualMatch) {
    return {
      testName: qualMatch[1].trim(),
      value: qualMatch[2].toUpperCase(),
      unit: '',
      refRange: '',
      flag: '',
    };
  }

  return null;
}

/** Parse columns from a tab-separated line */
function parseColumns(cols: string[]): { testName: string; value: string; unit: string; refRange: string; flag: string } | null {
  // Try to identify which column is what
  // Common layouts:
  // [TestName, Value, Unit, RefRange, Flag]
  // [TestName, Value+Unit, RefRange, Flag]
  // [TestName, Value, RefRange]
  // [TestName, Value]
  const testName = cols[0];
  if (!testName || testName.length < 2) return null;

  // Skip if first column looks like a date or number only
  if (/^\d{4}-\d{2}-\d{2}$/.test(testName)) return null;
  if (/^\d+$/.test(testName)) return null;

  let value = '';
  let unit = '';
  let refRange = '';
  let flag = '';

  // Second column is typically the value (possibly with unit)
  if (cols.length >= 2) {
    const valCol = cols[1];
    const valMatch = valCol.match(/^([<>]?\s*[\d.]+)\s*(.*)$/);
    if (valMatch) {
      value = valCol;
      unit = valMatch[2]?.trim() || '';
    } else {
      // Might be qualitative
      value = valCol;
    }
  }

  // Look through remaining columns for unit, reference range, and flag
  for (let i = 2; i < cols.length; i++) {
    const col = cols[i].trim();
    if (!col) continue;

    // Flag pattern (H, L, HH, LL, A, etc.)
    if (/^[HLA]{1,2}$/.test(col)) {
      flag = col;
      continue;
    }

    // Reference range pattern: "0.50 - 2.00" or "< 1.70" or "> 60"
    if (/[\d.]+\s*-\s*[\d.]/.test(col) || /^[<>]\s*[\d.]+/.test(col)) {
      refRange = col;
      continue;
    }

    // Unit pattern (letters, /, %)
    if (/^[a-zA-Z/%]+(?:\/[a-zA-Z]+)?$/.test(col) || /x\s*E\d+\//.test(col) || /^\d*\.?\d*\s*[a-zA-Z/%]+(?:\/[a-zA-Z]+)?$/.test(col)) {
      if (!unit) {
        unit = col;
        if (!value.includes(unit)) value = `${value} ${unit}`.trim();
      }
      continue;
    }
  }

  if (!value) return null;

  return { testName, value, unit, refRange, flag };
}

/** Parse extracted PDF text into a LabReport structure */
export function parseLifeLabsReport(text: string, fileName: string): LabReport | null {
  if (!text || text.trim().length < 20) return null;

  const date = extractDate(text) || new Date().toISOString().slice(0, 10);
  const person = detectPerson(text);
  const reportId = extractReportId(text);
  const provider = extractProvider(text);
  const orderedBy = extractOrderedBy(text);

  // Split into lines (remove page markers) and try to parse each as a result
  const lines = text.replace(/---PAGE---/g, '\n').split(/[\n\r]+/);
  const parsedResults: { result: LabResult; categoryId: string }[] = [];

  for (const line of lines) {
    const parsed = parseResultLine(line);
    if (!parsed) continue;

    const testName = normalizeTestName(parsed.testName);
    const numericValue = extractNumericValue(parsed.value);
    const unit = parsed.unit || extractUnit(parsed.value);
    const { status, statusLabel } = determineStatus(numericValue, parsed.refRange, parsed.flag);
    const categoryId = categorizeTest(testName);

    parsedResults.push({
      categoryId,
      result: {
        testName,
        valueSI: parsed.value,
        valueStandard: parsed.value,
        referenceRange: parsed.refRange || undefined,
        status,
        statusLabel,
        numericValue,
        unit,
      },
    });
  }

  if (parsedResults.length === 0) return null;

  // Group results into categories
  const categoryMap = new Map<string, LabResult[]>();
  for (const { categoryId, result } of parsedResults) {
    if (!categoryMap.has(categoryId)) categoryMap.set(categoryId, []);
    categoryMap.get(categoryId)!.push(result);
  }

  const categories: LabCategory[] = [];
  for (const [catId, results] of categoryMap) {
    const catDef = CATEGORY_PATTERNS.find((c) => c.id === catId) || {
      id: catId,
      name: catId === 'other' ? 'Other Tests' : catId,
      icon: '📋',
    };
    categories.push({
      id: catDef.id,
      name: catDef.name,
      icon: catDef.icon,
      results,
    });
  }

  // Sort categories to match the defined order
  const catOrder = CATEGORY_PATTERNS.map((c) => c.id);
  categories.sort((a, b) => {
    const ai = catOrder.indexOf(a.id);
    const bi = catOrder.indexOf(b.id);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return {
    id: `${date}-${reportId}`,
    date,
    person: person || 'liz', // default, user can change in preview
    reportId,
    provider,
    orderedBy,
    specimen: provider,
    categories,
    source: 'uploaded',
    uploadedAt: new Date().toISOString(),
    rawFileName: fileName,
  };
}

/** Parse multiple PDF files, returning results, errors, and raw text for debugging */
export async function parseMultiplePDFs(
  files: File[]
): Promise<{ reports: LabReport[]; errors: { fileName: string; error: string }[]; rawTexts: { fileName: string; text: string }[] }> {
  const reports: LabReport[] = [];
  const errors: { fileName: string; error: string }[] = [];
  const rawTexts: { fileName: string; text: string }[] = [];

  for (const file of files) {
    try {
      const text = await extractTextFromPDF(file);
      rawTexts.push({ fileName: file.name, text });
      const report = parseLifeLabsReport(text, file.name);
      if (report) {
        reports.push(report);
      } else {
        errors.push({
          fileName: file.name,
          error: 'Could not extract lab results from this file. The format may not be recognized.',
        });
      }
    } catch (err) {
      errors.push({
        fileName: file.name,
        error: err instanceof Error ? err.message : 'Failed to read PDF file.',
      });
    }
  }

  return { reports, errors, rawTexts };
}

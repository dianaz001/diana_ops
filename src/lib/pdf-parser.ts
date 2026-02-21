import { pdfjsLib } from './pdf-worker-setup';
import type { LabReport, LabCategory, LabResult, LabStatus, Person } from '../types/health';

/** Extract all text from a PDF file */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? (item as { str: string }).str : ''))
      .join(' ');
    pages.push(text);
  }

  return pages.join('\n');
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
  if (upper.includes('ELIZABETH') || upper.includes(' LIZ ') || upper.includes('ZARAZA, LIZ') || upper.includes('LIZ ZARAZA')) {
    return 'liz';
  }
  if (upper.includes('JULIAN') || upper.includes('ZARAZA, JULIAN')) {
    return 'julian';
  }
  return undefined;
}

function extractDate(text: string): string | undefined {
  // Try various date patterns
  // Pattern: YYYY-MM-DD
  const isoMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
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
 * LifeLabs typically formats results as:
 * TestName   Value   Unit   ReferenceRange   Flag
 */
function parseResultLine(line: string): { testName: string; value: string; unit: string; refRange: string; flag: string } | null {
  // Clean up extra whitespace
  const clean = line.replace(/\s+/g, ' ').trim();
  if (!clean || clean.length < 5) return null;

  // Try structured pattern: test name followed by numeric value
  // Pattern: "Test Name  1.23  mmol/L  0.50 - 2.00  "
  const structuredMatch = clean.match(
    /^(.+?)\s+([\d.]+)\s+([a-zA-Z/%]+(?:\/[a-zA-Z]+)?(?:\s*x\s*E\d+\/[a-zA-Z]+)?)\s*([\d.]+ - [\d.]+\s*[a-zA-Z/%]*(?:\/[a-zA-Z]+)?)?\s*([HLAB]*)?$/i
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

  // Simpler pattern: Test Name  Value Unit
  const simpleMatch = clean.match(
    /^(.+?)\s+([\d.]+)\s+([a-zA-Z/%]+(?:\/[a-zA-Z]+)?)/
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

  // Pattern for qualitative results: Test Name  NEGATIVE/POSITIVE/etc
  const qualMatch = clean.match(
    /^(.+?)\s+(NEGATIVE|POSITIVE|NO GROWTH|NORMAL|ABNORMAL|REACTIVE|NON-REACTIVE|DETECTED|NOT DETECTED)/i
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

/** Parse extracted PDF text into a LabReport structure */
export function parseLifeLabsReport(text: string, fileName: string): LabReport | null {
  if (!text || text.trim().length < 20) return null;

  const date = extractDate(text) || new Date().toISOString().slice(0, 10);
  const person = detectPerson(text);
  const reportId = extractReportId(text);
  const provider = extractProvider(text);
  const orderedBy = extractOrderedBy(text);

  // Split into lines and try to parse each as a result
  const lines = text.split(/[\n\r]+/);
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

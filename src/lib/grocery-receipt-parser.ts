import { extractTextFromPDF } from './pdf-parser';
import { categorizeItem } from './grocery-categorizer';
import type { ParsedReceipt, ParsedReceiptItem } from '../types/grocery';

// ── Store name detection ────────────────────────────

const KNOWN_STORES: { pattern: RegExp; name: string }[] = [
  { pattern: /walmart/i, name: 'Walmart' },
  { pattern: /costco/i, name: 'Costco' },
  { pattern: /target/i, name: 'Target' },
  { pattern: /kroger/i, name: 'Kroger' },
  { pattern: /safeway/i, name: 'Safeway' },
  { pattern: /whole\s*foods/i, name: 'Whole Foods' },
  { pattern: /trader\s*joe/i, name: "Trader Joe's" },
  { pattern: /aldi/i, name: 'Aldi' },
  { pattern: /publix/i, name: 'Publix' },
  { pattern: /h[\s-]*e[\s-]*b/i, name: 'H-E-B' },
  { pattern: /wegmans/i, name: 'Wegmans' },
  { pattern: /loblaws/i, name: 'Loblaws' },
  { pattern: /no\s*frills/i, name: 'No Frills' },
  { pattern: /superstore/i, name: 'Real Canadian Superstore' },
  { pattern: /metro(?:\s|$)/i, name: 'Metro' },
  { pattern: /freshco/i, name: 'FreshCo' },
  { pattern: /food\s*basics/i, name: 'Food Basics' },
  { pattern: /sobeys/i, name: 'Sobeys' },
  { pattern: /save[\s-]*on/i, name: 'Save-On-Foods' },
  { pattern: /amazon\s*fresh/i, name: 'Amazon Fresh' },
  { pattern: /instacart/i, name: 'Instacart' },
  { pattern: /exito/i, name: 'Exito' },
  { pattern: /jumbo/i, name: 'Jumbo' },
  { pattern: /carulla/i, name: 'Carulla' },
  { pattern: /d1\b/i, name: 'D1' },
  { pattern: /ara\b/i, name: 'Ara' },
];

function detectStore(text: string): string {
  for (const { pattern, name } of KNOWN_STORES) {
    if (pattern.test(text)) return name;
  }
  // Try first non-empty line as store name
  const firstLine = text.split('\n').find((l) => l.trim().length > 2);
  if (firstLine && firstLine.trim().length < 40) return firstLine.trim();
  return 'Unknown Store';
}

// ── Date extraction ─────────────────────────────────

function extractReceiptDate(text: string): string {
  // Common receipt date patterns
  const patterns = [
    // MM/DD/YYYY or DD/MM/YYYY
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    // YYYY-MM-DD
    /(\d{4})-(\d{2})-(\d{2})/,
    // Mon DD, YYYY
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s.]+(\d{1,2}),?\s*(\d{4})/i,
    // DD Mon YYYY
    /(\d{1,2})[\s.-]+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s.-]+(\d{4})/i,
    // MM-DD-YYYY
    /(\d{1,2})-(\d{1,2})-(\d{4})/,
  ];

  const monthNames: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  };

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;

    // ISO format
    if (/^\d{4}$/.test(match[1])) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }

    // Named month first: Mon DD, YYYY
    if (/^[a-zA-Z]/.test(match[1])) {
      const month = monthNames[match[1].toLowerCase().slice(0, 3)];
      if (month) return `${match[3]}-${month}-${match[2].padStart(2, '0')}`;
    }

    // DD Mon YYYY
    if (match[2] && /^[a-zA-Z]/.test(match[2])) {
      const month = monthNames[match[2].toLowerCase().slice(0, 3)];
      if (month) return `${match[3]}-${month}-${match[1].padStart(2, '0')}`;
    }

    // Numeric: assume MM/DD/YYYY (US style) unless day > 12
    const a = parseInt(match[1]);
    const b = parseInt(match[2]);
    const year = match[3];
    if (a > 12) {
      // DD/MM/YYYY
      return `${year}-${String(b).padStart(2, '0')}-${String(a).padStart(2, '0')}`;
    }
    // MM/DD/YYYY
    return `${year}-${String(a).padStart(2, '0')}-${String(b).padStart(2, '0')}`;
  }

  return new Date().toISOString().slice(0, 10);
}

// ── Tax and total extraction ────────────────────────

interface ReceiptTotals {
  subtotal: number;
  tax: number;
  total: number;
}

function extractTotals(text: string): ReceiptTotals {
  const lines = text.split('\n');
  let subtotal = 0;
  let tax = 0;
  let total = 0;

  for (const line of lines) {
    const lower = line.toLowerCase();
    const priceMatch = line.match(/\$?\s*([\d,]+\.\d{2})/);
    if (!priceMatch) continue;
    const amount = parseFloat(priceMatch[1].replace(',', ''));

    if (/\b(sub\s*total|subtotal)\b/i.test(lower)) {
      subtotal = amount;
    } else if (/\b(tax|hst|gst|pst|sales tax|state tax|county tax)\b/i.test(lower)) {
      tax += amount;
    } else if (/\b(total|amount due|balance|grand total)\b/i.test(lower) && !lower.includes('sub')) {
      total = amount;
    }
  }

  // Infer missing values
  if (total > 0 && subtotal === 0 && tax > 0) {
    subtotal = total - tax;
  }
  if (total === 0 && subtotal > 0) {
    total = subtotal + tax;
  }

  return { subtotal, tax, total };
}

// ── Line item parsing ───────────────────────────────

function parseLineItems(text: string): ParsedReceiptItem[] {
  const lines = text.split('\n');
  const items: ParsedReceiptItem[] = [];

  // Skip lines that are totals, headers, or non-item lines
  const skipPatterns = /^(sub\s*total|subtotal|total|tax|hst|gst|pst|sales tax|balance|amount|change|cash|credit|debit|visa|master|amex|card|payment|thank|welcome|store|address|phone|tel|receipt|transaction|date|time|cashier|register|terminal|\*{2,}|={2,}|-{3,}|\s*$)/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 3) continue;
    if (skipPatterns.test(trimmed)) continue;

    // Pattern: ITEM NAME ... $PRICE (or PRICE at end)
    // Try multiple patterns

    // Pattern 1: "ITEM NAME    $12.34" or "ITEM NAME    12.34"
    const priceAtEnd = trimmed.match(/^(.+?)\s+\$?\s*([\d,]+\.\d{2})\s*[A-Z]?\s*$/);
    if (priceAtEnd) {
      const name = priceAtEnd[1].trim();
      const price = parseFloat(priceAtEnd[2].replace(',', ''));

      // Skip if name looks like a total/header
      if (skipPatterns.test(name)) continue;
      if (price <= 0) continue;

      // Check for quantity prefix: "2 x ITEM" or "2 @ $3.99"
      const qtyMatch = name.match(/^(\d+)\s*[x@]\s*(.+)/i);
      let quantity = 1;
      let itemName = name;

      if (qtyMatch) {
        quantity = parseInt(qtyMatch[1]);
        itemName = qtyMatch[2].trim();
      }

      // Remove trailing letter codes (tax indicators like F, H, T)
      itemName = itemName.replace(/\s+[A-Z]\s*$/, '').trim();

      if (itemName.length >= 2) {
        items.push({
          name: titleCase(itemName),
          price,
          quantity,
          category: categorizeItem(itemName),
        });
      }
      continue;
    }

    // Pattern 2: "$12.34  ITEM NAME" (price first)
    const priceFirst = trimmed.match(/^\$?\s*([\d,]+\.\d{2})\s+(.+)/);
    if (priceFirst) {
      const price = parseFloat(priceFirst[1].replace(',', ''));
      const name = priceFirst[2].trim();

      if (skipPatterns.test(name)) continue;
      if (price <= 0 || name.length < 2) continue;

      items.push({
        name: titleCase(name),
        price,
        quantity: 1,
        category: categorizeItem(name),
      });
    }
  }

  return items;
}

function titleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (c) => c.toUpperCase())
    .replace(/\b(Or|And|Of|The|A|An|In|On|At|To|For|Is|It)\b/g, (w) => w.toLowerCase())
    .replace(/^\w/, (c) => c.toUpperCase());
}

// ── Main parser ─────────────────────────────────────

/**
 * Parse a grocery receipt PDF into structured data.
 * Extracts store, date, items, tax, and totals.
 */
export async function parseGroceryReceipt(file: File): Promise<ParsedReceipt> {
  const rawText = await extractTextFromPDF(file);

  const store_name = detectStore(rawText);
  const receipt_date = extractReceiptDate(rawText);
  const items = parseLineItems(rawText);
  const totals = extractTotals(rawText);

  // If we parsed items but no subtotal, sum them up
  if (totals.subtotal === 0 && items.length > 0) {
    totals.subtotal = items.reduce((sum, item) => sum + item.price, 0);
  }
  if (totals.total === 0) {
    totals.total = totals.subtotal + totals.tax;
  }

  // Round item prices
  for (const item of items) {
    item.price = Math.round(item.price * 100) / 100;
  }

  return {
    store_name,
    receipt_date,
    items,
    subtotal: Math.round(totals.subtotal * 100) / 100,
    tax: Math.round(totals.tax * 100) / 100,
    total: Math.round(totals.total * 100) / 100,
    raw_text: rawText,
  };
}

/**
 * Parse receipt from pasted text (no PDF)
 */
export function parseGroceryReceiptFromText(text: string): ParsedReceipt {
  const store_name = detectStore(text);
  const receipt_date = extractReceiptDate(text);
  const items = parseLineItems(text);
  const totals = extractTotals(text);

  if (totals.subtotal === 0 && items.length > 0) {
    totals.subtotal = items.reduce((sum, item) => sum + item.price, 0);
  }
  if (totals.total === 0) {
    totals.total = totals.subtotal + totals.tax;
  }

  return {
    store_name,
    receipt_date,
    items,
    subtotal: Math.round(totals.subtotal * 100) / 100,
    tax: Math.round(totals.tax * 100) / 100,
    total: Math.round(totals.total * 100) / 100,
    raw_text: text,
  };
}

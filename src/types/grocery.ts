// ── Grocery Expense Tracker Types ────────────────────

export type GroceryCategory =
  | 'fruits_veggies'
  | 'legumes_grains'
  | 'dairy'
  | 'meats_seafood'
  | 'cleaning_household'
  | 'protein_supplements'
  | 'beverages'
  | 'snacks_sweets'
  | 'bakery_bread'
  | 'frozen_prepared'
  | 'condiments_spices'
  | 'personal_care'
  | 'other';

export interface GroceryCategoryInfo {
  id: GroceryCategory;
  label: string;
  color: string;       // chart fill color
  keywords: string[];  // for auto-categorization
}

export interface GroceryItem {
  id: string;
  receipt_id: string | null;
  name: string;
  price: number;
  quantity: number;
  unit_price: number | null;
  category: GroceryCategory;
  tax_amount: number;
  owner: 'diana' | 'shared';
  item_date: string;   // YYYY-MM-DD
  is_manual: boolean;
  notes: string | null;
  created_at: string;
}

export interface GroceryReceipt {
  id: string;
  store_name: string;
  receipt_date: string; // YYYY-MM-DD
  subtotal: number;
  tax: number;
  total: number;
  raw_text: string | null;
  owner: 'diana' | 'shared';
  created_at: string;
  updated_at: string;
  items?: GroceryItem[];
}

export interface ParsedReceiptItem {
  name: string;
  price: number;
  quantity: number;
  category: GroceryCategory;
}

export interface ParsedReceipt {
  store_name: string;
  receipt_date: string;
  items: ParsedReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  raw_text: string;
}

// Dashboard aggregation types
export interface MonthlySpend {
  month: string;        // "Jan", "Feb", etc.
  monthKey: string;     // "2026-01"
  fruits_veggies: number;
  legumes_grains: number;
  dairy: number;
  meats_seafood: number;
  cleaning_household: number;
  protein_supplements: number;
  beverages: number;
  snacks_sweets: number;
  bakery_bread: number;
  frozen_prepared: number;
  condiments_spices: number;
  personal_care: number;
  other: number;
  total: number;
  itemCount: number;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
  category: GroceryCategory;
}

// Filter state
export interface GroceryFilters {
  year: number;
  month: number | null;      // null = all months
  category: GroceryCategory | null;
  owner: 'diana' | 'shared' | null;
  store: string | null;
  granularity: 'monthly' | 'quarterly' | 'annual';
  viewMode: 'category' | 'store';
}

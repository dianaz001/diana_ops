import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type {
  GroceryItem,
  GroceryReceipt,
  GroceryFilters,
  GroceryCategory,
  ParsedReceipt,
  MonthlySpend,
  CategoryBreakdown,
} from '../types/grocery';
import { getCategoryLabel } from '../lib/grocery-categorizer';

// ── Helper: month short name ────────────────────────
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ── Store interface ─────────────────────────────────

interface GroceryState {
  items: GroceryItem[];
  receipts: GroceryReceipt[];
  isLoading: boolean;
  error: string | null;
  filters: GroceryFilters;

  // Actions
  fetchItems: () => Promise<void>;
  fetchReceipts: () => Promise<void>;
  saveReceipt: (parsed: ParsedReceipt, owner: 'diana' | 'shared') => Promise<string | null>;
  addManualItem: (item: Omit<GroceryItem, 'id' | 'created_at'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<GroceryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
  setFilters: (filters: Partial<GroceryFilters>) => void;

  // Computed data
  getFilteredItems: () => GroceryItem[];
  getMonthlyData: () => MonthlySpend[];
  getCategoryBreakdown: () => CategoryBreakdown[];
  getTotalSpend: () => number;
  getItemCount: () => number;
  getAvgPerTrip: () => number;
  getStores: () => string[];
}

export const useGroceryStore = create<GroceryState>((set, get) => ({
  items: [],
  receipts: [],
  isLoading: false,
  error: null,
  filters: {
    year: new Date().getFullYear(),
    month: null,
    category: null,
    owner: null,
    store: null,
    granularity: 'monthly',
    viewMode: 'category',
  },

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('grocery_items')
        .select('*')
        .order('item_date', { ascending: false });

      if (error) throw error;
      set({ items: (data || []) as GroceryItem[], isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch items', isLoading: false });
    }
  },

  fetchReceipts: async () => {
    try {
      const { data, error } = await supabase
        .from('grocery_receipts')
        .select('*')
        .order('receipt_date', { ascending: false });

      if (error) throw error;
      set({ receipts: (data || []) as GroceryReceipt[] });
    } catch (err) {
      console.error('Failed to fetch receipts:', err);
    }
  },

  saveReceipt: async (parsed: ParsedReceipt, owner) => {
    set({ isLoading: true, error: null });
    try {
      // Insert receipt
      const { data: receipt, error: receiptErr } = await supabase
        .from('grocery_receipts')
        .insert({
          store_name: parsed.store_name,
          receipt_date: parsed.receipt_date,
          subtotal: parsed.subtotal,
          tax: parsed.tax,
          total: parsed.total,
          raw_text: parsed.raw_text,
          owner,
        })
        .select()
        .single();

      if (receiptErr) throw receiptErr;

      // Calculate tax per item proportionally
      const taxRate = parsed.subtotal > 0 ? parsed.tax / parsed.subtotal : 0;

      // Insert items
      const itemRows = parsed.items.map((item) => ({
        receipt_id: receipt.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit_price: item.quantity > 0 ? Math.round((item.price / item.quantity) * 100) / 100 : item.price,
        category: item.category,
        tax_amount: Math.round(item.price * taxRate * 100) / 100,
        owner,
        item_date: parsed.receipt_date,
        is_manual: false,
      }));

      if (itemRows.length > 0) {
        const { error: itemsErr } = await supabase
          .from('grocery_items')
          .insert(itemRows);

        if (itemsErr) throw itemsErr;
      }

      // Refresh data
      await get().fetchItems();
      await get().fetchReceipts();
      set({ isLoading: false });
      return receipt.id as string;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to save receipt', isLoading: false });
      return null;
    }
  },

  addManualItem: async (item) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('grocery_items')
        .insert({
          ...item,
          is_manual: true,
          unit_price: item.quantity > 0 ? Math.round((item.price / item.quantity) * 100) / 100 : item.price,
        });

      if (error) throw error;
      await get().fetchItems();
      set({ isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add item', isLoading: false });
    }
  },

  updateItem: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('grocery_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await get().fetchItems();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update item' });
    }
  },

  deleteItem: async (id) => {
    try {
      const { error } = await supabase
        .from('grocery_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete item' });
    }
  },

  deleteReceipt: async (id) => {
    try {
      const { error } = await supabase
        .from('grocery_receipts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().fetchItems();
      await get().fetchReceipts();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete receipt' });
    }
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  // ── Computed ──────────────────────────────────────

  getFilteredItems: () => {
    const { items, filters } = get();
    return items.filter((item) => {
      const itemYear = new Date(item.item_date).getFullYear();
      if (itemYear !== filters.year) return false;
      if (filters.month !== null) {
        const itemMonth = new Date(item.item_date).getMonth();
        if (itemMonth !== filters.month) return false;
      }
      if (filters.category && item.category !== filters.category) return false;
      if (filters.owner && item.owner !== filters.owner) return false;
      return true;
    });
  },

  getMonthlyData: () => {
    const filtered = get().getFilteredItems();
    const { filters } = get();

    // Group by month
    const monthMap = new Map<string, MonthlySpend>();

    // Initialize all months for the year
    for (let m = 0; m < 12; m++) {
      const key = `${filters.year}-${String(m + 1).padStart(2, '0')}`;
      monthMap.set(key, {
        month: MONTH_NAMES[m],
        monthKey: key,
        fruits_veggies: 0,
        legumes_grains: 0,
        dairy: 0,
        meats_seafood: 0,
        cleaning_household: 0,
        protein_supplements: 0,
        beverages: 0,
        snacks_sweets: 0,
        bakery_bread: 0,
        frozen_prepared: 0,
        condiments_spices: 0,
        personal_care: 0,
        other: 0,
        total: 0,
        itemCount: 0,
      });
    }

    for (const item of filtered) {
      const d = new Date(item.item_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const row = monthMap.get(key);
      if (!row) continue;

      const amount = item.price + item.tax_amount;
      const cat = item.category as keyof MonthlySpend;
      if (cat in row && typeof row[cat] === 'number') {
        (row[cat] as number) += amount;
      }
      row.total += amount;
      row.itemCount += 1;
    }

    // Round all values
    return Array.from(monthMap.values()).map((row) => {
      const rounded = { ...row };
      for (const key of Object.keys(rounded)) {
        const val = rounded[key as keyof MonthlySpend];
        if (typeof val === 'number' && key !== 'itemCount') {
          (rounded as Record<string, unknown>)[key] = Math.round(val * 100) / 100;
        }
      }
      return rounded;
    });
  },

  getCategoryBreakdown: () => {
    const filtered = get().getFilteredItems();
    const catMap = new Map<GroceryCategory, number>();

    for (const item of filtered) {
      const current = catMap.get(item.category) || 0;
      catMap.set(item.category, current + item.price + item.tax_amount);
    }

    const breakdown: CategoryBreakdown[] = [];
    for (const [category, value] of catMap) {
      if (value > 0) {
        breakdown.push({
          name: getCategoryLabel(category),
          value: Math.round(value * 100) / 100,
          category,
        });
      }
    }

    return breakdown.sort((a, b) => b.value - a.value);
  },

  getTotalSpend: () => {
    const filtered = get().getFilteredItems();
    return Math.round(filtered.reduce((sum, i) => sum + i.price + i.tax_amount, 0) * 100) / 100;
  },

  getItemCount: () => {
    return get().getFilteredItems().length;
  },

  getAvgPerTrip: () => {
    const { receipts, filters } = get();
    const yearReceipts = receipts.filter((r) => new Date(r.receipt_date).getFullYear() === filters.year);
    if (yearReceipts.length === 0) return 0;
    const totalSpend = yearReceipts.reduce((sum, r) => sum + r.total, 0);
    return Math.round((totalSpend / yearReceipts.length) * 100) / 100;
  },

  getStores: () => {
    const { receipts } = get();
    const stores = new Set(receipts.map((r) => r.store_name));
    return Array.from(stores).sort();
  },
}));

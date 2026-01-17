import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Entry, Category, Owner } from '../types';

interface EntriesState {
  entries: Entry[];
  currentEntry: Entry | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    category?: Category;
    subcategory?: string;
    owner?: Owner;
    search?: string;
  };

  // Actions
  fetchEntries: () => Promise<void>;
  fetchEntry: (id: string) => Promise<void>;
  createEntry: (entry: Partial<Entry>) => Promise<Entry | null>;
  updateEntry: (id: string, updates: Partial<Entry>) => Promise<boolean>;
  deleteEntry: (id: string) => Promise<boolean>;
  setFilters: (filters: Partial<EntriesState['filters']>) => void;
  clearFilters: () => void;
  searchEntries: (query: string) => Promise<Entry[]>;
}

export const useEntriesStore = create<EntriesState>((set, get) => ({
  entries: [],
  currentEntry: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchEntries: async () => {
    set({ isLoading: true, error: null });
    try {
      let query = supabase
        .from('juliz_portal_entries')
        .select('*')
        .order('updated_at', { ascending: false });

      const { filters } = get();
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.subcategory) {
        query = query.eq('subcategory', filters.subcategory);
      }
      if (filters.owner) {
        query = query.eq('owner', filters.owner);
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ entries: data || [], isLoading: false });
    } catch (err) {
      set({ error: 'Failed to fetch entries', isLoading: false });
    }
  },

  fetchEntry: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('juliz_portal_entries')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      set({ currentEntry: data, isLoading: false });
    } catch (err) {
      set({ error: 'Failed to fetch entry', isLoading: false, currentEntry: null });
    }
  },

  createEntry: async (entry: Partial<Entry>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('juliz_portal_entries')
        .insert({
          title: entry.title || 'Untitled',
          content: entry.content || '',
          category: entry.category || 'ideas',
          subcategory: entry.subcategory,
          tags: entry.tags || [],
          owner: entry.owner || 'shared',
          ...getFieldsForCategory(entry),
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh entries list
      get().fetchEntries();
      set({ isLoading: false });
      return data;
    } catch (err) {
      set({ error: 'Failed to create entry', isLoading: false });
      return null;
    }
  },

  updateEntry: async (id: string, updates: Partial<Entry>) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('juliz_portal_entries')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      // Refresh current entry and list
      if (get().currentEntry?.id === id) {
        get().fetchEntry(id);
      }
      get().fetchEntries();
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({ error: 'Failed to update entry', isLoading: false });
      return false;
    }
  },

  deleteEntry: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('juliz_portal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Clear current entry if it was deleted
      if (get().currentEntry?.id === id) {
        set({ currentEntry: null });
      }
      get().fetchEntries();
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({ error: 'Failed to delete entry', isLoading: false });
      return false;
    }
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
    get().fetchEntries();
  },

  clearFilters: () => {
    set({ filters: {} });
    get().fetchEntries();
  },

  searchEntries: async (query: string) => {
    if (!query.trim()) {
      return get().entries.slice(0, 20);
    }

    try {
      // Full-text search using the fts column
      const { data, error } = await supabase
        .from('juliz_portal_entries')
        .select('*')
        .textSearch('fts', query, { type: 'websearch' })
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) {
        // Fallback to simple ILIKE search
        const { data: fallbackData } = await supabase
          .from('juliz_portal_entries')
          .select('*')
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .order('updated_at', { ascending: false })
          .limit(50);

        return fallbackData || [];
      }

      return data || [];
    } catch {
      return [];
    }
  },
}));

// Helper to extract category-specific fields
function getFieldsForCategory(entry: Partial<Entry>): Partial<Entry> {
  const fields: Partial<Entry> = {};

  switch (entry.category) {
    case 'finance':
      fields.amount = entry.amount;
      fields.is_recurring = entry.is_recurring;
      fields.frequency = entry.frequency;
      fields.due_date = entry.due_date;
      break;
    case 'taxes':
      fields.tax_year = entry.tax_year;
      fields.document_type = entry.document_type;
      fields.tax_status = entry.tax_status;
      break;
    case 'health':
      fields.health_type = entry.health_type;
      fields.appointment_date = entry.appointment_date;
      fields.provider = entry.provider;
      break;
    case 'social':
      fields.event_date = entry.event_date;
      fields.people_involved = entry.people_involved;
      fields.location = entry.location;
      break;
    case 'ideas':
      fields.idea_status = entry.idea_status;
      fields.sparked_by = entry.sparked_by;
      break;
    case 'goals':
      fields.goal_status = entry.goal_status;
      fields.target_date = entry.target_date;
      fields.progress_percent = entry.progress_percent;
      fields.milestones = entry.milestones;
      break;
  }

  return fields;
}

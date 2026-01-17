import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEntriesStore } from '../stores/entriesStore';
import type { Entry, Category, Owner } from '../types';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(),
};

vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase,
}));

const mockEntry: Entry = {
  id: 'test-entry-1',
  title: 'Test Entry',
  content: 'Test content with **markdown**',
  category: 'ideas' as Category,
  subcategory: 'projects',
  tags: ['test', 'demo'],
  owner: 'julian' as Owner,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T12:00:00Z',
  idea_status: 'new',
};

describe('CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    const { result } = renderHook(() => useEntriesStore());
    act(() => {
      result.current.entries = [];
      result.current.currentEntry = null;
      result.current.error = null;
    });
  });

  describe('Create Entry', () => {
    it('should create a new entry with required fields', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockEntry,
              error: null,
            }),
          }),
        }),
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [mockEntry],
            error: null,
          }),
        }),
      });

      const { result } = renderHook(() => useEntriesStore());

      let createdEntry: Entry | null | undefined = null;
      await act(async () => {
        createdEntry = await result.current.createEntry({
          title: 'Test Entry',
          content: 'Test content',
          category: 'ideas',
          owner: 'julian',
        });
      });

      expect(createdEntry).not.toBeNull();
      expect((createdEntry as Entry | null)?.title).toBe('Test Entry');
      expect((createdEntry as Entry | null)?.category).toBe('ideas');
    });

    it('should use default values for optional fields', async () => {
      const createdWithDefaults: Entry = {
        ...mockEntry,
        title: 'Untitled',
        content: '',
        tags: [],
        owner: 'shared' as Owner,
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: createdWithDefaults,
              error: null,
            }),
          }),
        }),
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [createdWithDefaults],
            error: null,
          }),
        }),
      });

      const { result } = renderHook(() => useEntriesStore());

      await act(async () => {
        const entry = await result.current.createEntry({
          category: 'ideas',
        });
        expect(entry?.title).toBe('Untitled');
        expect(entry?.owner).toBe('shared');
      });
    });
  });

  describe('Read Entry', () => {
    it('should fetch a single entry by ID', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockEntry,
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useEntriesStore());

      await act(async () => {
        await result.current.fetchEntry('test-entry-1');
      });

      expect(result.current.currentEntry).toEqual(mockEntry);
      expect(result.current.currentEntry?.id).toBe('test-entry-1');
    });

    it('should verify all entry fields are returned', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockEntry,
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useEntriesStore());

      await act(async () => {
        await result.current.fetchEntry('test-entry-1');
      });

      const entry = result.current.currentEntry;
      expect(entry).toBeDefined();
      expect(entry?.title).toBe('Test Entry');
      expect(entry?.content).toBe('Test content with **markdown**');
      expect(entry?.category).toBe('ideas');
      expect(entry?.subcategory).toBe('projects');
      expect(entry?.tags).toEqual(['test', 'demo']);
      expect(entry?.owner).toBe('julian');
      expect(entry?.idea_status).toBe('new');
    });
  });

  describe('Update Entry', () => {
    it('should update an existing entry', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...mockEntry, title: 'Updated Title' },
              error: null,
            }),
          }),
          order: vi.fn().mockResolvedValue({
            data: [{ ...mockEntry, title: 'Updated Title' }],
            error: null,
          }),
        }),
      });

      const { result } = renderHook(() => useEntriesStore());

      // Set current entry first
      act(() => {
        result.current.currentEntry = mockEntry;
      });

      let success = false;
      await act(async () => {
        success = await result.current.updateEntry('test-entry-1', {
          title: 'Updated Title',
        });
      });

      expect(success).toBe(true);
    });

    it('should update category-specific fields correctly', async () => {
      const goalEntry: Entry = {
        ...mockEntry,
        category: 'goals' as Category,
        goal_status: 'in_progress',
        progress_percent: 50,
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...goalEntry, progress_percent: 75 },
              error: null,
            }),
          }),
          order: vi.fn().mockResolvedValue({
            data: [{ ...goalEntry, progress_percent: 75 }],
            error: null,
          }),
        }),
      });

      const { result } = renderHook(() => useEntriesStore());

      act(() => {
        result.current.currentEntry = goalEntry;
      });

      await act(async () => {
        await result.current.updateEntry('test-entry-1', {
          progress_percent: 75,
        });
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('juliz_portal_entries');
    });
  });

  describe('Delete Entry', () => {
    it('should delete an entry and clear current entry if it matches', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const { result } = renderHook(() => useEntriesStore());

      act(() => {
        result.current.currentEntry = mockEntry;
      });

      let success = false;
      await act(async () => {
        success = await result.current.deleteEntry('test-entry-1');
      });

      expect(success).toBe(true);
      expect(result.current.currentEntry).toBeNull();
    });

    it('should verify entry is removed from the database', async () => {
      const deleteMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      mockSupabase.from.mockReturnValue({
        delete: deleteMock,
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const { result } = renderHook(() => useEntriesStore());

      await act(async () => {
        await result.current.deleteEntry('test-entry-1');
      });

      expect(deleteMock).toHaveBeenCalled();
    });
  });
});

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

const mockEntries: Entry[] = [
  {
    id: '1',
    title: 'Vacation Fund',
    content: 'Saving for Japan trip',
    category: 'finance' as Category,
    tags: ['saving', 'vacation', 'japan'],
    owner: 'shared' as Owner,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-15T12:00:00Z',
  },
  {
    id: '2',
    title: 'Learn Japanese',
    content: 'Goal to learn basic Japanese before the trip',
    category: 'goals' as Category,
    tags: ['learning', 'japan'],
    owner: 'julian' as Owner,
    created_at: '2024-01-11T10:00:00Z',
    updated_at: '2024-01-16T12:00:00Z',
    goal_status: 'in_progress',
    progress_percent: 25,
  },
  {
    id: '3',
    title: 'Japan Travel Ideas',
    content: 'Places to visit: Tokyo, Kyoto, Osaka',
    category: 'ideas' as Category,
    tags: ['travel', 'japan'],
    owner: 'liz' as Owner,
    created_at: '2024-01-12T10:00:00Z',
    updated_at: '2024-01-17T12:00:00Z',
  },
  {
    id: '4',
    title: 'Budget Review',
    content: 'Monthly budget review for January',
    category: 'finance' as Category,
    tags: ['budget', 'monthly'],
    owner: 'shared' as Owner,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-18T12:00:00Z',
  },
];

describe('Search Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const { result } = renderHook(() => useEntriesStore());
    act(() => {
      result.current.entries = mockEntries;
      result.current.error = null;
    });
  });

  describe('Keyword Search', () => {
    it('should return matching entries for keyword search', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          textSearch: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: mockEntries.filter(e =>
                  e.title.toLowerCase().includes('japan') ||
                  e.content.toLowerCase().includes('japan')
                ),
                error: null,
              }),
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useEntriesStore());

      let searchResults: Entry[] = [];
      await act(async () => {
        searchResults = await result.current.searchEntries('japan');
      });

      expect(searchResults.length).toBe(3);
      expect(searchResults.every(e =>
        e.title.toLowerCase().includes('japan') ||
        e.content.toLowerCase().includes('japan') ||
        e.tags?.includes('japan')
      )).toBe(true);
    });

    it('should return empty results for non-matching search', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          textSearch: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useEntriesStore());

      let searchResults: Entry[] = [];
      await act(async () => {
        searchResults = await result.current.searchEntries('nonexistent-term-xyz');
      });

      expect(searchResults).toEqual([]);
    });
  });

  describe('Empty Search', () => {
    it('should return recent entries when search query is empty', async () => {
      const { result } = renderHook(() => useEntriesStore());

      act(() => {
        result.current.entries = mockEntries;
      });

      let searchResults: Entry[] = [];
      await act(async () => {
        searchResults = await result.current.searchEntries('');
      });

      // Should return up to 20 most recent entries
      expect(searchResults.length).toBeLessThanOrEqual(20);
      expect(searchResults).toEqual(mockEntries.slice(0, 20));
    });

    it('should return recent entries when search query is whitespace', async () => {
      const { result } = renderHook(() => useEntriesStore());

      act(() => {
        result.current.entries = mockEntries;
      });

      let searchResults: Entry[] = [];
      await act(async () => {
        searchResults = await result.current.searchEntries('   ');
      });

      expect(searchResults).toEqual(mockEntries.slice(0, 20));
    });
  });

  describe('Filter by Category', () => {
    it('should filter entries by category', async () => {
      const financeEntries = mockEntries.filter(e => e.category === 'finance');

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: financeEntries,
              error: null,
            }),
          }),
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: financeEntries,
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useEntriesStore());

      await act(async () => {
        result.current.setFilters({ category: 'finance' });
      });

      // Verify the filter was set
      expect(result.current.filters.category).toBe('finance');
    });
  });

  describe('Search Fallback', () => {
    it('should fallback to ILIKE search when full-text search fails', async () => {
      const ilikeMock = vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [mockEntries[0]],
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          textSearch: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Full-text search not available' },
              }),
            }),
          }),
          or: ilikeMock,
        }),
      });

      const { result } = renderHook(() => useEntriesStore());

      await act(async () => {
        await result.current.searchEntries('vacation');
      });

      // The fallback should have been called
      expect(ilikeMock).toHaveBeenCalled();
    });
  });

  describe('Search Result Ordering', () => {
    it('should return results ordered by updated_at descending', async () => {
      const orderedEntries = [...mockEntries].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          textSearch: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: orderedEntries,
                error: null,
              }),
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useEntriesStore());

      let searchResults: Entry[] = [];
      await act(async () => {
        searchResults = await result.current.searchEntries('japan');
      });

      // Verify ordering by updated_at descending
      for (let i = 0; i < searchResults.length - 1; i++) {
        const current = new Date(searchResults[i].updated_at).getTime();
        const next = new Date(searchResults[i + 1].updated_at).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });
  });
});

import { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { MobileNav } from '../components/layout/MobileNav';
import { EntryList } from '../components/entries/EntryList';
import { EntryDetail } from '../components/entries/EntryDetail';
import { QuickCapture } from '../components/entries/QuickCapture';
import { RecentActivity } from '../components/entries/RecentActivity';
import { SearchResults } from '../components/search/SearchResults';
import { useEntriesStore } from '../stores/entriesStore';
import { pullFromGitHub, pushToGitHub } from '../lib/github';
import type { Entry, Category } from '../types';

export function HomePage() {
  const {
    entries,
    isLoading,
    fetchEntries,
    deleteEntry,
    setFilters,
    clearFilters,
    searchEntries,
  } = useEntriesStore();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Entry[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleCategorySelect = (category: Category | null) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setSearchResults([]);
    if (category) {
      setFilters({ category });
    } else {
      clearFilters();
    }
  };

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const results = await searchEntries(query);
      setSearchResults(results);
      setIsSearching(false);
    },
    [searchEntries]
  );

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await pullFromGitHub();
      if (result.errors.length > 0) {
        console.error('Sync errors:', result.errors);
      }
      // Refresh entries after sync
      await fetchEntries();
    } catch (err) {
      console.error('Sync failed:', err);
    }
    setIsSyncing(false);
  };

  const handleEntryClick = (entry: Entry) => {
    setSelectedEntry(entry);
  };

  const handleEntryClose = () => {
    setSelectedEntry(null);
    // Refresh to get any updates
    fetchEntries();
  };

  const handleEntryDelete = async () => {
    if (selectedEntry) {
      await deleteEntry(selectedEntry.id);
      setSelectedEntry(null);
    }
  };

  const handleQuickCaptureCreated = async (id: string) => {
    // Find the newly created entry and push to GitHub
    const newEntry = entries.find((e) => e.id === id);
    if (newEntry) {
      await pushToGitHub(newEntry);
    }
    fetchEntries();
  };

  const displayedEntries = searchQuery.trim() ? searchResults : entries;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSearch={handleSearch}
        onQuickCapture={() => setShowQuickCapture(true)}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      <div className="flex">
        <Sidebar
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />

        <main className="flex-1 min-h-[calc(100vh-4rem)] pb-20 lg:pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {!searchQuery.trim() && (
              <RecentActivity
                entries={entries}
                onEntryClick={handleEntryClick}
              />
            )}

            {searchQuery.trim() ? (
              <SearchResults
                results={searchResults}
                query={searchQuery}
                onResultClick={handleEntryClick}
              />
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedCategory
                      ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
                      : 'All Entries'}
                  </h1>
                  <span className="text-sm text-gray-500">
                    {displayedEntries.length} item{displayedEntries.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <EntryList
                  entries={displayedEntries}
                  isLoading={isLoading || isSearching}
                  onEntryClick={handleEntryClick}
                />
              </>
            )}
          </div>
        </main>
      </div>

      <MobileNav
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />

      {selectedEntry && (
        <EntryDetail
          entry={selectedEntry}
          onClose={handleEntryClose}
          onDelete={handleEntryDelete}
        />
      )}

      <QuickCapture
        isOpen={showQuickCapture}
        onClose={() => setShowQuickCapture(false)}
        onCreated={handleQuickCaptureCreated}
      />
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { MobileNav } from '../components/layout/MobileNav';
import { EntryList } from '../components/entries/EntryList';
import { EntryDetail } from '../components/entries/EntryDetail';
import { QuickCapture } from '../components/entries/QuickCapture';
import { RecentActivity } from '../components/entries/RecentActivity';
import { SearchResults } from '../components/search/SearchResults';
import { HealthDashboard } from '../components/health/HealthDashboard';
import { SpiritualDashboard } from '../components/spiritual/SpiritualDashboard';
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

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    () => {
      const saved = localStorage.getItem('juliz-portal-nav');
      return saved ? (JSON.parse(saved) as Category) : null;
    }
  );
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Entry[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchEntries();
    if (selectedCategory && selectedCategory !== 'health' && selectedCategory !== 'spiritual') {
      setFilters({ category: selectedCategory });
    }
  }, [fetchEntries]);

  const handleCategorySelect = (category: Category | null) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setSearchResults([]);
    if (category) {
      localStorage.setItem('juliz-portal-nav', JSON.stringify(category));
      setFilters({ category });
    } else {
      localStorage.removeItem('juliz-portal-nav');
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
    <div className="min-h-screen bg-[#f9f8f6] dark:bg-[#0f1219] flex">
      {/* Sticky sidebar */}
      <Sidebar
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onSearch={handleSearch}
          onQuickCapture={() => setShowQuickCapture(true)}
          onSync={handleSync}
          isSyncing={isSyncing}
        />

        <main className="flex-1 p-6 lg:p-8 pb-24 lg:pb-8">
          {selectedCategory === 'health' ? (
            <HealthDashboard onBack={() => handleCategorySelect(null)} />
          ) : selectedCategory === 'spiritual' ? (
            <SpiritualDashboard onBack={() => handleCategorySelect(null)} />
          ) : (
            <div className="max-w-5xl mx-auto">
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
                  <div className="border-l-2 border-[#195de6]/20 pl-6 mb-8">
                    <h1 className="text-xs tracking-[0.4em] uppercase font-light text-slate-400 dark:text-slate-500 mb-1">
                      {selectedCategory
                        ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
                        : 'All Entries'}
                    </h1>
                    <p className="text-2xl font-light text-slate-600 dark:text-slate-300">
                      {selectedCategory
                        ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
                        : 'Overview'}
                    </p>
                    <span className="text-[10px] tracking-widest uppercase text-slate-400 font-light">
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
          )}
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

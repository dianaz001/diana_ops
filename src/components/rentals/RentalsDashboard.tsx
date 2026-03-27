import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Building2,
  LayoutGrid,
  Table2,
  DollarSign,
  Star,
  TrendingDown,
  Home,
} from 'lucide-react';
import { RENTAL_LISTINGS } from '../../data/rentals-data';
import type { RentalListing, RentalViewMode } from '../../types/rentals';
import { RentalCard } from './RentalCard';
import { RentalTable } from './RentalTable';
import { RentalMap } from './RentalMap';

interface RentalsDashboardProps {
  onBack: () => void;
}

export function RentalsDashboard({ onBack }: RentalsDashboardProps) {
  const [viewMode, setViewMode] = useState<RentalViewMode>('cards');
  const [showRejected, setShowRejected] = useState(false);
  const [listings, setListings] = useState<RentalListing[]>(RENTAL_LISTINGS);

  const activeListings = useMemo(
    () => listings.filter((l) => !l.rejected).sort((a, b) => a.rank - b.rank),
    [listings]
  );

  const rejectedListings = useMemo(
    () => listings.filter((l) => l.rejected),
    [listings]
  );

  const displayedListings = showRejected
    ? [...activeListings, ...rejectedListings]
    : activeListings;

  // Stats
  const avgPrice = Math.round(
    activeListings.reduce((s, l) => s + l.finalPrice, 0) / activeListings.length
  );
  const cheapest = Math.min(...activeListings.map((l) => l.finalPrice));
  const avgRating = (
    activeListings.reduce((s, l) => s + l.onlineRating, 0) / activeListings.length
  ).toFixed(1);

  const handleRankChange = (id: string, direction: 'up' | 'down') => {
    setListings((prev) => {
      const active = prev.filter((l) => !l.rejected).sort((a, b) => a.rank - b.rank);
      const rejected = prev.filter((l) => l.rejected);
      const idx = active.findIndex((l) => l.id === id);
      if (idx === -1) return prev;

      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= active.length) return prev;

      // Swap ranks
      const tempRank = active[idx].rank;
      active[idx] = { ...active[idx], rank: active[swapIdx].rank };
      active[swapIdx] = { ...active[swapIdx], rank: tempRank };

      return [...active, ...rejected];
    });
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-28 lg:pb-10">
        {/* Header */}
        <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-4 bg-[#f9f8f6]/80 dark:bg-[#0f1219]/80 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-500" />
                <h1 className="text-[13px] font-semibold tracking-tight text-slate-800 dark:text-slate-100">
                  Toronto Rentals
                </h1>
              </div>
            </div>

            {/* View toggle + filters */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRejected(!showRejected)}
                className={`text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors ${
                  showRejected
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {showRejected ? 'Hide' : 'Show'} rejected
              </button>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-[#195de6]'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-[#195de6]'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Table2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={<Home className="w-4 h-4 text-orange-500" />}
            label="Active Listings"
            value={String(activeListings.length)}
          />
          <StatCard
            icon={<DollarSign className="w-4 h-4 text-emerald-500" />}
            label="Avg Final Price"
            value={`$${avgPrice.toLocaleString()}`}
          />
          <StatCard
            icon={<TrendingDown className="w-4 h-4 text-blue-500" />}
            label="Cheapest"
            value={`$${cheapest.toLocaleString()}`}
          />
          <StatCard
            icon={<Star className="w-4 h-4 text-amber-500" />}
            label="Avg Rating"
            value={avgRating}
          />
        </div>

        {/* Map */}
        <div className="mb-6">
          <RentalMap listings={displayedListings} />
        </div>

        {/* Listings */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {displayedListings.map((listing, idx) => (
              <RentalCard
                key={listing.id}
                listing={listing}
                onRankChange={handleRankChange}
                isFirst={idx === 0}
                isLast={idx === activeListings.length - 1}
              />
            ))}
          </div>
        ) : (
          <RentalTable listings={displayedListings} />
        )}

        {/* Empty state */}
        {displayedListings.length === 0 && (
          <div className="text-center py-20">
            <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No listings to show</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white/70 dark:bg-slate-800/50 rounded-xl one-pixel-border p-4">
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-[9px] uppercase tracking-[0.15em] font-medium text-slate-400 dark:text-slate-500">
          {label}
        </span>
      </div>
      <p className="text-xl font-semibold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
}

import {
  Star,
  ExternalLink,
  Droplets,
  Zap,
  WashingMachine,
  Dumbbell,
  MapPin,
  Calendar,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import type { RentalListing } from '../../types/rentals';

interface RentalCardProps {
  listing: RentalListing;
  onRankChange: (id: string, direction: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i <= rating
              ? 'fill-amber-400 text-amber-400'
              : i - 0.5 <= rating
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-slate-300 dark:text-slate-600'
          }`}
        />
      ))}
      <span className="text-[10px] text-slate-400 ml-1">{rating}</span>
    </div>
  );
}

export function RentalCard({ listing, onRankChange, isFirst, isLast }: RentalCardProps) {
  const locationColor = getLocationColor(listing.location);

  return (
    <div
      className={`group relative bg-white/70 dark:bg-slate-800/50 rounded-2xl one-pixel-border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${
        listing.rejected ? 'opacity-50' : ''
      }`}
    >
      {/* Image / Gradient header */}
      <div
        className={`h-36 relative overflow-hidden ${locationColor}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/20 text-6xl font-light">
            {listing.address.charAt(0)}
          </span>
        </div>

        {/* Rank badge */}
        {!listing.rejected && (
          <div className="absolute top-3 left-3 flex items-center gap-1">
            <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[11px] font-semibold px-2.5 py-1 rounded-full text-slate-700 dark:text-slate-200">
              #{listing.rank}
            </span>
          </div>
        )}

        {listing.rejected && (
          <div className="absolute top-3 left-3">
            <span className="bg-red-500/90 text-white text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-full">
              Rejected
            </span>
          </div>
        )}

        {/* External link */}
        <a
          href={listing.link}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
        </a>

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <div className="text-white text-lg font-semibold drop-shadow-sm">
              ${listing.finalPrice.toLocaleString()}/mo
            </div>
            <div className="text-white/70 text-[10px]">
              ${listing.priceWithUtilities.toLocaleString()} with utilities
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 mb-1 leading-tight">
          {listing.address}
        </h3>

        <div className="flex items-center gap-1 mb-3">
          <MapPin className="w-3 h-3 text-slate-400" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {listing.location}
          </span>
        </div>

        <RatingStars rating={listing.onlineRating} />

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {listing.waterIncluded && (
            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Droplets className="w-2.5 h-2.5" /> Water
            </span>
          )}
          {listing.hydroIncluded && (
            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
              <Zap className="w-2.5 h-2.5" /> Hydro
            </span>
          )}
          {listing.inSuiteLaundry && (
            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <WashingMachine className="w-2.5 h-2.5" /> Laundry
            </span>
          )}
          {listing.gym && (
            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <Dumbbell className="w-2.5 h-2.5" /> Gym
            </span>
          )}
          {listing.sqft && (
            <span className="text-[9px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400">
              {listing.sqft} sqft
            </span>
          )}
          {listing.yearBuilt && (
            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400">
              <Calendar className="w-2.5 h-2.5" /> {listing.yearBuilt}
            </span>
          )}
        </div>

        {/* Promotions */}
        {listing.promotions && (
          <div className="mt-3 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50/80 dark:bg-emerald-900/20 rounded-lg px-2.5 py-1.5">
            🎉 {listing.promotions}
          </div>
        )}

        {/* Amenities */}
        {listing.amenities && (
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {listing.amenities}
          </p>
        )}

        {/* Notes */}
        {listing.otherAspects && (
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 italic">
            {listing.otherAspects}
          </p>
        )}

        {/* Visit status */}
        {listing.visitScheduled && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Visit status</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">{listing.visitScheduled}</p>
          </div>
        )}

        {/* Rank controls */}
        {!listing.rejected && (
          <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
            <button
              onClick={() => onRankChange(listing.id, 'up')}
              disabled={isFirst}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
            >
              <ChevronUp className="w-4 h-4 text-slate-500" />
            </button>
            <button
              onClick={() => onRankChange(listing.id, 'down')}
              disabled={isLast}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
            >
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function getLocationColor(location: string): string {
  const colors: Record<string, string> = {
    'Yonge-St Clair': 'bg-gradient-to-br from-violet-500 to-purple-600',
    'Yonge-Davisville': 'bg-gradient-to-br from-blue-500 to-cyan-600',
    'Yonge-Eglinton': 'bg-gradient-to-br from-emerald-500 to-teal-600',
    'Yonge-Lawrence': 'bg-gradient-to-br from-amber-500 to-orange-600',
    'Bloor-Yonge': 'bg-gradient-to-br from-rose-500 to-pink-600',
    'Yonge-Wellesley': 'bg-gradient-to-br from-indigo-500 to-blue-600',
  };
  return colors[location] || 'bg-gradient-to-br from-slate-500 to-slate-600';
}

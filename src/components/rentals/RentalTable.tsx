import { ExternalLink, Star, Check, X } from 'lucide-react';
import type { RentalListing } from '../../types/rentals';

interface RentalTableProps {
  listings: RentalListing[];
}

function BoolIcon({ value }: { value: boolean }) {
  return value ? (
    <Check className="w-3.5 h-3.5 text-emerald-500" />
  ) : (
    <X className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
  );
}

export function RentalTable({ listings }: RentalTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl one-pixel-border bg-white/70 dark:bg-slate-800/50">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-700/50">
            {['#', 'Address', 'Location', 'Final $/mo', 'w/ Utils', 'Rating', 'Sqft', 'Water', 'Laundry', 'Gym', 'Promotion', 'Manager', 'Notes', ''].map(
              (h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-[9px] uppercase tracking-[0.15em] font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {listings.map((l) => (
            <tr
              key={l.id}
              className={`border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors ${
                l.rejected ? 'opacity-40 line-through' : ''
              }`}
            >
              <td className="px-3 py-2.5 text-[12px] font-semibold text-slate-500">
                {l.rejected ? '—' : l.rank}
              </td>
              <td className="px-3 py-2.5">
                <div className="text-[12px] font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  {l.address}
                </div>
              </td>
              <td className="px-3 py-2.5 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {l.location}
              </td>
              <td className="px-3 py-2.5 text-[12px] font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                {l.finalPrice ? `$${l.finalPrice.toLocaleString()}` : '—'}
              </td>
              <td className="px-3 py-2.5 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {l.priceWithUtilities ? `$${l.priceWithUtilities.toLocaleString()}` : '—'}
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-0.5">
                  <Star
                    className={`w-3 h-3 ${
                      l.onlineRating >= 4
                        ? 'fill-amber-400 text-amber-400'
                        : l.onlineRating >= 3
                          ? 'fill-amber-300 text-amber-300'
                          : 'fill-slate-300 text-slate-300'
                    }`}
                  />
                  <span className="text-[11px] text-slate-500">{l.onlineRating}</span>
                </div>
              </td>
              <td className="px-3 py-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                {l.sqft || '—'}
              </td>
              <td className="px-3 py-2.5"><BoolIcon value={l.waterIncluded} /></td>
              <td className="px-3 py-2.5"><BoolIcon value={l.inSuiteLaundry} /></td>
              <td className="px-3 py-2.5"><BoolIcon value={l.gym} /></td>
              <td className="px-3 py-2.5 text-[10px] text-emerald-600 dark:text-emerald-400 max-w-[160px] truncate">
                {l.promotions || '—'}
              </td>
              <td className="px-3 py-2.5 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {l.manager || '—'}
              </td>
              <td className="px-3 py-2.5 text-[10px] text-slate-400 max-w-[180px] truncate">
                {l.otherAspects || '—'}
              </td>
              <td className="px-3 py-2.5">
                <a
                  href={l.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#195de6] hover:text-[#195de6]/70 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

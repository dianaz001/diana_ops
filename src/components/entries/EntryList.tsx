import { EntryCard } from './EntryCard';
import type { Entry } from '../../types';

interface EntryListProps {
  entries: Entry[];
  isLoading: boolean;
  onEntryClick: (entry: Entry) => void;
}

export function EntryList({ entries, isLoading, onEntryClick }: EntryListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl one-pixel-border bg-white/40 p-5 animate-pulse"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-20 h-4 bg-[#195de6]/8 rounded-lg" />
            </div>
            <div className="w-3/4 h-5 bg-[#195de6]/8 rounded-lg mb-3" />
            <div className="w-full h-3.5 bg-[#195de6]/5 rounded-lg mb-2" />
            <div className="w-2/3 h-3.5 bg-[#195de6]/5 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl opacity-40 mb-4">
          <svg
            className="w-16 h-16 mx-auto text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-light text-slate-600 mb-1">No entries found</h3>
        <p className="text-sm font-light text-slate-400">
          Create your first entry using Quick Capture
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          onClick={() => onEntryClick(entry)}
        />
      ))}
    </div>
  );
}

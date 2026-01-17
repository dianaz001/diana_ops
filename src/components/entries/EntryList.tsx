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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-20 h-5 bg-gray-200 rounded-full" />
            </div>
            <div className="w-3/4 h-5 bg-gray-200 rounded mb-2" />
            <div className="w-full h-4 bg-gray-100 rounded mb-1" />
            <div className="w-2/3 h-4 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No entries found</h3>
        <p className="text-gray-500">
          Create your first entry using Quick Capture
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

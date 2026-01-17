import { format, formatDistanceToNow } from 'date-fns';
import { getCategoryInfo, type Entry } from '../../types';

interface RecentActivityProps {
  entries: Entry[];
  onEntryClick: (entry: Entry) => void;
}

export function RecentActivity({ entries, onEntryClick }: RecentActivityProps) {
  const recentEntries = entries.slice(0, 10);

  if (recentEntries.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Recent Activity
      </h2>
      <div className="space-y-2">
        {recentEntries.map((entry) => {
          const categoryInfo = getCategoryInfo(entry.category);
          const updatedAt = new Date(entry.updated_at);
          const isToday = new Date().toDateString() === updatedAt.toDateString();

          return (
            <button
              key={entry.id}
              onClick={() => onEntryClick(entry)}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-lg flex-shrink-0">{categoryInfo.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{entry.title}</div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-xs ${categoryInfo.color}`}>
                    {categoryInfo.label}
                  </span>
                  <span>·</span>
                  <span>
                    {isToday
                      ? formatDistanceToNow(updatedAt, { addSuffix: true })
                      : format(updatedAt, 'MMM d')}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

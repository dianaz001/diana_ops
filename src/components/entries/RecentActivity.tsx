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
      <h2 className="text-[10px] tracking-[0.4em] uppercase font-light text-slate-400 mb-5">
        Recent Activity
      </h2>
      <div className="space-y-1">
        {recentEntries.map((entry) => {
          const categoryInfo = getCategoryInfo(entry.category);
          const updatedAt = new Date(entry.updated_at);
          const isToday = new Date().toDateString() === updatedAt.toDateString();

          return (
            <button
              key={entry.id}
              onClick={() => onEntryClick(entry)}
              className="w-full flex items-center gap-3 py-3 px-4 text-left hover:bg-[#195de6]/[0.03] rounded-xl transition-colors"
            >
              <span className="text-lg flex-shrink-0">{categoryInfo.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">{entry.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ${categoryInfo.color}`}>
                    {categoryInfo.label}
                  </span>
                  <span className="text-[10px] tracking-wider text-slate-400">
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

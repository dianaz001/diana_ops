import { format } from 'date-fns';
import { getCategoryInfo, type Entry } from '../../types';
import { User, Users, Calendar } from 'lucide-react';

interface EntryCardProps {
  entry: Entry;
  onClick: () => void;
}

export function EntryCard({ entry, onClick }: EntryCardProps) {
  const categoryInfo = getCategoryInfo(entry.category);

  const getOwnerIcon = () => {
    switch (entry.owner) {
      case 'julian':
        return <User className="w-3.5 h-3.5" />;
      case 'liz':
        return <User className="w-3.5 h-3.5" />;
      case 'shared':
        return <Users className="w-3.5 h-3.5" />;
    }
  };

  const getOwnerLabel = () => {
    switch (entry.owner) {
      case 'julian':
        return 'Julian';
      case 'liz':
        return 'Liz';
      case 'shared':
        return 'Shared';
    }
  };

  // Get a snippet of the content (first 150 chars, stripped of markdown)
  const contentSnippet = entry.content
    .replace(/[#*_~`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .slice(0, 150)
    .trim();

  return (
    <div
      onClick={onClick}
      className="bg-white/60 backdrop-blur-sm rounded-2xl one-pixel-border p-5 hover:shadow-lg hover:shadow-[#195de6]/5 cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${categoryInfo.color}`}>
              {categoryInfo.icon} {categoryInfo.label}
            </span>
            {entry.subcategory && (
              <span className="text-[10px] uppercase tracking-wider text-slate-400">
                / {entry.subcategory}
              </span>
            )}
          </div>

          <h3 className="font-medium text-slate-900 truncate">{entry.title}</h3>

          {contentSnippet && (
            <p className="text-sm font-light text-slate-500 mt-1 line-clamp-2">
              {contentSnippet}
              {entry.content.length > 150 && '...'}
            </p>
          )}

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {entry.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-[#195de6]/5 text-[#195de6]/70 text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {entry.tags.length > 3 && (
                <span className="text-[10px] tracking-wider text-slate-400">
                  +{entry.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Category-specific info */}
        <div className="flex-shrink-0 text-right">
          {entry.category === 'goals' && entry.progress_percent !== undefined && (
            <div className="mb-2">
              <div className="text-sm font-light text-slate-700">
                {entry.progress_percent}%
              </div>
              <div className="w-16 h-1 bg-[#195de6]/10 rounded-full mt-1">
                <div
                  className="h-full bg-[#195de6] rounded-full"
                  style={{ width: `${entry.progress_percent}%` }}
                />
              </div>
            </div>
          )}

          {entry.category === 'finance' && entry.amount !== undefined && (
            <div className="text-lg font-light tracking-tighter text-slate-800">
              ${entry.amount.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#195de6]/5 text-[10px] tracking-wider uppercase text-slate-400">
        <div className="flex items-center gap-1">
          {getOwnerIcon()}
          <span>{getOwnerLabel()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{format(new Date(entry.updated_at), 'MMM d, yyyy')}</span>
        </div>
      </div>
    </div>
  );
}

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
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${categoryInfo.color}`}>
              {categoryInfo.icon} {categoryInfo.label}
            </span>
            {entry.subcategory && (
              <span className="text-xs text-gray-500">
                / {entry.subcategory}
              </span>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 truncate">{entry.title}</h3>

          {contentSnippet && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {contentSnippet}
              {entry.content.length > 150 && '...'}
            </p>
          )}

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {entry.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                >
                  {tag}
                </span>
              ))}
              {entry.tags.length > 3 && (
                <span className="text-xs text-gray-400">
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
              <div className="text-sm font-medium text-gray-700">
                {entry.progress_percent}%
              </div>
              <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${entry.progress_percent}%` }}
                />
              </div>
            </div>
          )}

          {entry.category === 'finance' && entry.amount !== undefined && (
            <div className="text-sm font-medium text-green-600">
              ${entry.amount.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
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

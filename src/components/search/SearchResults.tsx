import { getCategoryInfo, type Entry } from '../../types';
import { format } from 'date-fns';

interface SearchResultsProps {
  results: Entry[];
  query: string;
  onResultClick: (entry: Entry) => void;
}

export function SearchResults({ results, query, onResultClick }: SearchResultsProps) {
  if (!query.trim()) {
    return null;
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No results found for "{query}"</p>
        <p className="text-sm text-gray-400 mt-1">Try different keywords or check your spelling</p>
      </div>
    );
  }

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-500 mb-4">
        Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
      </div>
      {results.map((entry) => {
        const categoryInfo = getCategoryInfo(entry.category);
        const contentSnippet = entry.content
          .replace(/[#*_~`]/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .slice(0, 200);

        return (
          <button
            key={entry.id}
            onClick={() => onResultClick(entry)}
            className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-gray-300 transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{categoryInfo.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${categoryInfo.color}`}>
                    {categoryInfo.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {format(new Date(entry.updated_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">
                  {highlightMatch(entry.title, query)}
                </h3>
                {contentSnippet && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {highlightMatch(contentSnippet, query)}
                  </p>
                )}
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
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

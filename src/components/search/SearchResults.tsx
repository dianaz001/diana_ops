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
      <div className="text-center py-12">
        <p className="text-sm font-light text-slate-500">No results found for "{query}"</p>
        <p className="text-[10px] tracking-wider uppercase text-slate-400 mt-2">Try different keywords or check your spelling</p>
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
        <mark key={i} className="bg-[#195de6]/15 text-[#195de6] rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-3">
      <div className="text-[10px] tracking-widest uppercase text-slate-400 mb-6">
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
            className="w-full text-left bg-white/60 one-pixel-border rounded-2xl p-5 hover:shadow-lg hover:shadow-[#195de6]/5 transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{categoryInfo.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${categoryInfo.color}`}>
                    {categoryInfo.label}
                  </span>
                  <span className="text-[10px] tracking-wider text-slate-400">
                    {format(new Date(entry.updated_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-slate-900">
                  {highlightMatch(entry.title, query)}
                </h3>
                {contentSnippet && (
                  <p className="text-sm font-light text-slate-500 mt-1 line-clamp-2">
                    {highlightMatch(contentSnippet, query)}
                  </p>
                )}
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

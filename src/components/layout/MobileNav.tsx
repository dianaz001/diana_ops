import { CATEGORIES, type Category } from '../../types';

interface MobileNavProps {
  selectedCategory: Category | null;
  onCategorySelect: (category: Category | null) => void;
}

export function MobileNav({ selectedCategory, onCategorySelect }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex overflow-x-auto">
        <button
          onClick={() => onCategorySelect(null)}
          className={`flex-shrink-0 flex flex-col items-center py-2 px-4 ${
            selectedCategory === null
              ? 'text-blue-600'
              : 'text-gray-500'
          }`}
        >
          <span className="text-xl">📊</span>
          <span className="text-xs mt-1">All</span>
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => onCategorySelect(cat.name)}
            className={`flex-shrink-0 flex flex-col items-center py-2 px-4 ${
              selectedCategory === cat.name
                ? 'text-blue-600'
                : 'text-gray-500'
            }`}
          >
            <span className="text-xl">{cat.icon}</span>
            <span className="text-xs mt-1">{cat.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

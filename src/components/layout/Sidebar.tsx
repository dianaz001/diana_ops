import { CATEGORIES, type Category, type CategoryInfo } from '../../types';

interface SidebarProps {
  selectedCategory: Category | null;
  onCategorySelect: (category: Category | null) => void;
}

export function Sidebar({ selectedCategory, onCategorySelect }: SidebarProps) {
  return (
    <aside className="hidden lg:block w-64 border-r border-gray-200 bg-gray-50 min-h-[calc(100vh-4rem)]">
      <nav className="p-4">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Categories
          </h2>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => onCategorySelect(null)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === null
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900'
                }`}
              >
                <span className="text-lg">📊</span>
                <span className="font-medium">All</span>
              </button>
            </li>
            {CATEGORIES.map((cat) => (
              <CategoryItem
                key={cat.name}
                category={cat}
                isSelected={selectedCategory === cat.name}
                onSelect={() => onCategorySelect(cat.name)}
              />
            ))}
          </ul>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Filters
          </h2>
          <ul className="space-y-1">
            <li>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-white hover:text-gray-900 rounded-lg transition-colors">
                <span className="text-lg">👤</span>
                <span>Julian's items</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-white hover:text-gray-900 rounded-lg transition-colors">
                <span className="text-lg">👤</span>
                <span>Liz's items</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-white hover:text-gray-900 rounded-lg transition-colors">
                <span className="text-lg">👥</span>
                <span>Shared items</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}

function CategoryItem({
  category,
  isSelected,
  onSelect,
}: {
  category: CategoryInfo;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        onClick={onSelect}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          isSelected
            ? 'bg-white shadow-sm text-gray-900'
            : 'text-gray-600 hover:bg-white hover:text-gray-900'
        }`}
      >
        <span className="text-lg">{category.icon}</span>
        <span className="font-medium">{category.label}</span>
      </button>
    </li>
  );
}

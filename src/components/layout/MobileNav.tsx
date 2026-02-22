import { CATEGORIES, type Category } from '../../types';

interface MobileNavProps {
  selectedCategory: Category | null;
  onCategorySelect: (category: Category | null) => void;
}

export function MobileNav({ selectedCategory, onCategorySelect }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[#195de6]/5 z-50">
      <div className="flex overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onCategorySelect(null)}
          className={`flex-shrink-0 flex flex-col items-center py-2.5 px-4 transition-colors ${
            selectedCategory === null
              ? 'text-[#195de6]'
              : 'text-slate-400'
          }`}
        >
          <span className="text-lg">📊</span>
          <span className="text-[9px] uppercase tracking-widest mt-1 font-light">All</span>
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => onCategorySelect(cat.name)}
            className={`flex-shrink-0 flex flex-col items-center py-2.5 px-4 transition-colors ${
              selectedCategory === cat.name
                ? 'text-[#195de6]'
                : 'text-slate-400'
            }`}
          >
            <span className="text-lg">{cat.icon}</span>
            <span className="text-[9px] uppercase tracking-widest mt-1 font-light">{cat.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

import {
  LayoutDashboard,
  Wallet,
  FileText,
  Heart,
  Users,
  Lightbulb,
  Target,
  Cross,
  Music,
} from 'lucide-react';
import { CATEGORIES, type Category, type CategoryInfo } from '../../types';

interface SidebarProps {
  selectedCategory: Category | null;
  onCategorySelect: (category: Category | null) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  finance: <Wallet className="w-[18px] h-[18px]" />,
  taxes: <FileText className="w-[18px] h-[18px]" />,
  health: <Heart className="w-[18px] h-[18px]" />,
  social: <Users className="w-[18px] h-[18px]" />,
  ideas: <Lightbulb className="w-[18px] h-[18px]" />,
  goals: <Target className="w-[18px] h-[18px]" />,
  spiritual: <Cross className="w-[18px] h-[18px]" />,
  music: <Music className="w-[18px] h-[18px]" />,
};

export function Sidebar({ selectedCategory, onCategorySelect }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-[#195de6]/10 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl z-30">
      {/* Brand */}
      <div className="px-8 py-10">
        <span className="text-xs uppercase tracking-[0.3em] font-light text-[#195de6]">
          DIANA
        </span>
      </div>

      {/* Categories */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.3em] font-light text-slate-400 dark:text-slate-500 px-4 mb-4">
            Categories
          </h2>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => onCategorySelect(null)}
                className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-colors ${
                  selectedCategory === null
                    ? 'sidebar-link-active bg-[#195de6]/5'
                    : 'text-slate-500 dark:text-slate-400 hover:text-[#195de6]'
                }`}
              >
                <LayoutDashboard className="w-[18px] h-[18px]" />
                <span className="text-[11px] uppercase tracking-widest">All</span>
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
        className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-colors ${
          isSelected
            ? 'sidebar-link-active bg-[#195de6]/5'
            : 'text-slate-500 dark:text-slate-400 hover:text-[#195de6]'
        }`}
      >
        {CATEGORY_ICONS[category.name] || <LayoutDashboard className="w-[18px] h-[18px]" />}
        <span className="text-[11px] uppercase tracking-widest">{category.label}</span>
      </button>
    </li>
  );
}

import {
  LayoutDashboard,
  Wallet,
  FileText,
  Heart,
  Users,
  Lightbulb,
  Target,
  Cross,
} from 'lucide-react';
import { CATEGORIES, type Category } from '../../types';

interface MobileNavProps {
  selectedCategory: Category | null;
  onCategorySelect: (category: Category | null) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  finance: <Wallet className="w-5 h-5" />,
  taxes: <FileText className="w-5 h-5" />,
  health: <Heart className="w-5 h-5" />,
  social: <Users className="w-5 h-5" />,
  ideas: <Lightbulb className="w-5 h-5" />,
  goals: <Target className="w-5 h-5" />,
  spiritual: <Cross className="w-5 h-5" />,
};

export function MobileNav({ selectedCategory, onCategorySelect }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-[#195de6]/5 dark:border-slate-700/50 z-50">
      <div className="flex overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onCategorySelect(null)}
          className={`flex-shrink-0 flex flex-col items-center py-2.5 px-4 transition-colors ${
            selectedCategory === null
              ? 'text-[#195de6]'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-widest mt-1 font-light">All</span>
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => onCategorySelect(cat.name)}
            className={`flex-shrink-0 flex flex-col items-center py-2.5 px-4 transition-colors ${
              selectedCategory === cat.name
                ? 'text-[#195de6]'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {CATEGORY_ICONS[cat.name] || <LayoutDashboard className="w-5 h-5" />}
            <span className="text-[9px] uppercase tracking-widest mt-1 font-light">{cat.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

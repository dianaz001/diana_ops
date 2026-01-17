export type Category = 'finance' | 'taxes' | 'health' | 'social' | 'ideas' | 'goals';
export type Owner = 'julian' | 'liz' | 'shared';

export interface Entry {
  id: string;
  title: string;
  content: string;
  category: Category;
  subcategory?: string;
  tags: string[];
  owner: Owner;
  created_at: string;
  updated_at: string;
  github_path?: string;
  embedding?: number[];

  // Finance-specific
  amount?: number;
  is_recurring?: boolean;
  frequency?: string;
  due_date?: string;

  // Tax-specific
  tax_year?: number;
  document_type?: string;
  tax_status?: string;

  // Health-specific
  health_type?: string;
  appointment_date?: string;
  provider?: string;

  // Social-specific
  event_date?: string;
  people_involved?: string[];
  location?: string;

  // Ideas-specific
  idea_status?: string;
  sparked_by?: string;

  // Goals-specific
  goal_status?: string;
  target_date?: string;
  progress_percent?: number;
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Session {
  id: string;
  created_at: string;
  expires_at: string;
  remember_me: boolean;
}

export interface Link {
  id: string;
  source_id: string;
  target_id: string;
  created_at: string;
}

export interface CategoryInfo {
  name: Category;
  label: string;
  icon: string;
  color: string;
  subcategories: string[];
}

export const CATEGORIES: CategoryInfo[] = [
  {
    name: 'finance',
    label: 'Finance',
    icon: '💰',
    color: 'bg-green-100 text-green-800',
    subcategories: ['budgets', 'investments', 'planning', 'tracking'],
  },
  {
    name: 'taxes',
    label: 'Taxes',
    icon: '📋',
    color: 'bg-blue-100 text-blue-800',
    subcategories: ['deductions', 'checklists', 'questions'],
  },
  {
    name: 'health',
    label: 'Health',
    icon: '❤️',
    color: 'bg-red-100 text-red-800',
    subcategories: ['julian', 'liz', 'shared', 'fitness', 'nutrition', 'appointments'],
  },
  {
    name: 'social',
    label: 'Social',
    icon: '👥',
    color: 'bg-purple-100 text-purple-800',
    subcategories: ['calendar', 'people', 'events', 'gifts', 'travel'],
  },
  {
    name: 'ideas',
    label: 'Ideas',
    icon: '💡',
    color: 'bg-yellow-100 text-yellow-800',
    subcategories: ['projects', 'creative', 'learning', 'home', 'experiments', 'archive'],
  },
  {
    name: 'goals',
    label: 'Goals',
    icon: '🎯',
    color: 'bg-orange-100 text-orange-800',
    subcategories: ['julian', 'liz', 'shared', 'yearly', 'habits', 'reviews'],
  },
];

export const getCategoryInfo = (category: Category): CategoryInfo => {
  return CATEGORIES.find(c => c.name === category) || CATEGORIES[0];
};

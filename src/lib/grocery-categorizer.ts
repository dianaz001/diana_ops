import type { GroceryCategory, GroceryCategoryInfo } from '../types/grocery';

// ── Category definitions with keyword matching ──────

export const GROCERY_CATEGORIES: GroceryCategoryInfo[] = [
  {
    id: 'fruits_veggies',
    label: 'Fruits & Vegetables',
    color: '#4A3728',
    keywords: [
      'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'raspberry',
      'mango', 'pineapple', 'watermelon', 'peach', 'pear', 'plum', 'cherry', 'kiwi',
      'lemon', 'lime', 'avocado', 'tomato', 'potato', 'onion', 'garlic', 'ginger',
      'carrot', 'broccoli', 'spinach', 'lettuce', 'kale', 'celery', 'cucumber',
      'pepper', 'zucchini', 'squash', 'corn', 'mushroom', 'cabbage', 'cauliflower',
      'eggplant', 'asparagus', 'green bean', 'pea', 'beet', 'radish', 'turnip',
      'sweet potato', 'yam', 'artichoke', 'brussels', 'bok choy', 'arugula',
      'cilantro', 'parsley', 'basil', 'mint', 'dill', 'chive', 'romaine',
      'fruit', 'vegetable', 'veggie', 'produce', 'salad', 'organic banana',
      'plantain', 'papaya', 'guava', 'clementine', 'tangerine', 'mandarin',
      'grapefruit', 'coconut',
    ],
  },
  {
    id: 'legumes_grains',
    label: 'Legumes & Grains',
    color: '#9DAFD0',
    keywords: [
      'bean', 'lentil', 'chickpea', 'rice', 'quinoa', 'oat', 'oatmeal', 'barley',
      'pasta', 'noodle', 'spaghetti', 'penne', 'macaroni', 'farro', 'couscous',
      'cereal', 'granola', 'muesli', 'flour', 'cornmeal', 'polenta', 'bulgur',
      'frijol', 'arroz', 'lenteja', 'garbanzo', 'black bean', 'kidney bean',
      'pinto bean', 'split pea', 'wild rice', 'brown rice',
      'basmati', 'jasmine rice', 'whole wheat', 'grain', 'legume',
    ],
  },
  {
    id: 'dairy',
    label: 'Dairy & Cheese',
    color: '#C4A882',
    keywords: [
      'milk', 'cheese', 'yogurt', 'yoghurt', 'butter', 'cream', 'sour cream',
      'cream cheese', 'cottage cheese', 'ricotta', 'mozzarella', 'cheddar',
      'parmesan', 'gouda', 'brie', 'feta', 'swiss', 'provolone', 'colby',
      'monterey jack', 'goat cheese', 'blue cheese', 'queso', 'leche',
      'mantequilla', 'crema', 'half & half', 'whipping cream',
      'almond milk', 'oat milk', 'soy milk', 'coconut milk',
      'egg', 'eggs', 'huevo', 'dozen egg', 'free range egg',
    ],
  },
  {
    id: 'meats_seafood',
    label: 'Meats & Seafood',
    color: '#D4763C',
    keywords: [
      'chicken', 'beef', 'pork', 'turkey', 'lamb', 'veal', 'duck', 'bison',
      'steak', 'ground beef', 'ground turkey', 'ground pork', 'ground chicken',
      'breast', 'thigh', 'drumstick', 'wing', 'rib', 'roast', 'tenderloin',
      'sirloin', 'filet', 'fillet', 'chop', 'sausage', 'bacon', 'ham',
      'salami', 'pepperoni', 'deli meat', 'hot dog', 'bratwurst',
      'salmon', 'tuna', 'shrimp', 'prawn', 'cod', 'tilapia', 'halibut',
      'trout', 'catfish', 'crab', 'lobster', 'clam', 'mussel', 'oyster',
      'scallop', 'squid', 'calamari', 'fish', 'seafood', 'meat',
      'pollo', 'carne', 'cerdo', 'res', 'pescado', 'camaron',
    ],
  },
  {
    id: 'cleaning_household',
    label: 'Cleaning & Household',
    color: '#282627',
    keywords: [
      'dish soap', 'dishwasher', 'detergent', 'laundry', 'fabric softener',
      'bleach', 'cleaner', 'cleaning', 'wipe', 'sponge', 'mop',
      'broom', 'trash bag', 'garbage bag', 'paper towel', 'toilet paper',
      'tissue', 'napkin', 'aluminum foil', 'plastic wrap', 'ziploc',
      'storage bag', 'light bulb', 'battery', 'candle',
      'air freshener', 'febreze', 'lysol', 'clorox', 'ajax',
      'windex', 'swiffer', 'bounty', 'charmin', 'glad',
      'hefty', 'reynolds', 'household', 'kitchen towel',
    ],
  },
  {
    id: 'protein_supplements',
    label: 'Protein & Supplements',
    color: '#4A6FA5',
    keywords: [
      'protein', 'whey', 'casein', 'creatine', 'bcaa', 'pre-workout',
      'preworkout', 'supplement', 'vitamin', 'multivitamin',
      'fish oil', 'omega', 'collagen', 'probiotic', 'prebiotic',
      'protein bar', 'protein shake', 'protein powder', 'mass gainer',
      'amino acid', 'glutamine', 'zinc', 'magnesium',
      'calcium supplement', 'vitamin d', 'vitamin c', 'b12', 'biotin',
      'ashwagandha', 'melatonin', 'electrolyte',
    ],
  },
  {
    id: 'beverages',
    label: 'Beverages',
    color: '#3D5A80',
    keywords: [
      'water', 'juice', 'soda', 'pop', 'cola', 'sprite', 'fanta',
      'coffee', 'tea', 'energy drink', 'gatorade', 'powerade',
      'lemonade', 'iced tea', 'kombucha', 'smoothie', 'sparkling',
      'seltzer', 'tonic', 'beer', 'wine',
      'coca cola', 'pepsi', 'red bull', 'monster',
      'starbucks', 'nespresso', 'keurig', 'k-cup', 'creamer',
    ],
  },
  {
    id: 'snacks_sweets',
    label: 'Snacks & Sweets',
    color: '#8B7355',
    keywords: [
      'chip', 'crisp', 'cracker', 'pretzel', 'popcorn', 'nut', 'almond',
      'cashew', 'peanut', 'walnut', 'pistachio', 'pecan', 'trail mix',
      'chocolate', 'candy', 'gummy', 'cookie', 'biscuit', 'brownie',
      'cake', 'pie', 'pastry', 'donut', 'doughnut', 'muffin', 'cupcake',
      'ice cream', 'gelato', 'popsicle', 'sorbet', 'pudding', 'jello',
      'oreo', 'doritos', 'cheetos', 'lays', 'pringles', 'ruffles',
      'snack', 'sweet', 'treat', 'dessert', 'sugar', 'honey',
      'maple syrup', 'nutella', 'jam', 'jelly', 'marmalade',
    ],
  },
  {
    id: 'bakery_bread',
    label: 'Bakery & Bread',
    color: '#B89660',
    keywords: [
      'bread', 'bagel', 'baguette', 'roll', 'bun', 'croissant', 'pita',
      'tortilla', 'wrap', 'naan', 'flatbread', 'sourdough', 'rye',
      'whole wheat bread', 'white bread', 'multigrain', 'english muffin',
      'hamburger bun', 'hot dog bun', 'ciabatta', 'focaccia', 'brioche',
      'pan', 'bakery',
    ],
  },
  {
    id: 'frozen_prepared',
    label: 'Frozen & Prepared',
    color: '#9CB5A4',
    keywords: [
      'frozen', 'pizza', 'burrito', 'lasagna', 'dinner', 'meal', 'entree',
      'pot pie', 'corn dog', 'nugget', 'fish stick', 'waffle', 'pancake',
      'french fries', 'fries', 'tater tot', 'hash brown', 'ice',
      'frozen vegetable', 'frozen fruit', 'tv dinner',
      'lean cuisine', 'hot pocket',
      'deli', 'rotisserie', 'prepared', 'ready to eat',
    ],
  },
  {
    id: 'condiments_spices',
    label: 'Condiments & Spices',
    color: '#E8DED1',
    keywords: [
      'ketchup', 'mustard', 'mayo', 'mayonnaise', 'hot sauce', 'soy sauce',
      'worcestershire', 'vinegar', 'olive oil', 'vegetable oil', 'canola oil',
      'coconut oil', 'sesame oil', 'cooking spray', 'salt', 'pepper',
      'cumin', 'paprika', 'oregano', 'thyme', 'rosemary', 'cinnamon',
      'nutmeg', 'chili powder', 'garlic powder', 'onion powder',
      'bay leaf', 'cayenne', 'curry', 'coriander',
      'salsa', 'guacamole', 'hummus', 'dressing', 'ranch', 'bbq sauce',
      'teriyaki', 'sriracha', 'tabasco', 'relish',
      'sauce', 'spice', 'seasoning', 'marinade', 'broth', 'stock',
      'bouillon', 'tomato sauce', 'tomato paste', 'canned tomato',
    ],
  },
  {
    id: 'personal_care',
    label: 'Personal Care',
    color: '#1A1A1A',
    keywords: [
      'shampoo', 'conditioner', 'body wash', 'soap', 'hand soap',
      'toothpaste', 'toothbrush', 'mouthwash', 'floss', 'deodorant',
      'lotion', 'moisturizer', 'sunscreen', 'razor', 'shaving',
      'cotton', 'bandage', 'band-aid', 'medicine', 'tylenol', 'advil',
      'ibuprofen', 'acetaminophen', 'cough', 'cold medicine',
      'sanitary', 'tampon', 'diaper', 'baby wipe',
      'hand sanitizer', 'face wash', 'makeup', 'cosmetic',
    ],
  },
  {
    id: 'other',
    label: 'Other',
    color: '#6B5B4F',
    keywords: [],
  },
];

const CATEGORY_MAP = new Map(GROCERY_CATEGORIES.map((c) => [c.id, c]));

export function getCategoryInfo(id: GroceryCategory): GroceryCategoryInfo {
  return CATEGORY_MAP.get(id) || GROCERY_CATEGORIES[GROCERY_CATEGORIES.length - 1];
}

export function getCategoryColor(id: GroceryCategory): string {
  return getCategoryInfo(id).color;
}

export function getCategoryLabel(id: GroceryCategory): string {
  return getCategoryInfo(id).label;
}

/**
 * Auto-categorize a grocery item name.
 * Matches against keyword lists, returns best match or 'other'.
 */
export function categorizeItem(itemName: string): GroceryCategory {
  const lower = itemName.toLowerCase().trim();

  let bestCategory: GroceryCategory = 'other';
  let bestScore = 0;

  for (const cat of GROCERY_CATEGORIES) {
    if (cat.id === 'other') continue;

    for (const keyword of cat.keywords) {
      if (lower.includes(keyword)) {
        const score = keyword.length;
        if (score > bestScore) {
          bestScore = score;
          bestCategory = cat.id;
        }
      }
    }
  }

  return bestCategory;
}

/**
 * Get all category options for dropdowns
 */
export function getAllCategories(): { value: GroceryCategory; label: string }[] {
  return GROCERY_CATEGORIES.map((c) => ({ value: c.id, label: c.label }));
}

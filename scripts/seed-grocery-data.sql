-- Seed data: 6 months of grocery expenses for an average Toronto person
-- Total budget: ~$3,000 (Oct 2025 - Mar 2026)
-- Stores: No Frills, Loblaws, Metro, Costco, FreshCo, T&T Supermarket

-- First, update CHECK constraints to allow 'diana' as owner
DO $$
BEGIN
  -- diana_portal_entries
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name LIKE '%owner%' AND table_name = 'diana_portal_entries'
  ) THEN
    ALTER TABLE diana_portal_entries DROP CONSTRAINT IF EXISTS diana_portal_entries_owner_check;
  END IF;
  ALTER TABLE diana_portal_entries ADD CONSTRAINT diana_portal_entries_owner_check CHECK (owner IN ('diana','shared'));
  UPDATE diana_portal_entries SET owner = 'diana' WHERE owner IN ('julian','liz');

  -- grocery_receipts
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name LIKE '%owner%' AND table_name = 'grocery_receipts'
  ) THEN
    ALTER TABLE grocery_receipts DROP CONSTRAINT IF EXISTS grocery_receipts_owner_check;
  END IF;
  ALTER TABLE grocery_receipts ADD CONSTRAINT grocery_receipts_owner_check CHECK (owner IN ('diana','shared'));
  UPDATE grocery_receipts SET owner = 'diana' WHERE owner IN ('julian','liz');

  -- grocery_items
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name LIKE '%owner%' AND table_name = 'grocery_items'
  ) THEN
    ALTER TABLE grocery_items DROP CONSTRAINT IF EXISTS grocery_items_owner_check;
  END IF;
  ALTER TABLE grocery_items ADD CONSTRAINT grocery_items_owner_check CHECK (owner IN ('diana','shared'));
  UPDATE grocery_items SET owner = 'diana' WHERE owner IN ('julian','liz');
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Constraint update encountered an issue: %', SQLERRM;
END $$;

-- ═══════════════════════════════════════════
-- RECEIPTS (18 trips over 6 months)
-- ═══════════════════════════════════════════

INSERT INTO grocery_receipts (id, store_name, receipt_date, subtotal, tax, total, owner) VALUES

-- October 2025 (3 trips, ~$480)
('r-2025-10-03', 'No Frills',    '2025-10-03', 142.35, 7.82, 150.17, 'diana'),
('r-2025-10-14', 'Costco',       '2025-10-14', 189.50, 10.42, 199.92, 'diana'),
('r-2025-10-27', 'Metro',        '2025-10-27', 123.80, 6.81, 130.61, 'diana'),

-- November 2025 (3 trips, ~$520)
('r-2025-11-02', 'Loblaws',      '2025-11-02', 156.40, 8.60, 165.00, 'diana'),
('r-2025-11-15', 'T&T Supermarket', '2025-11-15', 98.70, 5.43, 104.13, 'diana'),
('r-2025-11-28', 'Costco',       '2025-11-28', 237.20, 13.05, 250.25, 'diana'),

-- December 2025 (3 trips, ~$580 — holiday bump)
('r-2025-12-06', 'No Frills',    '2025-12-06', 134.90, 7.42, 142.32, 'diana'),
('r-2025-12-18', 'Loblaws',      '2025-12-18', 198.60, 10.92, 209.52, 'diana'),
('r-2025-12-30', 'Metro',        '2025-12-30', 216.40, 11.90, 228.30, 'diana'),

-- January 2026 (3 trips, ~$460)
('r-2026-01-05', 'FreshCo',      '2026-01-05', 118.30, 6.51, 124.81, 'diana'),
('r-2026-01-17', 'No Frills',    '2026-01-17', 145.60, 8.01, 153.61, 'diana'),
('r-2026-01-29', 'Costco',       '2026-01-29', 172.40, 9.48, 181.88, 'diana'),

-- February 2026 (3 trips, ~$470)
('r-2026-02-08', 'Metro',        '2026-02-08', 132.50, 7.29, 139.79, 'diana'),
('r-2026-02-16', 'T&T Supermarket', '2026-02-16', 108.90, 5.99, 114.89, 'diana'),
('r-2026-02-27', 'Loblaws',      '2026-02-27', 201.30, 11.07, 212.37, 'diana'),

-- March 2026 (3 trips, ~$490)
('r-2026-03-05', 'No Frills',    '2026-03-05', 139.70, 7.68, 147.38, 'diana'),
('r-2026-03-15', 'FreshCo',      '2026-03-15', 155.20, 8.54, 163.74, 'diana'),
('r-2026-03-24', 'Costco',       '2026-03-24', 168.90, 9.29, 178.19, 'diana');


-- ═══════════════════════════════════════════
-- ITEMS (~8-15 items per receipt)
-- ═══════════════════════════════════════════

INSERT INTO grocery_items (receipt_id, name, price, quantity, unit_price, category, tax_amount, owner, item_date, is_manual) VALUES

-- ── Oct 3: No Frills ($142.35) ──
('r-2025-10-03', 'Bananas (bunch)',        1.99, 1, 1.99, 'fruits_veggies', 0.00, 'diana', '2025-10-03', false),
('r-2025-10-03', 'Broccoli Crowns',        3.49, 1, 3.49, 'fruits_veggies', 0.00, 'diana', '2025-10-03', false),
('r-2025-10-03', 'Baby Spinach 312g',      4.99, 1, 4.99, 'fruits_veggies', 0.00, 'diana', '2025-10-03', false),
('r-2025-10-03', 'Chicken Breast 1kg',     14.99, 1, 14.99, 'meats_seafood', 0.00, 'diana', '2025-10-03', false),
('r-2025-10-03', 'Ground Beef Lean',       9.99, 1, 9.99, 'meats_seafood', 0.00, 'diana', '2025-10-03', false),
('r-2025-10-03', 'Beatrice 2% Milk 4L',    6.49, 1, 6.49, 'dairy', 0.00, 'diana', '2025-10-03', false),
('r-2025-10-03', 'Eggs Large 12pk',        5.29, 1, 5.29, 'dairy', 0.00, 'diana', '2025-10-03', false),
('r-2025-10-03', 'Basmati Rice 4kg',       12.99, 1, 12.99, 'legumes_grains', 0.00, 'diana', '2025-10-03', false),
('r-2025-10-03', 'Dempsters Whole Wheat',  4.49, 1, 4.49, 'bakery_bread', 0.00, 'diana', '2025-10-03', false),
('r-2025-10-03', 'Tomato Sauce 680ml',     2.49, 2, 1.25, 'condiments_spices', 0.00, 'diana', '2025-10-03', false),
('r-2025-10-03', 'Cheddar Cheese 400g',    7.99, 1, 7.99, 'dairy', 0.00, 'diana', '2025-10-03', false),
('r-2025-10-03', 'Dish Soap Dawn',         4.99, 1, 4.99, 'cleaning_household', 0.65, 'diana', '2025-10-03', false),
('r-2025-10-03', 'Paper Towels 6-roll',    8.99, 1, 8.99, 'cleaning_household', 1.17, 'diana', '2025-10-03', false),
('r-2025-10-03', 'Orange Juice 2.63L',     5.99, 1, 5.99, 'beverages', 0.00, 'diana', '2025-10-03', false),
('r-2025-10-03', 'Frozen Pizza Delissio',  7.49, 1, 7.49, 'frozen_prepared', 0.00, 'diana', '2025-10-03', false),
('r-2025-10-03', 'Greek Yogurt 750g',      6.49, 1, 6.49, 'dairy', 0.00, 'diana', '2025-10-03', false),
('r-2025-10-03', 'Doritos Nacho',          4.49, 1, 4.49, 'snacks_sweets', 0.00, 'diana', '2025-10-03', false),
('r-2025-10-03', 'Instant Coffee Nescafe', 12.99, 1, 12.99, 'beverages', 0.00, 'diana', '2025-10-03', false),
('r-2025-10-03', 'Red Onions 3lb bag',     3.49, 1, 3.49, 'fruits_veggies', 0.00, 'diana', '2025-10-03', false),
('r-2025-10-03', 'Garlic 3-pack',          2.29, 1, 2.29, 'fruits_veggies', 0.00, 'diana', '2025-10-03', false),

-- ── Oct 14: Costco ($189.50) ──
('r-2025-10-14', 'Kirkland Chicken Thighs 2.5kg', 22.99, 1, 22.99, 'meats_seafood', 0.00, 'diana', '2025-10-14', false),
('r-2025-10-14', 'Atlantic Salmon Fillets 1kg',   18.99, 1, 18.99, 'meats_seafood', 0.00, 'diana', '2025-10-14', false),
('r-2025-10-14', 'Kirkland Olive Oil 2L',         16.99, 1, 16.99, 'condiments_spices', 0.00, 'diana', '2025-10-14', false),
('r-2025-10-14', 'Organic Blueberries 1.5lb',     9.99, 1, 9.99, 'fruits_veggies', 0.00, 'diana', '2025-10-14', false),
('r-2025-10-14', 'Kirkland Toilet Paper 30pk',    22.99, 1, 22.99, 'cleaning_household', 2.99, 'diana', '2025-10-14', false),
('r-2025-10-14', 'Parmigiano Reggiano 1kg',       19.99, 1, 19.99, 'dairy', 0.00, 'diana', '2025-10-14', false),
('r-2025-10-14', 'Kirkland Trash Bags 200ct',     15.99, 1, 15.99, 'cleaning_household', 2.08, 'diana', '2025-10-14', false),
('r-2025-10-14', 'Mixed Nuts 1.13kg',             17.99, 1, 17.99, 'snacks_sweets', 0.00, 'diana', '2025-10-14', false),
('r-2025-10-14', 'Rotisserie Chicken',            9.99, 1, 9.99, 'meats_seafood', 0.00, 'diana', '2025-10-14', false),
('r-2025-10-14', 'Avocados 6-pack',               8.99, 1, 8.99, 'fruits_veggies', 0.00, 'diana', '2025-10-14', false),
('r-2025-10-14', 'Quinoa 2kg',                    14.99, 1, 14.99, 'legumes_grains', 0.00, 'diana', '2025-10-14', false),
('r-2025-10-14', 'Laundry Detergent Tide 4.43L',  19.99, 1, 19.99, 'cleaning_household', 2.60, 'diana', '2025-10-14', false),

-- ── Oct 27: Metro ($123.80) ──
('r-2025-10-27', 'Sweet Potatoes 3lb',     4.99, 1, 4.99, 'fruits_veggies', 0.00, 'diana', '2025-10-27', false),
('r-2025-10-27', 'Zucchini',               2.49, 2, 1.25, 'fruits_veggies', 0.00, 'diana', '2025-10-27', false),
('r-2025-10-27', 'Selection Pasta 900g',   2.99, 2, 1.50, 'legumes_grains', 0.00, 'diana', '2025-10-27', false),
('r-2025-10-27', 'Pork Tenderloin',        12.99, 1, 12.99, 'meats_seafood', 0.00, 'diana', '2025-10-27', false),
('r-2025-10-27', 'Greek Yogurt Oikos 4pk', 7.99, 1, 7.99, 'dairy', 0.00, 'diana', '2025-10-27', false),
('r-2025-10-27', 'Mushrooms 227g',         3.49, 1, 3.49, 'fruits_veggies', 0.00, 'diana', '2025-10-27', false),
('r-2025-10-27', 'Shrimp Frozen 454g',     13.99, 1, 13.99, 'meats_seafood', 0.00, 'diana', '2025-10-27', false),
('r-2025-10-27', 'Butter Lactantia 454g',  6.49, 1, 6.49, 'dairy', 0.00, 'diana', '2025-10-27', false),
('r-2025-10-27', 'Tortillas 10pk',         4.49, 1, 4.49, 'bakery_bread', 0.00, 'diana', '2025-10-27', false),
('r-2025-10-27', 'Black Beans 540ml',      1.69, 3, 0.56, 'legumes_grains', 0.00, 'diana', '2025-10-27', false),
('r-2025-10-27', 'Tim Hortons K-Cups 30',  24.99, 1, 24.99, 'beverages', 3.25, 'diana', '2025-10-27', false),
('r-2025-10-27', 'Bell Peppers 3pk',       5.99, 1, 5.99, 'fruits_veggies', 0.00, 'diana', '2025-10-27', false),
('r-2025-10-27', 'Ice Cream Häagen-Dazs',  7.99, 1, 7.99, 'snacks_sweets', 0.00, 'diana', '2025-10-27', false),
('r-2025-10-27', 'Toothpaste Colgate',     4.99, 1, 4.99, 'personal_care', 0.65, 'diana', '2025-10-27', false),
('r-2025-10-27', 'Deodorant Dove',         5.99, 1, 5.99, 'personal_care', 0.78, 'diana', '2025-10-27', false),

-- ── Nov 2: Loblaws ($156.40) ──
('r-2025-11-02', 'PC Free-Run Chicken 1.2kg', 16.99, 1, 16.99, 'meats_seafood', 0.00, 'diana', '2025-11-02', false),
('r-2025-11-02', 'PC Org Mixed Greens',       5.99, 1, 5.99, 'fruits_veggies', 0.00, 'diana', '2025-11-02', false),
('r-2025-11-02', 'Apples Honeycrisp 3lb',     7.49, 1, 7.49, 'fruits_veggies', 0.00, 'diana', '2025-11-02', false),
('r-2025-11-02', 'PC Blue Menu Salmon 2pk',   15.99, 1, 15.99, 'meats_seafood', 0.00, 'diana', '2025-11-02', false),
('r-2025-11-02', 'Natrel Cream 10% 1L',       4.49, 1, 4.49, 'dairy', 0.00, 'diana', '2025-11-02', false),
('r-2025-11-02', 'Baguette Fresh',            2.99, 1, 2.99, 'bakery_bread', 0.00, 'diana', '2025-11-02', false),
('r-2025-11-02', 'Lentils Red 900g',          4.99, 1, 4.99, 'legumes_grains', 0.00, 'diana', '2025-11-02', false),
('r-2025-11-02', 'Carrots 5lb bag',           4.49, 1, 4.49, 'fruits_veggies', 0.00, 'diana', '2025-11-02', false),
('r-2025-11-02', 'Soy Sauce Kikkoman 600ml',  4.99, 1, 4.99, 'condiments_spices', 0.00, 'diana', '2025-11-02', false),
('r-2025-11-02', 'Whey Protein Isolate 2lb',  39.99, 1, 39.99, 'protein_supplements', 5.20, 'diana', '2025-11-02', false),
('r-2025-11-02', 'Sparkling Water 12pk',      6.99, 1, 6.99, 'beverages', 0.00, 'diana', '2025-11-02', false),
('r-2025-11-02', 'PC Cookies Decadent',       4.49, 1, 4.49, 'snacks_sweets', 0.00, 'diana', '2025-11-02', false),
('r-2025-11-02', 'Frozen Berries Mix 600g',   6.99, 1, 6.99, 'frozen_prepared', 0.00, 'diana', '2025-11-02', false),
('r-2025-11-02', 'Eggs Free-Range 12pk',      7.49, 1, 7.49, 'dairy', 0.00, 'diana', '2025-11-02', false),
('r-2025-11-02', 'Cucumber English',          1.99, 2, 1.00, 'fruits_veggies', 0.00, 'diana', '2025-11-02', false),
('r-2025-11-02', 'Swiffer Refills',           12.99, 1, 12.99, 'cleaning_household', 1.69, 'diana', '2025-11-02', false),

-- ── Nov 15: T&T Supermarket ($98.70) ──
('r-2025-11-15', 'Bok Choy Fresh',          2.49, 1, 2.49, 'fruits_veggies', 0.00, 'diana', '2025-11-15', false),
('r-2025-11-15', 'Jasmine Rice 5kg',        13.99, 1, 13.99, 'legumes_grains', 0.00, 'diana', '2025-11-15', false),
('r-2025-11-15', 'Tofu Extra Firm 2pk',     4.99, 1, 4.99, 'legumes_grains', 0.00, 'diana', '2025-11-15', false),
('r-2025-11-15', 'Fresh Ginger Root',       2.99, 1, 2.99, 'fruits_veggies', 0.00, 'diana', '2025-11-15', false),
('r-2025-11-15', 'Napa Cabbage',            3.49, 1, 3.49, 'fruits_veggies', 0.00, 'diana', '2025-11-15', false),
('r-2025-11-15', 'Pork Belly Sliced 500g',  9.99, 1, 9.99, 'meats_seafood', 0.00, 'diana', '2025-11-15', false),
('r-2025-11-15', 'Udon Noodles 5pk',        5.99, 1, 5.99, 'legumes_grains', 0.00, 'diana', '2025-11-15', false),
('r-2025-11-15', 'Sesame Oil 360ml',        5.49, 1, 5.49, 'condiments_spices', 0.00, 'diana', '2025-11-15', false),
('r-2025-11-15', 'Miso Paste 500g',         6.99, 1, 6.99, 'condiments_spices', 0.00, 'diana', '2025-11-15', false),
('r-2025-11-15', 'Dumplings Frozen 600g',   8.99, 1, 8.99, 'frozen_prepared', 0.00, 'diana', '2025-11-15', false),
('r-2025-11-15', 'Green Onions (bunch)',     1.29, 2, 0.65, 'fruits_veggies', 0.00, 'diana', '2025-11-15', false),
('r-2025-11-15', 'Matcha Latte Mix',        12.99, 1, 12.99, 'beverages', 0.00, 'diana', '2025-11-15', false),
('r-2025-11-15', 'Mochi Ice Cream 6pk',     8.99, 1, 8.99, 'snacks_sweets', 0.00, 'diana', '2025-11-15', false),
('r-2025-11-15', 'Sriracha Sauce 450ml',    4.99, 1, 4.99, 'condiments_spices', 0.00, 'diana', '2025-11-15', false),

-- ── Nov 28: Costco ($237.20) ──
('r-2025-11-28', 'Kirkland Ground Turkey 2kg',   16.99, 1, 16.99, 'meats_seafood', 0.00, 'diana', '2025-11-28', false),
('r-2025-11-28', 'Kirkland Bacon 4pk',           19.99, 1, 19.99, 'meats_seafood', 0.00, 'diana', '2025-11-28', false),
('r-2025-11-28', 'Organic Strawberries 2lb',     8.99, 1, 8.99, 'fruits_veggies', 0.00, 'diana', '2025-11-28', false),
('r-2025-11-28', 'Kirkland Almond Butter',       12.99, 1, 12.99, 'condiments_spices', 0.00, 'diana', '2025-11-28', false),
('r-2025-11-28', 'Kirkland Paper Towels 12pk',   24.99, 1, 24.99, 'cleaning_household', 3.25, 'diana', '2025-11-28', false),
('r-2025-11-28', 'Kirkland Laundry Pods 120ct',  22.99, 1, 22.99, 'cleaning_household', 2.99, 'diana', '2025-11-28', false),
('r-2025-11-28', 'Organic Eggs 24pk',            12.49, 1, 12.49, 'dairy', 0.00, 'diana', '2025-11-28', false),
('r-2025-11-28', 'Kirkland Croissants 12pk',     7.99, 1, 7.99, 'bakery_bread', 0.00, 'diana', '2025-11-28', false),
('r-2025-11-28', 'Kirkland Greek Yogurt 3pk',    9.99, 1, 9.99, 'dairy', 0.00, 'diana', '2025-11-28', false),
('r-2025-11-28', 'Kirkland Protein Bars 20pk',   24.99, 1, 24.99, 'protein_supplements', 3.25, 'diana', '2025-11-28', false),
('r-2025-11-28', 'Frozen Vegetables Mix 2.5kg',  11.99, 1, 11.99, 'frozen_prepared', 0.00, 'diana', '2025-11-28', false),
('r-2025-11-28', 'Kirkland Spring Water 40pk',   5.99, 1, 5.99, 'beverages', 0.00, 'diana', '2025-11-28', false),
('r-2025-11-28', 'Raspberries 340g',             5.99, 1, 5.99, 'fruits_veggies', 0.00, 'diana', '2025-11-28', false),
('r-2025-11-28', 'Kirkland Vitamin D3',          14.99, 1, 14.99, 'protein_supplements', 1.95, 'diana', '2025-11-28', false),
('r-2025-11-28', 'Dark Chocolate Bark',          12.99, 1, 12.99, 'snacks_sweets', 0.00, 'diana', '2025-11-28', false),

-- ── Dec 6: No Frills ($134.90) ──
('r-2025-12-06', 'Potatoes 10lb bag',       5.99, 1, 5.99, 'fruits_veggies', 0.00, 'diana', '2025-12-06', false),
('r-2025-12-06', 'Celery Stalk',            2.99, 1, 2.99, 'fruits_veggies', 0.00, 'diana', '2025-12-06', false),
('r-2025-12-06', 'Chicken Drumsticks 2kg',  9.99, 1, 9.99, 'meats_seafood', 0.00, 'diana', '2025-12-06', false),
('r-2025-12-06', 'Canned Tomatoes 796ml',   1.99, 3, 0.66, 'condiments_spices', 0.00, 'diana', '2025-12-06', false),
('r-2025-12-06', 'Chickpeas 540ml',         1.49, 3, 0.50, 'legumes_grains', 0.00, 'diana', '2025-12-06', false),
('r-2025-12-06', 'Marble Cheese Block 600g', 9.49, 1, 9.49, 'dairy', 0.00, 'diana', '2025-12-06', false),
('r-2025-12-06', 'Milk 2% 4L',             6.49, 1, 6.49, 'dairy', 0.00, 'diana', '2025-12-06', false),
('r-2025-12-06', 'Bagels 6pk',             4.49, 1, 4.49, 'bakery_bread', 0.00, 'diana', '2025-12-06', false),
('r-2025-12-06', 'Frozen Perogies 907g',   5.49, 1, 5.49, 'frozen_prepared', 0.00, 'diana', '2025-12-06', false),
('r-2025-12-06', 'Green Tea Bags 72ct',    7.99, 1, 7.99, 'beverages', 0.00, 'diana', '2025-12-06', false),
('r-2025-12-06', 'Onions 3lb Yellow',      3.49, 1, 3.49, 'fruits_veggies', 0.00, 'diana', '2025-12-06', false),
('r-2025-12-06', 'Sour Cream 500ml',       3.49, 1, 3.49, 'dairy', 0.00, 'diana', '2025-12-06', false),
('r-2025-12-06', 'Granola Bars 12pk',      5.99, 1, 5.99, 'snacks_sweets', 0.00, 'diana', '2025-12-06', false),
('r-2025-12-06', 'All-Purpose Cleaner',    5.99, 1, 5.99, 'cleaning_household', 0.78, 'diana', '2025-12-06', false),
('r-2025-12-06', 'Cucumbers Mini 12pk',    4.99, 1, 4.99, 'fruits_veggies', 0.00, 'diana', '2025-12-06', false),
('r-2025-12-06', 'Romaine Hearts 3pk',     4.49, 1, 4.49, 'fruits_veggies', 0.00, 'diana', '2025-12-06', false),
('r-2025-12-06', 'Shampoo Pantene',        8.99, 1, 8.99, 'personal_care', 1.17, 'diana', '2025-12-06', false),

-- ── Dec 18: Loblaws ($198.60) — holiday shopping ──
('r-2025-12-18', 'Turkey Breast Bone-In 3kg',  29.99, 1, 29.99, 'meats_seafood', 0.00, 'diana', '2025-12-18', false),
('r-2025-12-18', 'Cranberry Sauce',             3.99, 1, 3.99, 'condiments_spices', 0.00, 'diana', '2025-12-18', false),
('r-2025-12-18', 'Brussels Sprouts 340g',       4.49, 1, 4.49, 'fruits_veggies', 0.00, 'diana', '2025-12-18', false),
('r-2025-12-18', 'PC Gravy Mix',                2.49, 2, 1.25, 'condiments_spices', 0.00, 'diana', '2025-12-18', false),
('r-2025-12-18', 'Brie Cheese 200g',            7.99, 1, 7.99, 'dairy', 0.00, 'diana', '2025-12-18', false),
('r-2025-12-18', 'Wine Cabernet 750ml',         14.99, 1, 14.99, 'beverages', 0.00, 'diana', '2025-12-18', false),
('r-2025-12-18', 'Sparkling Cider 750ml',       5.99, 1, 5.99, 'beverages', 0.00, 'diana', '2025-12-18', false),
('r-2025-12-18', 'Dinner Rolls 12pk',           4.99, 1, 4.99, 'bakery_bread', 0.00, 'diana', '2025-12-18', false),
('r-2025-12-18', 'Cream Cheese Philadelphia',   5.49, 1, 5.49, 'dairy', 0.00, 'diana', '2025-12-18', false),
('r-2025-12-18', 'Chocolate Box Lindt',         14.99, 1, 14.99, 'snacks_sweets', 0.00, 'diana', '2025-12-18', false),
('r-2025-12-18', 'Frozen Pie Shells 2pk',       5.49, 1, 5.49, 'frozen_prepared', 0.00, 'diana', '2025-12-18', false),
('r-2025-12-18', 'Heavy Cream 35% 473ml',       5.49, 1, 5.49, 'dairy', 0.00, 'diana', '2025-12-18', false),
('r-2025-12-18', 'PC Hummus 227g',              4.49, 1, 4.49, 'condiments_spices', 0.00, 'diana', '2025-12-18', false),
('r-2025-12-18', 'Crackers Triscuit',           4.49, 1, 4.49, 'snacks_sweets', 0.00, 'diana', '2025-12-18', false),
('r-2025-12-18', 'Sweet Potatoes',              4.99, 2, 2.50, 'fruits_veggies', 0.00, 'diana', '2025-12-18', false),
('r-2025-12-18', 'Napkins Party 100ct',         4.99, 1, 4.99, 'cleaning_household', 0.65, 'diana', '2025-12-18', false),
('r-2025-12-18', 'Mandarin Oranges 5lb',        8.99, 1, 8.99, 'fruits_veggies', 0.00, 'diana', '2025-12-18', false),
('r-2025-12-18', 'Stuffing Mix',                3.49, 1, 3.49, 'legumes_grains', 0.00, 'diana', '2025-12-18', false),
('r-2025-12-18', 'Vanilla Extract 118ml',       8.99, 1, 8.99, 'condiments_spices', 0.00, 'diana', '2025-12-18', false),
('r-2025-12-18', 'Aluminum Foil Heavy Duty',    6.99, 1, 6.99, 'cleaning_household', 0.91, 'diana', '2025-12-18', false),

-- ── Dec 30: Metro ($216.40) — post-holiday stock-up ──
('r-2025-12-30', 'Beef Stewing Cubes 1kg',  16.99, 1, 16.99, 'meats_seafood', 0.00, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Chicken Sausages 500g',   8.99, 1, 8.99, 'meats_seafood', 0.00, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Kale Organic Bunch',      3.99, 1, 3.99, 'fruits_veggies', 0.00, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Cauliflower Head',        4.49, 1, 4.49, 'fruits_veggies', 0.00, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Hummus Large 680g',       6.49, 1, 6.49, 'condiments_spices', 0.00, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Coconut Milk 4pk',        5.99, 1, 5.99, 'beverages', 0.00, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Brown Rice 2kg',          6.99, 1, 6.99, 'legumes_grains', 0.00, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Yogurt Skyr 500g',        5.49, 1, 5.49, 'dairy', 0.00, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Frozen Edamame 500g',     4.99, 1, 4.99, 'frozen_prepared', 0.00, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Frozen Burritos 6pk',     9.99, 1, 9.99, 'frozen_prepared', 0.00, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Olive Oil 500ml',         9.99, 1, 9.99, 'condiments_spices', 0.00, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Sourdough Loaf',          5.49, 1, 5.49, 'bakery_bread', 0.00, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Grapes Red 2lb',          6.99, 1, 6.99, 'fruits_veggies', 0.00, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Cheddar Aged 300g',       8.99, 1, 8.99, 'dairy', 0.00, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Fish Oil Supplements',    14.99, 1, 14.99, 'protein_supplements', 1.95, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Popcorn Kernels 850g',    4.99, 1, 4.99, 'snacks_sweets', 0.00, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Trash Bags 40ct',         7.99, 1, 7.99, 'cleaning_household', 1.04, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Body Wash Dove',          6.99, 1, 6.99, 'personal_care', 0.91, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Clementines 3lb bag',     5.99, 1, 5.99, 'fruits_veggies', 0.00, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Pasta Sauce Rao 660ml',   9.99, 1, 9.99, 'condiments_spices', 0.00, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Frozen Mango Chunks 600g', 5.99, 1, 5.99, 'frozen_prepared', 0.00, 'diana', '2025-12-30', false),
('r-2025-12-30', 'Multivitamin Women',      18.99, 1, 18.99, 'protein_supplements', 2.47, 'diana', '2025-12-30', false),

-- ── Jan 5: FreshCo ($118.30) ──
('r-2026-01-05', 'Bananas',                1.49, 1, 1.49, 'fruits_veggies', 0.00, 'diana', '2026-01-05', false),
('r-2026-01-05', 'Tomatoes on the Vine',   4.99, 1, 4.99, 'fruits_veggies', 0.00, 'diana', '2026-01-05', false),
('r-2026-01-05', 'Ground Chicken 450g',    7.99, 1, 7.99, 'meats_seafood', 0.00, 'diana', '2026-01-05', false),
('r-2026-01-05', 'Eggs 12pk',              5.49, 1, 5.49, 'dairy', 0.00, 'diana', '2026-01-05', false),
('r-2026-01-05', 'Almond Milk 1.89L',      4.49, 1, 4.49, 'beverages', 0.00, 'diana', '2026-01-05', false),
('r-2026-01-05', 'Oats Steel Cut 1kg',     5.99, 1, 5.99, 'legumes_grains', 0.00, 'diana', '2026-01-05', false),
('r-2026-01-05', 'Peanut Butter 1kg',      6.49, 1, 6.49, 'condiments_spices', 0.00, 'diana', '2026-01-05', false),
('r-2026-01-05', 'Whole Wheat Bread',      3.99, 1, 3.99, 'bakery_bread', 0.00, 'diana', '2026-01-05', false),
('r-2026-01-05', 'Frozen Salmon Fillets 4pk', 16.99, 1, 16.99, 'meats_seafood', 0.00, 'diana', '2026-01-05', false),
('r-2026-01-05', 'Apples Gala 3lb',        5.99, 1, 5.99, 'fruits_veggies', 0.00, 'diana', '2026-01-05', false),
('r-2026-01-05', 'Cottage Cheese 500g',    4.99, 1, 4.99, 'dairy', 0.00, 'diana', '2026-01-05', false),
('r-2026-01-05', 'Honey 500g',             8.49, 1, 8.49, 'condiments_spices', 0.00, 'diana', '2026-01-05', false),
('r-2026-01-05', 'Frozen Waffles 8pk',     4.49, 1, 4.49, 'frozen_prepared', 0.00, 'diana', '2026-01-05', false),
('r-2026-01-05', 'Rice Cakes',             3.49, 1, 3.49, 'snacks_sweets', 0.00, 'diana', '2026-01-05', false),
('r-2026-01-05', 'Hand Soap Refill',       5.99, 1, 5.99, 'cleaning_household', 0.78, 'diana', '2026-01-05', false),
('r-2026-01-05', 'Avocado',                2.49, 2, 1.25, 'fruits_veggies', 0.00, 'diana', '2026-01-05', false),
('r-2026-01-05', 'Lemons 5pk',             3.99, 1, 3.99, 'fruits_veggies', 0.00, 'diana', '2026-01-05', false),

-- ── Jan 17: No Frills ($145.60) ──
('r-2026-01-17', 'Chicken Thighs 1.5kg',    12.99, 1, 12.99, 'meats_seafood', 0.00, 'diana', '2026-01-17', false),
('r-2026-01-17', 'Broccoli Crowns',          3.99, 1, 3.99, 'fruits_veggies', 0.00, 'diana', '2026-01-17', false),
('r-2026-01-17', 'Spinach Baby 312g',        4.99, 1, 4.99, 'fruits_veggies', 0.00, 'diana', '2026-01-17', false),
('r-2026-01-17', 'Milk 2% 4L',              6.49, 1, 6.49, 'dairy', 0.00, 'diana', '2026-01-17', false),
('r-2026-01-17', 'Cheddar 400g',            7.99, 1, 7.99, 'dairy', 0.00, 'diana', '2026-01-17', false),
('r-2026-01-17', 'Pasta Penne 900g',        2.49, 2, 1.25, 'legumes_grains', 0.00, 'diana', '2026-01-17', false),
('r-2026-01-17', 'Canned Tuna 6pk',         8.99, 1, 8.99, 'meats_seafood', 0.00, 'diana', '2026-01-17', false),
('r-2026-01-17', 'Peppers Red 3pk',         5.49, 1, 5.49, 'fruits_veggies', 0.00, 'diana', '2026-01-17', false),
('r-2026-01-17', 'Butter 454g',             6.49, 1, 6.49, 'dairy', 0.00, 'diana', '2026-01-17', false),
('r-2026-01-17', 'Instant Noodles 5pk',     3.99, 1, 3.99, 'legumes_grains', 0.00, 'diana', '2026-01-17', false),
('r-2026-01-17', 'Ketchup Heinz 750ml',     4.49, 1, 4.49, 'condiments_spices', 0.00, 'diana', '2026-01-17', false),
('r-2026-01-17', 'Frozen French Fries 1kg', 4.99, 1, 4.99, 'frozen_prepared', 0.00, 'diana', '2026-01-17', false),
('r-2026-01-17', 'Coffee Ground 930g',      12.99, 1, 12.99, 'beverages', 0.00, 'diana', '2026-01-17', false),
('r-2026-01-17', 'Chips Lays Classic',      4.49, 1, 4.49, 'snacks_sweets', 0.00, 'diana', '2026-01-17', false),
('r-2026-01-17', 'Garbage Bags 20ct',       5.99, 1, 5.99, 'cleaning_household', 0.78, 'diana', '2026-01-17', false),
('r-2026-01-17', 'Tissues Kleenex 6pk',     8.99, 1, 8.99, 'cleaning_household', 1.17, 'diana', '2026-01-17', false),
('r-2026-01-17', 'Oranges Navel 4lb',       6.99, 1, 6.99, 'fruits_veggies', 0.00, 'diana', '2026-01-17', false),
('r-2026-01-17', 'Tortilla Chips',          4.49, 1, 4.49, 'snacks_sweets', 0.00, 'diana', '2026-01-17', false),

-- ── Jan 29: Costco ($172.40) ──
('r-2026-01-29', 'Kirkland Chicken Breast 2.5kg', 24.99, 1, 24.99, 'meats_seafood', 0.00, 'diana', '2026-01-29', false),
('r-2026-01-29', 'Kirkland Stir Fry Veg 2.5kg',  12.99, 1, 12.99, 'frozen_prepared', 0.00, 'diana', '2026-01-29', false),
('r-2026-01-29', 'Kirkland Almonds 1.36kg',       16.99, 1, 16.99, 'snacks_sweets', 0.00, 'diana', '2026-01-29', false),
('r-2026-01-29', 'Organic Bananas 3lb',           2.99, 1, 2.99, 'fruits_veggies', 0.00, 'diana', '2026-01-29', false),
('r-2026-01-29', 'Kirkland Mozzarella 1.33kg',    14.99, 1, 14.99, 'dairy', 0.00, 'diana', '2026-01-29', false),
('r-2026-01-29', 'Kirkland Quinoa 2.04kg',        14.99, 1, 14.99, 'legumes_grains', 0.00, 'diana', '2026-01-29', false),
('r-2026-01-29', 'Kirkland Dish Soap 2.66L',      9.99, 1, 9.99, 'cleaning_household', 1.30, 'diana', '2026-01-29', false),
('r-2026-01-29', 'Kirkland Coffee 1.36kg',        16.99, 1, 16.99, 'beverages', 0.00, 'diana', '2026-01-29', false),
('r-2026-01-29', 'Avocados 5pk',                  7.99, 1, 7.99, 'fruits_veggies', 0.00, 'diana', '2026-01-29', false),
('r-2026-01-29', 'Berries Mixed Frozen 2kg',      13.99, 1, 13.99, 'frozen_prepared', 0.00, 'diana', '2026-01-29', false),
('r-2026-01-29', 'Kirkland Creatine 500g',        19.99, 1, 19.99, 'protein_supplements', 2.60, 'diana', '2026-01-29', false),
('r-2026-01-29', 'Mango 6pk',                     9.99, 1, 9.99, 'fruits_veggies', 0.00, 'diana', '2026-01-29', false),

-- ── Feb 8: Metro ($132.50) ──
('r-2026-02-08', 'Salmon Fillet Fresh 500g',  14.99, 1, 14.99, 'meats_seafood', 0.00, 'diana', '2026-02-08', false),
('r-2026-02-08', 'Asparagus Bunch',           4.99, 1, 4.99, 'fruits_veggies', 0.00, 'diana', '2026-02-08', false),
('r-2026-02-08', 'Arugula 142g',              3.99, 1, 3.99, 'fruits_veggies', 0.00, 'diana', '2026-02-08', false),
('r-2026-02-08', 'Ricotta 475g',              5.49, 1, 5.49, 'dairy', 0.00, 'diana', '2026-02-08', false),
('r-2026-02-08', 'Prosciutto 150g',           7.99, 1, 7.99, 'meats_seafood', 0.00, 'diana', '2026-02-08', false),
('r-2026-02-08', 'Tomato Cherry Pint',        4.99, 1, 4.99, 'fruits_veggies', 0.00, 'diana', '2026-02-08', false),
('r-2026-02-08', 'Balsamic Vinegar 500ml',    7.99, 1, 7.99, 'condiments_spices', 0.00, 'diana', '2026-02-08', false),
('r-2026-02-08', 'Ciabatta Bread',            4.49, 1, 4.49, 'bakery_bread', 0.00, 'diana', '2026-02-08', false),
('r-2026-02-08', 'Eggs 12pk',                 5.49, 1, 5.49, 'dairy', 0.00, 'diana', '2026-02-08', false),
('r-2026-02-08', 'Dark Chocolate 85%',        4.49, 1, 4.49, 'snacks_sweets', 0.00, 'diana', '2026-02-08', false),
('r-2026-02-08', 'Sparkling Water Perrier 12pk', 8.99, 1, 8.99, 'beverages', 1.17, 'diana', '2026-02-08', false),
('r-2026-02-08', 'Chickpeas 540ml',           1.49, 2, 0.75, 'legumes_grains', 0.00, 'diana', '2026-02-08', false),
('r-2026-02-08', 'Frozen Pizza Dr. Oetker',   6.99, 2, 3.50, 'frozen_prepared', 0.00, 'diana', '2026-02-08', false),
('r-2026-02-08', 'Mayo Hellmanns 890ml',      6.49, 1, 6.49, 'condiments_spices', 0.00, 'diana', '2026-02-08', false),
('r-2026-02-08', 'Laundry Sheets 60ct',       12.99, 1, 12.99, 'cleaning_household', 1.69, 'diana', '2026-02-08', false),
('r-2026-02-08', 'Lip Balm Burt Bees',        4.99, 1, 4.99, 'personal_care', 0.65, 'diana', '2026-02-08', false),

-- ── Feb 16: T&T Supermarket ($108.90) ──
('r-2026-02-16', 'Enoki Mushrooms 200g',     3.49, 1, 3.49, 'fruits_veggies', 0.00, 'diana', '2026-02-16', false),
('r-2026-02-16', 'Choy Sum Bunch',           2.99, 1, 2.99, 'fruits_veggies', 0.00, 'diana', '2026-02-16', false),
('r-2026-02-16', 'Korean Short Ribs 500g',   15.99, 1, 15.99, 'meats_seafood', 0.00, 'diana', '2026-02-16', false),
('r-2026-02-16', 'Ramen Noodles Shin 5pk',   7.99, 1, 7.99, 'legumes_grains', 0.00, 'diana', '2026-02-16', false),
('r-2026-02-16', 'Kimchi 500g',              7.99, 1, 7.99, 'condiments_spices', 0.00, 'diana', '2026-02-16', false),
('r-2026-02-16', 'Gyoza Frozen 500g',        8.99, 1, 8.99, 'frozen_prepared', 0.00, 'diana', '2026-02-16', false),
('r-2026-02-16', 'Coconut Cream 400ml',      2.99, 2, 1.50, 'condiments_spices', 0.00, 'diana', '2026-02-16', false),
('r-2026-02-16', 'Bean Sprouts 350g',        1.99, 1, 1.99, 'fruits_veggies', 0.00, 'diana', '2026-02-16', false),
('r-2026-02-16', 'Daikon Radish',            2.49, 1, 2.49, 'fruits_veggies', 0.00, 'diana', '2026-02-16', false),
('r-2026-02-16', 'Jasmine Tea 100 bags',     8.99, 1, 8.99, 'beverages', 0.00, 'diana', '2026-02-16', false),
('r-2026-02-16', 'Tapioca Pearls 500g',      4.99, 1, 4.99, 'snacks_sweets', 0.00, 'diana', '2026-02-16', false),
('r-2026-02-16', 'Seaweed Snacks 12pk',      6.99, 1, 6.99, 'snacks_sweets', 0.00, 'diana', '2026-02-16', false),
('r-2026-02-16', 'Curry Paste Red 400g',     4.99, 1, 4.99, 'condiments_spices', 0.00, 'diana', '2026-02-16', false),
('r-2026-02-16', 'Rice Vinegar 500ml',       3.99, 1, 3.99, 'condiments_spices', 0.00, 'diana', '2026-02-16', false),
('r-2026-02-16', 'Mango Fresh 2pk',          4.99, 1, 4.99, 'fruits_veggies', 0.00, 'diana', '2026-02-16', false),

-- ── Feb 27: Loblaws ($201.30) ──
('r-2026-02-27', 'PC Org Chicken Breast 1kg',  18.99, 1, 18.99, 'meats_seafood', 0.00, 'diana', '2026-02-27', false),
('r-2026-02-27', 'Atlantic Cod Fillets 454g',  14.99, 1, 14.99, 'meats_seafood', 0.00, 'diana', '2026-02-27', false),
('r-2026-02-27', 'Avocados 4pk',               6.99, 1, 6.99, 'fruits_veggies', 0.00, 'diana', '2026-02-27', false),
('r-2026-02-27', 'Kale Org Bunch',             3.99, 1, 3.99, 'fruits_veggies', 0.00, 'diana', '2026-02-27', false),
('r-2026-02-27', 'Goat Cheese 300g',           8.99, 1, 8.99, 'dairy', 0.00, 'diana', '2026-02-27', false),
('r-2026-02-27', 'Greek Yogurt Oikos 4pk',     8.49, 1, 8.49, 'dairy', 0.00, 'diana', '2026-02-27', false),
('r-2026-02-27', 'Whole Wheat Pasta 900g',     3.49, 1, 3.49, 'legumes_grains', 0.00, 'diana', '2026-02-27', false),
('r-2026-02-27', 'PC Org Tomato Sauce 680ml',  3.99, 1, 3.99, 'condiments_spices', 0.00, 'diana', '2026-02-27', false),
('r-2026-02-27', 'Multigrain Bread',           4.99, 1, 4.99, 'bakery_bread', 0.00, 'diana', '2026-02-27', false),
('r-2026-02-27', 'Whey Protein 2lb',           39.99, 1, 39.99, 'protein_supplements', 5.20, 'diana', '2026-02-27', false),
('r-2026-02-27', 'Blueberries 340g',           5.99, 1, 5.99, 'fruits_veggies', 0.00, 'diana', '2026-02-27', false),
('r-2026-02-27', 'Orange Juice 1.75L',         5.99, 1, 5.99, 'beverages', 0.00, 'diana', '2026-02-27', false),
('r-2026-02-27', 'Frozen Vegetable Stir Fry',  5.99, 1, 5.99, 'frozen_prepared', 0.00, 'diana', '2026-02-27', false),
('r-2026-02-27', 'Chocolate Almonds 200g',     5.49, 1, 5.49, 'snacks_sweets', 0.00, 'diana', '2026-02-27', false),
('r-2026-02-27', 'Garbage Bags Kitchen 30ct',  7.99, 1, 7.99, 'cleaning_household', 1.04, 'diana', '2026-02-27', false),
('r-2026-02-27', 'Conditioner Dove 355ml',     6.99, 1, 6.99, 'personal_care', 0.91, 'diana', '2026-02-27', false),
('r-2026-02-27', 'Strawberries 454g',          5.99, 1, 5.99, 'fruits_veggies', 0.00, 'diana', '2026-02-27', false),
('r-2026-02-27', 'Mushrooms Cremini 227g',     3.99, 1, 3.99, 'fruits_veggies', 0.00, 'diana', '2026-02-27', false),
('r-2026-02-27', 'Maple Syrup 250ml',          9.99, 1, 9.99, 'condiments_spices', 0.00, 'diana', '2026-02-27', false),

-- ── Mar 5: No Frills ($139.70) ──
('r-2026-03-05', 'Bananas',                   1.99, 1, 1.99, 'fruits_veggies', 0.00, 'diana', '2026-03-05', false),
('r-2026-03-05', 'Carrots 5lb',               4.49, 1, 4.49, 'fruits_veggies', 0.00, 'diana', '2026-03-05', false),
('r-2026-03-05', 'Ground Beef Medium',        8.99, 1, 8.99, 'meats_seafood', 0.00, 'diana', '2026-03-05', false),
('r-2026-03-05', 'Chicken Wings 1kg',         10.99, 1, 10.99, 'meats_seafood', 0.00, 'diana', '2026-03-05', false),
('r-2026-03-05', 'Eggs Large 12pk',           5.49, 1, 5.49, 'dairy', 0.00, 'diana', '2026-03-05', false),
('r-2026-03-05', 'Milk 2% 4L',               6.49, 1, 6.49, 'dairy', 0.00, 'diana', '2026-03-05', false),
('r-2026-03-05', 'White Rice 4kg',            11.99, 1, 11.99, 'legumes_grains', 0.00, 'diana', '2026-03-05', false),
('r-2026-03-05', 'Black Beans 540ml',         1.49, 3, 0.50, 'legumes_grains', 0.00, 'diana', '2026-03-05', false),
('r-2026-03-05', 'Bread Whole Wheat',         3.99, 1, 3.99, 'bakery_bread', 0.00, 'diana', '2026-03-05', false),
('r-2026-03-05', 'Tomato Sauce 680ml',        2.29, 2, 1.15, 'condiments_spices', 0.00, 'diana', '2026-03-05', false),
('r-2026-03-05', 'Frozen Chicken Strips 700g', 9.99, 1, 9.99, 'frozen_prepared', 0.00, 'diana', '2026-03-05', false),
('r-2026-03-05', 'Tea Yorkshire 80 bags',     7.99, 1, 7.99, 'beverages', 0.00, 'diana', '2026-03-05', false),
('r-2026-03-05', 'Pretzels Bag',              3.99, 1, 3.99, 'snacks_sweets', 0.00, 'diana', '2026-03-05', false),
('r-2026-03-05', 'Sponges 6pk',               3.99, 1, 3.99, 'cleaning_household', 0.52, 'diana', '2026-03-05', false),
('r-2026-03-05', 'Onions Yellow 3lb',         3.49, 1, 3.49, 'fruits_veggies', 0.00, 'diana', '2026-03-05', false),
('r-2026-03-05', 'Garlic Bulb 3pk',           2.49, 1, 2.49, 'fruits_veggies', 0.00, 'diana', '2026-03-05', false),
('r-2026-03-05', 'Yogurt Activia 8pk',        6.49, 1, 6.49, 'dairy', 0.00, 'diana', '2026-03-05', false),

-- ── Mar 15: FreshCo ($155.20) ──
('r-2026-03-15', 'Chicken Breast Boneless 1kg', 14.99, 1, 14.99, 'meats_seafood', 0.00, 'diana', '2026-03-15', false),
('r-2026-03-15', 'Tilapia Fillets 454g',        10.99, 1, 10.99, 'meats_seafood', 0.00, 'diana', '2026-03-15', false),
('r-2026-03-15', 'Spinach 312g',                4.99, 1, 4.99, 'fruits_veggies', 0.00, 'diana', '2026-03-15', false),
('r-2026-03-15', 'Peppers Mixed 4pk',           5.99, 1, 5.99, 'fruits_veggies', 0.00, 'diana', '2026-03-15', false),
('r-2026-03-15', 'Cheddar Medium 400g',         7.99, 1, 7.99, 'dairy', 0.00, 'diana', '2026-03-15', false),
('r-2026-03-15', 'Greek Yogurt Plain 750g',     6.49, 1, 6.49, 'dairy', 0.00, 'diana', '2026-03-15', false),
('r-2026-03-15', 'Lentils Green 900g',          4.99, 1, 4.99, 'legumes_grains', 0.00, 'diana', '2026-03-15', false),
('r-2026-03-15', 'Couscous 500g',               3.99, 1, 3.99, 'legumes_grains', 0.00, 'diana', '2026-03-15', false),
('r-2026-03-15', 'Pita Bread 6pk',              3.49, 1, 3.49, 'bakery_bread', 0.00, 'diana', '2026-03-15', false),
('r-2026-03-15', 'Olive Oil 1L',                12.99, 1, 12.99, 'condiments_spices', 0.00, 'diana', '2026-03-15', false),
('r-2026-03-15', 'Frozen Samosas 12pk',          7.99, 1, 7.99, 'frozen_prepared', 0.00, 'diana', '2026-03-15', false),
('r-2026-03-15', 'Coffee Beans 454g',            11.99, 1, 11.99, 'beverages', 0.00, 'diana', '2026-03-15', false),
('r-2026-03-15', 'Granola 750g',                 6.99, 1, 6.99, 'snacks_sweets', 0.00, 'diana', '2026-03-15', false),
('r-2026-03-15', 'Dish Soap Palmolive',          3.49, 1, 3.49, 'cleaning_household', 0.45, 'diana', '2026-03-15', false),
('r-2026-03-15', 'Toothbrush Oral-B 2pk',        6.99, 1, 6.99, 'personal_care', 0.91, 'diana', '2026-03-15', false),
('r-2026-03-15', 'Celery Hearts',                3.49, 1, 3.49, 'fruits_veggies', 0.00, 'diana', '2026-03-15', false),
('r-2026-03-15', 'Sweet Potato',                 3.99, 1, 3.99, 'fruits_veggies', 0.00, 'diana', '2026-03-15', false),
('r-2026-03-15', 'Creatine Monohydrate 300g',   16.99, 1, 16.99, 'protein_supplements', 2.21, 'diana', '2026-03-15', false),

-- ── Mar 24: Costco ($168.90) ──
('r-2026-03-24', 'Kirkland Salmon 1.36kg',       22.99, 1, 22.99, 'meats_seafood', 0.00, 'diana', '2026-03-24', false),
('r-2026-03-24', 'Kirkland Shrimp Frozen 907g',  18.99, 1, 18.99, 'meats_seafood', 0.00, 'diana', '2026-03-24', false),
('r-2026-03-24', 'Organic Strawberries 2lb',      9.99, 1, 9.99, 'fruits_veggies', 0.00, 'diana', '2026-03-24', false),
('r-2026-03-24', 'Kirkland Pesto 630g',           9.99, 1, 9.99, 'condiments_spices', 0.00, 'diana', '2026-03-24', false),
('r-2026-03-24', 'Kirkland Cheddar 2-pk',         14.99, 1, 14.99, 'dairy', 0.00, 'diana', '2026-03-24', false),
('r-2026-03-24', 'Kirkland Organic Eggs 24pk',    12.99, 1, 12.99, 'dairy', 0.00, 'diana', '2026-03-24', false),
('r-2026-03-24', 'Kirkland Trail Mix 1.13kg',     14.99, 1, 14.99, 'snacks_sweets', 0.00, 'diana', '2026-03-24', false),
('r-2026-03-24', 'Paper Towels Bounty 12pk',      22.99, 1, 22.99, 'cleaning_household', 2.99, 'diana', '2026-03-24', false),
('r-2026-03-24', 'Kirkland Oat Milk 6pk',         12.99, 1, 12.99, 'beverages', 0.00, 'diana', '2026-03-24', false),
('r-2026-03-24', 'Blueberries Organic 1.5lb',     9.99, 1, 9.99, 'fruits_veggies', 0.00, 'diana', '2026-03-24', false),
('r-2026-03-24', 'Kirkland Whey Protein 2.72kg',  42.99, 1, 42.99, 'protein_supplements', 5.59, 'diana', '2026-03-24', false);

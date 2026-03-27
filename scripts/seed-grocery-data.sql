-- Seed data: 6 months of grocery expenses for an average Toronto person
-- Total budget: ~$3,000 (Oct 2025 - Mar 2026)
-- Stores: No Frills, Loblaws, Metro, Costco, FreshCo, T&T Supermarket
-- Safe to re-run: tables use IF NOT EXISTS

-- ═══════════════════════════════════════════
-- Helper function
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════
-- Create tables
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS grocery_receipts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name   TEXT NOT NULL,
  receipt_date DATE NOT NULL,
  subtotal     NUMERIC NOT NULL DEFAULT 0,
  tax          NUMERIC NOT NULL DEFAULT 0,
  total        NUMERIC NOT NULL DEFAULT 0,
  raw_text     TEXT,
  owner        TEXT NOT NULL DEFAULT 'diana' CHECK (owner IN ('diana','shared')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_receipts_updated_at ON grocery_receipts;
CREATE TRIGGER trg_receipts_updated_at
  BEFORE UPDATE ON grocery_receipts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_receipts_date  ON grocery_receipts (receipt_date DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_owner ON grocery_receipts (owner);

CREATE TABLE IF NOT EXISTS grocery_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id  UUID REFERENCES grocery_receipts(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  price       NUMERIC NOT NULL DEFAULT 0,
  quantity    NUMERIC NOT NULL DEFAULT 1,
  unit_price  NUMERIC,
  category    TEXT NOT NULL DEFAULT 'other' CHECK (category IN (
                'fruits_veggies','legumes_grains','dairy','meats_seafood',
                'cleaning_household','protein_supplements','beverages',
                'snacks_sweets','bakery_bread','frozen_prepared',
                'condiments_spices','personal_care','other'
              )),
  tax_amount  NUMERIC NOT NULL DEFAULT 0,
  owner       TEXT NOT NULL DEFAULT 'diana' CHECK (owner IN ('diana','shared')),
  item_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  is_manual   BOOLEAN NOT NULL DEFAULT false,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_items_receipt  ON grocery_items (receipt_id);
CREATE INDEX IF NOT EXISTS idx_items_date     ON grocery_items (item_date DESC);
CREATE INDEX IF NOT EXISTS idx_items_category ON grocery_items (category);
CREATE INDEX IF NOT EXISTS idx_items_owner    ON grocery_items (owner);

-- ═══════════════════════════════════════════
-- Clear existing seed data (if re-running)
-- ═══════════════════════════════════════════
DELETE FROM grocery_items;
DELETE FROM grocery_receipts;

-- ═══════════════════════════════════════════
-- Insert receipts and items using DO block
-- so we can capture generated UUIDs
-- ═══════════════════════════════════════════
DO $$
DECLARE
  rid UUID;
BEGIN

-- ── Oct 3: No Frills ($150.17) ──
INSERT INTO grocery_receipts (store_name, receipt_date, subtotal, tax, total, owner)
VALUES ('No Frills', '2025-10-03', 142.35, 7.82, 150.17, 'diana') RETURNING id INTO rid;
INSERT INTO grocery_items (receipt_id, name, price, quantity, unit_price, category, tax_amount, owner, item_date) VALUES
(rid, 'Bananas (bunch)', 1.99, 1, 1.99, 'fruits_veggies', 0, 'diana', '2025-10-03'),
(rid, 'Broccoli Crowns', 3.49, 1, 3.49, 'fruits_veggies', 0, 'diana', '2025-10-03'),
(rid, 'Baby Spinach 312g', 4.99, 1, 4.99, 'fruits_veggies', 0, 'diana', '2025-10-03'),
(rid, 'Chicken Breast 1kg', 14.99, 1, 14.99, 'meats_seafood', 0, 'diana', '2025-10-03'),
(rid, 'Ground Beef Lean', 9.99, 1, 9.99, 'meats_seafood', 0, 'diana', '2025-10-03'),
(rid, 'Beatrice 2% Milk 4L', 6.49, 1, 6.49, 'dairy', 0, 'diana', '2025-10-03'),
(rid, 'Eggs Large 12pk', 5.29, 1, 5.29, 'dairy', 0, 'diana', '2025-10-03'),
(rid, 'Basmati Rice 4kg', 12.99, 1, 12.99, 'legumes_grains', 0, 'diana', '2025-10-03'),
(rid, 'Dempsters Whole Wheat', 4.49, 1, 4.49, 'bakery_bread', 0, 'diana', '2025-10-03'),
(rid, 'Tomato Sauce 680ml', 2.49, 2, 1.25, 'condiments_spices', 0, 'diana', '2025-10-03'),
(rid, 'Cheddar Cheese 400g', 7.99, 1, 7.99, 'dairy', 0, 'diana', '2025-10-03'),
(rid, 'Dish Soap Dawn', 4.99, 1, 4.99, 'cleaning_household', 0.65, 'diana', '2025-10-03'),
(rid, 'Paper Towels 6-roll', 8.99, 1, 8.99, 'cleaning_household', 1.17, 'diana', '2025-10-03'),
(rid, 'Orange Juice 2.63L', 5.99, 1, 5.99, 'beverages', 0, 'diana', '2025-10-03'),
(rid, 'Frozen Pizza Delissio', 7.49, 1, 7.49, 'frozen_prepared', 0, 'diana', '2025-10-03'),
(rid, 'Greek Yogurt 750g', 6.49, 1, 6.49, 'dairy', 0, 'diana', '2025-10-03'),
(rid, 'Doritos Nacho', 4.49, 1, 4.49, 'snacks_sweets', 0, 'diana', '2025-10-03'),
(rid, 'Instant Coffee Nescafe', 12.99, 1, 12.99, 'beverages', 0, 'diana', '2025-10-03'),
(rid, 'Red Onions 3lb bag', 3.49, 1, 3.49, 'fruits_veggies', 0, 'diana', '2025-10-03'),
(rid, 'Garlic 3-pack', 2.29, 1, 2.29, 'fruits_veggies', 0, 'diana', '2025-10-03');

-- ── Oct 14: Costco ($199.92) ──
INSERT INTO grocery_receipts (store_name, receipt_date, subtotal, tax, total, owner)
VALUES ('Costco', '2025-10-14', 189.50, 10.42, 199.92, 'diana') RETURNING id INTO rid;
INSERT INTO grocery_items (receipt_id, name, price, quantity, unit_price, category, tax_amount, owner, item_date) VALUES
(rid, 'Kirkland Chicken Thighs 2.5kg', 22.99, 1, 22.99, 'meats_seafood', 0, 'diana', '2025-10-14'),
(rid, 'Atlantic Salmon Fillets 1kg', 18.99, 1, 18.99, 'meats_seafood', 0, 'diana', '2025-10-14'),
(rid, 'Kirkland Olive Oil 2L', 16.99, 1, 16.99, 'condiments_spices', 0, 'diana', '2025-10-14'),
(rid, 'Organic Blueberries 1.5lb', 9.99, 1, 9.99, 'fruits_veggies', 0, 'diana', '2025-10-14'),
(rid, 'Kirkland Toilet Paper 30pk', 22.99, 1, 22.99, 'cleaning_household', 2.99, 'diana', '2025-10-14'),
(rid, 'Parmigiano Reggiano 1kg', 19.99, 1, 19.99, 'dairy', 0, 'diana', '2025-10-14'),
(rid, 'Kirkland Trash Bags 200ct', 15.99, 1, 15.99, 'cleaning_household', 2.08, 'diana', '2025-10-14'),
(rid, 'Mixed Nuts 1.13kg', 17.99, 1, 17.99, 'snacks_sweets', 0, 'diana', '2025-10-14'),
(rid, 'Rotisserie Chicken', 9.99, 1, 9.99, 'meats_seafood', 0, 'diana', '2025-10-14'),
(rid, 'Avocados 6-pack', 8.99, 1, 8.99, 'fruits_veggies', 0, 'diana', '2025-10-14'),
(rid, 'Quinoa 2kg', 14.99, 1, 14.99, 'legumes_grains', 0, 'diana', '2025-10-14'),
(rid, 'Laundry Detergent Tide 4.43L', 19.99, 1, 19.99, 'cleaning_household', 2.60, 'diana', '2025-10-14');

-- ── Oct 27: Metro ($130.61) ──
INSERT INTO grocery_receipts (store_name, receipt_date, subtotal, tax, total, owner)
VALUES ('Metro', '2025-10-27', 123.80, 6.81, 130.61, 'diana') RETURNING id INTO rid;
INSERT INTO grocery_items (receipt_id, name, price, quantity, unit_price, category, tax_amount, owner, item_date) VALUES
(rid, 'Sweet Potatoes 3lb', 4.99, 1, 4.99, 'fruits_veggies', 0, 'diana', '2025-10-27'),
(rid, 'Zucchini', 2.49, 2, 1.25, 'fruits_veggies', 0, 'diana', '2025-10-27'),
(rid, 'Selection Pasta 900g', 2.99, 2, 1.50, 'legumes_grains', 0, 'diana', '2025-10-27'),
(rid, 'Pork Tenderloin', 12.99, 1, 12.99, 'meats_seafood', 0, 'diana', '2025-10-27'),
(rid, 'Greek Yogurt Oikos 4pk', 7.99, 1, 7.99, 'dairy', 0, 'diana', '2025-10-27'),
(rid, 'Mushrooms 227g', 3.49, 1, 3.49, 'fruits_veggies', 0, 'diana', '2025-10-27'),
(rid, 'Shrimp Frozen 454g', 13.99, 1, 13.99, 'meats_seafood', 0, 'diana', '2025-10-27'),
(rid, 'Butter Lactantia 454g', 6.49, 1, 6.49, 'dairy', 0, 'diana', '2025-10-27'),
(rid, 'Tortillas 10pk', 4.49, 1, 4.49, 'bakery_bread', 0, 'diana', '2025-10-27'),
(rid, 'Black Beans 540ml', 1.69, 3, 0.56, 'legumes_grains', 0, 'diana', '2025-10-27'),
(rid, 'Tim Hortons K-Cups 30', 24.99, 1, 24.99, 'beverages', 3.25, 'diana', '2025-10-27'),
(rid, 'Bell Peppers 3pk', 5.99, 1, 5.99, 'fruits_veggies', 0, 'diana', '2025-10-27'),
(rid, 'Ice Cream Häagen-Dazs', 7.99, 1, 7.99, 'snacks_sweets', 0, 'diana', '2025-10-27'),
(rid, 'Toothpaste Colgate', 4.99, 1, 4.99, 'personal_care', 0.65, 'diana', '2025-10-27'),
(rid, 'Deodorant Dove', 5.99, 1, 5.99, 'personal_care', 0.78, 'diana', '2025-10-27');

-- ── Nov 2: Loblaws ($165.00) ──
INSERT INTO grocery_receipts (store_name, receipt_date, subtotal, tax, total, owner)
VALUES ('Loblaws', '2025-11-02', 156.40, 8.60, 165.00, 'diana') RETURNING id INTO rid;
INSERT INTO grocery_items (receipt_id, name, price, quantity, unit_price, category, tax_amount, owner, item_date) VALUES
(rid, 'PC Free-Run Chicken 1.2kg', 16.99, 1, 16.99, 'meats_seafood', 0, 'diana', '2025-11-02'),
(rid, 'PC Org Mixed Greens', 5.99, 1, 5.99, 'fruits_veggies', 0, 'diana', '2025-11-02'),
(rid, 'Apples Honeycrisp 3lb', 7.49, 1, 7.49, 'fruits_veggies', 0, 'diana', '2025-11-02'),
(rid, 'PC Blue Menu Salmon 2pk', 15.99, 1, 15.99, 'meats_seafood', 0, 'diana', '2025-11-02'),
(rid, 'Natrel Cream 10% 1L', 4.49, 1, 4.49, 'dairy', 0, 'diana', '2025-11-02'),
(rid, 'Baguette Fresh', 2.99, 1, 2.99, 'bakery_bread', 0, 'diana', '2025-11-02'),
(rid, 'Lentils Red 900g', 4.99, 1, 4.99, 'legumes_grains', 0, 'diana', '2025-11-02'),
(rid, 'Carrots 5lb bag', 4.49, 1, 4.49, 'fruits_veggies', 0, 'diana', '2025-11-02'),
(rid, 'Soy Sauce Kikkoman 600ml', 4.99, 1, 4.99, 'condiments_spices', 0, 'diana', '2025-11-02'),
(rid, 'Whey Protein Isolate 2lb', 39.99, 1, 39.99, 'protein_supplements', 5.20, 'diana', '2025-11-02'),
(rid, 'Sparkling Water 12pk', 6.99, 1, 6.99, 'beverages', 0, 'diana', '2025-11-02'),
(rid, 'PC Cookies Decadent', 4.49, 1, 4.49, 'snacks_sweets', 0, 'diana', '2025-11-02'),
(rid, 'Frozen Berries Mix 600g', 6.99, 1, 6.99, 'frozen_prepared', 0, 'diana', '2025-11-02'),
(rid, 'Eggs Free-Range 12pk', 7.49, 1, 7.49, 'dairy', 0, 'diana', '2025-11-02'),
(rid, 'Cucumber English', 1.99, 2, 1.00, 'fruits_veggies', 0, 'diana', '2025-11-02'),
(rid, 'Swiffer Refills', 12.99, 1, 12.99, 'cleaning_household', 1.69, 'diana', '2025-11-02');

-- ── Nov 15: T&T Supermarket ($104.13) ──
INSERT INTO grocery_receipts (store_name, receipt_date, subtotal, tax, total, owner)
VALUES ('T&T Supermarket', '2025-11-15', 98.70, 5.43, 104.13, 'diana') RETURNING id INTO rid;
INSERT INTO grocery_items (receipt_id, name, price, quantity, unit_price, category, tax_amount, owner, item_date) VALUES
(rid, 'Bok Choy Fresh', 2.49, 1, 2.49, 'fruits_veggies', 0, 'diana', '2025-11-15'),
(rid, 'Jasmine Rice 5kg', 13.99, 1, 13.99, 'legumes_grains', 0, 'diana', '2025-11-15'),
(rid, 'Tofu Extra Firm 2pk', 4.99, 1, 4.99, 'legumes_grains', 0, 'diana', '2025-11-15'),
(rid, 'Fresh Ginger Root', 2.99, 1, 2.99, 'fruits_veggies', 0, 'diana', '2025-11-15'),
(rid, 'Napa Cabbage', 3.49, 1, 3.49, 'fruits_veggies', 0, 'diana', '2025-11-15'),
(rid, 'Pork Belly Sliced 500g', 9.99, 1, 9.99, 'meats_seafood', 0, 'diana', '2025-11-15'),
(rid, 'Udon Noodles 5pk', 5.99, 1, 5.99, 'legumes_grains', 0, 'diana', '2025-11-15'),
(rid, 'Sesame Oil 360ml', 5.49, 1, 5.49, 'condiments_spices', 0, 'diana', '2025-11-15'),
(rid, 'Miso Paste 500g', 6.99, 1, 6.99, 'condiments_spices', 0, 'diana', '2025-11-15'),
(rid, 'Dumplings Frozen 600g', 8.99, 1, 8.99, 'frozen_prepared', 0, 'diana', '2025-11-15'),
(rid, 'Green Onions (bunch)', 1.29, 2, 0.65, 'fruits_veggies', 0, 'diana', '2025-11-15'),
(rid, 'Matcha Latte Mix', 12.99, 1, 12.99, 'beverages', 0, 'diana', '2025-11-15'),
(rid, 'Mochi Ice Cream 6pk', 8.99, 1, 8.99, 'snacks_sweets', 0, 'diana', '2025-11-15'),
(rid, 'Sriracha Sauce 450ml', 4.99, 1, 4.99, 'condiments_spices', 0, 'diana', '2025-11-15');

-- ── Nov 28: Costco ($250.25) ──
INSERT INTO grocery_receipts (store_name, receipt_date, subtotal, tax, total, owner)
VALUES ('Costco', '2025-11-28', 237.20, 13.05, 250.25, 'diana') RETURNING id INTO rid;
INSERT INTO grocery_items (receipt_id, name, price, quantity, unit_price, category, tax_amount, owner, item_date) VALUES
(rid, 'Kirkland Ground Turkey 2kg', 16.99, 1, 16.99, 'meats_seafood', 0, 'diana', '2025-11-28'),
(rid, 'Kirkland Bacon 4pk', 19.99, 1, 19.99, 'meats_seafood', 0, 'diana', '2025-11-28'),
(rid, 'Organic Strawberries 2lb', 8.99, 1, 8.99, 'fruits_veggies', 0, 'diana', '2025-11-28'),
(rid, 'Kirkland Almond Butter', 12.99, 1, 12.99, 'condiments_spices', 0, 'diana', '2025-11-28'),
(rid, 'Kirkland Paper Towels 12pk', 24.99, 1, 24.99, 'cleaning_household', 3.25, 'diana', '2025-11-28'),
(rid, 'Kirkland Laundry Pods 120ct', 22.99, 1, 22.99, 'cleaning_household', 2.99, 'diana', '2025-11-28'),
(rid, 'Organic Eggs 24pk', 12.49, 1, 12.49, 'dairy', 0, 'diana', '2025-11-28'),
(rid, 'Kirkland Croissants 12pk', 7.99, 1, 7.99, 'bakery_bread', 0, 'diana', '2025-11-28'),
(rid, 'Kirkland Greek Yogurt 3pk', 9.99, 1, 9.99, 'dairy', 0, 'diana', '2025-11-28'),
(rid, 'Kirkland Protein Bars 20pk', 24.99, 1, 24.99, 'protein_supplements', 3.25, 'diana', '2025-11-28'),
(rid, 'Frozen Vegetables Mix 2.5kg', 11.99, 1, 11.99, 'frozen_prepared', 0, 'diana', '2025-11-28'),
(rid, 'Kirkland Spring Water 40pk', 5.99, 1, 5.99, 'beverages', 0, 'diana', '2025-11-28'),
(rid, 'Raspberries 340g', 5.99, 1, 5.99, 'fruits_veggies', 0, 'diana', '2025-11-28'),
(rid, 'Kirkland Vitamin D3', 14.99, 1, 14.99, 'protein_supplements', 1.95, 'diana', '2025-11-28'),
(rid, 'Dark Chocolate Bark', 12.99, 1, 12.99, 'snacks_sweets', 0, 'diana', '2025-11-28');

-- ── Dec 6: No Frills ($142.32) ──
INSERT INTO grocery_receipts (store_name, receipt_date, subtotal, tax, total, owner)
VALUES ('No Frills', '2025-12-06', 134.90, 7.42, 142.32, 'diana') RETURNING id INTO rid;
INSERT INTO grocery_items (receipt_id, name, price, quantity, unit_price, category, tax_amount, owner, item_date) VALUES
(rid, 'Potatoes 10lb bag', 5.99, 1, 5.99, 'fruits_veggies', 0, 'diana', '2025-12-06'),
(rid, 'Celery Stalk', 2.99, 1, 2.99, 'fruits_veggies', 0, 'diana', '2025-12-06'),
(rid, 'Chicken Drumsticks 2kg', 9.99, 1, 9.99, 'meats_seafood', 0, 'diana', '2025-12-06'),
(rid, 'Canned Tomatoes 796ml', 1.99, 3, 0.66, 'condiments_spices', 0, 'diana', '2025-12-06'),
(rid, 'Chickpeas 540ml', 1.49, 3, 0.50, 'legumes_grains', 0, 'diana', '2025-12-06'),
(rid, 'Marble Cheese Block 600g', 9.49, 1, 9.49, 'dairy', 0, 'diana', '2025-12-06'),
(rid, 'Milk 2% 4L', 6.49, 1, 6.49, 'dairy', 0, 'diana', '2025-12-06'),
(rid, 'Bagels 6pk', 4.49, 1, 4.49, 'bakery_bread', 0, 'diana', '2025-12-06'),
(rid, 'Frozen Perogies 907g', 5.49, 1, 5.49, 'frozen_prepared', 0, 'diana', '2025-12-06'),
(rid, 'Green Tea Bags 72ct', 7.99, 1, 7.99, 'beverages', 0, 'diana', '2025-12-06'),
(rid, 'Onions 3lb Yellow', 3.49, 1, 3.49, 'fruits_veggies', 0, 'diana', '2025-12-06'),
(rid, 'Sour Cream 500ml', 3.49, 1, 3.49, 'dairy', 0, 'diana', '2025-12-06'),
(rid, 'Granola Bars 12pk', 5.99, 1, 5.99, 'snacks_sweets', 0, 'diana', '2025-12-06'),
(rid, 'All-Purpose Cleaner', 5.99, 1, 5.99, 'cleaning_household', 0.78, 'diana', '2025-12-06'),
(rid, 'Cucumbers Mini 12pk', 4.99, 1, 4.99, 'fruits_veggies', 0, 'diana', '2025-12-06'),
(rid, 'Romaine Hearts 3pk', 4.49, 1, 4.49, 'fruits_veggies', 0, 'diana', '2025-12-06'),
(rid, 'Shampoo Pantene', 8.99, 1, 8.99, 'personal_care', 1.17, 'diana', '2025-12-06');

-- ── Dec 18: Loblaws ($209.52) — holiday shopping ──
INSERT INTO grocery_receipts (store_name, receipt_date, subtotal, tax, total, owner)
VALUES ('Loblaws', '2025-12-18', 198.60, 10.92, 209.52, 'diana') RETURNING id INTO rid;
INSERT INTO grocery_items (receipt_id, name, price, quantity, unit_price, category, tax_amount, owner, item_date) VALUES
(rid, 'Turkey Breast Bone-In 3kg', 29.99, 1, 29.99, 'meats_seafood', 0, 'diana', '2025-12-18'),
(rid, 'Cranberry Sauce', 3.99, 1, 3.99, 'condiments_spices', 0, 'diana', '2025-12-18'),
(rid, 'Brussels Sprouts 340g', 4.49, 1, 4.49, 'fruits_veggies', 0, 'diana', '2025-12-18'),
(rid, 'PC Gravy Mix', 2.49, 2, 1.25, 'condiments_spices', 0, 'diana', '2025-12-18'),
(rid, 'Brie Cheese 200g', 7.99, 1, 7.99, 'dairy', 0, 'diana', '2025-12-18'),
(rid, 'Wine Cabernet 750ml', 14.99, 1, 14.99, 'beverages', 0, 'diana', '2025-12-18'),
(rid, 'Sparkling Cider 750ml', 5.99, 1, 5.99, 'beverages', 0, 'diana', '2025-12-18'),
(rid, 'Dinner Rolls 12pk', 4.99, 1, 4.99, 'bakery_bread', 0, 'diana', '2025-12-18'),
(rid, 'Cream Cheese Philadelphia', 5.49, 1, 5.49, 'dairy', 0, 'diana', '2025-12-18'),
(rid, 'Chocolate Box Lindt', 14.99, 1, 14.99, 'snacks_sweets', 0, 'diana', '2025-12-18'),
(rid, 'Frozen Pie Shells 2pk', 5.49, 1, 5.49, 'frozen_prepared', 0, 'diana', '2025-12-18'),
(rid, 'Heavy Cream 35% 473ml', 5.49, 1, 5.49, 'dairy', 0, 'diana', '2025-12-18'),
(rid, 'PC Hummus 227g', 4.49, 1, 4.49, 'condiments_spices', 0, 'diana', '2025-12-18'),
(rid, 'Crackers Triscuit', 4.49, 1, 4.49, 'snacks_sweets', 0, 'diana', '2025-12-18'),
(rid, 'Sweet Potatoes', 4.99, 2, 2.50, 'fruits_veggies', 0, 'diana', '2025-12-18'),
(rid, 'Napkins Party 100ct', 4.99, 1, 4.99, 'cleaning_household', 0.65, 'diana', '2025-12-18'),
(rid, 'Mandarin Oranges 5lb', 8.99, 1, 8.99, 'fruits_veggies', 0, 'diana', '2025-12-18'),
(rid, 'Stuffing Mix', 3.49, 1, 3.49, 'legumes_grains', 0, 'diana', '2025-12-18'),
(rid, 'Vanilla Extract 118ml', 8.99, 1, 8.99, 'condiments_spices', 0, 'diana', '2025-12-18'),
(rid, 'Aluminum Foil Heavy Duty', 6.99, 1, 6.99, 'cleaning_household', 0.91, 'diana', '2025-12-18');

-- ── Dec 30: Metro ($228.30) — post-holiday stock-up ──
INSERT INTO grocery_receipts (store_name, receipt_date, subtotal, tax, total, owner)
VALUES ('Metro', '2025-12-30', 216.40, 11.90, 228.30, 'diana') RETURNING id INTO rid;
INSERT INTO grocery_items (receipt_id, name, price, quantity, unit_price, category, tax_amount, owner, item_date) VALUES
(rid, 'Beef Stewing Cubes 1kg', 16.99, 1, 16.99, 'meats_seafood', 0, 'diana', '2025-12-30'),
(rid, 'Chicken Sausages 500g', 8.99, 1, 8.99, 'meats_seafood', 0, 'diana', '2025-12-30'),
(rid, 'Kale Organic Bunch', 3.99, 1, 3.99, 'fruits_veggies', 0, 'diana', '2025-12-30'),
(rid, 'Cauliflower Head', 4.49, 1, 4.49, 'fruits_veggies', 0, 'diana', '2025-12-30'),
(rid, 'Hummus Large 680g', 6.49, 1, 6.49, 'condiments_spices', 0, 'diana', '2025-12-30'),
(rid, 'Coconut Milk 4pk', 5.99, 1, 5.99, 'beverages', 0, 'diana', '2025-12-30'),
(rid, 'Brown Rice 2kg', 6.99, 1, 6.99, 'legumes_grains', 0, 'diana', '2025-12-30'),
(rid, 'Yogurt Skyr 500g', 5.49, 1, 5.49, 'dairy', 0, 'diana', '2025-12-30'),
(rid, 'Frozen Edamame 500g', 4.99, 1, 4.99, 'frozen_prepared', 0, 'diana', '2025-12-30'),
(rid, 'Frozen Burritos 6pk', 9.99, 1, 9.99, 'frozen_prepared', 0, 'diana', '2025-12-30'),
(rid, 'Olive Oil 500ml', 9.99, 1, 9.99, 'condiments_spices', 0, 'diana', '2025-12-30'),
(rid, 'Sourdough Loaf', 5.49, 1, 5.49, 'bakery_bread', 0, 'diana', '2025-12-30'),
(rid, 'Grapes Red 2lb', 6.99, 1, 6.99, 'fruits_veggies', 0, 'diana', '2025-12-30'),
(rid, 'Cheddar Aged 300g', 8.99, 1, 8.99, 'dairy', 0, 'diana', '2025-12-30'),
(rid, 'Fish Oil Supplements', 14.99, 1, 14.99, 'protein_supplements', 1.95, 'diana', '2025-12-30'),
(rid, 'Popcorn Kernels 850g', 4.99, 1, 4.99, 'snacks_sweets', 0, 'diana', '2025-12-30'),
(rid, 'Trash Bags 40ct', 7.99, 1, 7.99, 'cleaning_household', 1.04, 'diana', '2025-12-30'),
(rid, 'Body Wash Dove', 6.99, 1, 6.99, 'personal_care', 0.91, 'diana', '2025-12-30'),
(rid, 'Clementines 3lb bag', 5.99, 1, 5.99, 'fruits_veggies', 0, 'diana', '2025-12-30'),
(rid, 'Pasta Sauce Rao 660ml', 9.99, 1, 9.99, 'condiments_spices', 0, 'diana', '2025-12-30'),
(rid, 'Frozen Mango Chunks 600g', 5.99, 1, 5.99, 'frozen_prepared', 0, 'diana', '2025-12-30'),
(rid, 'Multivitamin Women', 18.99, 1, 18.99, 'protein_supplements', 2.47, 'diana', '2025-12-30');

-- ── Jan 5: FreshCo ($124.81) ──
INSERT INTO grocery_receipts (store_name, receipt_date, subtotal, tax, total, owner)
VALUES ('FreshCo', '2026-01-05', 118.30, 6.51, 124.81, 'diana') RETURNING id INTO rid;
INSERT INTO grocery_items (receipt_id, name, price, quantity, unit_price, category, tax_amount, owner, item_date) VALUES
(rid, 'Bananas', 1.49, 1, 1.49, 'fruits_veggies', 0, 'diana', '2026-01-05'),
(rid, 'Tomatoes on the Vine', 4.99, 1, 4.99, 'fruits_veggies', 0, 'diana', '2026-01-05'),
(rid, 'Ground Chicken 450g', 7.99, 1, 7.99, 'meats_seafood', 0, 'diana', '2026-01-05'),
(rid, 'Eggs 12pk', 5.49, 1, 5.49, 'dairy', 0, 'diana', '2026-01-05'),
(rid, 'Almond Milk 1.89L', 4.49, 1, 4.49, 'beverages', 0, 'diana', '2026-01-05'),
(rid, 'Oats Steel Cut 1kg', 5.99, 1, 5.99, 'legumes_grains', 0, 'diana', '2026-01-05'),
(rid, 'Peanut Butter 1kg', 6.49, 1, 6.49, 'condiments_spices', 0, 'diana', '2026-01-05'),
(rid, 'Whole Wheat Bread', 3.99, 1, 3.99, 'bakery_bread', 0, 'diana', '2026-01-05'),
(rid, 'Frozen Salmon Fillets 4pk', 16.99, 1, 16.99, 'meats_seafood', 0, 'diana', '2026-01-05'),
(rid, 'Apples Gala 3lb', 5.99, 1, 5.99, 'fruits_veggies', 0, 'diana', '2026-01-05'),
(rid, 'Cottage Cheese 500g', 4.99, 1, 4.99, 'dairy', 0, 'diana', '2026-01-05'),
(rid, 'Honey 500g', 8.49, 1, 8.49, 'condiments_spices', 0, 'diana', '2026-01-05'),
(rid, 'Frozen Waffles 8pk', 4.49, 1, 4.49, 'frozen_prepared', 0, 'diana', '2026-01-05'),
(rid, 'Rice Cakes', 3.49, 1, 3.49, 'snacks_sweets', 0, 'diana', '2026-01-05'),
(rid, 'Hand Soap Refill', 5.99, 1, 5.99, 'cleaning_household', 0.78, 'diana', '2026-01-05'),
(rid, 'Avocado', 2.49, 2, 1.25, 'fruits_veggies', 0, 'diana', '2026-01-05'),
(rid, 'Lemons 5pk', 3.99, 1, 3.99, 'fruits_veggies', 0, 'diana', '2026-01-05');

-- ── Jan 17: No Frills ($153.61) ──
INSERT INTO grocery_receipts (store_name, receipt_date, subtotal, tax, total, owner)
VALUES ('No Frills', '2026-01-17', 145.60, 8.01, 153.61, 'diana') RETURNING id INTO rid;
INSERT INTO grocery_items (receipt_id, name, price, quantity, unit_price, category, tax_amount, owner, item_date) VALUES
(rid, 'Chicken Thighs 1.5kg', 12.99, 1, 12.99, 'meats_seafood', 0, 'diana', '2026-01-17'),
(rid, 'Broccoli Crowns', 3.99, 1, 3.99, 'fruits_veggies', 0, 'diana', '2026-01-17'),
(rid, 'Spinach Baby 312g', 4.99, 1, 4.99, 'fruits_veggies', 0, 'diana', '2026-01-17'),
(rid, 'Milk 2% 4L', 6.49, 1, 6.49, 'dairy', 0, 'diana', '2026-01-17'),
(rid, 'Cheddar 400g', 7.99, 1, 7.99, 'dairy', 0, 'diana', '2026-01-17'),
(rid, 'Pasta Penne 900g', 2.49, 2, 1.25, 'legumes_grains', 0, 'diana', '2026-01-17'),
(rid, 'Canned Tuna 6pk', 8.99, 1, 8.99, 'meats_seafood', 0, 'diana', '2026-01-17'),
(rid, 'Peppers Red 3pk', 5.49, 1, 5.49, 'fruits_veggies', 0, 'diana', '2026-01-17'),
(rid, 'Butter 454g', 6.49, 1, 6.49, 'dairy', 0, 'diana', '2026-01-17'),
(rid, 'Instant Noodles 5pk', 3.99, 1, 3.99, 'legumes_grains', 0, 'diana', '2026-01-17'),
(rid, 'Ketchup Heinz 750ml', 4.49, 1, 4.49, 'condiments_spices', 0, 'diana', '2026-01-17'),
(rid, 'Frozen French Fries 1kg', 4.99, 1, 4.99, 'frozen_prepared', 0, 'diana', '2026-01-17'),
(rid, 'Coffee Ground 930g', 12.99, 1, 12.99, 'beverages', 0, 'diana', '2026-01-17'),
(rid, 'Chips Lays Classic', 4.49, 1, 4.49, 'snacks_sweets', 0, 'diana', '2026-01-17'),
(rid, 'Garbage Bags 20ct', 5.99, 1, 5.99, 'cleaning_household', 0.78, 'diana', '2026-01-17'),
(rid, 'Tissues Kleenex 6pk', 8.99, 1, 8.99, 'cleaning_household', 1.17, 'diana', '2026-01-17'),
(rid, 'Oranges Navel 4lb', 6.99, 1, 6.99, 'fruits_veggies', 0, 'diana', '2026-01-17'),
(rid, 'Tortilla Chips', 4.49, 1, 4.49, 'snacks_sweets', 0, 'diana', '2026-01-17');

-- ── Jan 29: Costco ($181.88) ──
INSERT INTO grocery_receipts (store_name, receipt_date, subtotal, tax, total, owner)
VALUES ('Costco', '2026-01-29', 172.40, 9.48, 181.88, 'diana') RETURNING id INTO rid;
INSERT INTO grocery_items (receipt_id, name, price, quantity, unit_price, category, tax_amount, owner, item_date) VALUES
(rid, 'Kirkland Chicken Breast 2.5kg', 24.99, 1, 24.99, 'meats_seafood', 0, 'diana', '2026-01-29'),
(rid, 'Kirkland Stir Fry Veg 2.5kg', 12.99, 1, 12.99, 'frozen_prepared', 0, 'diana', '2026-01-29'),
(rid, 'Kirkland Almonds 1.36kg', 16.99, 1, 16.99, 'snacks_sweets', 0, 'diana', '2026-01-29'),
(rid, 'Organic Bananas 3lb', 2.99, 1, 2.99, 'fruits_veggies', 0, 'diana', '2026-01-29'),
(rid, 'Kirkland Mozzarella 1.33kg', 14.99, 1, 14.99, 'dairy', 0, 'diana', '2026-01-29'),
(rid, 'Kirkland Quinoa 2.04kg', 14.99, 1, 14.99, 'legumes_grains', 0, 'diana', '2026-01-29'),
(rid, 'Kirkland Dish Soap 2.66L', 9.99, 1, 9.99, 'cleaning_household', 1.30, 'diana', '2026-01-29'),
(rid, 'Kirkland Coffee 1.36kg', 16.99, 1, 16.99, 'beverages', 0, 'diana', '2026-01-29'),
(rid, 'Avocados 5pk', 7.99, 1, 7.99, 'fruits_veggies', 0, 'diana', '2026-01-29'),
(rid, 'Berries Mixed Frozen 2kg', 13.99, 1, 13.99, 'frozen_prepared', 0, 'diana', '2026-01-29'),
(rid, 'Kirkland Creatine 500g', 19.99, 1, 19.99, 'protein_supplements', 2.60, 'diana', '2026-01-29'),
(rid, 'Mango 6pk', 9.99, 1, 9.99, 'fruits_veggies', 0, 'diana', '2026-01-29');

-- ── Feb 8: Metro ($139.79) ──
INSERT INTO grocery_receipts (store_name, receipt_date, subtotal, tax, total, owner)
VALUES ('Metro', '2026-02-08', 132.50, 7.29, 139.79, 'diana') RETURNING id INTO rid;
INSERT INTO grocery_items (receipt_id, name, price, quantity, unit_price, category, tax_amount, owner, item_date) VALUES
(rid, 'Salmon Fillet Fresh 500g', 14.99, 1, 14.99, 'meats_seafood', 0, 'diana', '2026-02-08'),
(rid, 'Asparagus Bunch', 4.99, 1, 4.99, 'fruits_veggies', 0, 'diana', '2026-02-08'),
(rid, 'Arugula 142g', 3.99, 1, 3.99, 'fruits_veggies', 0, 'diana', '2026-02-08'),
(rid, 'Ricotta 475g', 5.49, 1, 5.49, 'dairy', 0, 'diana', '2026-02-08'),
(rid, 'Prosciutto 150g', 7.99, 1, 7.99, 'meats_seafood', 0, 'diana', '2026-02-08'),
(rid, 'Tomato Cherry Pint', 4.99, 1, 4.99, 'fruits_veggies', 0, 'diana', '2026-02-08'),
(rid, 'Balsamic Vinegar 500ml', 7.99, 1, 7.99, 'condiments_spices', 0, 'diana', '2026-02-08'),
(rid, 'Ciabatta Bread', 4.49, 1, 4.49, 'bakery_bread', 0, 'diana', '2026-02-08'),
(rid, 'Eggs 12pk', 5.49, 1, 5.49, 'dairy', 0, 'diana', '2026-02-08'),
(rid, 'Dark Chocolate 85%', 4.49, 1, 4.49, 'snacks_sweets', 0, 'diana', '2026-02-08'),
(rid, 'Sparkling Water Perrier 12pk', 8.99, 1, 8.99, 'beverages', 1.17, 'diana', '2026-02-08'),
(rid, 'Chickpeas 540ml', 1.49, 2, 0.75, 'legumes_grains', 0, 'diana', '2026-02-08'),
(rid, 'Frozen Pizza Dr. Oetker', 6.99, 2, 3.50, 'frozen_prepared', 0, 'diana', '2026-02-08'),
(rid, 'Mayo Hellmanns 890ml', 6.49, 1, 6.49, 'condiments_spices', 0, 'diana', '2026-02-08'),
(rid, 'Laundry Sheets 60ct', 12.99, 1, 12.99, 'cleaning_household', 1.69, 'diana', '2026-02-08'),
(rid, 'Lip Balm Burt Bees', 4.99, 1, 4.99, 'personal_care', 0.65, 'diana', '2026-02-08');

-- ── Feb 16: T&T Supermarket ($114.89) ──
INSERT INTO grocery_receipts (store_name, receipt_date, subtotal, tax, total, owner)
VALUES ('T&T Supermarket', '2026-02-16', 108.90, 5.99, 114.89, 'diana') RETURNING id INTO rid;
INSERT INTO grocery_items (receipt_id, name, price, quantity, unit_price, category, tax_amount, owner, item_date) VALUES
(rid, 'Enoki Mushrooms 200g', 3.49, 1, 3.49, 'fruits_veggies', 0, 'diana', '2026-02-16'),
(rid, 'Choy Sum Bunch', 2.99, 1, 2.99, 'fruits_veggies', 0, 'diana', '2026-02-16'),
(rid, 'Korean Short Ribs 500g', 15.99, 1, 15.99, 'meats_seafood', 0, 'diana', '2026-02-16'),
(rid, 'Ramen Noodles Shin 5pk', 7.99, 1, 7.99, 'legumes_grains', 0, 'diana', '2026-02-16'),
(rid, 'Kimchi 500g', 7.99, 1, 7.99, 'condiments_spices', 0, 'diana', '2026-02-16'),
(rid, 'Gyoza Frozen 500g', 8.99, 1, 8.99, 'frozen_prepared', 0, 'diana', '2026-02-16'),
(rid, 'Coconut Cream 400ml', 2.99, 2, 1.50, 'condiments_spices', 0, 'diana', '2026-02-16'),
(rid, 'Bean Sprouts 350g', 1.99, 1, 1.99, 'fruits_veggies', 0, 'diana', '2026-02-16'),
(rid, 'Daikon Radish', 2.49, 1, 2.49, 'fruits_veggies', 0, 'diana', '2026-02-16'),
(rid, 'Jasmine Tea 100 bags', 8.99, 1, 8.99, 'beverages', 0, 'diana', '2026-02-16'),
(rid, 'Tapioca Pearls 500g', 4.99, 1, 4.99, 'snacks_sweets', 0, 'diana', '2026-02-16'),
(rid, 'Seaweed Snacks 12pk', 6.99, 1, 6.99, 'snacks_sweets', 0, 'diana', '2026-02-16'),
(rid, 'Curry Paste Red 400g', 4.99, 1, 4.99, 'condiments_spices', 0, 'diana', '2026-02-16'),
(rid, 'Rice Vinegar 500ml', 3.99, 1, 3.99, 'condiments_spices', 0, 'diana', '2026-02-16'),
(rid, 'Mango Fresh 2pk', 4.99, 1, 4.99, 'fruits_veggies', 0, 'diana', '2026-02-16');

-- ── Feb 27: Loblaws ($212.37) ──
INSERT INTO grocery_receipts (store_name, receipt_date, subtotal, tax, total, owner)
VALUES ('Loblaws', '2026-02-27', 201.30, 11.07, 212.37, 'diana') RETURNING id INTO rid;
INSERT INTO grocery_items (receipt_id, name, price, quantity, unit_price, category, tax_amount, owner, item_date) VALUES
(rid, 'PC Org Chicken Breast 1kg', 18.99, 1, 18.99, 'meats_seafood', 0, 'diana', '2026-02-27'),
(rid, 'Atlantic Cod Fillets 454g', 14.99, 1, 14.99, 'meats_seafood', 0, 'diana', '2026-02-27'),
(rid, 'Avocados 4pk', 6.99, 1, 6.99, 'fruits_veggies', 0, 'diana', '2026-02-27'),
(rid, 'Kale Org Bunch', 3.99, 1, 3.99, 'fruits_veggies', 0, 'diana', '2026-02-27'),
(rid, 'Goat Cheese 300g', 8.99, 1, 8.99, 'dairy', 0, 'diana', '2026-02-27'),
(rid, 'Greek Yogurt Oikos 4pk', 8.49, 1, 8.49, 'dairy', 0, 'diana', '2026-02-27'),
(rid, 'Whole Wheat Pasta 900g', 3.49, 1, 3.49, 'legumes_grains', 0, 'diana', '2026-02-27'),
(rid, 'PC Org Tomato Sauce 680ml', 3.99, 1, 3.99, 'condiments_spices', 0, 'diana', '2026-02-27'),
(rid, 'Multigrain Bread', 4.99, 1, 4.99, 'bakery_bread', 0, 'diana', '2026-02-27'),
(rid, 'Whey Protein 2lb', 39.99, 1, 39.99, 'protein_supplements', 5.20, 'diana', '2026-02-27'),
(rid, 'Blueberries 340g', 5.99, 1, 5.99, 'fruits_veggies', 0, 'diana', '2026-02-27'),
(rid, 'Orange Juice 1.75L', 5.99, 1, 5.99, 'beverages', 0, 'diana', '2026-02-27'),
(rid, 'Frozen Vegetable Stir Fry', 5.99, 1, 5.99, 'frozen_prepared', 0, 'diana', '2026-02-27'),
(rid, 'Chocolate Almonds 200g', 5.49, 1, 5.49, 'snacks_sweets', 0, 'diana', '2026-02-27'),
(rid, 'Garbage Bags Kitchen 30ct', 7.99, 1, 7.99, 'cleaning_household', 1.04, 'diana', '2026-02-27'),
(rid, 'Conditioner Dove 355ml', 6.99, 1, 6.99, 'personal_care', 0.91, 'diana', '2026-02-27'),
(rid, 'Strawberries 454g', 5.99, 1, 5.99, 'fruits_veggies', 0, 'diana', '2026-02-27'),
(rid, 'Mushrooms Cremini 227g', 3.99, 1, 3.99, 'fruits_veggies', 0, 'diana', '2026-02-27'),
(rid, 'Maple Syrup 250ml', 9.99, 1, 9.99, 'condiments_spices', 0, 'diana', '2026-02-27');

-- ── Mar 5: No Frills ($147.38) ──
INSERT INTO grocery_receipts (store_name, receipt_date, subtotal, tax, total, owner)
VALUES ('No Frills', '2026-03-05', 139.70, 7.68, 147.38, 'diana') RETURNING id INTO rid;
INSERT INTO grocery_items (receipt_id, name, price, quantity, unit_price, category, tax_amount, owner, item_date) VALUES
(rid, 'Bananas', 1.99, 1, 1.99, 'fruits_veggies', 0, 'diana', '2026-03-05'),
(rid, 'Carrots 5lb', 4.49, 1, 4.49, 'fruits_veggies', 0, 'diana', '2026-03-05'),
(rid, 'Ground Beef Medium', 8.99, 1, 8.99, 'meats_seafood', 0, 'diana', '2026-03-05'),
(rid, 'Chicken Wings 1kg', 10.99, 1, 10.99, 'meats_seafood', 0, 'diana', '2026-03-05'),
(rid, 'Eggs Large 12pk', 5.49, 1, 5.49, 'dairy', 0, 'diana', '2026-03-05'),
(rid, 'Milk 2% 4L', 6.49, 1, 6.49, 'dairy', 0, 'diana', '2026-03-05'),
(rid, 'White Rice 4kg', 11.99, 1, 11.99, 'legumes_grains', 0, 'diana', '2026-03-05'),
(rid, 'Black Beans 540ml', 1.49, 3, 0.50, 'legumes_grains', 0, 'diana', '2026-03-05'),
(rid, 'Bread Whole Wheat', 3.99, 1, 3.99, 'bakery_bread', 0, 'diana', '2026-03-05'),
(rid, 'Tomato Sauce 680ml', 2.29, 2, 1.15, 'condiments_spices', 0, 'diana', '2026-03-05'),
(rid, 'Frozen Chicken Strips 700g', 9.99, 1, 9.99, 'frozen_prepared', 0, 'diana', '2026-03-05'),
(rid, 'Tea Yorkshire 80 bags', 7.99, 1, 7.99, 'beverages', 0, 'diana', '2026-03-05'),
(rid, 'Pretzels Bag', 3.99, 1, 3.99, 'snacks_sweets', 0, 'diana', '2026-03-05'),
(rid, 'Sponges 6pk', 3.99, 1, 3.99, 'cleaning_household', 0.52, 'diana', '2026-03-05'),
(rid, 'Onions Yellow 3lb', 3.49, 1, 3.49, 'fruits_veggies', 0, 'diana', '2026-03-05'),
(rid, 'Garlic Bulb 3pk', 2.49, 1, 2.49, 'fruits_veggies', 0, 'diana', '2026-03-05'),
(rid, 'Yogurt Activia 8pk', 6.49, 1, 6.49, 'dairy', 0, 'diana', '2026-03-05');

-- ── Mar 15: FreshCo ($163.74) ──
INSERT INTO grocery_receipts (store_name, receipt_date, subtotal, tax, total, owner)
VALUES ('FreshCo', '2026-03-15', 155.20, 8.54, 163.74, 'diana') RETURNING id INTO rid;
INSERT INTO grocery_items (receipt_id, name, price, quantity, unit_price, category, tax_amount, owner, item_date) VALUES
(rid, 'Chicken Breast Boneless 1kg', 14.99, 1, 14.99, 'meats_seafood', 0, 'diana', '2026-03-15'),
(rid, 'Tilapia Fillets 454g', 10.99, 1, 10.99, 'meats_seafood', 0, 'diana', '2026-03-15'),
(rid, 'Spinach 312g', 4.99, 1, 4.99, 'fruits_veggies', 0, 'diana', '2026-03-15'),
(rid, 'Peppers Mixed 4pk', 5.99, 1, 5.99, 'fruits_veggies', 0, 'diana', '2026-03-15'),
(rid, 'Cheddar Medium 400g', 7.99, 1, 7.99, 'dairy', 0, 'diana', '2026-03-15'),
(rid, 'Greek Yogurt Plain 750g', 6.49, 1, 6.49, 'dairy', 0, 'diana', '2026-03-15'),
(rid, 'Lentils Green 900g', 4.99, 1, 4.99, 'legumes_grains', 0, 'diana', '2026-03-15'),
(rid, 'Couscous 500g', 3.99, 1, 3.99, 'legumes_grains', 0, 'diana', '2026-03-15'),
(rid, 'Pita Bread 6pk', 3.49, 1, 3.49, 'bakery_bread', 0, 'diana', '2026-03-15'),
(rid, 'Olive Oil 1L', 12.99, 1, 12.99, 'condiments_spices', 0, 'diana', '2026-03-15'),
(rid, 'Frozen Samosas 12pk', 7.99, 1, 7.99, 'frozen_prepared', 0, 'diana', '2026-03-15'),
(rid, 'Coffee Beans 454g', 11.99, 1, 11.99, 'beverages', 0, 'diana', '2026-03-15'),
(rid, 'Granola 750g', 6.99, 1, 6.99, 'snacks_sweets', 0, 'diana', '2026-03-15'),
(rid, 'Dish Soap Palmolive', 3.49, 1, 3.49, 'cleaning_household', 0.45, 'diana', '2026-03-15'),
(rid, 'Toothbrush Oral-B 2pk', 6.99, 1, 6.99, 'personal_care', 0.91, 'diana', '2026-03-15'),
(rid, 'Celery Hearts', 3.49, 1, 3.49, 'fruits_veggies', 0, 'diana', '2026-03-15'),
(rid, 'Sweet Potato', 3.99, 1, 3.99, 'fruits_veggies', 0, 'diana', '2026-03-15'),
(rid, 'Creatine Monohydrate 300g', 16.99, 1, 16.99, 'protein_supplements', 2.21, 'diana', '2026-03-15');

-- ── Mar 24: Costco ($178.19) ──
INSERT INTO grocery_receipts (store_name, receipt_date, subtotal, tax, total, owner)
VALUES ('Costco', '2026-03-24', 168.90, 9.29, 178.19, 'diana') RETURNING id INTO rid;
INSERT INTO grocery_items (receipt_id, name, price, quantity, unit_price, category, tax_amount, owner, item_date) VALUES
(rid, 'Kirkland Salmon 1.36kg', 22.99, 1, 22.99, 'meats_seafood', 0, 'diana', '2026-03-24'),
(rid, 'Kirkland Shrimp Frozen 907g', 18.99, 1, 18.99, 'meats_seafood', 0, 'diana', '2026-03-24'),
(rid, 'Organic Strawberries 2lb', 9.99, 1, 9.99, 'fruits_veggies', 0, 'diana', '2026-03-24'),
(rid, 'Kirkland Pesto 630g', 9.99, 1, 9.99, 'condiments_spices', 0, 'diana', '2026-03-24'),
(rid, 'Kirkland Cheddar 2-pk', 14.99, 1, 14.99, 'dairy', 0, 'diana', '2026-03-24'),
(rid, 'Kirkland Organic Eggs 24pk', 12.99, 1, 12.99, 'dairy', 0, 'diana', '2026-03-24'),
(rid, 'Kirkland Trail Mix 1.13kg', 14.99, 1, 14.99, 'snacks_sweets', 0, 'diana', '2026-03-24'),
(rid, 'Paper Towels Bounty 12pk', 22.99, 1, 22.99, 'cleaning_household', 2.99, 'diana', '2026-03-24'),
(rid, 'Kirkland Oat Milk 6pk', 12.99, 1, 12.99, 'beverages', 0, 'diana', '2026-03-24'),
(rid, 'Blueberries Organic 1.5lb', 9.99, 1, 9.99, 'fruits_veggies', 0, 'diana', '2026-03-24'),
(rid, 'Kirkland Whey Protein 2.72kg', 42.99, 1, 42.99, 'protein_supplements', 5.59, 'diana', '2026-03-24');

END $$;

-- ═══════════════════════════════════════════
-- Enable RLS (permissive for personal app)
-- ═══════════════════════════════════════════
ALTER TABLE grocery_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to grocery_receipts" ON grocery_receipts;
CREATE POLICY "Allow all access to grocery_receipts" ON grocery_receipts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to grocery_items" ON grocery_items;
CREATE POLICY "Allow all access to grocery_items" ON grocery_items FOR ALL USING (true) WITH CHECK (true);

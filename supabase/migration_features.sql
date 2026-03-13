-- =============================================
-- LogicPro: SQL migrace pro features
-- Spustit v Supabase SQL editoru
-- =============================================

-- 1. PROFILY (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- 2. OBLIBENE
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_all_own" ON favorites FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);


-- 3. ULOZENE HLEDANI
CREATE TABLE IF NOT EXISTS saved_searches (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_searches_all_own" ON saved_searches FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);


-- 4. POPTAVKY / INQUIRIES
CREATE TABLE IF NOT EXISTS inquiries (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inquiries_insert_anyone" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "inquiries_select_admin" ON inquiries FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "inquiries_select_own" ON inquiries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "inquiries_delete_admin" ON inquiries FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE INDEX IF NOT EXISTS idx_inquiries_listing ON inquiries(listing_id);


-- 5. ADMIN WRITE POLICIES na listings
CREATE POLICY "listings_insert_admin" ON listings FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "listings_update_admin" ON listings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "listings_delete_admin" ON listings FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ADMIN WRITE POLICIES na listing_images
CREATE POLICY "images_insert_admin" ON listing_images FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "images_update_admin" ON listing_images FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "images_delete_admin" ON listing_images FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- 6. FULLTEXT SEARCH
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Czech-friendly text search config
DO $$ BEGIN
  CREATE TEXT SEARCH CONFIGURATION czech_unaccent (COPY = simple);
EXCEPTION WHEN unique_violation THEN NULL;
END $$;

ALTER TEXT SEARCH CONFIGURATION czech_unaccent
  ALTER MAPPING FOR hword, hword_part, word WITH unaccent, simple;

-- Search vector column
ALTER TABLE listings ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Populate
UPDATE listings SET search_vector =
  setweight(to_tsvector('czech_unaccent', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('czech_unaccent', COALESCE(locality_city, '')), 'A') ||
  setweight(to_tsvector('czech_unaccent', COALESCE(description, '')), 'C');

-- GIN indexes
CREATE INDEX IF NOT EXISTS idx_listings_search ON listings USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_listings_title_trgm ON listings USING GIN(title gin_trgm_ops);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION listings_search_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('czech_unaccent', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('czech_unaccent', COALESCE(NEW.locality_city, '')), 'A') ||
    setweight(to_tsvector('czech_unaccent', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_listings_search ON listings;
CREATE TRIGGER trg_listings_search
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION listings_search_trigger();


-- 7. SUPABASE STORAGE BUCKET
-- Manualne v Supabase dashboard: Storage > New bucket > "listing-images" > Public
-- Nebo pres API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true);

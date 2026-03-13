-- LogicPro: Supabase PostgreSQL schema
-- Run this in Supabase SQL Editor FIRST, then run seed.sql

CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  advert_function INTEGER NOT NULL,
  advert_type INTEGER NOT NULL DEFAULT 4,
  advert_subtype INTEGER NOT NULL,
  advert_price NUMERIC NOT NULL,
  advert_price_currency INTEGER NOT NULL DEFAULT 3,
  advert_price_unit INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  locality_city TEXT NOT NULL,
  locality_street TEXT,
  locality_citypart TEXT,
  locality_region TEXT,
  locality_latitude DOUBLE PRECISION,
  locality_longitude DOUBLE PRECISION,
  usable_area INTEGER,
  estate_area INTEGER,
  office_area INTEGER,
  min_divisible_area INTEGER,
  building_condition INTEGER,
  building_type INTEGER,
  building_class INTEGER,
  certification INTEGER,
  furnished INTEGER,
  elevator INTEGER,
  parking_lots INTEGER DEFAULT 0,
  parking_type INTEGER,
  garage INTEGER DEFAULT 0,
  energy_efficiency_rating INTEGER,
  floors INTEGER,
  ceiling_height DOUBLE PRECISION,
  floor_load INTEGER,
  sprinkler_type INTEGER,
  heating_type INTEGER,
  loading_docks INTEGER DEFAULT 0,
  dock_type INTEGER,
  drive_in_gates INTEGER DEFAULT 0,
  crane_capacity DOUBLE PRECISION,
  column_grid TEXT,
  lease_type INTEGER,
  available_from TEXT,
  land_type INTEGER,
  utilities TEXT,
  rail_access INTEGER DEFAULT 0,
  highway_distance DOUBLE PRECISION,
  year_built INTEGER,
  year_renovated INTEGER,
  extra_info INTEGER,
  features TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE listing_images (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  is_main INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_listings_function ON listings(advert_function);
CREATE INDEX idx_listings_subtype ON listings(advert_subtype);
CREATE INDEX idx_listings_city ON listings(locality_city);
CREATE INDEX idx_images_listing ON listing_images(listing_id);

-- Enable Row Level Security (public read)
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read listings" ON listings FOR SELECT USING (true);
CREATE POLICY "Public read images" ON listing_images FOR SELECT USING (true);

-- Helper functions for filters endpoint
CREATE OR REPLACE FUNCTION get_city_counts()
RETURNS TABLE(value TEXT, count BIGINT) LANGUAGE sql STABLE AS $$
  SELECT locality_city AS value, COUNT(*) AS count
  FROM listings GROUP BY locality_city ORDER BY count DESC;
$$;

CREATE OR REPLACE FUNCTION get_subtype_counts()
RETURNS TABLE(value INTEGER, count BIGINT) LANGUAGE sql STABLE AS $$
  SELECT advert_subtype AS value, COUNT(*) AS count
  FROM listings GROUP BY advert_subtype ORDER BY count DESC;
$$;

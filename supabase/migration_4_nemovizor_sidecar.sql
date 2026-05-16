-- =====================================================================
-- LogicPro — migrace #4: Nemovizor sidecar (DRAFT — NESPOUŠTĚT JEŠTĚ)
-- =====================================================================
-- Stav: navrh ceka na finalizaci architektury (otazky Q1-Q3 nemovizor).
--
-- Co tato migrace dela:
--   1) Vytvori tabulku `property_extensions` — sidecar drzici
--      industrial fieldy, ktere Nemovizor schema nezna, PLUS denormalizovany
--      "hot mirror" core poli pro performance filteringu na listings strance.
--   2) FK property_id smeruje na Nemovizor stable ID (UUID nebo TEXT slug
--      podle toho, co Nemovizor pouziva).
--   3) Indexy na hot mirror sloupcich pro DB-side filtering.
--   4) RLS — public read, admin write.
--   5) Trigger na updated_at.
--
-- Po finalizaci spustit:
--   1) Pred spustenim potvrdit format property_id (UUID vs TEXT).
--   2) Po spustenim — backfill z aktualni listings tabulky
--      (viz sekce BACKFILL na konci).
--   3) Po overeni — zacit psat z LogicPro admin formu do teto tabulky.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. PROPERTY_EXTENSIONS — sidecar tabulka
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.property_extensions (
  -- Identita
  property_id          TEXT PRIMARY KEY,             -- Nemovizor stable ID
                                                     -- (zmenit na UUID pokud
                                                     -- Nemovizor pouziva UUID)
  -- ===== INDUSTRIAL FIELDS (LogicPro autoritativni zdroj) =====
  building_class       INTEGER,                      -- 1=A, 2=B, 3=C
  certification        TEXT[],                       -- ["BREEAM Excellent", "LEED Gold"]
  floor_load           INTEGER,                      -- codebook id (1-5)
  loading_docks        INTEGER,                      -- pocet
  dock_type            INTEGER,                      -- codebook id
  drive_in_gates       INTEGER,
  crane_capacity       NUMERIC(6,2),                 -- tuny
  column_grid          TEXT,                         -- "12x24m"
  sprinkler_type       INTEGER,                      -- codebook id
  rail_access          BOOLEAN DEFAULT FALSE,
  highway_distance     NUMERIC(6,2),                 -- km
  lease_type           INTEGER,                      -- NNN/NN/Gross/...
  ceiling_height       NUMERIC(4,2),                 -- metry (pokud Nemovizor nema)
  min_divisible_area   INTEGER,                      -- m2
  office_area          INTEGER,
  production_area      INTEGER,
  shop_area            INTEGER,
  store_area           INTEGER,
  workshop_area        INTEGER,

  -- ===== HOT MIRROR (denormalizace z Nemovizoru pro filter performance) =====
  -- Tyto sloupce drzime synced s Nemovizorem (push webhook nebo daily pull).
  -- Pouzivaji se v listings query, takze maji indexy.
  -- POZOR: pri kazdem sync je nutne respektovat poradi
  --        (sync_version se zvedne, pak teprve updatuj data).
  mirror_subtype          INTEGER,                   -- LogicPro advert_subtype
  mirror_advert_function  INTEGER,                   -- 1=Prodej, 2=Pronajem
  mirror_locality_city    TEXT,
  mirror_locality_region  TEXT,
  mirror_latitude         DOUBLE PRECISION,
  mirror_longitude        DOUBLE PRECISION,
  mirror_price            NUMERIC,
  mirror_price_currency   INTEGER,
  mirror_price_unit       INTEGER,
  mirror_usable_area      INTEGER,
  mirror_estate_area      INTEGER,
  mirror_main_image_url   TEXT,
  mirror_title            TEXT,
  mirror_status           TEXT,                      -- active / reserved / sold / archived

  -- ===== SYNC METADATA =====
  source                  TEXT NOT NULL DEFAULT 'nemovizor',  -- nemovizor / sreality / manual
  last_synced_at          TIMESTAMPTZ DEFAULT NOW(),
  sync_version            INTEGER DEFAULT 1,         -- inkrementuje pri kazdem sync
  sync_hash               TEXT,                      -- ETag/hash z Nemovizoru pro change detect

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.property_extensions IS
  'LogicPro sidecar: industrial fieldy + hot mirror z Nemovizoru pro performance filtering.';


-- ---------------------------------------------------------------------
-- 2. INDEXY na hot mirror sloupcich (listing query path)
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_pe_mirror_subtype
  ON public.property_extensions (mirror_subtype);
CREATE INDEX IF NOT EXISTS idx_pe_mirror_city
  ON public.property_extensions (mirror_locality_city);
CREATE INDEX IF NOT EXISTS idx_pe_mirror_price
  ON public.property_extensions (mirror_price);
CREATE INDEX IF NOT EXISTS idx_pe_mirror_status
  ON public.property_extensions (mirror_status);
CREATE INDEX IF NOT EXISTS idx_pe_mirror_function
  ON public.property_extensions (mirror_advert_function);
CREATE INDEX IF NOT EXISTS idx_pe_synced
  ON public.property_extensions (last_synced_at DESC);

-- Indexy na industrial fieldy pro filtraci
CREATE INDEX IF NOT EXISTS idx_pe_building_class
  ON public.property_extensions (building_class)
  WHERE building_class IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pe_floor_load
  ON public.property_extensions (floor_load)
  WHERE floor_load IS NOT NULL;

-- GIN index na certifikace array (pro IN-array filter)
CREATE INDEX IF NOT EXISTS idx_pe_certifications
  ON public.property_extensions USING GIN (certification)
  WHERE certification IS NOT NULL;


-- ---------------------------------------------------------------------
-- 3. updated_at trigger
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_pe_updated_at ON public.property_extensions;
CREATE TRIGGER trg_pe_updated_at
  BEFORE UPDATE ON public.property_extensions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ---------------------------------------------------------------------
-- 4. RLS — public read, admin write
-- ---------------------------------------------------------------------
ALTER TABLE public.property_extensions ENABLE ROW LEVEL SECURITY;

-- Public muze cist jen aktivni / rezervovane (stejny pattern jako listings)
DROP POLICY IF EXISTS "pe_select_public" ON public.property_extensions;
CREATE POLICY "pe_select_public" ON public.property_extensions
  FOR SELECT
  USING (mirror_status IN ('active', 'reserved') OR public.is_admin());

-- Service role obchazi RLS (sync cron + admin form pres /api/properties/...)
-- ale dame i policy pro autenticated admin pro pripad UI editu
DROP POLICY IF EXISTS "pe_write_admin" ON public.property_extensions;
CREATE POLICY "pe_write_admin" ON public.property_extensions
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ---------------------------------------------------------------------
-- 5. VIEW pro pohodlne joiny v API (volitelne)
--    Sjednocuje sidecar + (pokud bude potreba) lokalni listings tabulku.
-- ---------------------------------------------------------------------
-- NEPOUZIVAT YET — definovat az po finalizaci data flow.
-- Priklad budouciho VIEW:
--
-- CREATE OR REPLACE VIEW public.v_listings_full AS
-- SELECT
--   pe.property_id,
--   pe.mirror_title AS title,
--   pe.mirror_locality_city AS locality_city,
--   pe.mirror_price AS advert_price,
--   pe.mirror_subtype AS advert_subtype,
--   pe.building_class,
--   pe.floor_load,
--   pe.certification,
--   pe.dock_type,
--   pe.loading_docks,
--   pe.crane_capacity,
--   pe.column_grid,
--   pe.sprinkler_type,
--   pe.rail_access,
--   pe.highway_distance,
--   pe.lease_type,
--   ...
-- FROM public.property_extensions pe
-- WHERE pe.mirror_status IN ('active', 'reserved');


-- =====================================================================
-- BACKFILL — KOPIRUJE EXISTUJICI LISTINGS DO SIDECARU
-- =====================================================================
-- Spustit POUZE pokud chces zachovat existujici LogicPro listingy
-- jako "manual source" v sidecaru, dokud je Nemovizor postupne nahradi.
-- =====================================================================
-- INSERT INTO public.property_extensions (
--   property_id, source,
--   building_class, certification, floor_load, loading_docks, dock_type,
--   drive_in_gates, crane_capacity, column_grid, sprinkler_type,
--   rail_access, highway_distance, lease_type, ceiling_height,
--   min_divisible_area, office_area,
--   mirror_subtype, mirror_advert_function,
--   mirror_locality_city, mirror_locality_region,
--   mirror_latitude, mirror_longitude,
--   mirror_price, mirror_price_currency, mirror_price_unit,
--   mirror_usable_area, mirror_estate_area,
--   mirror_title, mirror_status
-- )
-- SELECT
--   'local-' || id::TEXT,                            -- placeholder property_id
--   COALESCE(source, 'manual'),
--   building_class,
--   CASE WHEN certification IS NOT NULL
--        THEN ARRAY[certification::TEXT]
--        ELSE NULL END,
--   floor_load, loading_docks, dock_type, drive_in_gates, crane_capacity,
--   column_grid, sprinkler_type, rail_access::BOOLEAN,
--   highway_distance, lease_type, ceiling_height, min_divisible_area, office_area,
--   advert_subtype, advert_function,
--   locality_city, locality_region,
--   locality_latitude, locality_longitude,
--   advert_price, advert_price_currency, advert_price_unit,
--   usable_area, estate_area,
--   title, status
-- FROM public.listings
-- WHERE status IN ('active', 'reserved')
-- ON CONFLICT (property_id) DO NOTHING;


-- =====================================================================
-- ROLLBACK (pokud bude potreba)
-- =====================================================================
-- DROP TABLE IF EXISTS public.property_extensions CASCADE;

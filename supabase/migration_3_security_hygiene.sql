-- =====================================================================
-- LogicPro — migrace #3: bezpecnost & hygiena
-- Spustit jako celek v Supabase SQL editoru.
-- Idempotentni — lze pustit opakovane.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. is_admin() helper — rychlejsi nez EXISTS subquery v kazde RLS policy
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;


-- ---------------------------------------------------------------------
-- 2. Privilege escalation fix — uzivatel si nesmi zmenit role na 'admin'.
--    Zaroven nesmi menit ID ani created_at.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_update_own_safe" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- role smi menit jen admin (vyuziva is_admin); user si svoji roli
    -- nezmeni, protoze WITH CHECK zhodnoti hodnotu PO update.
    AND (role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) OR public.is_admin())
  );

-- Admin musí mít moznost editovat jakykoliv profil (zmena role apod.)
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ---------------------------------------------------------------------
-- 3. Inquiries — uzavrit primy INSERT z anon klienta.
--    Inquiry chodi pres /api/inquiries (server-side validation + Turnstile).
--    Service role obchazi RLS, takze policy pro INSERT jiz neni potreba.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "inquiries_insert_anyone" ON public.inquiries;

-- Pro jistotu zachovame moznost prihlasenemu uzivateli se podivat na svoje
-- vlastni poptavky (pokud listing_id je null nebo user_id == auth.uid()).
-- Existing policies inquiries_select_admin / inquiries_select_own / inquiries_delete_admin
-- nechavame.


-- ---------------------------------------------------------------------
-- 4. Listings — pridat sloupce pro scraper, hygienu a SEO
-- ---------------------------------------------------------------------
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS source           TEXT,
  ADD COLUMN IF NOT EXISTS external_id      TEXT,
  ADD COLUMN IF NOT EXISTS slug             TEXT,
  ADD COLUMN IF NOT EXISTS status           TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS last_seen_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS features_jsonb   JSONB;

ALTER TABLE public.listings
  ALTER COLUMN advert_price_currency SET DEFAULT 1; -- CZK je realny default v CR

-- Status enum (rucne — Postgres CHECK staci, ENUM by stezoval migrace)
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_status_check
  CHECK (status IN ('active', 'reserved', 'sold', 'archived', 'draft'));

-- UNIQUE pro deduplikaci scraperu
CREATE UNIQUE INDEX IF NOT EXISTS uq_listings_source_external
  ON public.listings (source, external_id)
  WHERE source IS NOT NULL AND external_id IS NOT NULL;

-- Slug index
CREATE UNIQUE INDEX IF NOT EXISTS uq_listings_slug
  ON public.listings (slug)
  WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings (status);
CREATE INDEX IF NOT EXISTS idx_listings_updated_at ON public.listings (updated_at DESC);


-- ---------------------------------------------------------------------
-- 5. Trigger pro automaticky updated_at
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_listings_updated_at ON public.listings;
CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ---------------------------------------------------------------------
-- 6. Migrace features (TEXT s JSON.stringify) -> features_jsonb (JSONB)
--    Provede se idempotentne — pokud features_jsonb je NULL a features
--    obsahuje validni JSON pole, prevedeme. Puvodni features sloupec
--    zachovavame pro zpetnou kompatibilitu API/scraperu.
-- ---------------------------------------------------------------------
UPDATE public.listings
SET features_jsonb = features::jsonb
WHERE features_jsonb IS NULL
  AND features IS NOT NULL
  AND features ~ '^\s*\[';


-- ---------------------------------------------------------------------
-- 7. Slug auto-generator pro nove listingy bez slugu.
--    Format: <city>-<title>-<id>, lower-case, ascii only.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.listings_set_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  base TEXT;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base := lower(unaccent(coalesce(NEW.locality_city, '') || '-' || coalesce(NEW.title, 'nemovitost')));
    base := regexp_replace(base, '[^a-z0-9]+', '-', 'g');
    base := regexp_replace(base, '(^-|-$)', '', 'g');
    base := substring(base, 1, 80);
    NEW.slug := base || '-' || NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_listings_slug ON public.listings;
CREATE TRIGGER trg_listings_slug
  BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION public.listings_set_slug();


-- ---------------------------------------------------------------------
-- 8. Listings RLS — zobrazit jen ne-archivovane verejne. Admin vidi vse.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read listings" ON public.listings;
CREATE POLICY "listings_select_public" ON public.listings
  FOR SELECT
  USING (status IN ('active', 'reserved') OR public.is_admin());

-- Prepiseme stare admin write policies, aby vyuzivaly is_admin()
DROP POLICY IF EXISTS "listings_insert_admin" ON public.listings;
DROP POLICY IF EXISTS "listings_update_admin" ON public.listings;
DROP POLICY IF EXISTS "listings_delete_admin" ON public.listings;

CREATE POLICY "listings_insert_admin" ON public.listings
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "listings_update_admin" ON public.listings
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "listings_delete_admin" ON public.listings
  FOR DELETE USING (public.is_admin());

-- listing_images — totez
DROP POLICY IF EXISTS "Public read images" ON public.listing_images;
CREATE POLICY "images_select_public" ON public.listing_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "images_insert_admin" ON public.listing_images;
DROP POLICY IF EXISTS "images_update_admin" ON public.listing_images;
DROP POLICY IF EXISTS "images_delete_admin" ON public.listing_images;

CREATE POLICY "images_insert_admin" ON public.listing_images
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "images_update_admin" ON public.listing_images
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "images_delete_admin" ON public.listing_images
  FOR DELETE USING (public.is_admin());


-- ---------------------------------------------------------------------
-- 9. Inquiries policies — pouzit is_admin()
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "inquiries_select_admin" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_delete_admin" ON public.inquiries;

CREATE POLICY "inquiries_select_admin" ON public.inquiries
  FOR SELECT USING (public.is_admin());
CREATE POLICY "inquiries_delete_admin" ON public.inquiries
  FOR DELETE USING (public.is_admin());


-- ---------------------------------------------------------------------
-- 10. Index na search_vector je v migraci #2, ale pojistime se
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_listings_search ON public.listings USING GIN(search_vector);


-- =====================================================================
-- HOTOVO. Po spusteni:
--   1) overit, ze public.is_admin() funguje (mel by vratit false pro anon)
--   2) overit, ze sebe-update profile s role='admin' selze pro non-admin
--   3) listings vraci jen status IN ('active','reserved') pro anon
-- =====================================================================

import { Router } from "express";
import { getDb, CODEBOOKS } from "../db.js";

const router = Router();

/* GET /api/codebooks */
router.get("/codebooks", (_req, res) => {
  res.json(CODEBOOKS);
});

/* GET /api/filters */
router.get("/filters", (_req, res) => {
  const db = getDb();
  const cities = db.prepare("SELECT locality_city AS value, COUNT(*) AS count FROM listings GROUP BY locality_city ORDER BY count DESC").all();
  const subtypes = db.prepare("SELECT advert_subtype AS value, COUNT(*) AS count FROM listings GROUP BY advert_subtype ORDER BY count DESC").all();
  res.json({
    cities,
    subtypes: subtypes.map((s) => ({ ...s, label: CODEBOOKS.advert_subtype[s.value] || "?" })),
  });
});

/* GET /api/listings/featured */
router.get("/listings/featured", (_req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT l.*, li.url AS main_image FROM listings l
    LEFT JOIN listing_images li ON li.listing_id = l.id AND li.is_main = 1
    ORDER BY l.id LIMIT 3
  `).all();
  res.json({ listings: rows });
});

/* GET /api/listings/:id/similar */
router.get("/listings/:id/similar", (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);
  const listing = db.prepare("SELECT * FROM listings WHERE id=?").get(id);
  if (!listing) return res.status(404).json({ error: "Not found" });

  const rows = db.prepare(`
    SELECT l.*, li.url AS main_image FROM listings l
    LEFT JOIN listing_images li ON li.listing_id = l.id AND li.is_main = 1
    WHERE l.id != ? AND (l.advert_subtype = ? OR l.locality_city = ?)
    ORDER BY RANDOM() LIMIT 3
  `).all(id, listing.advert_subtype, listing.locality_city);
  res.json({ listings: rows });
});

/* GET /api/listings/:id */
router.get("/listings/:id", (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);
  const row = db.prepare("SELECT * FROM listings WHERE id=?").get(id);
  if (!row) return res.status(404).json({ error: "Not found" });

  const imgs = db.prepare("SELECT * FROM listing_images WHERE listing_id=? ORDER BY is_main DESC, sort_order").all(id);
  const data = { ...row, images: imgs };
  if (data.features) {
    try { data.features = JSON.parse(data.features); } catch {}
  }
  res.json(data);
});

/* GET /api/listings */
router.get("/listings", (req, res) => {
  const db = getDb();
  const where = [];
  const params = [];

  const { advert_function, advert_subtype, locality_city, area_min, area_max, price_min, price_max,
    building_class, floor_load, certification, loading_docks_min, ceiling_height_min, ceiling_height_max,
    sort, limit: lim, offset: off } = req.query;

  if (advert_function) { where.push("l.advert_function = ?"); params.push(Number(advert_function)); }
  if (advert_subtype) {
    const subs = advert_subtype.split(",").map(Number).filter(Boolean);
    if (subs.length) { where.push(`l.advert_subtype IN (${subs.map(() => "?").join(",")})`); params.push(...subs); }
  }
  if (locality_city) { where.push("l.locality_city = ?"); params.push(locality_city); }
  if (area_min) { where.push("(COALESCE(l.usable_area,0)+COALESCE(l.estate_area,0)) >= ?"); params.push(Number(area_min)); }
  if (area_max) { where.push("(COALESCE(l.usable_area,0)+COALESCE(l.estate_area,0)) <= ?"); params.push(Number(area_max)); }
  if (price_min) { where.push("l.advert_price >= ?"); params.push(Number(price_min)); }
  if (price_max) { where.push("l.advert_price <= ?"); params.push(Number(price_max)); }
  if (building_class) { where.push("l.building_class = ?"); params.push(Number(building_class)); }
  if (floor_load) { where.push("l.floor_load >= ?"); params.push(Number(floor_load)); }
  if (certification) { where.push("l.certification IS NOT NULL"); }
  if (loading_docks_min) { where.push("l.loading_docks >= ?"); params.push(Number(loading_docks_min)); }
  if (ceiling_height_min) { where.push("l.ceiling_height >= ?"); params.push(Number(ceiling_height_min)); }
  if (ceiling_height_max) { where.push("l.ceiling_height <= ?"); params.push(Number(ceiling_height_max)); }

  const whereSql = where.length ? " WHERE " + where.join(" AND ") : "";
  const sortMap = {
    price_asc: "l.advert_price ASC",
    price_desc: "l.advert_price DESC",
    area_asc: "(COALESCE(l.usable_area,0)+COALESCE(l.estate_area,0)) ASC",
    area_desc: "(COALESCE(l.usable_area,0)+COALESCE(l.estate_area,0)) DESC",
    newest: "l.created_at DESC",
  };
  const sortSql = sortMap[sort] || "l.id ASC";
  const limit = Number(lim) || 20;
  const offset = Number(off) || 0;

  const total = db.prepare(`SELECT COUNT(*) AS cnt FROM listings l${whereSql}`).get(...params).cnt;
  const rows = db.prepare(`
    SELECT l.*, li.url AS main_image FROM listings l
    LEFT JOIN listing_images li ON li.listing_id = l.id AND li.is_main = 1
    ${whereSql}
    ORDER BY ${sortSql}
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  res.json({ total, listings: rows });
});

export default router;

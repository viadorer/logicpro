import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { q, limit = 8 } = req.query;
  if (!q || q.length < 2) return res.json({ results: [] });

  const { data, error } = await supabase
    .from('listings')
    .select('id, title, locality_city, advert_function, advert_subtype, advert_price')
    .or(`title.ilike.%${q}%,locality_city.ilike.%${q}%,description.ilike.%${q}%`)
    .limit(Number(limit));

  if (error) return res.status(500).json({ error: error.message });
  res.json({ results: data || [] });
}

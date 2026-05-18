// =====================================================================
// Server-side data source switch.
// =====================================================================
// Cte process.env.DATA_SOURCE (BEZ VITE_ prefixu — server-side only).
// Hodnoty: 'supabase' (default), 'nemovizor', 'hybrid'.
//
// Pouziti v api/* handlerech:
//
//   import { getDataSource } from "../lib/data-source.js";
//   if (getDataSource() === "nemovizor") {
//     return handlerNemovizor(req, res);
//   }
//   // ... existing supabase code
//
// =====================================================================

export function getDataSource() {
  const v = (process.env.DATA_SOURCE || "supabase").toLowerCase().trim();
  if (v === "nemovizor" || v === "hybrid") return v;
  return "supabase";
}

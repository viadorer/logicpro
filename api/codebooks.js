import { CODEBOOKS } from "../lib/codebooks.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400, immutable");
  res.json(CODEBOOKS);
}

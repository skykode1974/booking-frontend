export default async function handler(req, res) {
  const base = process.env.BACKEND_BASE_URL?.replace(/\/$/, "");
  if (!base) return res.status(400).json({ error: "no_base" });
  try {
    const r = await fetch(`${base}/api/room-types`, { headers: { Accept: "application/json" } });
    const d = await r.json();
    return res.status(200).json(d);
  } catch {
    return res.status(500).json({ error: "fetch_failed" });
  }
}

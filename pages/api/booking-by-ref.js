export default async function handler(req, res) {
  const payment_ref = req.query.payment_ref || req.query.ref;
  if (!payment_ref) return res.status(400).json({ booking: null, error: "missing ref" });

  // Prefer the public admin base; fall back to BACKEND_BASE_URL
  const raw = process.env.NEXT_PUBLIC_ADMIN_API_BASE || process.env.BACKEND_BASE_URL || "";
  let base = raw.replace(/\/$/, "");      // trim trailing slash

  // If someone set base to ".../public", ensure it becomes ".../public/api"
  if (!/\/api$/i.test(base)) base += "/api";

  const url = `${base}/hms/booking/by-ref?payment_ref=${encodeURIComponent(payment_ref)}`;

  try {
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    const data = await r.json();

    // Optional debug: /api/booking-by-ref?payment_ref=REF&debug=1
    if (req.query.debug) return res.status(200).json({ used: url, data });

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ booking: null, used: url, error: String(e?.message || e) });
  }
}

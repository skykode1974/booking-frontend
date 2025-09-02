export default async function handler(req, res) {
  const payment_ref = req.query.payment_ref || req.query.ref;
  if (!payment_ref) return res.status(400).json({});

  const raw = process.env.NEXT_PUBLIC_ADMIN_API_BASE || process.env.BACKEND_BASE_URL || "";
  let base = raw.replace(/\/$/, "");
  if (!/\/api$/i.test(base)) base += "/api";

  const url = `${base}/hms/booking/status?payment_ref=${encodeURIComponent(payment_ref)}`;

  try {
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    const d = await r.json();

    if (req.query.debug) return res.status(200).json({ used: url, data: d });
    return res.status(200).json(d);
  } catch (e) {
    return res.status(500).json({ used: url, error: String(e?.message || e) });
  }
}

// pages/api/booking-by-ref.js
export default async function handler(req, res) {
  // prevent CDN / browser caching
  res.setHeader("Cache-Control", "no-store");

  const ref = req.query.payment_ref || req.query.ref;
  if (!ref) return res.status(200).json({ booking: null });

  // Build base like ".../public/api"
  const raw =
    process.env.NEXT_PUBLIC_ADMIN_API_BASE ||
    process.env.BACKEND_BASE_URL ||
    "https://admin.awrabsuiteshotel.com.ng/public";
  const base = /\/api$/i.test(raw) ? raw.replace(/\/$/, "") : raw.replace(/\/$/, "") + "/api";

  const byRefURL = `${base}/hms/booking/by-ref?payment_ref=${encodeURIComponent(ref)}`;
  const statusURL = `${base}/hms/booking/status?payment_ref=${encodeURIComponent(ref)}`;

  try {
    // get both in parallel
    const [refResp, statResp] = await Promise.all([
      fetch(byRefURL, { headers: { Accept: "application/json" } }),
      fetch(statusURL, { headers: { Accept: "application/json" } }),
    ]);

    const refJson = await refResp.json().catch(() => ({}));
    const statJson = await statResp.json().catch(() => ({}));

    const booking = refJson?.booking ?? null;
    const live_status = String(statJson?.status || "").toLowerCase();

    // Convenience boolean for the UI
    const hmsStatus = String(booking?.status || "").toLowerCase();
    const is_confirmed =
      ["consumed", "confirmed", "approved"].includes(live_status) ||
      ["confirmed", "approved"].includes(hmsStatus);

    if (req.query.debug) {
      return res.status(200).json({
        used: { byRefURL, statusURL },
        booking,
        live_status,
        is_confirmed,
      });
    }

    return res.status(200).json({ booking, live_status, is_confirmed });
  } catch (e) {
    return res
      .status(500)
      .json({ booking: null, error: String(e?.message || e) });
  }
}

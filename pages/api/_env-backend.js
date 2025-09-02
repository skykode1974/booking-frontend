export default function handler(req, res) {
  const base =
    process.env.BACKEND_BASE_URL ||
    "https://admin.awrabsuiteshotel.com.ng/public"; // fallback so we always see *something*
  res.status(200).json({ base });
}

export default function handler(req, res) {
  res.status(200).json({
    BACKEND_BASE_URL: process.env.BACKEND_BASE_URL || null,
    hardcodedDefault: "https://admin.awrabsuiteshotel.com.ng/public",
  });
}

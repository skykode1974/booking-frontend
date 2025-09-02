// pages/api/push/subscribe.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/push/subscribe`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {})
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ ok: false, message: 'proxy failed' });
  }
}

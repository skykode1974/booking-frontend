// components/http.js
import axios from "axios";

const HOSTS = [
  (import.meta?.env?.VITE_API_URL || process.env.REACT_APP_API_URL || "").replace(/\/+$/,""),
  "https://admin.awrabsuiteshotel.com.ng",
  "https://hotel.skykode.com.ng"
].filter(Boolean);

function join(base, path) {
  const a = base.replace(/\/+$/,'');
  const b = path.startsWith("/") ? path : `/${path}`;
  return `${a}${b}`;
}

export async function getJSON(path, config = {}) {
  let lastErr;
  for (const host of HOSTS) {
    const url = join(host, path);
    try {
      const res = await axios.get(url, {
        headers: { Accept: "application/json" },
        withCredentials: false,
        ...config
      });
      return res.data;
    } catch (e) {
      console.warn(`[GET FAIL] ${url} → ${e?.response?.status || e.message}`);
      lastErr = e;
    }
  }
  throw lastErr;
}

export function mediaURL(raw) {
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const rel = raw.startsWith("/") ? raw : `/${raw}`;
  const base = HOSTS[0] || "https://admin.awrabsuiteshotel.com.ng";
  return `${base}${rel}`;
}

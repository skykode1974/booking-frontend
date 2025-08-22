// components/http.js
import axios from "axios";

export async function getJSON(path, config = {}) {
  const url = path.startsWith("/") ? path : `/${path}`;
  const res = await axios.get(url, {
    headers: { Accept: "application/json" },
    withCredentials: false,
    ...config,
  });
  return res.data;
}

export function mediaURL(raw) {
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const rel = raw.startsWith("/") ? raw : `/${raw}`;
  return `https://admin.awrabsuiteshotel.com.ng${rel}`;
}

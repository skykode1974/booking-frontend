// /services/roomsApi.js
import axios from "axios";
import dayjs from "dayjs";
import { normalizeRoom } from "../utils/normalize";

export async function fetchRoomsByType(roomTypeId, { signal } = {}) {
  let list = [];
  try {
    const a = await axios.get("/api/rooms-by-type", {
      params: { room_type_id: roomTypeId },
      signal,
    });
    list = Array.isArray(a.data?.data) ? a.data.data : Array.isArray(a.data) ? a.data : [];
  } catch {
    const b = await axios.get("/api/rooms", {
      params: { room_type_id: roomTypeId, all: 1 },
      signal,
    });
    list = Array.isArray(b.data?.data) ? b.data.data : Array.isArray(b.data) ? b.data : [];
  }
  return list.map(normalizeRoom);
}

export async function fetchAvailableRooms({ arrival, departure, roomTypeId, signal } = {}) {
  const res = await axios.get("/api/available-rooms", {
    params: {
      arrival: dayjs(arrival).format("YYYY-MM-DD"),
      departure: dayjs(departure).format("YYYY-MM-DD"),
      room_type_id: roomTypeId,
    },
    signal,
  });
  const arr = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
  return new Set(arr.map((r) => String(r.id ?? r.room_id ?? r.ID)));
}

export async function fetchOccupancyByRoom({ signal } = {}) {
  try {
    const res = await axios.get("/api/rooms-live-overview", { signal });
    const groups = res.data?.data || [];
    const byId = new Map();
    for (const g of groups) {
      for (const r of g.rooms || []) {
        const sec = Number(r.sec_to_departure);
        byId.set(String(r.room_id), {
          dep_iso: r.departure_iso || null,
          sec_left: Number.isFinite(sec) ? sec : null,
          status: r.status || null,
        });
      }
    }
    return byId;
  } catch (e) {
    if (e?.name !== "CanceledError") console.warn("fetchOccupancyByRoom failed:", e?.message || e);
    return new Map();
  }
}

export async function fetchUnavailableByRoom({ roomTypeId, from, to, businessId, signal } = {}) {
  try {
    const params = new URLSearchParams();
    if (roomTypeId) params.set("room_type_id", String(roomTypeId));
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (businessId) params.set("business_id", String(businessId));

    const res = await fetch(`/api/hms/unavailable/by-room?${params.toString()}`, {
      headers: { Accept: "application/json" },
      signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const map = new Map();
    const rows = Array.isArray(json?.data) ? json.data : [];
    rows.forEach((row) => {
      const id = String(row.room_id ?? row.hms_rooms_id ?? "").trim();
      if (!id) return;
      const item = { from: row.date_from ?? null, to: row.date_to ?? null, type: row.unavailable_type ?? "unavailable" };
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(item);
    });
    return map;
  } catch (e) {
    if (e?.name !== "AbortError") console.warn("fetchUnavailableByRoom failed:", e?.message || e);
    return new Map();
  }
}

export async function fetchOnlineHoldsByRoom({ roomTypeId, from, to, signal } = {}) {
  try {
    const params = new URLSearchParams();
    if (roomTypeId) params.set("room_type_id", String(roomTypeId));
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const res = await fetch(`/api/hms/online-holds/by-room?${params.toString()}`, {
      headers: { Accept: "application/json" },
      signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const ids = Array.isArray(json?.room_ids) ? json.room_ids : [];
    return new Set(ids.map((id) => String(id)));
  } catch (e) {
    if (e?.name !== "AbortError") console.warn("fetchOnlineHoldsByRoom failed:", e?.message || e);
    return new Set();
  }
}

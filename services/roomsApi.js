// /services/roomsApi.js
import axios from "axios";
import dayjs from "dayjs";
import { normalizeRoom } from "../utils/normalize";

export async function fetchRoomsByType(roomTypeId) {
  let list = [];
  try {
    const a = await axios.get("/api/rooms-by-type", { params: { room_type_id: roomTypeId } });
    list = Array.isArray(a.data?.data) ? a.data.data : Array.isArray(a.data) ? a.data : [];
  } catch {
    const b = await axios.get("/api/rooms", { params: { room_type_id: roomTypeId, all: 1 } });
    list = Array.isArray(b.data?.data) ? b.data.data : Array.isArray(b.data) ? b.data : [];
  }
  return list.map(normalizeRoom);
}

export async function fetchAvailableRooms({ arrival, departure, roomTypeId }) {
  const res = await axios.get("/api/available-rooms", {
    params: {
      arrival: dayjs(arrival).format("YYYY-MM-DD"),
      departure: dayjs(departure).format("YYYY-MM-DD"),
      room_type_id: roomTypeId,
    },
  });
  const arr = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
  return new Set(arr.map((r) => String(r.id ?? r.room_id ?? r.ID)));
}

// LIVE occupancy from backend modal API (roomsOverview)
// services/roomsApi.js
// LIVE occupancy from backend API
export async function fetchOccupancyByRoom() {
  try {
    const res = await axios.get("/api/rooms-live-overview"); // ✅ use the new endpoint
    const groups = res.data?.data || [];
    const byId = new Map(); // room_id -> { dep_iso, sec_left, status }

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
    console.warn("fetchOccupancyByRoom failed:", e?.message || e);
    return new Map(); // never throw; UI keeps working
  }
}

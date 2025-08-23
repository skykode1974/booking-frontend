'use client';
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import BookingModal from "./BookingModal";

const ADMIN_HOST = "https://admin.awrabsuiteshotel.com.ng";

const amenityMap = {
  "9": "WiFi",
  "10": "Air Conditioning",
  "11": "Flat Screen TV",
  "12": "Private Bathroom",
  "13": "Hot Water",
  "14": "Mini Fridge",
  "15": "Wardrobe",
  "16": "Towel",
  "17": "Balcony",
  "18": "Room Service"
};

function safeAmenityList(amenities) {
  if (!amenities) return [];
  try {
    const parsed = typeof amenities === "string" ? JSON.parse(amenities) : amenities;
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function mediaURL(raw) {
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const rel = raw.startsWith("/") ? raw : `/${raw}`;
  return `${ADMIN_HOST}${rel}`;
}

// Try common API shapes safely
function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.room_types)) return data.room_types;
  if (Array.isArray(data?.rooms)) return data.rooms;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function RoomTypeList() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [raw, setRaw] = useState(null);       // debug
  const [err, setErr] = useState("");         // debug
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await axios.get("/api/room-types", {
          headers: { Accept: "application/json" },
          timeout: 15000
        });
        if (!mounted) return;
        setRaw(data);
        const list = extractList(data);
        setRoomTypes(list);
        if (list.length === 0) {
          console.warn("Room types array is empty. API raw payload:", data);
        }
      } catch (e) {
        const msg = e?.response
          ? `HTTP ${e.response.status}`
          : (e?.message || "Network error");
        setErr(msg);
        console.error("Error fetching room types:", e);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const toggleCardDetails = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="opacity-70">Loading room types…</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="max-w-xl w-full p-4 rounded-lg border">
          <div className="font-semibold mb-2">Couldn’t load room types</div>
          <div className="text-sm mb-3">{err}</div>
          <details className="text-xs opacity-70">
            <summary>Raw debug</summary>
            <pre className="overflow-auto text-[11px]">
              {JSON.stringify(raw, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  // Show a small debug panel if list is empty
  const showEmptyDebug = roomTypes.length === 0;

  return (
    <div
      className="min-h-screen py-12 px-4 transition-all"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <h1 className="text-3xl font-bold text-center mb-10">Available Room Types</h1>

      {showEmptyDebug && (
        <div className="max-w-3xl mx-auto mb-6 p-4 border rounded-lg text-sm">
          No room types found.
          <details className="mt-2">
            <summary className="cursor-pointer text-blue-500">Debug payload</summary>
            <pre className="overflow-auto text-[11px]">
              {JSON.stringify(raw, null, 2)}
            </pre>
          </details>
          <div className="text-xs opacity-70 mt-2">
            Tip: Open <code>/api/room-types</code> in your browser. If it’s not JSON, fix <code>next.config.mjs</code> rewrite.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {roomTypes.map((room, index) => {
          const key = room.id ?? index;
          const imageSrc =
            room.media?.[0]?.url ||
            room.media?.[0]?.original_url ||
            room.image_url ||
            room.cover_url ||
            "";
          const title = room.type || room.type_name || room.name || "Room Type";
          const descHTML = room.description || "";
          const amenities = safeAmenityList(room.amenities);
          const price = room?.pricing?.default_price_per_night;

          return (
            <motion.div
              key={key}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Glow */}
              <div className="absolute -inset-1 rounded-2xl bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-500 via-purple-600 to-indigo-500 opacity-30 blur-md group-hover:opacity-70 transition-all duration-300 z-0"></div>

              {/* Card */}
              <div
                className="relative z-10 border rounded-2xl overflow-hidden shadow-xl transition-transform hover:scale-[1.02]"
                style={{
                  backgroundColor: "var(--foreground)",
                  color: "var(--background)",
                  borderColor: "var(--background)"
                }}
              >
                <div className="relative h-48 w-full bg-gray-700">
                  {imageSrc ? (
                    <img
                      src={mediaURL(imageSrc)}
                      alt="Room Type"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="text-xl font-semibold text-blue-500 mb-1">{title}</h2>

                  {!!descHTML && (
                    <div
                      className="text-sm mb-2 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: descHTML }}
                    />
                  )}

                  <ul className="text-sm mb-4 space-y-1">
                    <li>
                      <strong>Price:</strong>{" "}
                      {price != null
                        ? `₦${Number(price).toLocaleString("en-NG", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : "N/A"}
                    </li>
                    <li><strong>Max Adults:</strong> {room.no_of_adult ?? room.max_adult ?? "—"}</li>
                    <li><strong>Max Children:</strong> {room.no_of_child ?? room.max_child ?? "—"}</li>
                  </ul>

                  {amenities.length > 0 && (
                    <>
                      <button
                        onClick={() => toggleCardDetails(key)}
                        className="text-sm text-blue-400 underline hover:text-blue-300 mb-2"
                      >
                        {expandedCards[key] ? "Hide Amenities & Extras" : "Show Amenities & Extras"}
                      </button>

                      {expandedCards[key] && (
                        <div className="text-sm space-y-3">
                          <div>
                            <strong>Amenities:</strong>
                            <ul className="list-disc pl-5 mt-1">
                              {amenities.map((id, i) => (
                                <li key={i}>{amenityMap[String(id)] || `Amenity #${id}`}</li>
                              ))}
                            </ul>
                          </div>

                          {Array.isArray(room.extras) && room.extras.length > 0 && (
                            <div>
                              <strong>Extras:</strong>
                              <ul className="list-disc pl-5 mt-1">
                                {room.extras.map((extra) => (
                                  <li key={extra.id ?? `${extra.name}-${extra.price}`}>
                                    {extra.name} - ₦{Number(extra.price).toLocaleString()}
                                    {extra.price_per && (
                                      <span className="text-xs text-gray-500 ml-1">
                                        ({extra.price_per})
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => setSelectedRoomType(room)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md w-full transition"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {selectedRoomType && (
        <BookingModal
          roomType={selectedRoomType}
          onClose={() => setSelectedRoomType(null)}
        />
      )}
    </div>
  );
}

export default RoomTypeList;

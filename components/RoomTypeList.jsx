import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import BookingModal from "./BookingModal";

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

function RoomTypeList() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    axios
      .get("https://hotel.skykode.com.ng/api/room-types")
      .then((response) => {
        setRoomTypes(response.data);
      })
      .catch((error) => {
        console.error("Error fetching room types:", error);
      });
  }, []);

  const toggleCardDetails = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div
      className="min-h-screen py-12 px-4 transition-all"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <h1 className="text-3xl font-bold text-center mb-10">Available Room Types</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {roomTypes.map((room, index) => (
          <motion.div
            key={room.id}
            className="relative group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            {/* Gradient background */}
            <div className="absolute -inset-1 rounded-2xl bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-500 via-purple-600 to-indigo-500 opacity-30 blur-md group-hover:opacity-70 transition-all duration-300 z-0"></div>

            {/* Main card */}
            <div
              className="relative z-10 border rounded-2xl overflow-hidden shadow-xl transition-transform hover:scale-[1.02]"
              style={{
                backgroundColor: "var(--foreground)",
                color: "var(--background)",
                borderColor: "var(--background)"
              }}
            >
              <div className="relative h-48 w-full bg-gray-700">
                {room.media && room.media.length > 0 ? (
                  <img
                    src={room.media[0]?.url}
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
                <h2 className="text-xl font-semibold text-blue-500 mb-1">
                  {room.type}
                </h2>

                <div
                  className="text-sm mb-2 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: room.description }}
                ></div>

                <ul className="text-sm mb-4 space-y-1">
                  <li><strong>Price:</strong> ₦
                    {room?.pricing?.default_price_per_night
                      ? Number(room.pricing.default_price_per_night).toLocaleString("en-NG", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "N/A"}
                  </li>
                  <li><strong>Max Adults:</strong> {room.no_of_adult}</li>
                  <li><strong>Max Children:</strong> {room.no_of_child}</li>
                </ul>

                {/* Toggle Amenities */}
                <button
                  onClick={() => toggleCardDetails(room.id)}
                  className="text-sm text-blue-400 underline hover:text-blue-300 mb-2"
                >
                  {expandedCards[room.id]
                    ? "Hide Amenities & Extras"
                    : "Show Amenities & Extras"}
                </button>

                {/* Amenities & Extras */}
                {expandedCards[room.id] && (
                  <div className="text-sm space-y-3">
                    {/* Amenities */}
                    {room.amenities && (
                      <div>
                        <strong>Amenities:</strong>
                        <ul className="list-disc pl-5 mt-1">
                          {JSON.parse(room.amenities).map((id, i) => (
                            <li key={i}>{amenityMap[id] || `Amenity #${id}`}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Extras */}
                    {room.extras && room.extras.length > 0 && (
                      <div>
                        <strong>Extras:</strong>
                        <ul className="list-disc pl-5 mt-1">
                          {room.extras.map((extra) => (
                            <li key={extra.id}>
                              {extra.name} - ₦{Number(extra.price).toLocaleString()}
                              <span className="text-xs text-gray-500 ml-1">
                                ({extra.price_per})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
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
        ))}
      </div>

      {/* Booking Modal */}
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

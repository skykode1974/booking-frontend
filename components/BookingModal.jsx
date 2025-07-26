
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";

function BookingModal({ roomType, onClose }) {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    arrival_date: "",
    departure_date: "",
    total_amount: "",
    captured_image: "",
  });

  useEffect(() => {
    if (form.arrival_date && form.departure_date) {
      (async () => {
        try {
          const res = await axios.get("https://hotel.skykode.com.ng/api/available-rooms", {
            params: {
              arrival: form.arrival_date,
              departure: form.departure_date,
              room_type_id: roomType.id,
            },
          });
          setAvailableRooms(res.data);
          setSelectedRooms([]);
        } catch (err) {
          console.error("Room fetch error:", err);
        }
      })();
    }
  }, [form.arrival_date, form.departure_date]);

  useEffect(() => {
    if (form.arrival_date && form.departure_date && selectedRooms.length > 0) {
      const nights = dayjs(form.departure_date).diff(dayjs(form.arrival_date), "day");
      const price = roomType?.pricing?.default_price_per_night || 0;
      const total = nights * price * selectedRooms.length;
      setForm((prev) => ({ ...prev, total_amount: total }));
    }
  }, [form.arrival_date, form.departure_date, selectedRooms]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRoomSelect = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value);
    }
    setSelectedRooms(selected);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.full_name || !form.phone || !form.arrival_date || !form.departure_date || selectedRooms.length === 0) {
    toast.error("🚫 Please fill all required fields.");
    return;
  }

  const bookingPayload = {
    ...form,
    room_id: selectedRooms[0] || null,
    room_ids: selectedRooms,
    booking_date: new Date().toISOString().slice(0, 10),
    captured_image: form.captured_image || "",
    payment_status: "unpaid",
    amount_paid: 0,
    status: "pending",
    payment_ref: "",
  };

  setLoading(true);

  // Save to localStorage and redirect to pay page
  setTimeout(() => {
    localStorage.setItem("bookingData", JSON.stringify(bookingPayload));
    setLoading(false);
    window.location.href = "/pay";
  }, 1500);
};


  const captureImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "user";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setForm({ ...form, captured_image: reader.result });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const Checkmark = () => (
    <motion.svg
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="w-16 h-16 text-green-500 mx-auto mt-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <motion.path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1 }}
      />
    </motion.svg>
  );

  return (
    <AnimatePresence>
      <motion.div
        key="modal"
        initial={{ opacity: 0, y: "-10%" }}
        animate={{ opacity: 1, y: "0%" }}
        exit={{ opacity: 0, y: "-10%" }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto bg-gradient-to-br from-blue-900 via-slate-900 to-purple-900 bg-opacity-70 backdrop-blur-md"
      >
        <div className="relative w-full max-w-md bg-slate-900 text-white rounded-2xl border border-slate-700 shadow-2xl overflow-hidden mt-10 mb-10">
          <div className="absolute inset-x-0 top-0">
            <svg className="w-full h-16" viewBox="0 0 1440 120" fill="none">
              <path fill="#3B82F6" fillOpacity="0.3" d="M0,80 C360,120 1080,0 1440,60 L1440,0 L0,0 Z" />
              <path fill="#60A5FA" fillOpacity="0.4" d="M0,100 C300,40 1140,140 1440,100 L1440,0 L0,0 Z" />
            </svg>
          </div>

          {success ? (
            <div className="p-6 text-center relative z-10">
              <Checkmark />
              <h2 className="text-xl font-bold text-green-400 mt-3">🎉 Booking Successful!</h2>
              <p className="text-gray-300 mt-2">Thank you for booking. We’ll reach out shortly via WhatsApp.</p>
              <button onClick={onClose} className="mt-4 px-5 py-2 bg-slate-700 rounded hover:bg-slate-600 text-white">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative z-10 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              <h2 className="text-lg font-bold text-center text-blue-300">Book Room - {roomType.type}</h2>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" name="arrival_date" onChange={handleChange} required className="input" />
                <input type="date" name="departure_date" onChange={handleChange} required className="input" />
              </div>
              <select multiple value={selectedRooms} onChange={handleRoomSelect} required className="input h-28">
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>Room #{room.room_number}</option>
                ))}
              </select>
              <input name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange} className="input" required />
              <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="input" required />
              <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="input" />
              {!form.captured_image && (
                <button type="button" onClick={captureImage} className="btn-purple">📷 Capture Face (Optional)</button>
              )}
              {form.captured_image && (
                <div>
                  <img src={form.captured_image} alt="Captured" className="w-20 h-20 rounded border mt-2" />
                  <button onClick={() => setForm({ ...form, captured_image: "" })} className="text-red-400 text-xs">
                    Remove
                  </button>
                </div>
              )}
              <input value={form.total_amount} readOnly className="bg-black border border-green-600 p-2 w-full rounded text-green-400 text-center font-bold" />
              {loading && <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse rounded"></div>}
              <div className="flex justify-between mt-3">
                <button type="button" onClick={onClose} className="btn-slate">Cancel</button>
                <button type="submit" disabled={loading} className="btn-blue">
                  {loading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          )}
        </div>
        <ToastContainer position="top-right" theme="dark" autoClose={3000} />
      </motion.div>
    </AnimatePresence>
  );
}

export default BookingModal;

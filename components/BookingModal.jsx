import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BottomWave from "@/components/BottomWave"; // Adjust path if needed

function BookingModal({ roomType, onClose }) {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [arrival, setArrival] = useState(null);
  const [departure, setDeparture] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    arrival_date: "",
    departure_date: "",
    total_amount: "",
    captured_image: "",
  });

  const nights =
    form.arrival_date && form.departure_date
      ? dayjs(form.departure_date).diff(dayjs(form.arrival_date), "day")
      : 0;

  const price = roomType?.pricing?.default_price_per_night || 0;

  useEffect(() => {
    if (form.arrival_date && form.departure_date) {
      (async () => {
        try {
          const res = await axios.get("https://admin.awrabsuiteshotel.com.ng/api/available-rooms", {
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
      const total = nights * price * selectedRooms.length;
      setForm((prev) => ({ ...prev, total_amount: total }));
    }
  }, [form.arrival_date, form.departure_date, selectedRooms]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
        <div className="relative w-full max-w-md bg-slate-900 text-white rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

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
           <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto z-10 p-6 space-y-4">

             <h2 className="text-lg font-bold text-center text-blue-300">Book Room - {roomType.type}</h2>

<div className="grid grid-cols-1 gap-4">
  <div>
    <label className="block text-sm text-white mb-1">Arrival Date</label>
    <DatePicker
      selected={arrival}
      onChange={(date) => {
        setArrival(date);
        setForm({ ...form, arrival_date: dayjs(date).format("YYYY-MM-DD") });
      }}
      placeholderText="📅 Select arrival date"
      className="bg-slate-800 text-white px-3 py-2 rounded border border-blue-400 w-full placeholder:text-slate-300"
      calendarClassName="custom-datepicker"
      dateFormat="yyyy-MM-dd"
      minDate={new Date()}
    />
  </div>

  <div>
    <label className="block text-sm text-white mb-1">Departure Date</label>
    <DatePicker
      selected={departure}
      onChange={(date) => {
        setDeparture(date);
        setForm({ ...form, departure_date: dayjs(date).format("YYYY-MM-DD") });
      }}
      placeholderText="📅 Select departure date"
      className="bg-slate-800 text-white px-3 py-2 rounded border border-blue-400 w-full placeholder:text-slate-300"
      calendarClassName="custom-datepicker"
      dateFormat="yyyy-MM-dd"
      minDate={arrival || new Date()}
    />
  </div>
</div>


              <div className="flex flex-col mt-2">
                <label className="text-sm text-white mb-1">Select Available Room(s)</label>
               


<div className="flex flex-wrap gap-3">
  {availableRooms.length === 0 && (
    <p className="text-gray-300">Loading available rooms...</p>
  )}

  {availableRooms.map((room) => {
    const isSelected = selectedRooms.includes(String(room.id));
    return (
      <div
        key={room.id}
        onClick={() => {
          setSelectedRooms((prev) =>
            isSelected
              ? prev.filter((id) => id !== String(room.id))
              : [...prev, String(room.id)]
          );
        }}
        className={`cursor-pointer w-[48%] p-4 rounded-xl border-2 transition duration-200
          ${
            isSelected
              ? "bg-gradient-to-r from-blue-600 to-blue-800 border-blue-400 shadow-md"
              : "bg-slate-800 border-slate-600 hover:border-blue-400 hover:bg-slate-700"
          }`}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🛏️</span>
          <div>
            <h4 className="font-semibold text-white">Room #{room.room_number}</h4>
            <p className="text-sm text-gray-400">Floor: {room.floor || "N/A"}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2">
          <p className="text-sm font-bold text-green-400">
            ₦{Number(price).toLocaleString()}
          </p>
          <input
            type="checkbox"
            readOnly
            checked={isSelected}
            className="accent-blue-500 w-4 h-4"
          />
        </div>
      </div>
    );
  })}
</div>




              </div>

              <input
                name="full_name"
                placeholder="Full Name"
                value={form.full_name}
                onChange={handleChange}
                className="input"
                required
              />
              <input
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
                className="input"
                required
              />
              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="input"
              />

              {!form.captured_image && (
                <button type="button" onClick={captureImage} className="btn-purple">
                  📷 Capture Face (Optional)
                </button>
              )}
              {form.captured_image && (
                <div>
                  <img src={form.captured_image} alt="Captured" className="w-20 h-20 rounded border mt-2" />
                  <button onClick={() => setForm({ ...form, captured_image: "" })} className="text-red-400 text-xs">
                    Remove
                  </button>
                </div>
              )}

              <div className="bg-white text-black rounded border border-green-600 p-4 mt-2 space-y-2 text-sm text-center font-semibold">
                <p>
                  🛏 <span className="text-blue-600">{selectedRooms.length}</span> room(s) ×{" "}
                  <span className="text-blue-600">{nights}</span> night(s)
                </p>
                <p>
                  💵 Per night per room: ₦<span className="text-blue-600">{Number(price).toLocaleString()}</span>
                </p>
                <hr className="my-1 border-green-500" />
                <p className="text-lg text-green-700 font-bold">
                  💰 Total: ₦{Number(form.total_amount || 0).toLocaleString()}
                </p>
              </div>

              {loading && (
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse rounded"></div>
              )}
              <div className="flex justify-between mt-3">
                <button type="button" onClick={onClose} className="btn-slate">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-blue">
                  {loading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          )}
          <ToastContainer position="top-right" theme="dark" autoClose={3000} />
        </div>
      </motion.div>


{/* 👇 Bottom Wave & Footer */}
<div className="z-0">
  <BottomWave />
  <div className="text-center text-xs text-slate-400 pb-3 -mt-6">Designed by Skykode</div>
</div>


    </AnimatePresence>
  );
}

export default BookingModal;
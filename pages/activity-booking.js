import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_dark.css"; // You can use other themes too
import { useState, useEffect } from "react";

export default function ActivityBookingPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    booking_date: "",
    activities: [],
    gym_duration: "",
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [activityOptions, setActivityOptions] = useState([]);

  const getDayKey = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-US", {
      weekday: "short",
    }).toLowerCase();
  };

  useEffect(() => {
    if (!form.booking_date) {
      setActivityOptions([]);
      return;
    }

    fetch(`https://hotel.skykode.com.ng/api/hms/activities/${form.booking_date}`)
      .then((res) => res.json())
      .then((data) => {
        const dayKey = getDayKey(form.booking_date);

        const filtered = data.filter((act) => {
          const activityDay = (act.day || "").toLowerCase();
          const customDays = (act.custom_days || "")
            .toLowerCase()
            .split(",")
            .map((d) => d.trim());

          if (activityDay === "everyday") return true;
          if (activityDay === "custom") return customDays.includes(dayKey);
          return activityDay.startsWith(dayKey);
        });

        setActivityOptions(filtered);
      })
      .catch((err) => {
        console.error("Failed to load activities", err);
        alert("Could not load activity list.");
      });
  }, [form.booking_date]);

  const isGym = (activityName) => activityName.toLowerCase() === "gym";
  const isGymSelected = form.activities.some((a) => isGym(a.activity_type));

const handleCheckbox = (activity) => {
  const isGym = activity.name.toLowerCase() === "gym";
  const isAlreadySelected = form.activities.find((a) => a.activity_id === activity.id);

  // If Gym is selected now
  if (isGym && !isAlreadySelected) {
    setForm({
      ...form,
      activities: [{
        activity_id: activity.id,
        activity_type: activity.name,
        price: parseFloat(activity.price)
      }],
      gym_duration: "daily",
    });
    return;
  }

  // If Gym is being unselected
  if (isGym && isAlreadySelected) {
    setForm({
      ...form,
      activities: [],
      gym_duration: "",
    });
    return;
  }

  // If another activity is being selected while Gym is selected — BLOCK IT
  if (!isGym && form.activities.some((a) => a.activity_type.toLowerCase() === "gym")) {
    alert("❌ Gym must be booked alone.");
    return;
  }

  // Regular toggle
  let updated;
  if (isAlreadySelected) {
    updated = form.activities.filter((a) => a.activity_id !== activity.id);
  } else {
    updated = [
      ...form.activities,
      {
        activity_id: activity.id,
        activity_type: activity.name,
        price: parseFloat(activity.price)
      }
    ];
  }

  setForm({ ...form, activities: updated });
};

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getGymDates = () => {
    const startDate = form.booking_date;
    const duration = form.gym_duration || "daily";
    let end = new Date(startDate);
    if (duration === "weekly") end.setDate(end.getDate() + 6);
    else if (duration === "monthly") end.setDate(end.getDate() + 29);
    const endDate = end.toISOString().split("T")[0];
    return { start_date: startDate, end_date: endDate };
  };

  const totalAmount = form.activities.reduce((sum, a) => {
    if (isGym(a.activity_type)) {
      const duration = form.gym_duration || "daily";
      const multiplier = duration === "weekly" ? 7 : duration === "monthly" ? 30 : 1;
      return sum + a.price * multiplier;
    }
    return sum + a.price;
  }, 0);

  const handleSubmit = async () => {
    if (!form.full_name || !form.email || !form.phone || !form.booking_date || form.activities.length === 0) {
      alert("Please fill all fields and select at least one activity.");
      return;
    }

    const gymDates = isGymSelected ? getGymDates() : { start_date: null, end_date: null };

    try {
      const res = await fetch("https://hotel.skykode.com.ng/api/book-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          gym_duration: isGymSelected ? form.gym_duration : "",
          start_date: gymDates.start_date,
          end_date: gymDates.end_date,
        }),
      });

      const data = await res.json();

      if (data.booking_id && data.payment_ref) {
        localStorage.setItem("latest_booking", JSON.stringify(form));

        const handler = window.PaystackPop.setup({
          key: "pk_test_xxxxxxxxxxxxxx",
          email: form.email,
          amount: totalAmount * 100,
          ref: data.payment_ref,
          metadata: {
            booking_id: data.booking_id,
            phone: form.phone,
          },
          callback: function () {
            window.location.href = "/thank-you";
          },
          onClose: function () {
            alert("Transaction was not completed.");
          },
        });

        handler.openIframe();
      } else {
        alert("Booking failed.");
      }
    } catch (err) {
      alert("Something went wrong.");
      console.error(err);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-12">
      <div className="max-w-2xl mx-auto bg-white/10 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">🎫 Activity Booking</h2>

        {/* Personal Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleInput}
            placeholder="Full Name"
            className="bg-white/10 p-2 rounded border border-gray-300 text-white placeholder-gray-400"
          />
          <input
            name="email"
            value={form.email}
            onChange={handleInput}
            placeholder="Email"
            className="bg-white/10 p-2 rounded border border-gray-300 text-white placeholder-gray-400"
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleInput}
            placeholder="Phone"
            className="bg-white/10 p-2 rounded border border-gray-300 text-white placeholder-gray-400"
          />
        <Flatpickr
  options={{
    dateFormat: "Y-m-d",
    minDate: "today"
  }}
  value={form.booking_date}
  onChange={([date]) =>
    setForm({ ...form, booking_date: date.toISOString().split("T")[0] })
  }
  className="bg-white/10 p-2 rounded border border-gray-300 text-white w-full"
/>

        </div>

        {/* Activities */}
        <div className="mt-6">
          <p className="font-semibold mb-2">Select Activities:</p>

          {activityOptions.length === 0 && form.booking_date && (
            <p className="text-red-400 font-semibold">
              No activities available for this date.
            </p>
          )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
  {activityOptions.map((item) => {
    const isSelected = form.activities.some((a) => a.activity_type === item.name);

    const icons = {
      Pool: "🏊",
      Cinema: "🎬",
      Gym: "🏋️‍♂️",
      "Ladies Night": "💃",
    };

    return (
      <div
        key={item.id}
        onClick={() => handleCheckbox(item)}
        className={`cursor-pointer border rounded-lg p-4 flex items-center space-x-3 transition-all duration-200
          ${isSelected ? "bg-blue-600 text-white border-blue-700" : "bg-white/10 text-white border-gray-400 hover:border-blue-400"}`}
      >
        <span className="text-2xl">{icons[item.name] || "🎫"}</span>
        <div className="flex-1">
          <p className="font-bold">{item.label || item.name}</p>
          <p className="text-sm">₦{parseFloat(item.price).toLocaleString()}</p>
        </div>
        <div className={`w-5 h-5 flex items-center justify-center border-2 rounded transition-all duration-200
  ${isSelected ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
  {isSelected && (
    <svg
      className="w-4 h-4 text-white animate-bounce"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )}
</div>

      </div>
    );
  })}
</div>

        </div>

      

        {/* Total + Duration Info */}
        <div className="mt-6">
 <div className="hidden sm:block">
          <p className="mb-1">
            Total:{" "}
            <span className="font-bold text-green-400">
         
              ₦{totalAmount.toLocaleString()}
            </span>
       
          </p>  </div>

{form.activities.some((a) => a.activity_type.toLowerCase().includes("gym")) && (
  <p className="text-sm text-gray-300 italic mt-1">
    Gym Duration: <strong>{form.gym_duration}</strong>{" "}
    ({form.gym_duration === "weekly"
      ? "7 days"
      : form.gym_duration === "monthly"
      ? "30 days"
      : "1 day"})
  </p>
)}


 {form.activities.some((a) => a.activity_type.toLowerCase().includes("gym")) && (
  <div className="mt-4">
    <label className="block mb-1 font-semibold">Gym Booking Duration:</label>
    <div className="flex gap-4">
      {["daily", "weekly", "monthly"].map((duration) => (
        <label
          key={duration}
          className={`flex items-center space-x-2 px-3 py-1 border rounded cursor-pointer ${
            form.gym_duration === duration
              ? "bg-blue-600 border-blue-700 text-white"
              : "bg-white/10 border-gray-300 text-white"
          }`}
          onClick={() => setForm({ ...form, gym_duration: duration })}
        >
          <input
            type="checkbox"
            readOnly
            checked={form.gym_duration === duration}
          />
          <span className="capitalize">Per {duration}</span>
        </label>
      ))}
    </div>
  </div>
)}

     {/* Main Book & Pay Button - visible on all screen sizes */}
<button
  onClick={() => setShowConfirm(true)}
  className="mt-4 px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 transition text-white w-full"
>
  Book & Pay Now
</button>
</div>
</div>

{/* Mobile Floating Summary (shows only on small screens) */}
{form.booking_date && form.activities.length > 0 && (
  <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg sm:hidden">
    <div>
      <p className="text-sm">
        <span className="font-bold">Total:</span> ₦{totalAmount.toLocaleString()}
      </p>
      {form.activities.some((a) =>
        a.activity_type.toLowerCase().includes("gym")
      ) && (
        <p className="text-xs italic text-gray-300">
          Gym: {form.gym_duration} (
          {form.gym_duration === "weekly"
            ? "7 days"
            : form.gym_duration === "monthly"
            ? "30 days"
            : "1 day"}
          )
        </p>
      )}
    </div>
    <button
      onClick={() => setShowConfirm(true)}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold"
    >
      Book & Pay
    </button>
  </div>
)}

{/* Confirmation Popup - shows on all screen sizes */}
{showConfirm && (
  <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center px-4">
    <div className="bg-white text-gray-900 rounded-lg shadow-lg max-w-md w-full p-6">
      <h3 className="text-xl font-bold mb-4 text-center">📋 Confirm Your Booking</h3>

      <p><strong>Name:</strong> {form.full_name}</p>
      <p><strong>Email:</strong> {form.email}</p>
      <p><strong>Phone:</strong> {form.phone}</p>
      <p><strong>Date:</strong> {form.booking_date}</p>

      <div className="mt-3">
        <strong>Activities:</strong>
        <ul className="list-disc list-inside text-sm">
          {form.activities.map((a, i) => (
            <li key={i}>{a.activity_type} - ₦{a.price.toLocaleString()}</li>
          ))}
        </ul>
      </div>

      {form.activities.some((a) =>
        a.activity_type.toLowerCase().includes("gym")
      ) && (
        <p className="mt-2 text-sm italic text-center">
          🏋️ Gym Duration: <strong>{form.gym_duration}</strong> (
          {form.gym_duration === "weekly"
            ? "7 days"
            : form.gym_duration === "monthly"
            ? "30 days"
            : "1 day"}
          )
        </p>
      )}

      <p className="mt-3 text-center">
        <strong>Total:</strong> ₦{totalAmount.toLocaleString()}
      </p>

      <div className="mt-4 flex justify-between gap-4">
        <button
          onClick={() => setShowConfirm(false)}
          className="px-4 py-2 bg-gray-300 text-gray-900 rounded w-1/2"
        >
          ❌ Cancel
        </button>
      <button
  onClick={() => {
    if (!form.full_name || !form.phone || form.activities.length === 0) {
      alert("Please complete all required fields and select at least one activity.");
      return;
    }

    const isGymSelected = form.activities.some((a) => a.activity_type.toLowerCase() === "gym");
    const otherActivitiesSelected = form.activities.some((a) => a.activity_type.toLowerCase() !== "gym");

    if (isGymSelected && otherActivitiesSelected) {
      alert("❌ Gym booking must be done alone. Please unselect other activities.");
      return;
    }

    if (isGymSelected && !form.gym_duration) {
      alert("Please select Gym duration (daily, weekly, or monthly).");
      return;
    }

    localStorage.setItem("bookingData", JSON.stringify(form));
    window.location.href = "/pay-activity";
  }}

          className="px-4 py-2 bg-blue-600 text-white rounded w-1/2"
        >
          ✅ Confirm & Pay
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
}    
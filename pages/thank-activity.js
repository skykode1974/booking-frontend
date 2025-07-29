import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

function FullScreenLoader({ message = "Please wait..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-slate-800 text-white">
      <div className="loader animate-spin rounded-full h-14 w-14 border-t-4 border-blue-400 border-opacity-50 mb-4"></div>
      <p className="text-lg font-semibold text-center px-4">{message}</p>
      <style jsx>{`
        .loader {
          border: 4px solid rgba(255, 255, 255, 0.2);
          border-left-color: #00c6ff;
        }
      `}</style>
    </div>
  );
}

export default function ThankActivityPage() {
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    const storedBooking = localStorage.getItem("latest_booking");
    if (storedBooking) {
      setBooking(JSON.parse(storedBooking));
    }
    setIsLoading(false);
  }, []);

  const handlePrint = () => window.print();

  if (isLoading) {
    return (
      <FullScreenLoader message="✅ Booking confirmed. Redirecting to your receipt... Please do not refresh or close this page." />
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="bg-gray-100 p-6 rounded-lg shadow">
          <p className="text-red-600">⚠️ No booking found.</p>
          <Link href="/" className="text-blue-600 hover:underline block mt-4">
            ← Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-white text-black py-10 px-4 md:px-20 print:bg-white font-sans animate-fade-in">
      <div
        ref={printRef}
        className="max-w-3xl mx-auto bg-white rounded-xl p-6 shadow-2xl border border-blue-100 print:shadow-none print:border-none print:p-0"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-3xl print:hidden">
            ✔
          </div>
          <h2 className="text-3xl font-extrabold text-blue-800 print:text-black">
            Awrab Suite Hotels
          </h2>
          <hr className="mt-2 border-blue-200 print:border-black" />
        </div>

        <h1 className="text-2xl font-bold mb-4 text-blue-700 print:text-black text-center">
          ✅ Thank You for Your Booking!
        </h1>

        <p className="mb-3 text-gray-700 print:text-black text-center">
          Dear <strong>{booking.full_name}</strong>, your activity booking has been successfully confirmed and paid.
        </p>

        {booking.email && (
          <p className="mb-6 text-sm text-blue-800 bg-blue-100 border border-blue-200 p-3 rounded text-center print:bg-transparent print:border-none print:text-black">
            📩 A confirmation email has been sent to <strong>{booking.email}</strong>.
          </p>
        )}

        {/* Activity Booking View */}
        <div className="text-center mt-6">
          <p className="mb-1 text-gray-800 print:text-black">
            <strong>Date:</strong> {booking.booking_date}
          </p>

          <p className="font-semibold mb-2">Activities Booked:</p>
          <ul className="list-disc list-inside mb-4 text-left max-w-sm mx-auto print:text-black">
            {booking.activities?.map((a, i) => (
              <li key={i} className="capitalize">
                {a.activity_type} – ₦{a.price.toLocaleString()}
              </li>
            ))}
          </ul>

          {/* Gym Duration Summary */}
          {booking.activities?.some((a) =>
            a.activity_type.toLowerCase().includes("gym")
          ) && (
            <p className="italic text-sm mt-2">
              🏋️ Gym Duration: <strong>{booking.gym_duration}</strong>{" "}
              ({booking.gym_duration === "weekly"
                ? "7 days"
                : booking.gym_duration === "monthly"
                ? "30 days"
                : "1 day"})
            </p>
          )}

          <p className="text-green-700 font-bold mt-2">
            💰 Total Paid: ₦
            {booking.activities
              ?.reduce((sum, a) => sum + parseInt(a.price || 0), 0)
              .toLocaleString()}
          </p>
        </div>

        <div className="space-y-2 text-gray-800 print:text-black text-center mt-4">
          <p>
            <strong>🔖 Booking Reference:</strong> {booking.payment_ref || "N/A"}
          </p>
          <p>
            <strong>📞 Phone:</strong> {booking.phone}
          </p>
        </div>

        <div className="mt-8 flex gap-4 justify-center print:hidden">
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
          >
            ← Go to Homepage
          </Link>
          <button
            onClick={handlePrint}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition"
          >
            🖨️ Print Receipt
          </button>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 1s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Link from 'next/link'

export default function ThankYouPage() {
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
      <div className="flex items-center justify-center h-screen bg-white">
        <p className="text-gray-600 text-lg">Loading booking details...</p>
      </div>
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
      <div ref={printRef} className="max-w-3xl mx-auto bg-white rounded-xl p-6 shadow-2xl border border-blue-100 print:shadow-none print:border-none print:p-0">
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
          Dear <strong>{booking.full_name}</strong>, your booking has been successfully confirmed and paid.
        </p>

        {booking.email && (
          <p className="mb-6 text-sm text-blue-800 bg-blue-100 border border-blue-200 p-3 rounded text-center print:bg-transparent print:border-none print:text-black">
            📩 A confirmation email has been sent to <strong>{booking.email}</strong>.
          </p>
        )}

        <div className="overflow-x-auto mb-6">
          <table className="w-full border border-blue-200 text-sm md:text-base rounded overflow-hidden print:text-sm">
            <thead className="bg-blue-500 text-white print:bg-gray-300 print:text-black">
              <tr>
                <th className="border border-blue-300 px-3 py-2">Room No</th>
                <th className="border border-blue-300 px-3 py-2">Room Type</th>
                <th className="border border-blue-300 px-3 py-2">Arrival</th>
                <th className="border border-blue-300 px-3 py-2">Departure</th>
                <th className="border border-blue-300 px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {booking.bookings?.map((item, index) => (
                <tr key={index} className="bg-white hover:bg-blue-50 print:hover:bg-white">
                  <td className="border border-blue-200 px-3 py-2">{item.room_number}</td>
                  <td className="border border-blue-200 px-3 py-2">{item.room_type}</td>
                  <td className="border border-blue-200 px-3 py-2">{booking.arrival_date}</td>
                  <td className="border border-blue-200 px-3 py-2">{booking.departure_date}</td>
                  <td className="border border-blue-200 px-3 py-2 capitalize">{item.status || "Confirmed"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2 text-gray-800 print:text-black text-center">
          <p className="text-green-700 font-semibold text-lg">
            💰 Total Paid: ₦{Number(booking.amount_paid || 0).toLocaleString()}
          </p>
          <p>
            <strong>🔖 Booking Reference:</strong> {booking.payment_ref}
          </p>
          <p>
            <strong>📞 Phone:</strong> {booking.phone}
          </p>
        </div>

        <div className="mt-8 flex gap-4 justify-center print:hidden">
        <Link href="/"
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

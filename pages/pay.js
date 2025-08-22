import React, { useEffect, useState } from "react";

export default function PayPage() {
  const [statusMessage, setStatusMessage] = useState("🔄 Preparing your booking...");

  useEffect(() => {
    const bookingData = JSON.parse(localStorage.getItem("bookingData"));
    if (!bookingData) {
      alert("❌ No booking data found. Please start your booking again.");
      window.location.href = "/";
      return;
    }

    const amountKobo = parseInt(bookingData.total_amount || 0) * 100;

    const launchPaystack = () => {
      setStatusMessage("🔐 Initializing secure Paystack session...");

      if (!window.PaystackPop) {
        alert("❌ Paystack library not loaded.");
        return;
      }

      const handler = window.PaystackPop.setup({
        key: "pk_test_8b7fd2e87008b6c7ebefa03efe35476f73e9bde0",
        email: bookingData.email || "guest@example.com",
        amount: amountKobo,
        currency: "NGN",
        ref: `AWRAB-${Date.now()}`,

        callback: function (response) {
          setStatusMessage("✅ Payment successful. Saving booking...");

          fetch("https://admin.awrabsuiteshotel.com.ng/api/book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...bookingData,
              amount_paid: amountKobo / 100,
              payment_ref: response.reference,
              payment_status: "paid",
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.status === "success") {
                const completeBooking = {
                  ...bookingData,
                  amount_paid: amountKobo / 100,
                  payment_ref: response.reference,
                  bookings: data.bookings || [],
                };

                localStorage.setItem("latest_booking", JSON.stringify(completeBooking));
                localStorage.removeItem("bookingData");

                const message = encodeURIComponent(
                  `✅ Booking Confirmed!\nName: ${bookingData.full_name}\nPhone: ${bookingData.phone}\nReference: ${response.reference}\nArrival: ${bookingData.arrival_date}\nDeparture: ${bookingData.departure_date}`
                );

                setTimeout(() => {
                  window.location.href = "/thank-you";
                  window.open(`https://wa.me/2348167332529?text=${message}`, "_blank");
                }, 500);
              } else {
                alert("⚠️ Payment received, but booking failed. Contact support.");
              }
            })
            .catch(() => {
              alert("❌ Payment succeeded, but server error occurred.");
            });
        },

        onClose: function () {
          alert("⚠️ Payment window closed.");
          window.location.href = "/";
        },
      });

      setStatusMessage("✅ Payment gateway launching...");
      setTimeout(() => handler.openIframe(), 1000); // slight delay to let user read the message
    };

    setTimeout(launchPaystack, 1500); // Give user time to read initial status
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white text-center px-4">
      <div>
        <div className="animate-spin h-10 w-10 mx-auto mb-4 border-t-4 border-blue-300 rounded-full"></div>
        <p className="text-lg font-semibold">{statusMessage}</p>
        <p className="text-sm mt-2 text-blue-200">Please do not refresh or close this page</p>
      </div>
    </div>
  );
}

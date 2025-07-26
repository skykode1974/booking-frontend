import React, { useEffect } from "react";

function PayPage() {
  useEffect(() => {
    const bookingData = JSON.parse(localStorage.getItem("bookingData"));
    if (!bookingData) {
      alert("No booking data found. Please start booking again.");
      window.location.href = "/";
      return;
    }

    const amountKobo = parseInt(bookingData.total_amount || 0) * 100;

    if (!window.PaystackPop) {
      alert("Paystack not loaded.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: "pk_test_8b7fd2e87008b6c7ebefa03efe35476f73e9bde0",
      email: bookingData.email || "guest@example.com",
      amount: amountKobo,
      currency: "NGN",
      ref: `AWRAB-${Date.now()}`,

      callback: function (response) {
        console.log("✅ PAYMENT SUCCESS", response);

        fetch("https://hotel.skykode.com.ng/api/book", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: bookingData.full_name,
            phone: bookingData.phone,
            email: bookingData.email,
            arrival_date: bookingData.arrival_date,
            departure_date: bookingData.departure_date,
            room_ids: bookingData.room_ids,
            captured_image: bookingData.captured_image,
            total_amount: bookingData.total_amount,
            amount_paid: amountKobo / 100,
            payment_ref: response.reference,
            payment_status: "paid",
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status === "success") {
              const completeBooking = {
                full_name: bookingData.full_name,
                phone: bookingData.phone,
                email: bookingData.email,
                arrival_date: bookingData.arrival_date,
                departure_date: bookingData.departure_date,
                total_amount: bookingData.total_amount,
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
                window.open(`https://wa.me/2348I67332529?text=${message}`, "_blank");
              }, 500);
            } else {
              alert("Payment was received but booking submission failed. Contact support.");
              console.error("Booking API Error:", data);
            }
          })
          .catch((error) => {
            alert("❌ Booking submission failed. Please contact support.");
            console.error(error);
          });
      },

      onClose: function () {
        alert("❌ Payment window closed.");
        window.location.href = "/";
      },
    });

    handler.openIframe();
  }, []);

  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-h-screen tw-bg-gray-100">
      <div className="tw-text-center tw-bg-white tw-p-8 tw-rounded tw-shadow">
        <h2 className="tw-text-lg tw-font-semibold">
          Initializing secure payment via Paystack...
        </h2>
      </div>
    </div>
  );
}

export default PayPage;

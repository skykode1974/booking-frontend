import React from "react";
import { useRouter } from "next/router";
import { FiCheckCircle } from "react-icons/fi";

function getSavedRef() {
  try {
    const latest = localStorage.getItem("latest_booking");
    if (latest) {
      const b = JSON.parse(latest);
      if (b?.payment_ref) return String(b.payment_ref);
    }
  } catch {}
  try {
    const raw = localStorage.getItem("bookingData");
    if (raw) {
      const b = JSON.parse(raw);
      if (b?.payment_ref) return String(b.payment_ref);
    }
  } catch {}
  return null;
}

export default function FloatingReceiptButton() {
  const router = useRouter();

  const handleClick = () => {
    const ref = getSavedRef();
    if (ref) {
      router.push(`/receipt/${encodeURIComponent(ref)}`);
    } else {
      router.push(`/receipt`); // opens the ref lookup page
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Check Receipt"
      title="Check Receipt"
      className="
        fixed bottom-5 left-5 z-50 print:hidden
        inline-flex items-center gap-2
        rounded-full px-4 py-3
        bg-indigo-600 text-white font-semibold shadow-lg
        hover:bg-indigo-700 active:scale-[.98] transition
      "
    >
      <FiCheckCircle className="text-xl" />
      <span className="hidden sm:inline">Check Receipt</span>
    </button>
  );
}

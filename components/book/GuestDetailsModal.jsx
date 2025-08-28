// /components/book/GuestDetailsModal.jsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";

export default function GuestDetailsModal({
  open,
  onClose,
  guest,
  setGuest,
  selectedRooms,
  nights,
  pricePerNight,
  total,
  arrivalDate,
  departureDate,
  onConfirm,
}) {
  const fileRef = useRef(null);

  function onPickSelfie(e) {
    e?.preventDefault?.();
    if (fileRef.current) fileRef.current.value = "";
    fileRef.current?.click();
  }

  function onFileChange(e) {
    e?.preventDefault?.();
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert("Image too large. Max 4MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = reader.result;
      setGuest((g) => {
        const next = { ...g, captured_image: img };
        try { sessionStorage.setItem("guest_draft", JSON.stringify(next)); } catch {}
        return next;
      });
    };
    reader.readAsDataURL(file);
  }

  function preventEnterSubmit(e) {
    if (e.key === "Enter") e.preventDefault();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[95] max-h-[90vh] overflow-auto rounded-t-2xl bg-white text-black shadow-2xl sm:inset-y-0 sm:my-auto sm:mx-auto sm:h-auto sm:max-w-lg sm:rounded-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
          >
            <div className="border-b p-4">
              <h3 className="text-lg font-semibold">Guest Details & Summary</h3>
              <p className="text-xs text-black/60">Optionally capture a selfie for faster check-in.</p>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); onConfirm(e); }}
              onKeyDown={preventEnterSubmit}
              className="p-4 space-y-4"
              noValidate
            >
              <div className="grid grid-cols-1 gap-3">
                <input
                  required placeholder="Full name *"
                  value={guest.full_name}
                  onChange={(e) => setGuest((g) => ({ ...g, full_name: e.target.value }))}
                  className="w-full rounded-md border px-3 py-2"
                />
                <input
                  required placeholder="Phone *"
                  value={guest.phone}
                  onChange={(e) => setGuest((g) => ({ ...g, phone: e.target.value }))}
                  className="w-full rounded-md border px-3 py-2"
                />
                <input
                  placeholder="Email (optional)"
                  value={guest.email}
                  onChange={(e) => setGuest((g) => ({ ...g, email: e.target.value }))}
                  className="w-full rounded-md border px-3 py-2"
                />

                <div className="rounded-md border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-medium">Capture Face (optional)</div>
                    {guest.captured_image ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setGuest((g) => {
                            const next = { ...g, captured_image: "" };
                            try { sessionStorage.setItem("guest_draft", JSON.stringify(next)); } catch {}
                            return next;
                          });
                        }}
                        className="text-red-600 text-xs hover:underline"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>

                  {guest.captured_image ? (
                    <img src={guest.captured_image} alt="Captured" className="h-24 w-24 rounded object-cover border" />
                  ) : (
                    <button
                      type="button"
                      onClick={onPickSelfie}
                      className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-white hover:bg-slate-800"
                    >
                      Use Camera
                    </button>
                  )}

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={onFileChange}
                  />
                </div>
              </div>

              <div className="rounded-lg border bg-black/5 p-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <Info label="Arrival" value={arrivalDate || "-"} />
                  <Info label="Departure" value={departureDate || "-"} />
                  <Info label="Nights" value={nights} />
                  <Info label="Rooms" value={selectedRooms.length} />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="opacity-70">Total</div>
                  <div className="font-bold">
                    ₦{Number(total || 0).toLocaleString("en-NG")}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 hover:bg-black/5">
                  Cancel
                </button>
                <button type="submit" className="rounded-md bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700">
                  Proceed to Payment
                </button>
              </div>
            </form>

            <div className="border-t p-3 text-center text-xs text-black/60">You’ll complete payment on the next screen.</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="opacity-70">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
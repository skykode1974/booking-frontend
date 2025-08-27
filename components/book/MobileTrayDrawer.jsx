// /components/book/MobileTrayDrawer.jsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiTrash2 } from "react-icons/fi";

export default function MobileTrayDrawer({
  open,
  onClose,
  selectedRooms,
  nights,
  pricePerNight,
  total,
  arrivalDate,
  departureDate,
  onRemoveRoom,
  onProceed,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-black/60"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[95] rounded-t-2xl bg-white text-black shadow-2xl"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="font-semibold">Booking Tray</div>
              <button onClick={onClose} className="p-1 rounded hover:bg-black/5"><FiX /></button>
            </div>

            <div className="max-h-[55vh] overflow-auto p-4">
              {selectedRooms.length === 0 ? (
                <div className="text-sm text-black/70">No rooms selected yet.</div>
              ) : (
                <div className="space-y-3">
                  {selectedRooms.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-3 border-b border-black/10 pb-2">
                      <div className="min-w-0">
                        <div className="font-medium truncate">Room #{r.room_number}</div>
                        <div className="text-xs text-black/60">
                          ₦{Number(pricePerNight || 0).toLocaleString("en-NG")} / night
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveRoom(r.id)}
                        className="p-1 rounded border border-black/20 hover:bg-black/5 text-red-500"
                        aria-label="Remove room"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <Info label="Arrival" value={arrivalDate || "-"} />
                <Info label="Departure" value={departureDate || "-"} />
                <Info label="Nights" value={nights} />
                <Info label="Rooms" value={selectedRooms.length} />
              </div>
            </div>

            <div className="border-t p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Total</div>
                <div className="font-bold text-emerald-600">₦{Number(total || 0).toLocaleString("en-NG")}</div>
              </div>
              <button
                onClick={onProceed}
                disabled={selectedRooms.length === 0 || total <= 0}
                className="w-full py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50"
              >
                Proceed
              </button>
            </div>
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

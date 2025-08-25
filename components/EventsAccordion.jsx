// components/EventsAccordion.jsx
import React, { useState } from "react";
import Link from "next/link";

const EVENTS = [
  { key: "ladies", label: "Ladies Night", desc: "Fridays • 7:00 PM" },
  { key: "club", label: "Club Night", desc: "Saturdays • 10:00 PM" },
  { key: "trepas", label: "Trepas Night", desc: "Monthly special" },
  { key: "pool", label: "Pool Party", desc: "Saturdays • 3–9 PM" },
];

const TIERS = [
  { key: "adult", name: "Adult", price: "₦5,000", perks: ["Pool access", "DJ & games", "1 soft drink"] },
  { key: "child", name: "Child", price: "₦2,500", perks: ["Kids zone", "Floating toys", "1 juice pack"] },
  { key: "vip", name: "VIP", price: "₦15,000", perks: ["Cabana seating", "Premium drink", "Photo ops", "Express entry"] },
];

export default function EventsAccordion() {
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState("pool");
  const [tier, setTier] = useState("adult");
  const selectedTier = TIERS.find((t) => t.key === tier);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-2xl border p-4 text-left"
      >
        <div>
          <h2 className="text-xl font-semibold">Weekend Events</h2>
          <p className="text-sm opacity-80">
            Tap to {open ? "hide" : "view"} Ladies Night • Club Night • Trepas Night • Pool Party
          </p>
        </div>
        <span className="text-2xl">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="mt-4 grid gap-4 sm:grid-cols-[260px_1fr]">
          {/* Left list */}
          <div className="rounded-2xl border p-3">
            <ul className="space-y-2">
              {EVENTS.map((e) => (
                <li key={e.key}>
                  <button
                    onClick={() => setActive(e.key)}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                      active === e.key ? "bg-primary-600 text-white" : "hover:bg-neutral-100"
                    }`}
                  >
                    <div className="font-medium">{e.label}</div>
                    <div className="opacity-80">{e.desc}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right content */}
          <div className="rounded-2xl border p-4">
            {active !== "pool" ? (
              <div className="text-sm opacity-80">
                Details for <strong>{EVENTS.find((x) => x.key === active)?.label}</strong> are coming soon.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Tiers */}
                <div>
                  <h3 className="mb-2 text-base font-semibold">Ticket Tiers</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {TIERS.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setTier(t.key)}
                        className={`rounded-xl border p-3 text-left text-sm ${
                          tier === t.key ? "border-primary-500 ring-1 ring-primary-500" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{t.name}</span>
                          <span>{t.price}</span>
                        </div>
                        <ul className="mt-1 list-disc pl-5 opacity-90">
                          {t.perks.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 text-sm opacity-80">
                    Selected: <strong>{selectedTier?.name}</strong>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/activity-booking?tier=${tier}`}
                    className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2 font-semibold text-white"
                  >
                     Booking  NOw
                  </Link>
                
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

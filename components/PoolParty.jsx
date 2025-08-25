// components/PoolParty.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import QrBlock from "@/components/QrBlock";


const TICKET_TIERS = [
  { key: "adult", name: "Adult", price: "₦5,000", perks: ["Pool access", "DJ & games", "1 soft drink"] },
  { key: "child", name: "Child", price: "₦2,500", perks: ["Kids zone", "Floating toys", "1 juice pack"] },
  { key: "vip", name: "VIP", price: "₦15,000", perks: ["Cabana seating", "Premium drink", "Photo ops", "Express entry"] },
];

const AMENITIES = [
  "Clean, temperature-controlled pool",
  "Changing rooms & lockers",
  "Lifeguard on duty",
  "Pool bar & small chops",
  "Shower points",
  "Free Wi-Fi",
  "On-site parking",
];

const FAQS = [
  { q: "What should I bring?", a: "Swimwear, towel, flip-flops, and an ID for VIP access. Floaters available for rent on site." },
  { q: "Is outside food allowed?", a: "Light snacks are allowed in general areas. No glass near the pool. The pool bar serves food & drinks." },
  { q: "Refunds & reschedule?", a: "Tickets are non-refundable but can be rescheduled once if you contact us at least 24 hours before your slot." },
  { q: "Do lodged guests get perks?", a: "Yes. Lodged guests can enter their room number to enjoy discounted tiers when available." },
];

const TERMS = [
  "All guests must shower before entering the pool.",
  "Children must be supervised by an adult at all times.",
  "No running on wet surfaces. Follow lifeguard instructions.",
  "Venue reserves right of admission. Damages may attract charges.",
];

function useAutoplay(length, delay = 4500) {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);
  useEffect(() => {
    timer.current = setInterval(() => setIdx((p) => (p + 1) % length), delay);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [length, delay]);
  return [idx, setIdx];
}

export default function PoolParty() {
  const heroes = useMemo(() => ([
    { src: "/poolparty/hero1.jpg", alt: "Pool party night lights" },
    { src: "/poolparty/hero2.jpg", alt: "Cabanas and palm ambience" },
    { src: "/poolparty/hero3.jpg", alt: "Friends by the pool" },
  ]), []);

  const [slideIdx, setSlideIdx] = useAutoplay(heroes.length);
  const [activeTier, setActiveTier] = useState("adult");
  const tierObj = useMemo(() => TICKET_TIERS.find((t) => t.key === activeTier), [activeTier]);

  return (
    <div className="min-h-screen w-full bg-white text-gray-800 dark:bg-neutral-950 dark:text-neutral-100">
      {/* HERO */}
      <section className="relative h-[54vh] sm:h-[62vh] md:h-[68vh] overflow-hidden">
        <AnimatePresence initial={false}>
          {heroes.map((h, i) => (
            i === slideIdx && (
              <motion.div
                key={i}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Image src={h.src} alt={h.alt} fill priority className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </motion.div>
            )
          ))}
        </AnimatePresence>

        <div className="absolute inset-x-4 bottom-6 mx-auto max-w-5xl">
          <motion.div
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-2xl bg-white/80 p-4 backdrop-blur-md shadow-lg dark:bg-neutral-900/70"
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">Awrab Suite Hotel Pool Party</h1>
                <p className="text-sm sm:text-base opacity-90">Every Saturday • 3:00 PM – 9:00 PM • Poolside & Cabana Area</p>
              </div>
              <div className="flex items-center gap-2">
                {heroes.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlideIdx(i)}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${i === slideIdx ? "bg-primary-500 w-6" : "bg-neutral-300 dark:bg-neutral-700"}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TIERS + CTA */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Tiers */}
          <div>
            <h2 className="mb-3 text-xl font-semibold">Ticket Tiers</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {TICKET_TIERS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTier(t.key)}
                  className={`rounded-2xl border p-4 text-left shadow-sm hover:shadow-md focus:outline-none focus:ring-2 ${
                    activeTier === t.key ? "border-primary-500 ring-primary-500" : "border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{t.name}</p>
                    <span className="text-sm">{t.price}</span>
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm opacity-90">
                    {t.perks.map((p, i) => (<li key={i}>{p}</li>))}
                  </ul>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-primary-50 p-4 text-sm text-primary-900 dark:bg-primary-900/20 dark:text-primary-200">
              <p>Selected: <strong>{tierObj?.name}</strong> — <strong>{tierObj?.price}</strong></p>
              <p className="opacity-90">Promo: Lodged guests may enjoy discounts (enter room # on the next page).</p>
            </div>

            {/* Amenities */}
            <div className="mt-8">
              <h3 className="mb-2 text-lg font-semibold">Amenities</h3>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {AMENITIES.map((a, i) => (
                  <li key={i} className="rounded-xl border border-neutral-200 p-3 text-sm shadow-sm dark:border-neutral-800">{a}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Booking link card */}
          <div>
            <h2 className="mb-3 text-xl font-semibold">Book Pool Party</h2>
            <div className="space-y-3 rounded-2xl border border-neutral-200 p-4 shadow-sm dark:border-neutral-800">
              <p className="text-sm opacity-90">Choose your ticket tier on the left, then continue to our activity booking page to complete your details.</p>
              <div className="rounded-xl bg-primary-50 p-4 text-sm text-primary-900 dark:bg-primary-900/20 dark:text-primary-200">
                <p>Selected: <strong>{tierObj?.name}</strong> — <strong>{tierObj?.price}</strong></p>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <Link href={`/activity-booking?tier=${activeTier}`} className="inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-2 font-semibold text-white transition hover:bg-primary-700">
                  Continue to Booking
                </Link>
              </div>
              <p className="text-xs opacity-70">By booking you agree to the Terms below.</p>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="mx-auto max-w-6xl px-4 pb-6">
        <h2 className="mb-3 text-xl font-semibold">Gallery</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image src={`/poolparty/gallery${n}.jpg`} alt={`Pool party ${n}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* FAQ + TERMS + QR */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="mb-3 text-xl font-semibold">FAQs</h2>
            <div className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
              {FAQS.map((f, i) => (
                <details key={i} className="group p-4">
                  <summary className="cursor-pointer list-none font-medium"><span className="mr-2">Q{i + 1}.</span> {f.q}</summary>
                  <p className="mt-2 text-sm opacity-90">{f.a}</p>
                </details>
              ))}
            </div>
            <div className="mt-8">
              <h3 className="mb-2 text-lg font-semibold">Terms & Conditions</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm opacity-90">
                {TERMS.map((t, i) => (<li key={i}>{t}</li>))}
              </ul>
            </div>
          </div>

<aside className="rounded-2xl border border-neutral-200 p-4 shadow-sm dark:border-neutral-800">
  <h3 className="mb-2 text-lg font-semibold">Quick Access</h3>
  <p className="text-sm opacity-90">Scan to open the Pool Party page on your phone:</p>
  <QrBlock url="https://awrabsuiteshotel.com.ng/pool-party" />
  <p className="mt-3 text-xs opacity-70">If local QR is missing, an online QR will appear.</p>
</aside>

        </div>
      </section>
    </div>
  );
}

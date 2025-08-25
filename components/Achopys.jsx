'use client';
import { useEffect, useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// Client-only QR component
const CatalodgeQR = dynamic(() => import("./CatalodgeQR"), { ssr: false });

/** Local assets (place these in /public/achopys/) */
const ILLUS_PNG = "/achopys/guest-scanning.png";
const ILLUS_SVG = "/achopys/guest-scanning.svg"; // optional fallback
const ILLUS_PLACEHOLDER = "/achopys/placeholder.jpg";
const FALLBACK = "/achopys/placeholder.jpg";

/** Fallbacks */
const useIllustrationFallback = () =>
  useCallback((e) => {
    const img = e.currentTarget;
    if (!img.dataset.step) {
      img.dataset.step = "png";
      img.src = ILLUS_SVG;
    } else if (img.dataset.step === "png") {
      img.dataset.step = "svg";
      img.src = ILLUS_PLACEHOLDER;
    }
  }, []);

const useImgFallback = () =>
  useCallback((e) => {
    const img = e.currentTarget;
    if (img.dataset.fallback) return;
    img.dataset.fallback = "1";
    img.src = FALLBACK;
  }, []);

/** Responsive QR size */
function useResponsiveQrSize() {
  const [size, setSize] = useState(220); // ↓ smaller max
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 360) setSize(140);
      else if (w < 420) setSize(160);
      else if (w < 480) setSize(180);
      else if (w < 640) setSize(190);
      else if (w < 1024) setSize(200);
      else setSize(220);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}


/** Slider (local images) */
const slides = [
  "/achopys/slider1.png",
  "/achopys/slider2.jpeg",
  "/achopys/slider3.webp",
];

/** Menu data (local images) */
const foods = [
  {
    name: "Jollof Rice & Chicken",
    desc: "Classic Nigerian jollof with grilled chicken",
    price: 3500,
    img: "/achopys/jollof-chicken.jpg",
  },
  {
    name: "Fried Rice & Turkey",
    desc: "Stir-fried rice, veggies & grilled turkey",
    price: 4200,
    img: "/achopys/fried-rice-turkey.jpg",
  },
  {
    name: "Pounded Yam & Egusi",
    desc: "Rich melon soup, assorted meats",
    price: 4800,
    img: "/achopys/pounded-yam-egusi.jpg",
  },
  {
    name: "Amala with Efo Riro",
    desc: "Yam flour meal with spinach stew (efo riro)",
    price: 2800,
    img: "/achopys/amala-efo-riro.jpg",
  },
];

const drinks = [
  { name: "Red Wine", desc: "Rich, smooth red wine by the glass", price: 1800, img: "/achopys/red-wine.jpg" },
  { name: "Fresh Juice", desc: "Pineapple / Orange / Watermelon", price: 1500, img: "/achopys/fresh-juice.jpg" },
  { name: "Soft Drinks", desc: "Coke / Fanta / Sprite", price: 800, img: "/achopys/soft-drinks.jpg" },
  { name: "Ice Cream", desc: "Creamy scoops, assorted flavors", price: 2500, img: "/achopys/ice-cream.jpg" },
];

/** Only Food & Drinks */
const filters = ["Food", "Drinks"];

export default function Achopys() {
  const [index, setIndex] = useState(0);
  const [filter, setFilter] = useState("Food");
  const onImgError = useImgFallback();
  const onIllustrationError = useIllustrationFallback();
  const qrSize = useResponsiveQrSize();

  const list = useMemo(() => (filter === "Drinks" ? drinks : foods), [filter]);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, []);

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <section
      id="achopys"
      className="relative py-16 px-4 md:px-6 overflow-x-hidden"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Achopys Center</h2>
          <p className="mt-3 text-sm md:text-base opacity-80 max-w-2xl mx-auto">
            Tasty meals & refreshing drinks crafted for comfort. Guests can enjoy room-service ordering while non-lodgers are attended to at the eatery.
          </p>
        </div>

        {/* Row 1: Slider (6) | Menu (6) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Slider */}
          <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 shadow-xl">
            <div className="relative h-[300px] sm:h-[360px] md:h-[420px]">

              <AnimatePresence initial={false} mode="wait">
                <motion.img
                  key={index}
                  src={slides[index]}
                  alt="Achopys slide"
                  onError={onImgError}
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.5 }}
                />
              </AnimatePresence>
            </div>

            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full"
            >
              <FaChevronRight />
            </button>

            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-white" : "w-2.5 bg-white/60 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Menu list */}
          <div>
            {/* Tabs + CTA */}
            <div className="flex items-center gap-2 mb-4">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${
                    filter === f ? "bg-blue-600 text-white border-blue-600" : "bg-transparent border-white/20 hover:border-white/40"
                  }`}
                >
                  {f}
                </button>
              ))}
              <div className="ml-auto">
                <Link
                  href="/catalodge"
                  className="px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-black font-medium text-sm"
                >
                  Guests: Order via Catalodge
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {list.map((item, idx) => (
                <motion.div
                  key={`${item.name}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (idx % 4) * 0.05 }}
                  className="group border border-white/10 rounded-xl overflow-hidden bg-white/5 hover:bg-white/10 backdrop-blur-sm"
                >
                  <div className="h-32 w-full overflow-hidden">
                    <img
                      src={item.img}
                      alt={item.name}
                      onError={onImgError}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold">{item.name}</h4>
                    
                    </div>
                    <p className="text-xs opacity-80 mt-1">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 text-xs opacity-70">
              <span className="font-medium">Note:</span> Online ordering is available to lodged guests. Walk-ins are welcome at Achopys Center.
            </div>
          </div>
        </div>
        {/* /Row 1 */}

        {/* Row 2 (FULL-WIDTH 12 → 6/6): Illustration | QR */}
        <div className="mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* LEFT: Illustration (compact, responsive) */}
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl aspect-[3/2] md:aspect-auto md:h-[420px] lg:h-[460px]">

              <img
                src={ILLUS_PNG}
                onError={onIllustrationError}
                alt="Guest scanning QR to order"
                className="w-full h-full object-cover"
              />
            </div>

            {/* RIGHT: QR card (compact, responsive) */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-8 flex flex-col items-center justify-center text-center shadow-xl">
              <div className="w-full flex justify-center">
                <div className="max-w-full">
                  <CatalodgeQR size={qrSize} />
                </div>
              </div>
              {/* Removed extra text & button per request */}
            </div>
          </div>
        </div>
        {/* /Row 2 */}
      </div>
    </section>
  );
}

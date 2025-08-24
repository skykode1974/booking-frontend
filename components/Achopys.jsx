'use client';
import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// ✅ Use a local fallback (create /public/achopys/placeholder.jpg)
// If you don't have it yet, temporarily use: "https://via.placeholder.com/800x600?text=Achopys"
const FALLBACK = "/achopys/placeholder.jpg";

// robust onError handler (avoids infinite loop)
const useImgFallback = () =>
  useCallback((e) => {
    const img = e.currentTarget;
    if (img.dataset.fallback) return; // already swapped
    img.dataset.fallback = "1";
    img.src = FALLBACK;
  }, []);

// You can keep these remote URLs; any that fail will swap to FALLBACK automatically.
const slides = [
  "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1528697203043-733bfdca2f27?q=80&w=1600&auto=format&fit=crop",
];

const foods = [
  { name: "Jollof Rice & Chicken", desc: "Classic Nigerian jollof with grilled chicken", price: 3500, img: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop" },
  { name: "Fried Rice & Turkey", desc: "Stir-fried rice, veggies & grilled turkey", price: 4200, img: "https://images.unsplash.com/photo-1544025163-403d7b6856c2?q=80&w=800&auto=format&fit=crop" },
  { name: "Pounded Yam & Egusi", desc: "Rich melon soup, assorted meats", price: 4800, img: "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=800&auto=format&fit=crop" },
  { name: "Shawarma (Chicken)", desc: "Creamy, spicy wrap", price: 2800, img: "https://images.unsplash.com/photo-1604908554007-09e0e5c0d3d3?q=80&w=800&auto=format&fit=crop" },
];

const drinks = [
  { name: "Chapman", desc: "Refreshing Nigerian mocktail", price: 1800, img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop" },
  { name: "Fresh Juice", desc: "Pineapple / Orange / Watermelon", price: 1500, img: "https://images.unsplash.com/photo-1515734674582-29010bb37906?q=80&w=800&auto=format&fit=crop" },
  { name: "Soft Drinks", desc: "Coke / Fanta / Sprite", price: 800, img: "https://images.unsplash.com/photo-1500051638674-ff996a0ec29e?q=80&w=800&auto=format&fit=crop" },
  { name: "Mocktail Trio", desc: "Virgin mojito / sunrise / colada", price: 2500, img: "https://images.unsplash.com/photo-1551022370-1dc3f6c38788?q=80&w=800&auto=format&fit=crop" },
];

const filters = ["All", "Food", "Drinks"];

export default function Achopys() {
  const [index, setIndex] = useState(0);
  const [filter, setFilter] = useState("All");
  const onImgError = useImgFallback();

  const list = useMemo(() => {
    if (filter === "Food") return foods;
    if (filter === "Drinks") return drinks;
    return [...foods, ...drinks];
  }, [filter]);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, []);

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <section id="achopys" className="relative py-16 px-4 md:px-6"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Achopys Center</h2>
          <p className="mt-3 text-sm md:text-base opacity-80 max-w-2xl mx-auto">
            Tasty meals & refreshing drinks crafted for comfort. Guests can enjoy room-service ordering while non-lodgers are attended to at the eatery.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Slider */}
          <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 shadow-xl">
            <div className="relative h-[280px] sm:h-[360px] md:h-[420px]">
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

            <button onClick={prev} aria-label="Previous"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full">
              <FaChevronLeft />
            </button>
            <button onClick={next} aria-label="Next"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full">
              <FaChevronRight />
            </button>

            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-2.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2.5 bg-white/60 hover:bg-white/80"}`}
                />
              ))}
            </div>
          </div>

          {/* Menu grid */}
          <div>
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
                <a href="/catalodge" className="px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-black font-medium text-sm">
                  Guests: Order via Catalodge
                </a>
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
                      <span className="text-blue-400 font-semibold">
                        ₦{Number(item.price).toLocaleString("en-NG")}
                      </span>
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
      </div>
    </section>
  );
}

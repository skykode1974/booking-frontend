// components/ParallaxHero.jsx
"use client";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ParallaxHero() {
  const { scrollY } = useScroll();
  const yImg = useTransform(scrollY, [0, 400], [0, 80]);     // bg float
  const yTitle = useTransform(scrollY, [0, 400], [0, -40]);  // title rises
  const opacityTitle = useTransform(scrollY, [0, 300], [1, 0.7]);

  return (
    <section className="relative h-[72vh] overflow-hidden rounded-b-3xl">
      <motion.div style={{ y: yImg }} className="absolute inset-0">
        <Image src="/poolparty/hero1.jpg" alt="Awrab Suite Hotel" fill priority className="object-cover" />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      <div className="relative z-10 flex h-full items-end">
        <motion.div
          style={{ y: yTitle, opacity: opacityTitle }}
          className="mx-auto mb-10 max-w-6xl px-4 text-white"
        >
          <h1 className="text-3xl font-extrabold sm:text-5xl">Welcome to Awrab Suite Hotel</h1>
          <p className="mt-2 max-w-xl text-sm sm:text-base opacity-90">
            Luxury lodging, Catalodge dining, and weekend Pool Parties.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

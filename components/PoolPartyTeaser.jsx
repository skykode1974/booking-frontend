// components/PoolPartyTeaser.jsx
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function PoolPartyTeaser() {
  const [videoOk, setVideoOk] = useState(true);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="relative overflow-hidden rounded-2xl shadow-lg">
        <div className="relative h-64 sm:h-80 md:h-96">
          {videoOk ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              poster="/poolparty/hero-poster.jpg"
              onError={() => setVideoOk(false)}
            >
              <source src="/poolparty/hero.webm" type="video/webm" />
              <source src="/poolparty/hero.mp4" type="video/mp4" />
            </video>
          ) : (
            <Image
              src="/poolparty/hero.avif"
              alt="Pool Party at Awrab Suite Hotel"
              fill
              className="object-cover"
              priority
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 text-white">
            <h2 className="text-2xl font-bold sm:text-3xl">Weekend Pool Party</h2>
            <p className="text-sm opacity-90 sm:text-base">Every Sunrday • 10:00 AM–12:00 PM • Adult • VIP</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href="/activity-booking"
                className="inline-flex items-center rounded-xl bg-primary-600 px-4 py-2 font-semibold hover:bg-primary-700"
              >
                Book Pool Party
              </Link>
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

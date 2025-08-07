// components/GalleryShowcase.jsx
import { useEffect, useState } from 'react';

const images = [
  '/images/pool.jpg',
  '/images/bar.jpg',
  '/images/suite.jpg',
  '/images/gym.jpg',
  '/images/courtyard.jpg',
];

const highlights = [
  'Luxurious rooms and executive suites',
  'Courtyard pool surrounded by palm trees',
  'Well-equipped gym and spa facilities',
  'Bar and fine dining experiences',
  'Conference center with 500-seat capacity',
  '20 minutes from the airport',
  'Free Wi-Fi and 24/7 power supply',
];

export default function GalleryShowcase() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-[#0c1a2b] py-16 px-4 text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 items-center">
        
        {/* Left: Sliding Image (3/5 width) */}
        <div className="col-span-1 md:col-span-3 relative h-[320px] md:h-[460px] overflow-hidden rounded-xl shadow-lg">
          <img
            src={images[current]}
            alt="Hotel Gallery"
            className="w-full h-full object-cover rounded-xl transition-all duration-700 ease-in-out"
          />

          {/* 360° Icon */}
          <div className="absolute bottom-4 left-4 bg-white text-black px-3 py-1 text-sm font-bold rounded-full shadow-md flex items-center gap-1">
            <span>360°</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 2a10 10 0 0 1 7.07 17.07m-14.14 0A10 10 0 0 1 12 2m0 0v4m0 12v4m8-8h4m-20 0h4" />
            </svg>
          </div>
        </div>

        {/* Right: Highlights (2/5 width) */}
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Why Guests Love Us</h2>
          <ul className="list-disc pl-4 space-y-3 text-sm md:text-base text-gray-200">
            {highlights.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{item}</li>
            ))}
          </ul>

          {/* Check-in info */}
         
        </div>
      </div>
    </section>
  );
}

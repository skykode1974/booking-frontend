import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const slides = [
  {
    image: '/images/hero1.jpeg',
    headline: 'Experience Comfort & Class',
    subtext: 'Discover class, comfort, and convenience.',
  },
  {
    image: '/images/hero2.jpeg',
    headline: 'Luxury at its Best',
    subtext: 'Every stay is a story worth remembering.',
  },
  {
    image: '/images/hero3.jpg',
    headline: 'Feel at Home',
    subtext: 'Enjoy hospitality tailored just for you.',
  },
];

export default function HeroSlider() {
  return (
    <div className="relative h-[80vh] overflow-hidden z-0">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        loop
        className="h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              className="h-full bg-cover bg-center flex items-center justify-center text-center transition-all duration-1000 ease-in-out"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Text animation wrapper */}
              <motion.div
                key={index} // <-- this makes animation re-trigger per slide
                initial={{ opacity: 0, y: 30, rotateX: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="bg-black/60 p-8 rounded-lg text-white max-w-2xl mx-auto"
              >
                <h1 className="text-3xl md:text-5xl font-bold mb-4">{slide.headline}</h1>
                <p className="text-lg">{slide.subtext}</p>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

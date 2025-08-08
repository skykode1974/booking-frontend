// components/HeroSlider.jsx
import { useEffect, useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const slides = [
  {
    image: '/images/hero1.jpg',
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

// --- Typewriter with erase/retype ---
function useTypewriter(text, { speed = 60, eraseSpeed = 40, delay = 1500, startKey }) {
  const [output, setOutput] = useState('');
  const [phase, setPhase] = useState('typing'); // typing | pausing | deleting

  useEffect(() => {
    setOutput('');
    setPhase('typing');
  }, [text, startKey]);

  useEffect(() => {
    let timeout;

    if (phase === 'typing') {
      if (output.length < text.length) {
        timeout = setTimeout(() => {
          setOutput(text.slice(0, output.length + 1));
        }, speed);
      } else {
        setPhase('pausing');
      }
    } else if (phase === 'pausing') {
      timeout = setTimeout(() => setPhase('deleting'), delay);
    } else if (phase === 'deleting') {
      if (output.length > 0) {
        timeout = setTimeout(() => {
          setOutput(text.slice(0, output.length - 1));
        }, eraseSpeed);
      }
    }

    return () => clearTimeout(timeout);
  }, [output, phase, text, speed, eraseSpeed, delay]);

  return output;
}

export default function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    slides.forEach(s => { const img = new Image(); img.src = s.image; });
  }, []);

  return (
    <div className="relative w-full">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        speed={900}
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        loop
        navigation
        pagination={{ clickable: true }}
        onSlideChange={(swiper) => setActive(swiper.realIndex)}
        className="h-[70vh] md:h-[80vh] rounded-2xl overflow-hidden"
      >
        {slides.map((s, idx) => (
          <SwiperSlide key={idx}>
            <SlideContent
              {...s}
              isActive={active === idx}
              slideKey={active}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function SlideContent({ image, headline, subtext, isActive, slideKey }) {
  const typedHeadline = useTypewriter(headline, { speed: 60, eraseSpeed: 40, delay: 1500, startKey: slideKey });
  const typedSub = useTypewriter(subtext, { speed: 45, eraseSpeed: 30, delay: 1500, startKey: slideKey + '-sub' });

  const motionClass = useMemo(
    () => `absolute inset-0 bg-center bg-cover will-change-transform ${isActive ? 'animate-heroIn' : ''}`,
    [isActive]
  );

  // Smooth scroll handlers
  const scrollToSection = (id) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative h-full">
      <div className={motionClass} style={{ backgroundImage: `url(${image})` }} />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
            {typedHeadline}
            <Cursor isActive={isActive} />
          </h1>
          <p className="mt-4 md:mt-6 text-base md:text-xl text-white/90">{typedSub}</p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => scrollToSection('#rooms')}
              className="rounded-xl bg-white/90 hover:bg-white text-gray-900 px-5 py-3 font-medium transition"
            >
              Book a Room
            </button>
            <button
              onClick={() => scrollToSection('#contact')}
              className="rounded-xl bg-transparent border border-white/70 hover:bg-white/10 text-white px-5 py-3 font-medium backdrop-blur-sm transition"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Cursor({ isActive }) {
  return (
    <span className={`inline-block w-[2px] h-[1em] align-[-0.15em] ml-1 bg-white ${isActive ? 'animate-caret' : ''}`} />
  );
}

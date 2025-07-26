'use client';

import { Typewriter } from 'react-simple-typewriter';

export default function HeroHeader() {
  return (
    <header className="relative h-[25vh] flex items-center justify-center text-white text-center bg-gradient-to-r from-gray-900 via-gray-800 to-black overflow-hidden dark:bg-black">
      
      {/* 🌊 TOP WAVE */}
      <div className="absolute top-0 left-0 w-full z-0 pointer-events-none opacity-40 dark:opacity-60">
        <svg className="w-full h-16" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path
            fill="#0ea5e9"
            fillOpacity="1"
            d="M0,64L60,90.7C120,117,240,171,360,160C480,149,600,75,720,85.3C840,96,960,192,1080,197.3C1200,203,1320,117,1380,74.7L1440,32V0H0Z"
          >
            <animate
              attributeName="d"
              dur="12s"
              repeatCount="indefinite"
              values="
                M0,64L60,90.7C120,117,240,171,360,160C480,149,600,75,720,85.3C840,96,960,192,1080,197.3C1200,203,1320,117,1380,74.7L1440,32V0H0Z;
                M0,48L80,72C160,96,320,128,480,128C640,128,800,96,960,85.3C1120,75,1280,85,1360,90.7L1440,96V0H0Z;
                M0,64L60,90.7C120,117,240,171,360,160C480,149,600,75,720,85.3C840,96,960,192,1080,197.3C1200,203,1320,117,1380,74.7L1440,32V0H0Z
              "
            />
          </path>
        </svg>
      </div>

      {/* 🌟 TEXT */}
      <div className="z-10 px-4">
<br/>
        <h1 className="text-xl md:text-3xl font-bold mb-2 text-white">
          <Typewriter
            words={[
              'Welcome to Awrab Suite Hotel',
              'An Online Booking Center',
              'Experience Comfort & Class',
              'Book Luxury Rooms Easily Online',
            ]}
            loop={true}
            cursor
            cursorStyle="|"
            typeSpeed={60}
            deleteSpeed={40}
            delaySpeed={2000}
          />
        </h1>
        <p className="text-sm md:text-base text-gray-300 mt-2 dark:text-gray-400">
          Discover class, comfort, and convenience
        </p>
      </div>

      {/* 🌊 BOTTOM WAVE */}
      <div className="absolute bottom-0 left-0 w-full z-0 pointer-events-none opacity-40 dark:opacity-60">
        <svg className="w-full h-16" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path
            fill="#6366f1"
            fillOpacity="1"
            d="M0,256L60,240C120,224,240,192,360,192C480,192,600,224,720,229.3C840,235,960,213,1080,208C1200,203,1320,213,1380,218.7L1440,224V320H0Z"
          >
            <animate
              attributeName="d"
              dur="10s"
              repeatCount="indefinite"
              values="
                M0,256L60,240C120,224,240,192,360,192C480,192,600,224,720,229.3C840,235,960,213,1080,208C1200,203,1320,213,1380,218.7L1440,224V320H0Z;
                M0,240L80,230C160,220,320,210,480,210C640,210,800,230,960,235C1120,240,1280,230,1360,225L1440,220V320H0Z;
                M0,256L60,240C120,224,240,192,360,192C480,192,600,224,720,229.3C840,235,960,213,1080,208C1200,203,1320,213,1380,218.7L1440,224V320H0Z
              "
            />
          </path>
        </svg>
      </div>
    </header>
  );
}

// components/ActivityWave.jsx
"use client";
import { useEffect, useState } from "react";

/**
 * Animated wave header with floating activity tags.
 * - Lightweight, CSS-driven, respects reduced motion
 * - Tokens are created on the client to avoid hydration issues
 */
export default function ActivityWave({
  height = 220,            // px height of the header
  density = 22,            // how many floating tokens
}) {
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    // Activity words + emojis
    const WORDS = [
      "Pool 🏊", "Gym 🏋️", "Ladies Night 💃", "Club Night 🎧",
      "Spa 💆", "Karaoke 🎤", "BBQ 🍗", "Cocktails 🍹",
      "Game Night 🎮", "Cinema 🍿", "Kids Zone 🧒", "Yoga 🧘",
    ];
    const COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#f472b6", "#a78bfa", "#f87171"];
    const sizes = [0.9, 1, 1.1, 1.2, 1.35];

    // Create N random tokens
    const make = Array.from({ length: density }).map((_, i) => {
      const word = WORDS[i % WORDS.length];
      return {
        id: i,
        word,
        left: Math.random() * 100,                 // %
        top: Math.random() * 55,                   // %
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: sizes[Math.floor(Math.random() * sizes.length)],
        drift: 10 + Math.random() * 16,            // seconds
        bob: 2.5 + Math.random() * 3.5,            // seconds
        rotate: Math.random() * 10 - 5,            // deg
        delay: -(Math.random() * 10).toFixed(2),   // negative to desync
      };
    });
    setTokens(make);
  }, [density]);

  return (
    <section
      className="relative w-full overflow-hidden rounded-b-3xl"
      style={{ height }}
      aria-hidden="true"
    >
      {/* Floating labels layer */}
      <div className="pointer-events-none absolute inset-0">
        <div className="h-full w-full">
          {tokens.map(t => (
            <div
              key={t.id}
              className="absolute will-change-transform motion-safe:animate-none"
              style={{
                left: `${t.left}%`,
                top: `${t.top}%`,
                transform: `rotate(${t.rotate}deg)`,
                color: t.color,
                fontWeight: 700,
                fontSize: `${t.size}rem`,
              }}
            >
              {/* Outer drift (X) */}
              <div
                className="token-drift"
                style={{
                  animationDuration: `${t.drift}s`,
                  animationDelay: `${t.delay}s`,
                }}
              >
                {/* Inner bob (Y) */}
                <div
                  className="token-bob"
                  style={{
                    animationDuration: `${t.bob}s`,
                    animationDelay: `${t.delay}s`,
                  }}
                >
                  {t.word}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient background (subtle) */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_300px_at_50%_-100px,#1d4ed8_10%,transparent_60%)] dark:bg-[radial-gradient(1200px_300px_at_50%_-100px,#1d4ed8_10%,transparent_60%)]" />

      {/* Waves (two layers for depth) */}
      <WaveSVG className="absolute bottom-0 left-0 right-0 opacity-70" speed={12} reverse />
      <WaveSVG className="absolute bottom-0 left-0 right-0 opacity-40" speed={18} />

      {/* Local styles */}
      <style jsx>{`
        /* Horizontal drift */
        @keyframes drift {
          0%   { transform: translateX(0); }
          50%  { transform: translateX(-20px); }
          100% { transform: translateX(0); }
        }
        /* Vertical bob */
        @keyframes bob {
          0%   { transform: translateY(0); }
          50%  { transform: translateY(-8px); }
          100% { transform: translateY(0); }
        }
        .token-drift {
          animation-name: drift;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .token-bob {
          animation-name: bob;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .token-drift, .token-bob { animation: none !important; }
        }
      `}</style>
    </section>
  );
}

function WaveSVG({ className = "", speed = 12, reverse = false }) {
  return (
    <svg className={className} viewBox="0 0 1200 120" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`waveGradient-${reverse ? "rev" : "fwd"}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
        <path id={`wavePath-${reverse ? "rev" : "fwd"}`} d="M0,50 C150,110 350,-10 600,60 C850,130 1050,10 1200,60 L1200,120 L0,120 Z" />
      </defs>

      <g className={reverse ? "wave-move-rev" : "wave-move"} style={{ animationDuration: `${speed}s` }}>
        <use href={`#wavePath-${reverse ? "rev" : "fwd"}`} fill={`url(#waveGradient-${reverse ? "rev" : "fwd"})`} />
      </g>

      <style jsx>{`
        @keyframes waveMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-1200px); }
        }
        @keyframes waveMoveRev {
          0% { transform: translateX(0); }
          100% { transform: translateX(1200px); }
        }
        .wave-move {
          animation: waveMove linear infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .wave-move-rev {
          animation: waveMoveRev linear infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        @media (prefers-reduced-motion: reduce) {
          .wave-move, .wave-move-rev { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}

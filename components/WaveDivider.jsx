// components/ActivityWave.jsx
"use client";
import { useEffect, useMemo, useState } from "react";

/**
 * Animated wave header with floating tokens.
 * Props:
 *  - height   : number (px)
 *  - density  : number (how many tokens)
 *  - words    : string[] (labels to float; if empty uses defaults)
 *  - palette  : string[] hex colors
 */
export default function ActivityWave({
  height = 220,
  density = 22,
  words = [],
  palette = ["#60a5fa", "#34d399", "#fbbf24", "#f472b6", "#a78bfa", "#f87171"],
}) {
  const [tokens, setTokens] = useState([]);

  // default labels if none provided
  const fallbackWords = useMemo(
    () => [
      "Awrab Suites Hotel",
      "Catalodge",
      "Pool Party",
      "Ladies Night",
      "Club Night",
      "Gym",
      "Spa",
      "Karaoke",
    ],
    []
  );

  useEffect(() => {
    const WORDS = (words && words.length ? words : fallbackWords).slice(0, 200); // safety cap
    const sizes = [0.9, 1, 1.1, 1.2, 1.35];

    const make = Array.from({ length: density }).map((_, i) => {
      const word = WORDS[i % WORDS.length];
      return {
        id: i,
        word,
        left: Math.random() * 100,             // %
        top: Math.random() * 55,               // %
        color: palette[Math.floor(Math.random() * palette.length)],
        size: sizes[Math.floor(Math.random() * sizes.length)],
        drift: 10 + Math.random() * 16,        // seconds
        bob: 2.5 + Math.random() * 3.5,        // seconds
        rotate: Math.random() * 10 - 5,        // deg
        delay: -(Math.random() * 10).toFixed(2),
      };
    });
    setTokens(make);
  }, [density, words, palette, fallbackWords]);

  return (
    <section
      className="relative w-full overflow-hidden rounded-b-3xl"
      style={{ height }}
      aria-hidden="true"
    >
      {/* Floating labels */}
      <div className="pointer-events-none absolute inset-0">
        {tokens.map((t) => (
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
              textShadow:
                "0 1px 2px rgba(0,0,0,.25), 0 0 10px rgba(0,0,0,.08)",
              whiteSpace: "nowrap",
            }}
          >
            <div
              className="token-drift"
              style={{
                animationDuration: `${t.drift}s`,
                animationDelay: `${t.delay}s`,
              }}
            >
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

      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_300px_at_50%_-100px,#1d4ed8_10%,transparent_60%)] dark:bg-[radial-gradient(1200px_300px_at_50%_-100px,#1d4ed8_10%,transparent_60%)]" />

      {/* Waves */}
      <WaveSVG className="absolute bottom-0 left-0 right-0 opacity-70" speed={12} reverse />
      <WaveSVG className="absolute bottom-0 left-0 right-0 opacity-40" speed={18} />

      <style jsx>{`
        @keyframes drift {
          0% { transform: translateX(0); }
          50% { transform: translateX(-20px); }
          100% { transform: translateX(0); }
        }
        @keyframes bob {
          0% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
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
        @keyframes waveMove { 0% { transform: translateX(0); } 100% { transform: translateX(-1200px); } }
        @keyframes waveMoveRev { 0% { transform: translateX(0); } 100% { transform: translateX(1200px); } }
        .wave-move, .wave-move-rev {
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .wave-move { animation-name: waveMove; }
        .wave-move-rev { animation-name: waveMoveRev; }
        @media (prefers-reduced-motion: reduce) {
          .wave-move, .wave-move-rev { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}

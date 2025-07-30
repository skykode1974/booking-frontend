export default function BackgroundWaves() {
  return (
    <div className="absolute top-0 left-0 w-full z-0 overflow-hidden" style={{ height: '300px' }}>
      <svg viewBox="0 0 1440 320" className="w-full h-full">
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00b4d8" />
            <stop offset="100%" stopColor="#0077b6" />
          </linearGradient>
        </defs>
        <path
          fill="url(#waveGradient)"
          fillOpacity="0.4"
          d="M0,192L48,186.7C96,181,192,171,288,160C384,149,480,139,576,149.3C672,160,768,192,864,192C960,192,1056,160,1152,133.3C1248,107,1344,85,1392,74.7L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        />
      </svg>
    </div>
  );
}

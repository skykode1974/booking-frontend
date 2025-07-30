export default function BottomWave() {
  return (
    <div className="fixed bottom-0 left-0 w-full overflow-hidden z-0 pointer-events-none">
      <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-[100px]">
        <path
          fill="#3B82F6"
          fillOpacity="0.2"
          d="M0,80 C360,120 1080,0 1440,60 L1440,120 L0,120 Z"
        />
        <path
          fill="#60A5FA"
          fillOpacity="0.4"
          d="M0,100 C300,40 1140,140 1440,100 L1440,120 L0,120 Z"
        />
        <path
          fill="#93C5FD"
          fillOpacity="0.6"
          d="M0,90 C420,150 1020,10 1440,90 L1440,120 L0,120 Z"
        />
      </svg>
    </div>
  );
}

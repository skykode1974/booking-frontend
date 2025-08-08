// components/Features.jsx
import {
  FaSwimmingPool,
  FaWifi,
  FaParking,
  FaUtensils,
  FaSpa,
  FaHotel,          // Hall
  FaGlassCheers,    // Club-house
  FaConciergeBell,  // Room service
} from 'react-icons/fa';

const features = [
  { icon: <FaSwimmingPool />, title: 'Swimming Pool' },
  { icon: <FaWifi />, title: 'Free Wi‑Fi' },
  { icon: <FaParking />, title: 'Parking Space' },
  { icon: <FaUtensils />, title: 'Restaurant' },
  { icon: <FaSpa />, title: 'Spa & Wellness' },
  { icon: <FaHotel />, title: 'Hall' },
  { icon: <FaGlassCheers />, title: 'Club‑House' },
  { icon: <FaConciergeBell />, title: 'Bar' },
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative py-16 px-4 overflow-hidden"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Multicolored moving “wave” background */}
      <div className="features-bg pointer-events-none absolute inset-0 -z-10">
        <span className="waveBlob wave1" />
        <span className="waveBlob wave2" />
        <span className="waveBlob wave3" />
      </div>

      <div className="max-w-6xl mx-auto text-center relative">
        <h2 className="text-3xl font-bold mb-10">Our Amenities</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{
                backgroundColor: "var(--foreground)",
                color: "var(--background)",
              }}
            >
              <div className="text-4xl mb-4 text-blue-500">{feat.icon}</div>
              <h3 className="text-sm sm:text-base font-semibold">
                {feat.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

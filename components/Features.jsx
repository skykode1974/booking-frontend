// components/Features.jsx
import {
  FaSwimmingPool,
  FaWifi,
  FaParking,
  FaUtensils,
  FaSpa,
} from 'react-icons/fa';

const features = [
  { icon: <FaSwimmingPool />, title: 'Swimming Pool' },
  { icon: <FaWifi />, title: 'Free Wi-Fi' },
  { icon: <FaParking />, title: 'Parking Space' },
  { icon: <FaUtensils />, title: 'Restaurant' },
  { icon: <FaSpa />, title: 'Spa & Wellness' },
];

export default function Features() {
  return (
    <section
      className="py-16 px-4"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-10">Our Amenities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl shadow-md transition-all duration-300"
              style={{
                backgroundColor: "var(--foreground)",
                color: "var(--background)",
              }}
            >
              <div className="text-4xl text-blue-500 mb-4">{feat.icon}</div>
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

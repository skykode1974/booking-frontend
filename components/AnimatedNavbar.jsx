import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";

export default function AnimatedNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  const bookings = [
    { label: "Room Booking", href: "/room-booking" },
    { label: "Hall Booking", href: "/hall-booking" },
    { label: "Activity Booking", href: "/activity-booking" },
  ];

  const entertainment = [
    { label: "Restaurant", href: "/restaurant" },
    { label: "Canteen", href: "/canteen" },
    { label: "Bar", href: "/bar" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/5 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <h1 className="text-lg md:text-xl font-bold text-white">Awrab Suite Hotel</h1>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 text-sm font-medium">
          <li className="group relative">
            <span className="cursor-pointer">Bookings</span>
            <ul className="absolute hidden group-hover:block top-full left-0 bg-white text-black rounded shadow-md mt-2 min-w-[180px]">
              {bookings.map((item, idx) => (
                <li key={idx}>
                  <a
                    href={item.href}
                    className="block px-4 py-2 hover:bg-blue-100"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </li>

          <li className="group relative">
            <span className="cursor-pointer">Dining & Entertainment</span>
            <ul className="absolute hidden group-hover:block top-full left-0 bg-white text-black rounded shadow-md mt-2 min-w-[180px]">
              {entertainment.map((item, idx) => (
                <li key={idx}>
                  <a
                    href={item.href}
                    className="block px-4 py-2 hover:bg-blue-100"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        </ul>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white">
            {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-black bg-opacity-80 backdrop-blur-md text-white px-4 py-4 space-y-4">
          <div>
            <h2 className="text-sm font-bold mb-1">Bookings</h2>
            {bookings.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block text-sm py-1 border-b border-white/10 hover:text-blue-300"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div>
            <h2 className="text-sm font-bold mt-4 mb-1">Dining & Entertainment</h2>
            {entertainment.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block text-sm py-1 border-b border-white/10 hover:text-blue-300"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi"; // Install: npm i react-icons

export default function AnimatedNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    "Room Booking",
    "Hall Booking",
    "Club Booking",
    "Cinema",
    "Gym",
    "Pool",
    "Restaurant",
    "Canteen",
    "Bar",
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/5 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <h1 className="text-lg md:text-xl font-bold text-white">Skykode Hotel</h1>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-5 text-sm font-medium">
          {navItems.map((item, index) => (
            <li key={index}>
              <a
  href="#"
  className="relative text-white hover:text-blue-400 transition after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full"
>
  {item}
</a>

            </li>
          ))}
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
        <div className="md:hidden bg-black bg-opacity-80 backdrop-blur-md text-white px-4 py-4 space-y-2">
          {navItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className="block text-sm py-2 border-b border-white/10 hover:text-blue-300 transition"
              onClick={() => setIsOpen(false)}
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

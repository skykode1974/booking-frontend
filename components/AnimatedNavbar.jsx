import { useState, useEffect } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { FaSun, FaMoon } from "react-icons/fa";

export default function AnimatedNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Smooth scroll helper
  const scrollToSection = (id) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false); // close mobile menu if open
    }
  };

  // Apply theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
      document.body.classList.remove("light");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      document.body.classList.add("light");
      setIsDark(false);
    }
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    const body = document.body;
    const newTheme = !isDark;

    if (newTheme) {
      html.classList.add("dark");
      body.classList.add("dark");
      body.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      body.classList.remove("dark");
      body.classList.add("light");
      localStorage.setItem("theme", "light");
    }
    setIsDark(newTheme);
  };

  const bookings = [
    { label: "Room Booking", href: "/room-booking" },
    { label: "Activity Booking", href: "/activity-booking" },
  ];

  const entertainment = [
    { label: "Restaurant", href: "/restaurant" },
    { label: "Canteen", href: "/canteen" },
    { label: "Bar", href: "/bar" },
  ];

  const pages = [
    { label: "Home", target: "#home" },
    { label: "Features", target: "#features" },
    { label: "Rooms", target: "#rooms" },
    { label: "Contact", target: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/5 text-white shadow-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-lg md:text-xl font-bold text-white">
          Awrab Suite Hotel
        </h1>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {pages.map((item, idx) => (
            <li key={idx}>
              <button
                onClick={() => scrollToSection(item.target)}
                className="hover:text-blue-400 transition"
              >
                {item.label}
              </button>
            </li>
          ))}

          {/* Bookings Dropdown */}
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

          {/* Entertainment Dropdown */}
          <li className="group relative">
            <span className="cursor-pointer">Dining</span>
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

          {/* Theme Toggle Button */}
          <li>
            <button
              onClick={toggleDarkMode}
              title="Toggle Theme"
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-full"
            >
              {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
            </button>
          </li>
        </ul>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white"
          >
            {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black bg-opacity-90 text-white px-6 py-6 space-y-6">
          {/* Pages */}
          <div>
            <h2 className="text-sm font-bold mb-1">Navigation</h2>
            {pages.map((item, idx) => (
              <button
                key={idx}
                onClick={() => scrollToSection(item.target)}
                className="block py-1 border-b border-white/10 hover:text-blue-300 w-full text-left"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Bookings */}
          <div>
            <h2 className="text-sm font-bold mt-4 mb-1">Bookings</h2>
            {bookings.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block py-1 border-b border-white/10 hover:text-blue-300"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Entertainment */}
          <div>
            <h2 className="text-sm font-bold mt-4 mb-1">Dining & Entertainment</h2>
            {entertainment.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block py-1 border-b border-white/10 hover:text-blue-300"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Theme Toggle */}
          <div className="pt-4">
            <button
              onClick={toggleDarkMode}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-md text-sm"
            >
              {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

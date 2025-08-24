'use client';
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router"; // pages router
import { HiMenu, HiX } from "react-icons/hi";
import { FaSun, FaMoon } from "react-icons/fa";

const GUARD_DEST = "/catalodge"; // change this if needed

export default function AnimatedNavbar() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // guard modal
  const [guardOpen, setGuardOpen] = useState(false);
  const [pendingDest, setPendingDest] = useState(null);

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

  // mark these as guarded; clicking them triggers the modal then routes to GUARD_DEST
 const entertainment = [
  { label: "Restaurant", href: "/restaurant", guarded: true, guardDest: GUARD_DEST },
  { label: "Eatery", href: "/canteen", guarded: true, guardDest: GUARD_DEST },
  { label: "Club Bar", href: "/bar", guarded: true, guardDest: GUARD_DEST },
];


  const pages = [
    { label: "Home", target: "#home" },
    { label: "Features", target: "#features" },
    { label: "Rooms", target: "#rooms" },
    { label: "Contact", target: "#contact" },
  ];

  const openGuard = useCallback((dest) => {
    setPendingDest(dest || GUARD_DEST);
    setGuardOpen(true);
  }, []);

  const confirmGuard = useCallback(() => {
    const dest = pendingDest || GUARD_DEST;
    setGuardOpen(false);
    setIsOpen(false);
    router.push(dest);
  }, [pendingDest, router]);

  const cancelGuard = useCallback(() => {
    setGuardOpen(false);
    setPendingDest(null);
  }, []);

  // intercept click for guarded items
  const handleItemClick = (e, item) => {
    if (item?.guarded) {
      e.preventDefault();
      openGuard(item.guardDest);
    } else if (item?.href) {
      e.preventDefault();
      setIsOpen(false);
      router.push(item.href);
    }
  };

  // Reusable desktop dropdown (fixes hover gap with pt-2 bridge + guard support)
  const DesktopDropdown = ({ label, items }) => (
    <li className="group relative">
      <button
        type="button"
        className="cursor-pointer select-none hover:text-blue-400 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
        aria-haspopup="true"
        aria-expanded="false"
      >
        {label}
      </button>

      {/* Hover bridge container */}
      <div className="absolute left-0 top-full pt-2 z-[60]">
        <ul
          className="
            pointer-events-none invisible opacity-0 translate-y-1
            group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto
            group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto
            transition duration-150 ease-out
            bg-white text-black rounded-md shadow-xl min-w-[200px] overflow-hidden
          "
          role="menu"
        >
          {items.map((item, idx) => (
            <li key={idx} role="none">
              <a
                href={item.href}
                onClick={(e) => handleItemClick(e, item)}
                className="block px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                role="menuitem"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );

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
                className="hover:text-blue-400 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
              >
                {item.label}
              </button>
            </li>
          ))}

          {/* Bookings Dropdown */}
          <DesktopDropdown label="Bookings" items={bookings} />

          {/* Dining Dropdown (guarded) */}
          <DesktopDropdown label="Dining" items={entertainment} />

          {/* Theme Toggle */}
          <li>
            <button
              onClick={toggleDarkMode}
              title="Toggle Theme"
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
            </button>
          </li>
        </ul>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
            aria-label="Toggle menu"
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
                className="block py-2 border-b border-white/10 hover:text-blue-300 w-full text-left"
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
                onClick={(e) => handleItemClick(e, item)}
                className="block py-2 border-b border-white/10 hover:text-blue-300"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Dining & Entertainment (guarded) */}
          <div>
            <h2 className="text-sm font-bold mt-4 mb-1">Dining & Entertainment</h2>
            {entertainment.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                onClick={(e) => handleItemClick(e, item)}
                className="block py-2 border-b border-white/10 hover:text-blue-300"
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

      {/* Guard Modal */}
      {guardOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guard-title"
        >
          <div className="w-full max-w-sm rounded-xl bg-white text-black shadow-2xl overflow-hidden">
            <div className="p-4">
              <h3 id="guard-title" className="text-lg font-semibold mb-1">
                Please Note
              </h3>
              <p className="text-sm">
                Only lodged customers can order for service online.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t p-3">
              <button
                onClick={cancelGuard}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmGuard}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

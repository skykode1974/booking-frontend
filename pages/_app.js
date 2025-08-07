// pages/_app.js
import { useEffect, useState } from "react";
import "@/styles/globals.css";
import "flatpickr/dist/themes/material_green.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function App({ Component, pageProps }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);

    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <>
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-blue-600 text-white rounded shadow"
      >
        {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>
      <Component {...pageProps} />
    </>
  );
}

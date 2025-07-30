import { useEffect } from "react";
import "@/styles/globals.css"; // Your custom global styles
import "flatpickr/dist/themes/material_green.css"; // ✅ Flatpickr theme (must be here in Next.js)

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // ✅ Always enable dark mode
    document.documentElement.classList.add("dark");

    // Optional: If you ever want to use system preference instead:
    // const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    // if (prefersDark) {
    //   document.documentElement.classList.add("dark");
    // } else {
    //   document.documentElement.classList.remove("dark");
    // }
  }, []);

  return <Component {...pageProps} />;
}

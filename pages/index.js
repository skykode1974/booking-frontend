import { useEffect } from 'react';
import AnimatedNavbar from '../components/AnimatedNavbar';
import HeroHeader from '../components/HeroHeader';
import RoomTypeList from '../components/RoomTypeList';
import Features from '../components/Features'; // ✅ New import
import HeroSlider from '../components/HeroSlider';
import GalleryShowcase from '../components/GalleryShowcase';
import ContactUs from '../components/ContactUs';
import BottomWave from '../components/BottomWave';
import Footer from '../components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
  const html = document.documentElement;
  const isDark = html.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
};

  return (
    <>

      <AnimatedNavbar />
      <HeroSlider />
      <HeroHeader />
      <RoomTypeList />
      <Features /> {/* ✅ New section added here */}
      <GalleryShowcase />
      <ContactUs />
      <BottomWave />
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />
      <Footer />



      {/* Skykode Credit */}
<div className="bg-[#0a1524] text-center text-xs text-gray-500 py-3 border-t border-gray-700">
  Designed by <span className="text-blue-400 font-medium">Skykode</span>
</div>

      <a
        href="https://wa.me/2348167332529"
        className="fixed bottom-5 right-5 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg z-[40]"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with us on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.52 3.48A11.77 11.77 0 0 0 2.05 19.27L.03 24l4.93-2a11.73 11.73 0 0 0 5.62 1.42h.06a11.75 11.75 0 0 0 11.76-11.77 11.62 11.62 0 0 0-1.88-6.17ZM12.6 20.3a9.44 9.44 0 0 1-4.79-1.29l-.34-.2-2.92 1.17.56-3.01-.2-.32a9.5 9.5 0 0 1 15.15-10.64 9.5 9.5 0 0 1-7.46 14.3ZM17 14.27c-.29-.14-1.7-.83-1.96-.92s-.45-.14-.63.14-.72.92-.88 1.11-.33.21-.62.07a7.73 7.73 0 0 1-2.27-1.41 8.58 8.58 0 0 1-1.58-2c-.17-.28 0-.43.13-.57.13-.13.29-.33.43-.49s.19-.28.29-.46a.51.51 0 0 0-.02-.49c-.07-.14-.63-1.52-.87-2.09-.23-.56-.46-.49-.63-.5l-.53-.01a1 1 0 0 0-.72.33 3 3 0 0 0-.93 2.23 5.26 5.26 0 0 0 1.1 2.75 12.09 12.09 0 0 0 4.66 4 15.26 15.26 0 0 0 1.55.57 3.73 3.73 0 0 0 1.7.11c.52-.08 1.7-.7 1.94-1.38s.24-1.26.17-1.38-.26-.21-.55-.35Z" />
        </svg>
      </a>
    </>
  );
}

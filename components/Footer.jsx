// components/Footer.jsx
import { FaFacebookF, FaInstagram, FaTwitter, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#0c1a2b] text-gray-300 pt-14 pb-6 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

        {/* Hotel Name / Logo */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Awrab Hotel</h3>
          <p className="text-sm">Where luxury meets comfort. We deliver premium hospitality experiences in the heart of the city.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#rooms" className="hover:text-white">Rooms</a></li>
            <li><a href="#features" className="hover:text-white">Amenities</a></li>
            <li><a href="/contact" className="hover:text-white">Contact Us</a></li>
            <li><a href="#" className="hover:text-white">Book Now</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Contact</h4>
          <ul className="text-sm space-y-2">
            <li>📍 123 Awrab Crescent, Luton, UK</li>
            <li>📞 +44 1234 567 890</li>
            <li>✉️ reservations@awrabhotel.com</li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Connect</h4>
          <div className="flex gap-4 text-xl">
            <a href="#" className="hover:text-blue-500"><FaFacebookF /></a>
            <a href="#" className="hover:text-pink-400"><FaInstagram /></a>
            <a href="#" className="hover:text-sky-400"><FaTwitter /></a>
            <a href="https://wa.me/441234567890" target="_blank" rel="noreferrer" className="hover:text-green-400"><FaWhatsapp /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

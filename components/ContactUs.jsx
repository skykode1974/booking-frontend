// components/ContactUs.jsx
export default function ContactUs() {
  return (
    <section
      className="py-16 px-4 transition-all"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* LEFT SIDE */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p style={{ color: "var(--muted)" }}>
            Have questions or want to make a booking? We're here to help.
          </p>

          <div className="space-y-3 text-sm" style={{ color: "var(--muted)" }}>
            <p><strong>📍 Address:</strong> Rabiat Ibilola Ajeigbe Street,
Olorunshogo, off Ojoku Road, Lamodi area, Offa, Kwara state.</p>
            <p><strong>📞 Phone:</strong> +2349161693006</p>

            <p className="flex items-center gap-2 text-sm">
              <span className="text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.52 3.48A11.77 11.77 0 0 0 2.05 19.27L.03 24l4.93-2a11.73 11.73 0 0 0 5.62 1.42h.06a11.75 11.75 0 0 0 11.76-11.77 11.62 11.62 0 0 0-1.88-6.17Z" />
                  <path d="M12.6 20.3a9.44 9.44 0 0 1-4.79-1.29l-.34-.2-2.92 1.17.56-3.01-.2-.32a9.5 9.5 0 0 1 15.15-10.64 9.5 9.5 0 0 1-7.46 14.3Z" />
                </svg>
              </span>
              <a href="https://wa.me/2349161693006" target="_blank" rel="noopener noreferrer" className="hover:underline">
                +44 1234 567 890
              </a>
            </p>

            <p><strong>✉️ Email:</strong> reservations@awrabhotel.com</p>
            <p><strong>🕒 Hours:</strong> Mon–Sun, 24/7</p>
          </div>

          <div className="w-full h-64 rounded-lg overflow-hidden border-2 border-blue-600">
           <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
  <iframe
    title="Awrab Suites Hotel Map"
    src="https://www.google.com/maps?q=Rabiat%20Ibilola%20Ajeigbe%20Street%2C%20Olorunshogo%2C%20off%20Ojoku%20Road%2C%20Lamodi%20area%2C%20Offa%2C%20Kwara%20State%2C%20Nigeria&z=16&output=embed"
    className="absolute inset-0 h-full w-full rounded-lg"
    loading="lazy"
    allowFullScreen
    referrerPolicy="no-referrer-when-downgrade"
    style={{ border: 0 }}
  />
</div>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <form
          className="space-y-6 p-6 rounded-lg shadow-lg"
          style={{ backgroundColor: "var(--foreground)", color: "var(--background)" }}
        >
          <h3 className="text-2xl font-semibold mb-2">Send a Message</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Your Name"
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
                borderColor: "var(--foreground)"
              }}
            />
            <input
              type="email"
              placeholder="Your Email"
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
                borderColor: "var(--foreground)"
              }}
            />
          </div>

          <input
            type="text"
            placeholder="Subject"
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
              borderColor: "var(--foreground)"
            }}
          />

          <textarea
            placeholder="Your Message"
            rows="5"
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
              borderColor: "var(--foreground)"
            }}
          ></textarea>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-md text-white font-semibold transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}

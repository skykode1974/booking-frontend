// pages/_app.js or app/layout.js (depending on setup)
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

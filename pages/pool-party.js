// pages/pool-party.js
import Head from "next/head";
import AnimatedNavbar from "@/components/AnimatedNavbar";  // 👈 add
import Footer from "@/components/Footer";                  // 👈 (optional, if you have it)
import PoolParty from "@/components/PoolParty";

export default function PoolPartyPage() {
  return (
    <>
      <Head>
        <title>Pool Party • Awrab Suite Hotel</title>
        <meta name="description" content="Join our weekly Pool Party: music, cabanas, VIP, kids zone and more at Awrab Suite Hotel." />
        <meta property="og:title" content="Pool Party • Awrab Suite Hotel" />
        <meta property="og:description" content="Tickets for Adult, Child, VIP • Every Saturday 3–9 PM • Book now" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://awrabsuiteshotel.com.ng/pool-party" />
        <meta property="og:image" content="https://awrabsuiteshotel.com.ng/poolparty/hero1.jpg" />
      </Head>

      <AnimatedNavbar active="Pool Party" />   {/* 👈 navbar shows on this page */}
      <PoolParty />
      <Footer />                                {/* 👈 optional footer */}
    </>
  );
}

import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

export default function ParticlesBookingModal() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles-booking"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: 0 },
        particles: {
          number: { value: 0 },
        },
        interactivity: {
          events: { onHover: { enable: false } },
        },
        emitters: {
          direction: "top-right",
          rate: { delay: 0.3, quantity: 1 },
          size: { width: 0, height: 0 },
          position: { x: 50, y: 100 },
          particles: {
            move: { speed: 20, outModes: { default: "destroy" } },
            life: { duration: { sync: true, value: 5 }, count: 1 },
            size: { value: 20 },
            shape: { type: "text", options: { text: { value: ["Book Room", "Book Hall", "Reserve", "🛏", "🏢"] } } },
            color: { value: ["#00ffcc", "#66ff66", "#ffff00", "#00ccff"] },
          },
        },
      }}
    />
  );
}

import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim"; // ✅ Now this works

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: false },
        particles: {
          number: { value: 50 },
          color: { value: ["#ff4d4d", "#4dff4d", "#4d4dff", "#ffff4d"] },
          shape: { type: "char", character: { value: ["Gym", "Pool",  "Ladies Night",  "💃", "Cinema", "🎉", "Gym",  "🏋️‍♂️",  "🏊", "🎨"], font: "Verdana", style: "", weight: "400", fill: true } },
          size: { value: 20, random: true, anim: { enable: true, speed: 4 } },
          move: { enable: true, speed: 2, out_mode: "out" },
        },
      }}
    />
  );
}

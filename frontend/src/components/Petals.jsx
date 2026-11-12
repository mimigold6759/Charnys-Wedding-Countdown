import { useMemo } from "react";

const PETAL_SVG = (size, hue) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 2C7.5 6 5 10.5 5 14.5 5 19 8 22 12 22s7-3 7-7.5C19 10.5 16.5 6 12 2Z"
      fill={hue}
      fillOpacity="0.85"
    />
    <path
      d="M12 4c-2.6 3.2-4.2 6.7-4.2 10"
      stroke="#fff"
      strokeOpacity="0.35"
      strokeWidth="0.7"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const HUES = ["#E8B4B8", "#E3A0A8", "#EFC6CB", "#D98E99", "#F0D3D5"];

export const Petals = ({ count = 16 }) => {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const rand = (min, max) => min + Math.random() * (max - min);
        return {
          id: i,
          left: rand(0, 96),
          size: rand(12, 26),
          duration: rand(11, 22),
          delay: rand(-22, 0),
          drift: rand(-10, 12).toFixed(1) + "vw",
          spin: rand(180, 560).toFixed(0) + "deg",
          opacity: rand(0.4, 0.8).toFixed(2),
          hue: HUES[i % HUES.length],
        };
      }),
    [count]
  );

  return (
    <div aria-hidden="true" data-testid="floating-petals" className="fixed inset-0 z-[5] pointer-events-none overflow-hidden">
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={{
            left: `${p.left}%`,
            "--petal-duration": `${p.duration}s`,
            "--petal-delay": `${p.delay}s`,
            "--petal-drift": p.drift,
            "--petal-spin": p.spin,
            "--petal-opacity": p.opacity,
          }}
        >
          {PETAL_SVG(p.size, p.hue)}
        </span>
      ))}
    </div>
  );
};

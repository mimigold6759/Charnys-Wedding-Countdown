import { useEffect, useState } from "react";

const pad = (n) => String(n).padStart(2, "0");

const Unit = ({ value, label, testid }) => (
  <div className="flex flex-col items-center gap-2 sm:gap-4" data-testid={testid}>
    <div className="relative">
      <span
        key={value}
        className="digit-tick font-mono-digits font-light text-4xl sm:text-6xl md:text-7xl tracking-tight text-[#FAF7F2]"
      >
        {pad(value)}
      </span>
    </div>
    <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-sans font-medium text-[#FAF7F2]/60">
      {label}
    </span>
  </div>
);

const Sep = () => (
  <span className="font-serif-display font-light text-3xl sm:text-5xl md:text-6xl text-[#D4AF37]/70 pb-6 sm:pb-8 select-none">
    ·
  </span>
);

export const Countdown = ({ target }) => {
  const calc = () => {
    const diff = Math.max(0, new Date(target).getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor(diff / 3600000) % 24,
      minutes: Math.floor(diff / 60000) % 60,
      seconds: Math.floor(diff / 1000) % 60,
      done: diff === 0,
    };
  };
  const [t, setT] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  if (t.done) {
    return (
      <div data-testid="wedding-countdown-timer" className="text-center">
        <p className="font-serif-display italic text-4xl sm:text-6xl text-[#FAF7F2]">
          The day has arrived
        </p>
      </div>
    );
  }

  return (
    <div data-testid="wedding-countdown-timer" className="flex items-start justify-center gap-3 sm:gap-6 md:gap-8">
      <Unit value={t.days} label="Days" testid="countdown-days" />
      <Sep />
      <Unit value={t.hours} label="Hours" testid="countdown-hours" />
      <Sep />
      <Unit value={t.minutes} label="Minutes" testid="countdown-minutes" />
      <Sep />
      <Unit value={t.seconds} label="Seconds" testid="countdown-seconds" />
    </div>
  );
};

import { useEffect, useState } from "react";
import { Countdown } from "./Countdown";

const HERO_IMG =
  "https://images.unsplash.com/photo-1640901646021-74984db23c54?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHw0fHxsaWdodCUyMHBpbmslMjBmbG93ZXJzJTIwc2VhbWxlc3MlMjBwYXR0ZXJuJTIwd2FsbHBhcGVyJTIwcGFzdGVsJTIwcGVvbmllcyUyMHJvc2VzfGVufDB8fHx8MTc5NDQ1ODMxNHww&ixlib=rb-4.1.0&q=85";

export const Hero = ({ config, onGuestbookClick }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const parallax = Math.min(scrollY * 0.35, 300);

  return (
    <header className="relative min-h-screen flex flex-col overflow-hidden" data-testid="hero-section">
      <div
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${parallax}px) scale(1.12)` }}
      >
        <img src={HERO_IMG} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFF5F8]/60 via-[#FFF9FB]/40 to-[#FFF9FB]/95" />
      </div>

      <nav
        data-testid="main-nav"
        className="relative z-10 flex items-center justify-between px-5 sm:px-10 pt-6"
      >
        <span className="font-serif-display text-2xl sm:text-3xl text-[#7A2E4B] tracking-tight">
          E<span className="text-[#D87093] italic">&</span>L
        </span>
        <button
          data-testid="nav-guestbook-link"
          onClick={onGuestbookClick}
          className="text-xs sm:text-sm uppercase tracking-[0.25em] text-[#7A2E4B]/70 hover:text-[#D87093] transition-colors duration-300"
        >
          Guestbook
        </button>
      </nav>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 gap-8 sm:gap-12 py-16">
        <p
          className="reveal-line text-xs sm:text-sm uppercase tracking-[0.4em] text-[#D87093] font-sans font-semibold"
          style={{ animationDelay: "0.15s" }}
        >
          {config.dateLabel} — {config.venue}
        </p>

        <h1 className="font-serif-display text-[#3B1E28] leading-[1.02]">
          <span
            className="reveal-line block text-5xl sm:text-7xl md:text-8xl font-medium tracking-tight drop-shadow-[0_2px_12px_rgba(255,255,255,0.8)]"
            style={{ animationDelay: "0.45s" }}
          >
            {config.bride}
          </span>
          <span
            className="reveal-line block text-3xl sm:text-5xl md:text-6xl italic font-light text-[#D87093] my-1 sm:my-3"
            style={{ animationDelay: "0.75s" }}
          >
            &
          </span>
          <span
            className="reveal-line block text-5xl sm:text-7xl md:text-8xl font-medium tracking-tight drop-shadow-[0_2px_12px_rgba(255,255,255,0.8)]"
            style={{ animationDelay: "1.05s" }}
          >
            {config.groom}
          </span>
        </h1>

        <div className="reveal-line" style={{ animationDelay: "1.5s" }}>
          <Countdown target={config.targetDate} />
        </div>

        <p
          className="reveal-line font-serif-display italic text-lg sm:text-2xl text-[#7A2E4B]/80"
          style={{ animationDelay: "1.8s" }}
        >
          until forever begins
        </p>
      </div>

      <div
        className="reveal-line relative z-10 pb-10 flex justify-center"
        style={{ animationDelay: "2.1s" }}
      >
        <button
          data-testid="hero-guestbook-button"
          onClick={onGuestbookClick}
          className="group rounded-full border border-[#7A2E4B]/30 bg-white/60 backdrop-blur-sm px-8 py-3.5 text-xs sm:text-sm uppercase tracking-[0.25em] text-[#7A2E4B] transition-all duration-500 hover:bg-[#D87093] hover:text-white hover:border-[#D87093]"
        >
          Leave a wish
          <span className="inline-block ml-2 transition-transform duration-500 group-hover:translate-y-1">↓</span>
        </button>
      </div>
    </header>
  );
};

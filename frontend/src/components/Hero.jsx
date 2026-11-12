import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Countdown } from "./Countdown";

const HERO_IMG =
  "https://images.unsplash.com/photo-1640901646021-74984db23c54?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHw0fHxsaWdodCUyMHBpbmslMjBmbG93ZXJzJTIwc2VhbWxlc3MlMjBwYXR0ZXJuJTIwd2FsbHBhcGVyJTIwcGFzdGVsJTIwcGVvbmllcyUyMHJvc2VzfGVufDB8fHx8MTc5NDQ1ODMxNHww&ixlib=rb-4.1.0&q=85";

const Details = ({ config }) => {
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(config.venueAddress);
      toast.success("Address copied");
    } catch {
      toast.error("Could not copy — long-press to copy instead");
    }
  };

  return (
    <div
      data-testid="hero-details"
      className="grid sm:grid-cols-2 gap-10 sm:gap-14 text-left max-w-3xl mx-auto"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-[#D87093] font-sans font-semibold mb-4">
          The Day
        </p>
        <p className="font-serif-display text-3xl sm:text-4xl text-[#3B1E28]">Sunday</p>
        <p className="font-serif-display text-3xl sm:text-4xl text-[#3B1E28]">
          24 <span className="font-light">January</span>
        </p>
        <p className="font-serif-display text-2xl sm:text-3xl text-[#3B1E28]/80 mt-1">2027</p>
      </div>

      <div className="sm:border-l sm:border-[#7A2E4B]/15 sm:pl-14">
        <p className="text-xs uppercase tracking-[0.35em] text-[#D87093] font-sans font-semibold mb-4">
          The Venue
        </p>
        <p className="font-serif-display text-3xl sm:text-4xl text-[#3B1E28]">
          {config.venueName}
        </p>
        <p className="mt-2 text-sm sm:text-base text-[#3B1E28]/70">{config.venueAddress}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <a
            data-testid="hero-maps-link"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${config.venueName} ${config.venueAddress}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-[0.25em] text-[#7A2E4B] underline underline-offset-8 decoration-[#D87093]/60 hover:text-[#D87093] transition-colors duration-300"
          >
            Open in maps
          </a>
          <button
            data-testid="hero-copy-address"
            onClick={copyAddress}
            className="inline-flex items-center gap-2 rounded-full border border-[#7A2E4B]/30 bg-white/60 backdrop-blur-sm px-5 py-2 text-xs uppercase tracking-[0.25em] text-[#7A2E4B] transition-all duration-300 hover:bg-[#D87093] hover:text-white hover:border-[#D87093]"
          >
            <Copy size={13} /> Copy address
          </button>
        </div>
      </div>
    </div>
  );
};

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
          YD<span className="text-[#D87093] italic">&</span>C
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
        <h1 className="font-serif-display text-[#3B1E28] leading-[1.02]">
          <span
            data-testid="save-the-date-bubble"
            className="reveal-line inline-block rounded-full border border-[#E89FAD]/40 bg-white/60 backdrop-blur-sm px-6 py-2 text-xs sm:text-sm uppercase tracking-[0.35em] font-sans font-semibold text-[#C75B80] shadow-[0_4px_20px_rgba(216,112,147,0.18)] mb-5 sm:mb-7"
            style={{ animationDelay: "0.15s" }}
          >
            Save the date!
          </span>
          <span
            className="reveal-line block font-script text-8xl sm:text-9xl md:text-[10rem] text-[#4A1229] drop-shadow-[0_4px_14px_rgba(120,120,130,0.55)]"
            style={{ animationDelay: "0.3s" }}
          >
            {config.bride}
          </span>
          <span
            className="reveal-line block text-xl sm:text-2xl md:text-3xl italic font-light text-[#7A2E4B] mt-4 sm:mt-6"
            style={{
              animationDelay: "0.7s",
              letterSpacing: "0.55em",
              marginRight: "-0.55em",
            }}
          >
            {config.tagline}
          </span>
        </h1>

        <div className="reveal-line" style={{ animationDelay: "1.1s" }}>
          <Countdown target={config.targetDate} />
        </div>

        <p
          className="reveal-line font-serif-display italic text-2xl sm:text-3xl text-[#7A2E4B]"
          style={{ animationDelay: "1.4s" }}
        >
          {config.danceLine}
        </p>

        <div className="reveal-line w-full" style={{ animationDelay: "1.7s" }}>
          <Details config={config} />
        </div>
      </div>

      <div
        className="reveal-line relative z-10 pb-10 flex justify-center"
        style={{ animationDelay: "2s" }}
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

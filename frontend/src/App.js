import { useEffect, useRef } from "react";
import "@/App.css";
import { Toaster } from "sonner";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Petals } from "@/components/Petals";
import { Guestbook } from "@/components/Guestbook";

const WEDDING = {
  bride: "Charny",
  tagline: "is getting married!!",
  dateLabel: "January 24, 2027",
  venue: "Rosewood Hall, Napa Valley",
  targetDate: "2027-01-24T16:00:00",
};

function App() {
  const guestbookRef = useRef(null);

  const scrollToGuestbook = () => {
    guestbookRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="grain floral-page min-h-screen" data-testid="evermore-app">
      <Petals count={16} />
      <Hero config={WEDDING} onGuestbookClick={scrollToGuestbook} />
      {/* hero now shows: Charny / is getting married!! */}

      <Marquee items={["Charny is getting married!!", "January 24, 2027"]} />

      <Guestbook ref={guestbookRef} />

      <Marquee items={["two hearts", "one promise", "a lifetime to go"]} />

      <footer data-testid="site-footer" className="relative bg-[#4A1229]/95 backdrop-blur-sm text-[#FFF9FB] px-4 sm:px-8 py-16 sm:py-24 text-center">
        <p className="font-serif-display text-4xl sm:text-6xl tracking-tight mb-4">
          {WEDDING.bride} <span className="italic text-[#E89FAD] text-2xl sm:text-4xl">{WEDDING.tagline}</span>
        </p>
        <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-[#FFF9FB]/60">
          {WEDDING.dateLabel} — {WEDDING.venue}
        </p>
        <p className="mt-10 font-serif-display italic text-lg text-[#FFF9FB]/50">
          evermore
        </p>
      </footer>

      <Toaster position="bottom-center" richColors />
    </div>
  );
}

export default App;

import { useEffect, useRef, useState } from "react";
import "@/App.css";
import { Toaster } from "sonner";
import { Heart } from "lucide-react";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Petals } from "@/components/Petals";
import { Guestbook, AdminSignIn } from "@/components/Guestbook";
import { PhotoGallery } from "@/components/PhotoGallery";
import { MusicPlayer } from "@/components/MusicPlayer";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

const DEFAULT_SONGS = [
  { id: "static-1", src: "/song.mp3", title: "Song 1", isStatic: true },
  { id: "static-2", src: "/song1.mp3", title: "Song 2", isStatic: true },
];

const WEDDING = {
  bride: "Charny",
  tagline: "is getting married!!",
  danceLine: "Can't wait to dance together!!",
  dateLabel: "January 24, 2027",
  venueName: "Tiferes Elka",
  venueAddress: "2 School Terrace, Monsey, New York 10977",
  ceremonyTime: "4:30 PM",
  targetDate: "2027-01-24T16:30:00",
};

function App() {
  const guestbookRef = useRef(null);
  const [songs, setSongs] = useState(DEFAULT_SONGS);

  useEffect(() => {
    const loadSongs = async () => {
      try {
        const q = query(collection(db, "songs"), orderBy("created_at", "asc"));
        const snap = await getDocs(q);
        const customSongs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSongs([...DEFAULT_SONGS, ...customSongs]);
      } catch {}
    };
    loadSongs();
  }, []);

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
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
    );
    document.querySelectorAll(".reveal-on-scroll").forEach((el) => observer.observe(el));
    const fallback = setTimeout(() => {
      document.querySelectorAll(".reveal-on-scroll").forEach((el) => el.classList.add("is-visible"));
    }, 1200);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div className="grain floral-page min-h-screen relative" data-testid="evermore-app">
      <Petals count={16} />
      <Hero config={WEDDING} onGuestbookClick={scrollToGuestbook} />

      <Marquee items={["Charny is getting married!!", "January 24, 2027"]} />

      <div className="relative z-10">
        <Guestbook ref={guestbookRef} />

        <PhotoGallery />

        <div className="flex justify-center pt-2 pb-10">
          <MusicPlayer playlist={songs} />
        </div>

        <AdminSignIn songs={songs} onSongsChange={setSongs} />
      </div>

      <Marquee items={["Charny is getting married!!", "January 24, 2027"]} />

      <footer data-testid="site-footer" className="relative z-10 bg-[#4A1229] text-[#FFF9FB] px-4 sm:px-8 py-16 sm:py-24 text-center border-t-0">
        <p className="font-script text-4xl sm:text-6xl text-[#FFF9FB] drop-shadow-[0_4px_14px_rgba(120,120,130,0.35)] mb-4">
          Yaakov Duvid <span className="text-[#E89FAD]">&</span> Charny
        </p>
        <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-[#FFF9FB]/60">
          {WEDDING.dateLabel}
        </p>
        <p className="mt-10 font-serif-display italic text-lg text-[#FFF9FB]/50">
          made with love for Charny <Heart size={13} className="inline-block -mt-1 text-[#E89FAD]" fill="#E89FAD" strokeWidth={0} />
        </p>
      </footer>

      <Toaster position="bottom-center" richColors />
    </div>
  );
}

export default App;
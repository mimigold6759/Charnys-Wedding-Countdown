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
import { SongManager } from "@/components/SongManager";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
  const [songs, setSongs] = useState([]);
  const [adminPassword, setAdminPassword] = useState("");

  useEffect(() => {
    axios
      .get(`${API}/songs`)
      .then((res) => setSongs(res.data.songs || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onAdminOn = (e) => setAdminPassword(e.detail);
    const onAdminOff = () => setAdminPassword("");
    window.addEventListener("evermore:admin-on", onAdminOn);
    window.addEventListener("evermore:admin-off", onAdminOff);
    return () => {
      window.removeEventListener("evermore:admin-on", onAdminOn);
      window.removeEventListener("evermore:admin-off", onAdminOff);
    };
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
      {/* hero now shows: Charny / is getting married!! */}

      <Marquee items={["Charny is getting married!!", "January 24, 2027"]} />

      <div className="relative z-10">
        <Guestbook ref={guestbookRef} />

        <PhotoGallery />

        {songs.length > 0 ? (
          <div className="flex justify-center pt-2 pb-10">
            <MusicPlayer playlist={songs} />
          </div>
        ) : null}

        <AdminSignIn onAdminChange={setAdminPassword} adminPassword={adminPassword} songs={songs} onSongsChange={setSongs} />
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

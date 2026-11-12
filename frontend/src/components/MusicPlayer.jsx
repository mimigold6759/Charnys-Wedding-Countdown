import { useEffect, useRef, useState } from "react";
import { Music, Pause } from "lucide-react";

export const MusicPlayer = ({ src, title, artist }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onReady = () => setAvailable(true);
    const onError = () => setAvailable(false);
    audio.addEventListener("canplaythrough", onReady);
    audio.addEventListener("error", onError);
    audio.load();
    return () => {
      audio.removeEventListener("canplaythrough", onReady);
      audio.removeEventListener("error", onError);
    };
  }, [src]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => setAvailable(false));
    }
  };

  if (!src) return null;

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" />
      <button
        data-testid="music-player-toggle"
        onClick={toggle}
        disabled={!available}
        aria-label={playing ? "Pause music" : "Play music"}
        className="fixed bottom-6 left-6 z-[80] flex items-center gap-3 rounded-full border border-[#E89FAD]/40 bg-white/85 backdrop-blur-md pl-3 pr-5 py-3 shadow-[0_8px_30px_rgba(216,112,147,0.3)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(216,112,147,0.45)] hover:-translate-y-0.5 disabled:opacity-40"
      >
        <span
          className={`flex items-center justify-center w-9 h-9 rounded-full bg-[#D87093] text-white transition-transform duration-300 ${
            playing ? "animate-pulse" : ""
          }`}
        >
          {playing ? <Pause size={16} /> : <Music size={16} />}
        </span>
        <span className="text-left leading-tight">
          <span className="block text-[10px] uppercase tracking-[0.25em] text-[#7A5965]">
            {playing ? "Now playing" : "Play our song"}
          </span>
          <span className="block font-serif-display italic text-sm text-[#7A2E4B]">
            {title}
            {artist ? ` — ${artist}` : ""}
          </span>
        </span>
      </button>
    </>
  );
};

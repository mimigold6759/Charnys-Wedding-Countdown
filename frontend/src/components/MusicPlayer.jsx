import { useEffect, useRef, useState } from "react";
import { Music, Pause } from "lucide-react";

export const MusicPlayer = ({ playlist }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [available, setAvailable] = useState(false);

  const current = playlist[trackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onReady = () => setAvailable(true);
    const onError = () => setAvailable(false);
    const onEnded = () => setTrackIndex((i) => (i + 1) % playlist.length);
    audio.addEventListener("canplaythrough", onReady);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("canplaythrough", onReady);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
    };
  }, [playlist.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    if (playing) audio.play().catch(() => {});
  }, [trackIndex]); // eslint-disable-line react-hooks/exhaustive-deps

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

  return (
    <>
      <audio ref={audioRef} preload="auto">
        <source src={current.src} type="audio/mpeg" />
      </audio>
      <button
        data-testid="music-player-toggle"
        onClick={toggle}
        disabled={!available}
        aria-label={playing ? "Pause music" : "Play music"}
        className="flex items-center gap-3 rounded-full border border-[#E89FAD]/40 bg-white/85 backdrop-blur-md pl-3 pr-5 py-3 shadow-[0_8px_30px_rgba(216,112,147,0.3)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(216,112,147,0.45)] hover:-translate-y-0.5 disabled:opacity-40"
      >
        <span
          className={`flex items-center justify-center w-9 h-9 rounded-full bg-[#D87093] text-white transition-transform duration-300 ${
            playing ? "animate-pulse" : ""
          }`}
        >
          {playing ? <Pause size={16} /> : <Music size={16} />}
        </span>
        <span className="text-left leading-tight">
          <span className="block font-serif-display italic text-sm text-[#7A2E4B]">
            {playing ? "Now playing" : "Play our songs"}
          </span>
        </span>
      </button>
    </>
  );
};

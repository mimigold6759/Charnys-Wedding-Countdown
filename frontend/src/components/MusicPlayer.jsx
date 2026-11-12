import { useEffect, useRef, useState } from "react";
import { Music, Pause } from "lucide-react";

const STATIC_PLAYLIST = [
  { src: "/song.mp3", title: "Our Song" }
];

export const MusicPlayer = ({ playlist }) => {
  const activePlaylist = playlist && playlist.length > 0 ? playlist : STATIC_PLAYLIST;
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);

  const current = activePlaylist[trackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => setTrackIndex((i) => (i + 1) % activePlaylist.length);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("ended", onEnded);
    };
  }, [activePlaylist.length, trackIndex]);

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
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  if (!current) return null;

  return (
    <>
      <audio ref={audioRef} preload="auto">
        <source src="/song.mp3" type="audio/mpeg" />
      </audio>
      <button
        data-testid="music-player-toggle"
        onClick={toggle}
        aria-label={playing ? "Pause music" : "Play music"}
        className="flex items-center gap-3 rounded-full border border-[#E89FAD]/40 bg-white/85 backdrop-blur-md pl-3 pr-5 py-3 shadow-[0_8px_30px_rgba(216,112,147,0.3)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(216,112,147,0.45)] hover:-translate-y-0.5"
      >
        <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#D87093] text-white transition-transform duration-300">
          {playing ? <Pause size={16} /> : <Music size={16} />}
        </span>
        <span className="text-left leading-tight">
          <span className="block font-serif-display italic text-sm text-[#7A2E4B]">
            {playing ? "Now playing" : "Press Play"}
          </span>
        </span>
      </button>
    </>
  );
};
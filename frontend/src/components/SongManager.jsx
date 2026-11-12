import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Music, Trash2, Upload } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const SongManager = ({ password, songs, onSongsChange }) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const pickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Song must be under 25MB");
      return;
    }
    upload(file);
  };

  const upload = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("password", password);
      fd.append("title", file.name.replace(/\.[^.]+$/, ""));
      fd.append("song", file);
      const res = await axios.post(`${API}/songs`, fd);
      onSongsChange(res.data.songs);
      toast.success("Song added");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (songId) => {
    try {
      const res = await axios.delete(`${API}/songs/${songId}`, { data: { password } });
      onSongsChange(res.data.songs);
      toast.success("Song removed");
    } catch {
      toast.error("Could not remove song");
    }
  };

  return (
    <div data-testid="song-manager" className="mt-6 mx-auto max-w-md bg-white/80 backdrop-blur-md border border-[#E89FAD]/30 rounded-lg p-5">
      <p className="text-xs uppercase tracking-[0.25em] font-semibold text-[#7A2E4B]/70 mb-4 flex items-center justify-center gap-2">
        <Music size={13} /> Playlist
      </p>

      <input ref={fileRef} data-testid="song-upload-input" type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/m4a" onChange={pickFile} className="hidden" />
      <button
        data-testid="song-upload-button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-full rounded-full border border-[#7A2E4B]/30 bg-white/70 px-5 py-2.5 text-xs uppercase tracking-[0.25em] text-[#7A2E4B] transition-all duration-300 hover:bg-[#D87093] hover:text-white hover:border-[#D87093] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Upload size={13} /> {uploading ? "Uploading…" : "Add a song"}
      </button>

      <ul className="mt-4 space-y-2 text-left">
        {songs.length === 0 && (
          <li className="text-sm text-[#7A5965] italic text-center py-2">No songs yet</li>
        )}
        {songs.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 bg-white/70 border border-[#E89FAD]/20 rounded-md px-4 py-2.5">
            <span className="font-serif-display italic text-sm text-[#3B1E28] truncate">{s.title}</span>
            <button
              data-testid={`song-delete-${s.id}`}
              onClick={() => remove(s.id)}
              className="text-[#C75B80] hover:text-[#7A2E4B] transition-colors shrink-0"
              aria-label={`Remove ${s.title}`}
            >
              <Trash2 size={15} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

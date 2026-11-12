import { useRef, useState } from "react";
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "sonner";
import { Music, Trash2, Upload, Link as LinkIcon } from "lucide-react";

export const SongManager = ({ songs, onSongsChange }) => {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const fileRef = useRef(null);

  const pickFile = (e) => {
    const files = e.target.files;
    const file = files && files.length > 0 ? files[0] : null;
    if (!file) return;
    if (file.size > 700 * 1024) {
      toast.error("File uploads must be under 700KB on the free plan — use 'Add by URL' for full songs!");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    uploadFile(file);
  };

  const uploadFile = (file) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const songTitle = file.name.replace(/\.[^.]+$/, "");
        const newSong = {
          title: songTitle,
          src: reader.result,
          created_at: new Date().toISOString(),
        };
        const docRef = await addDoc(collection(db, "songs"), newSong);
        onSongsChange([...songs, { id: docRef.id, ...newSong }]);
        toast.success("Song added");
      } catch {
        toast.error("Could not save song");
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    };
    reader.onerror = () => {
      toast.error("Could not read audio file");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const addByUrl = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      toast.error("Please enter a song name and MP3 link");
      return;
    }
    setUploading(true);
    try {
      const newSong = {
        title: title.trim(),
        src: url.trim(),
        created_at: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, "songs"), newSong);
      onSongsChange([...songs, { id: docRef.id, ...newSong }]);
      setTitle("");
      setUrl("");
      setShowUrlInput(false);
      toast.success("Song added");
    } catch {
      toast.error("Could not add song");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (song) => {
    if (song.isStatic) {
      onSongsChange(songs.filter((s) => s.id !== song.id));
      toast.success("Removed from active session (delete from GitHub public folder to remove permanently)");
      return;
    }
    try {
      await deleteDoc(doc(db, "songs", song.id));
      onSongsChange(songs.filter((s) => s.id !== song.id));
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
      <div className="flex gap-2">
        <button
          data-testid="song-upload-button"
          onClick={() => fileRef.current && fileRef.current.click()}
          disabled={uploading}
          className="flex-1 rounded-full border border-[#7A2E4B]/30 bg-white/70 px-4 py-2.5 text-xs uppercase tracking-[0.2em] text-[#7A2E4B] transition-all duration-300 hover:bg-[#D87093] hover:text-white hover:border-[#D87093] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Upload size={13} /> {uploading ? "Saving…" : "Upload (<700KB)"}
        </button>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="flex-1 rounded-full border border-[#7A2E4B]/30 bg-white/70 px-4 py-2.5 text-xs uppercase tracking-[0.2em] text-[#7A2E4B] transition-all duration-300 hover:bg-[#D87093] hover:text-white hover:border-[#D87093] flex items-center justify-center gap-2"
        >
          <LinkIcon size={13} /> Add by URL
        </button>
      </div>

      {showUrlInput && (
        <form onSubmit={addByUrl} className="mt-3 space-y-2 text-left bg-white/80 p-3 rounded-md border border-[#E89FAD]/25">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Song title (e.g. Siman Tov)"
            className="w-full bg-transparent border-b border-[#E89FAD]/40 outline-none py-1.5 text-sm text-[#3B1E28]"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Direct .mp3 link (https://...)"
            className="w-full bg-transparent border-b border-[#E89FAD]/40 outline-none py-1.5 text-sm text-[#3B1E28]"
          />
          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded-full bg-[#7A2E4B] py-2 text-xs uppercase tracking-[0.2em] text-white hover:bg-[#C75B80] transition-colors"
          >
            Save Song Link
          </button>
        </form>
      )}

      <ul className="mt-4 space-y-2 text-left">
        {songs.length === 0 && (
          <li className="text-sm text-[#7A5965] italic text-center py-2">No songs yet</li>
        )}
        {songs.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 bg-white/70 border border-[#E89FAD]/20 rounded-md px-4 py-2.5">
            <span className="font-serif-display italic text-sm text-[#3B1E28] truncate">{s.title}</span>
            <button
              data-testid={`song-delete-${s.id}`}
              onClick={() => remove(s)}
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
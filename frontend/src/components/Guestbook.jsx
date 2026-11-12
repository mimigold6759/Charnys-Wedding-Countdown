import { forwardRef, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Lock, Trash2 } from "lucide-react";
import { GuestbookForm } from "./GuestbookForm";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const WishCard = ({ entry, adminMode, onDelete }) => {
  const date = new Date(entry.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <article
      data-testid="guestbook-wish-card"
      className="group relative bg-white border border-[#4A1525]/15 shadow-sm p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {entry.photo_path && (
        <img
          data-testid="guestbook-wish-photo"
          src={`${API}/photos/${entry.photo_path}`}
          alt={`from ${entry.name}`}
          loading="lazy"
          className="w-full object-cover mb-4 border border-[#4A1525]/10"
        />
      )}
      <p className="font-serif-display text-xl sm:text-2xl leading-snug text-[#2C2627] mb-4">
        “{entry.message}”
      </p>
      <footer className="flex items-end justify-between gap-3">
        <div>
          <p className="font-serif-display italic text-lg text-[#7A3549]">— {entry.name}</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C827A] mt-1 font-mono-digits">{date}</p>
        </div>
        {adminMode && (
          <button
            data-testid="guestbook-delete-button"
            onClick={() => onDelete(entry.id)}
            className="rounded-full border border-[#4A1525]/20 p-2 text-[#7A3549] hover:bg-[#4A1525] hover:text-[#FAF7F2] transition-colors duration-300"
            aria-label={`Delete wish from ${entry.name}`}
          >
            <Trash2 size={15} />
          </button>
        )}
      </footer>
    </article>
  );
};

export const Guestbook = forwardRef(function Guestbook(_, ref) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    axios
      .get(`${API}/guestbook`)
      .then((res) => setEntries(res.data))
      .catch(() => toast.error("Could not load the guestbook"))
      .finally(() => setLoading(false));
  }, []);

  const onPosted = useCallback((entry) => {
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const tryDelete = async (id, pwd) => {
    try {
      await axios.delete(`${API}/guestbook/${id}`, { data: { password: pwd } });
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Wish removed");
      return true;
    } catch {
      toast.error("Incorrect password");
      return false;
    }
  };

  const unlockAdmin = async () => {
    try {
      await axios.delete(`${API}/guestbook/__probe__`, { data: { password } });
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("Incorrect password");
        return;
      }
      // 404 on the probe id means the password was accepted
    }
    setAdminMode(true);
    setShowAdminPrompt(false);
    toast.success("Admin mode on — delete buttons are visible");
  };

  const handleDelete = (id) => tryDelete(id, password);

  return (
    <section ref={ref} data-testid="guestbook-section" className="relative px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto py-20 sm:py-28 md:py-36">
      <div className="reveal-on-scroll text-center mb-14 sm:mb-20">
        <p className="text-xs uppercase tracking-[0.35em] font-semibold text-[#D4AF37] mb-4">The Guestbook</p>
        <h2 className="font-serif-display text-4xl sm:text-5xl md:text-6xl tracking-tight text-[#4A1525]">
          A wall of wishes
        </h2>
        <p className="mt-5 text-base sm:text-lg text-[#2C2627]/70 max-w-xl mx-auto leading-relaxed">
          Leave a few words — and a photograph, if you like — for Emma & Liam to keep forever.
        </p>
      </div>

      <div className="reveal-on-scroll mb-16 sm:mb-24">
        <GuestbookForm onPosted={onPosted} />
      </div>

      {loading ? (
        <p data-testid="guestbook-loading" className="text-center text-[#8C827A] font-serif-display italic text-xl">
          Gathering wishes…
        </p>
      ) : entries.length === 0 ? (
        <p data-testid="guestbook-empty" className="text-center font-serif-display italic text-2xl text-[#8C827A]">
          Be the first to leave a wish.
        </p>
      ) : (
        <div data-testid="guestbook-masonry-wall" className="masonry">
          {entries.map((e) => (
            <WishCard key={e.id} entry={e} adminMode={adminMode} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <div className="mt-16 text-center">
        {!adminMode && !showAdminPrompt && (
          <button
            data-testid="admin-mode-toggle"
            onClick={() => setShowAdminPrompt(true)}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#8C827A] hover:text-[#4A1525] transition-colors duration-300"
          >
            <Lock size={13} /> Couple sign-in
          </button>
        )}
        {showAdminPrompt && !adminMode && (
          <div data-testid="admin-password-form" className="inline-flex items-center gap-3 bg-white border border-[#4A1525]/15 p-3 pl-5">
            <input
              data-testid="admin-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && unlockAdmin()}
              placeholder="Couple's password"
              className="bg-transparent outline-none text-sm text-[#2C2627] placeholder:text-[#8C827A]"
            />
            <button
              data-testid="admin-unlock-button"
              onClick={unlockAdmin}
              className="rounded-full bg-[#4A1525] px-5 py-2 text-xs uppercase tracking-[0.2em] text-[#FAF7F2] hover:bg-[#7A3549] transition-colors"
            >
              Unlock
            </button>
          </div>
        )}
        {adminMode && (
          <p data-testid="admin-mode-active" className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
            Admin mode — hover a wish to remove it
          </p>
        )}
      </div>
    </section>
  );
});

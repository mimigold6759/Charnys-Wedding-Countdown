import { forwardRef, useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { X } from "lucide-react";

export const PhotoGallery = forwardRef(function PhotoGallery(_, ref) {
  const [photos, setPhotos] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, "guestbook"), orderBy("created_at", "desc"));
        const snap = await getDocs(q);
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPhotos(all.filter((e) => e.photo_path));
      } catch {}
    };
    load();
    window.addEventListener("evermore:wish-posted", load);
    window.addEventListener("evermore:wish-deleted", load);
    return () => {
      window.removeEventListener("evermore:wish-posted", load);
      window.removeEventListener("evermore:wish-deleted", load);
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    if (selected) {
      window.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected]);

  return (
    <section
      ref={ref}
      data-testid="photo-gallery-section"
      className="relative px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto py-20 sm:py-28"
    >
      <div className="reveal-on-scroll text-center mb-12 sm:mb-16">
        <h2 className="font-serif-display text-4xl sm:text-5xl md:text-6xl tracking-tight text-[#3B1E28]">
          Photo Gallery
        </h2>
      </div>

      {photos.length === 0 ? (
        <p
          data-testid="photo-gallery-empty"
          className="reveal-on-scroll text-center font-serif-display italic text-2xl text-[#7A5965]"
        >
          Photos guests share will bloom here.
        </p>
      ) : (
        <div data-testid="photo-gallery-grid" className="reveal-on-scroll grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 bg-[#FBE9EF]/90 backdrop-blur-sm border border-[#E89FAD]/25 rounded-lg p-6 sm:p-10 shadow-[0_8px_40px_rgba(216,112,147,0.12)]">
          {photos.map((e) => (
            <button
              key={e.id}
              data-testid="gallery-photo-card"
              onClick={() => setSelected(e)}
              className="group relative bg-white p-2.5 pb-3 border border-[#E89FAD]/30 shadow-[0_4px_20px_rgba(216,112,147,0.15)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(216,112,147,0.3)] hover:-translate-y-1 hover:rotate-0 odd:-rotate-1 even:rotate-1 text-left cursor-pointer"
            >
              <img
                src={e.photo_path}
                alt={`shared by ${e.name}`}
                loading="lazy"
                className="w-full aspect-square object-cover border border-[#E89FAD]/20"
              />
              <figcaption className="mt-2 text-center font-serif-display italic text-sm text-[#7A2E4B]">
                — {e.name}
              </figcaption>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div
          data-testid="photo-lightbox"
          onClick={() => setSelected(null)}
          style={{ zIndex: 100 }}
          className="fixed inset-0 flex items-center justify-center bg-[#3B1E28]/85 backdrop-blur-sm p-4 sm:p-10 cursor-zoom-out"
        >
          <button
            data-testid="lightbox-close"
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 rounded-full bg-white/90 p-2.5 text-[#4A1229] hover:bg-[#E89FAD] hover:text-white transition-colors duration-300"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <figure
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-4 sm:p-6 pb-5 sm:pb-6 max-w-2xl w-full max-h-[90vh] overflow-auto shadow-[0_24px_80px_rgba(0,0,0,0.4)] border border-[#E89FAD]/30 cursor-default"
          >
            <img
              src={selected.photo_path}
              alt={`shared by ${selected.name}`}
              className="w-full max-h-[55vh] object-contain border border-[#E89FAD]/20 bg-[#FFF9FB]"
            />
            <figcaption className="mt-5 text-center">
              <p className="font-serif-display text-xl sm:text-2xl leading-snug text-[#3B1E28]">
                “{selected.message}”
              </p>
              <p className="mt-3 font-serif-display italic text-lg text-[#C75B80]">
                — {selected.name}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#7A5965] font-mono-digits">
                {new Date(selected.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
});
import { forwardRef, useEffect, useState } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const PhotoGallery = forwardRef(function PhotoGallery(_, ref) {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const load = () =>
      axios
        .get(`${API}/guestbook`)
        .then((res) => setPhotos(res.data.filter((e) => e.photo_path)))
        .catch(() => {});
    load();
    window.addEventListener("evermore:wish-posted", load);
    window.addEventListener("evermore:wish-deleted", load);
    return () => {
      window.removeEventListener("evermore:wish-posted", load);
      window.removeEventListener("evermore:wish-deleted", load);
    };
  }, []);

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
            <figure
              key={e.id}
              data-testid="gallery-photo-card"
              className="group relative bg-white p-2.5 pb-3 border border-[#E89FAD]/30 shadow-[0_4px_20px_rgba(216,112,147,0.15)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(216,112,147,0.3)] hover:-translate-y-1 hover:rotate-0 odd:-rotate-1 even:rotate-1"
            >
              <img
                src={`${API}/photos/${e.photo_path}`}
                alt={`shared by ${e.name}`}
                loading="lazy"
                className="w-full aspect-square object-cover border border-[#E89FAD]/20"
              />
              <figcaption className="mt-2 text-center font-serif-display italic text-sm text-[#7A2E4B]">
                — {e.name}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
});

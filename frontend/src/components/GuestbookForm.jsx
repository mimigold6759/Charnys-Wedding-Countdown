import { useRef, useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";

const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 900;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = reject;
    img.src = url;
  });

export const GuestbookForm = ({ onPosted }) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const pickPhoto = (e) => {
    const files = e.target.files;
    const file = files && files.length > 0 ? files[0] : null;
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Photo must be under 10MB");
      return;
    }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    setPhoto(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast.error("Please add your name and a message");
      return;
    }
    setSubmitting(true);
    try {
      let photoData = null;
      if (photo) {
        photoData = await compressImage(photo);
      }
      const newEntry = {
        name: name.trim(),
        message: message.trim(),
        photo_path: photoData,
        created_at: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, "guestbook"), newEntry);
      onPosted({ id: docRef.id, ...newEntry });
      setName("");
      setMessage("");
      clearPhoto();
      window.dispatchEvent(new CustomEvent("evermore:wish-posted"));
      toast.success("Your wish is on the wall");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      data-testid="guestbook-form"
      onSubmit={submit}
      className="bg-white/80 backdrop-blur-md border border-white/80 shadow-[0_8px_40px_rgba(216,112,147,0.15)] p-6 sm:p-10 max-w-2xl mx-auto"
    >
      <div className="grid gap-6">
        <div>
          <label htmlFor="gb-name" className="block text-xs uppercase tracking-[0.25em] font-semibold text-[#7A2E4B]/70 mb-3">
            Your name
          </label>
          <input
            id="gb-name"
            data-testid="guestbook-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="e.g. Aunt Sophie"
            className="w-full bg-transparent border-b border-[#E89FAD]/40 focus:border-[#D87093] outline-none py-3 font-serif-display text-2xl text-[#3B1E28] placeholder:text-[#7A5965]/50 transition-colors duration-300"
          />
        </div>
        <div>
          <label htmlFor="gb-message" className="block text-xs uppercase tracking-[0.25em] font-semibold text-[#7A2E4B]/70 mb-3">
            Your mazel tov wish
          </label>
          <textarea
            id="gb-message"
            data-testid="guestbook-message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="Write something they'll read for years…"
            className="w-full bg-transparent border-b border-[#E89FAD]/40 focus:border-[#D87093] outline-none py-3 text-base text-[#3B1E28] placeholder:text-[#7A5965]/50 resize-none transition-colors duration-300"
          />
        </div>

        <div>
          <input
            ref={fileRef}
            id="gb-photo"
            data-testid="guestbook-photo-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={pickPhoto}
            className="hidden"
          />
          {preview ? (
            <div className="relative inline-block" data-testid="guestbook-photo-preview">
              <img src={preview} alt="Selected" className="h-32 w-auto border border-[#E89FAD]/30 object-cover" />
              <button
                type="button"
                data-testid="guestbook-photo-remove"
                onClick={clearPhoto}
                className="absolute -top-2 -right-2 rounded-full bg-[#7A2E4B] text-white p-1.5 hover:bg-[#C75B80] transition-colors"
                aria-label="Remove photo"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              data-testid="guestbook-photo-button"
              onClick={() => fileRef.current && fileRef.current.click()}
              className="flex items-center gap-2 text-sm text-[#C75B80] hover:text-[#7A2E4B] transition-colors duration-300"
            >
              <ImagePlus size={18} />
              Add a photo <span className="text-[#7A5965]">(optional)</span>
            </button>
          )}
        </div>

        <button
          type="submit"
          data-testid="guestbook-submit-button"
          disabled={submitting}
          className="mt-2 rounded-full bg-[#D87093] px-10 py-4 text-xs uppercase tracking-[0.3em] text-white transition-all duration-500 hover:bg-[#C75B80] hover:shadow-[0_10px_30px_rgba(216,112,147,0.4)] disabled:opacity-50 disabled:cursor-wait"
        >
          {submitting ? "Placing your wish…" : "Place it on the wall"}
        </button>
      </div>
    </form>
  );
};
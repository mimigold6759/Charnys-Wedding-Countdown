import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const GuestbookForm = ({ onPosted }) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const pickPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Photo must be under 8MB");
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
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("message", message.trim());
      if (photo) fd.append("photo", photo);
      const res = await axios.post(`${API}/guestbook`, fd);
      onPosted(res.data);
      setName("");
      setMessage("");
      clearPhoto();
      toast.success("Your wish is on the wall");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Something went wrong — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      data-testid="guestbook-form"
      onSubmit={submit}
      className="bg-white border border-[#4A1525]/15 shadow-sm p-6 sm:p-10 max-w-2xl mx-auto"
    >
      <div className="grid gap-6">
        <div>
          <label htmlFor="gb-name" className="block text-xs uppercase tracking-[0.25em] font-semibold text-[#4A1525]/70 mb-3">
            Your name
          </label>
          <input
            id="gb-name"
            data-testid="guestbook-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="e.g. Aunt Sophie"
            className="w-full bg-transparent border-b border-[#4A1525]/25 focus:border-[#D4AF37] outline-none py-3 font-serif-display text-2xl text-[#4A1525] placeholder:text-[#8C827A]/60 transition-colors duration-300"
          />
        </div>
        <div>
          <label htmlFor="gb-message" className="block text-xs uppercase tracking-[0.25em] font-semibold text-[#4A1525]/70 mb-3">
            Your wish
          </label>
          <textarea
            id="gb-message"
            data-testid="guestbook-message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="Write something they'll read for years…"
            className="w-full bg-transparent border-b border-[#4A1525]/25 focus:border-[#D4AF37] outline-none py-3 text-base text-[#2C2627] placeholder:text-[#8C827A]/60 resize-none transition-colors duration-300"
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
              <img src={preview} alt="Selected" className="h-32 w-auto border border-[#4A1525]/15 object-cover" />
              <button
                type="button"
                data-testid="guestbook-photo-remove"
                onClick={clearPhoto}
                className="absolute -top-2 -right-2 rounded-full bg-[#4A1525] text-[#FAF7F2] p-1.5 hover:bg-[#7A3549] transition-colors"
                aria-label="Remove photo"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              data-testid="guestbook-photo-button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 text-sm text-[#7A3549] hover:text-[#4A1525] transition-colors duration-300"
            >
              <ImagePlus size={18} />
              Add a photo <span className="text-[#8C827A]">(optional)</span>
            </button>
          )}
        </div>

        <button
          type="submit"
          data-testid="guestbook-submit-button"
          disabled={submitting}
          className="mt-2 rounded-full bg-[#4A1525] px-10 py-4 text-xs uppercase tracking-[0.3em] text-[#FAF7F2] transition-all duration-500 hover:bg-[#7A3549] hover:shadow-lg disabled:opacity-50 disabled:cursor-wait"
        >
          {submitting ? "Placing your wish…" : "Place it on the wall"}
        </button>
      </div>
    </form>
  );
};

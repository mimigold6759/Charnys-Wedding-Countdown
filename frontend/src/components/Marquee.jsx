export const Marquee = ({ items, attached = false }) => {
  const line = items.map((t) => `${t}  •  `).join("");
  return (
    <div
      data-testid="editorial-marquee"
      className={`overflow-hidden py-5 select-none ${
        attached
          ? "bg-[#4A1229]"
          : "border-y border-[#E89FAD]/25 bg-white/50 backdrop-blur-sm"
      }`}
      aria-hidden="true"
    >
      <div className="marquee-track">
        {[0, 1].map((half) => (
          <span
            key={half}
            className={`whitespace-nowrap font-serif-display italic text-xl sm:text-2xl tracking-wide pr-2 ${
              attached ? "text-[#E89FAD]/50" : "text-[#C75B80]/60"
            }`}
          >
            {line.repeat(3)}
          </span>
        ))}
      </div>
    </div>
  );
};

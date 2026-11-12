export const Marquee = ({ items }) => {
  const line = items.map((t) => `${t}  •  `).join("");
  return (
    <div
      data-testid="editorial-marquee"
      className="overflow-hidden border-y border-[#4A1525]/10 bg-[#F5ECE8] py-5 select-none"
      aria-hidden="true"
    >
      <div className="marquee-track">
        {[0, 1].map((half) => (
          <span
            key={half}
            className="whitespace-nowrap font-serif-display italic text-xl sm:text-2xl tracking-wide text-[#7A3549]/70 pr-2"
          >
            {line.repeat(3)}
          </span>
        ))}
      </div>
    </div>
  );
};

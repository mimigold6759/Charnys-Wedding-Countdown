const WEDDING = {
  bride: "Charny",
  groom: "Yaakov Duvid",
  dateLabel: "January 24, 2027",
  venueName: "Tiferes Elka",
  venueAddress: "2 School Terrace, Monsey, New York 10977",
};

const esc = (s) =>
  String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const openKeepsake = (entries, apiBase) => {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  const cards = sorted
    .map((e) => {
      const photo = e.photo_path
        ? `<img src="${apiBase}/photos/${e.photo_path}" alt="" style="width:100%;max-height:340px;object-fit:cover;border:1px solid #E89FAD;border-radius:4px;margin-bottom:14px;" />`
        : "";
      const date = new Date(e.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return `
      <div class="wish">
        ${photo}
        <p class="msg">&ldquo;${esc(e.message)}&rdquo;</p>
        <p class="name">&mdash; ${esc(e.name)}</p>
        <p class="date">${date}</p>
      </div>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Mazel Tovs for ${esc(WEDDING.bride)} &amp; ${esc(WEDDING.groom)}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Cormorant Garamond', Georgia, serif; color: #3B1E28; background: #FFF9FB; margin: 0; padding: 48px 32px; }
  .cover { text-align: center; margin-bottom: 48px; }
  .cover h1 { font-size: 56px; font-weight: 500; margin: 0 0 8px; }
  .cover .amp { color: #C75B80; font-style: italic; }
  .cover p { color: #7A5965; letter-spacing: 3px; text-transform: uppercase; font-size: 12px; margin: 0; }
  .rule { width: 80px; height: 1px; background: #E89FAD; margin: 24px auto; }
  .grid { column-count: 2; column-gap: 24px; }
  @media (min-width: 900px) { .grid { column-count: 3; } }
  .wish { break-inside: avoid; background: #fff; border: 1px solid #F3E8DF; border-radius: 8px; padding: 20px; margin-bottom: 24px; box-shadow: 0 4px 18px rgba(216,112,147,0.08); }
  .wish .msg { font-size: 20px; line-height: 1.4; margin: 0 0 14px; }
  .wish .name { font-style: italic; color: #C75B80; font-size: 17px; margin: 0 0 4px; }
  .wish .date { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #7A5965; margin: 0; }
  .count { text-align: center; color: #7A5965; font-style: italic; margin-top: 32px; }
  @media print { body { padding: 24px; } .wish { box-shadow: none; } }
</style>
</head>
<body>
  <div class="cover">
    <h1>${esc(WEDDING.bride)} <span class="amp">&amp;</span> ${esc(WEDDING.groom)}</h1>
    <p>${esc(WEDDING.dateLabel)} &mdash; ${esc(WEDDING.venueName)}, ${esc(WEDDING.venueAddress)}</p>
    <div class="rule"></div>
    <p style="font-style:italic; text-transform:none; letter-spacing:0; font-size:16px;">A keepsake of every mazel tov</p>
  </div>
  <div class="grid">${cards}</div>
  <p class="count">${sorted.length} ${sorted.length === 1 ? "wish" : "wishes"} &mdash; made with love</p>
  <script>window.onload = () => { setTimeout(() => window.print(), 400); };</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};

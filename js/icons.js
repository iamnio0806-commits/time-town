const SHAPES = {
  rice: `
    <path d="M25 36c0-9 7-14 15-14s15 5 15 14v26c0 7-7 12-15 12s-15-5-15-12V36z" fill="#FFF9EF" stroke="#24160F" stroke-width="3"/>
    <path d="M32 30c2-8 14-8 16 0" fill="none" stroke="#24160F" stroke-width="3"/>
    <circle cx="34" cy="50" r="2.4" fill="#C4882A"/>
    <circle cx="46" cy="46" r="2.4" fill="#C4882A"/>
    <circle cx="42" cy="58" r="2.4" fill="#C4882A"/>`,
  soy: `
    <rect x="34" y="12" width="12" height="8" rx="2" fill="#5C3317"/>
    <rect x="27" y="20" width="26" height="46" rx="8" fill="#6B3418" stroke="#24160F" stroke-width="3"/>
    <rect x="32" y="34" width="16" height="14" rx="2" fill="#F4E2B8"/>`,
  egg: `
    <ellipse cx="40" cy="44" rx="16" ry="22" fill="#FFF9EF" stroke="#24160F" stroke-width="3"/>
    <ellipse cx="40" cy="48" rx="7" ry="9" fill="#F3D48A"/>`,
  towel: `
    <path d="M18 28h44v34H18z" fill="#F7FBFF" stroke="#24160F" stroke-width="3"/>
    <path d="M18 36h44M24 28v34M56 28v34" stroke="#7EA4C8" stroke-width="3"/>
    <path d="M22 24h36v8H22z" fill="#D7E6F4" stroke="#24160F" stroke-width="3"/>`,
  soap: `
    <rect x="16" y="34" width="48" height="26" rx="10" fill="#F7FBF2" stroke="#24160F" stroke-width="3"/>
    <circle cx="58" cy="28" r="6" fill="none" stroke="#7EA46A" stroke-width="3"/>
    <circle cx="66" cy="22" r="3" fill="none" stroke="#7EA46A" stroke-width="3"/>`,
  tea: `
    <rect x="24" y="24" width="32" height="40" rx="6" fill="#6E8F45" stroke="#24160F" stroke-width="3"/>
    <rect x="30" y="16" width="20" height="10" rx="3" fill="#D7E4BE" stroke="#24160F" stroke-width="3"/>
    <path d="M34 40c4 4 8 4 12 0M34 48c4 4 8 4 12 0" fill="none" stroke="#F4F8EA" stroke-width="3"/>`,
  candy: `
    <path d="M12 40l14-8 8 8-8 8-14-8z" fill="#F29BB0" stroke="#24160F" stroke-width="3"/>
    <rect x="30" y="32" width="20" height="16" rx="4" fill="#E45D78" stroke="#24160F" stroke-width="3"/>
    <path d="M54 40l14-8-8 8 8 8-14-8z" fill="#F29BB0" stroke="#24160F" stroke-width="3"/>`,
  can: `
    <ellipse cx="40" cy="24" rx="16" ry="7" fill="#F8E7B8" stroke="#24160F" stroke-width="3"/>
    <path d="M24 24v32c0 4 7 8 16 8s16-4 16-8V24" fill="#E7B45A" stroke="#24160F" stroke-width="3"/>
    <path d="M24 34c4 3 28 3 32 0" fill="none" stroke="#24160F" stroke-width="3"/>`,
  notebook: `
    <rect x="22" y="16" width="40" height="50" rx="4" fill="#FFF9F0" stroke="#24160F" stroke-width="3"/>
    <path d="M30 16v50" stroke="#C4523A" stroke-width="3"/>
    <path d="M36 30h18M36 40h18M36 50h12" stroke="#C4882A" stroke-width="3"/>`,
  slipper: `
    <path d="M14 48c8-16 24-20 40-12 8 4 14 8 14 16H18c-4 0-6-2-4-4z" fill="#E98B62" stroke="#24160F" stroke-width="3"/>
    <path d="M28 40c6-2 16 0 22 6" fill="none" stroke="#24160F" stroke-width="3"/>`,
  umbrella: `
    <path d="M14 42c0-16 12-26 26-26s26 10 26 26z" fill="#D94B3A" stroke="#24160F" stroke-width="3"/>
    <path d="M40 16v46" stroke="#24160F" stroke-width="3"/>
    <path d="M40 62c8 0 10-6 6-8" fill="none" stroke="#24160F" stroke-width="3"/>
    <path d="M27 42V30M40 42V24M53 42V30" stroke="#F8E7C8" stroke-width="3"/>`,
  cup: `
    <path d="M22 24h30l-4 36H26L22 24z" fill="#FFF9F0" stroke="#24160F" stroke-width="3"/>
    <path d="M52 30h8c6 0 8 8 0 14h-8" fill="none" stroke="#24160F" stroke-width="3"/>
    <path d="M28 24c2-8 16-8 18 0" fill="#C4523A"/>`,
  cabbage: `
    <ellipse cx="40" cy="46" rx="22" ry="18" fill="#F4FBEF" stroke="#24160F" stroke-width="3"/>
    <ellipse cx="40" cy="46" rx="14" ry="12" fill="#B7D98A" stroke="#24160F" stroke-width="3"/>
    <path d="M40 28c4 6 4 12 0 18" fill="none" stroke="#3E7A4C" stroke-width="3"/>`,
  tomato: `
    <circle cx="40" cy="46" r="18" fill="#D6453D" stroke="#24160F" stroke-width="3"/>
    <path d="M40 24c-2 6 2 8 0 12M32 30c6 2 10 2 16 0" fill="none" stroke="#2F6B3A" stroke-width="3"/>`,
  tofu: `
    <path d="M18 32h32v28H18z" fill="#FFF9F0" stroke="#24160F" stroke-width="3"/>
    <path d="M50 32l12-8v28l-12 8z" fill="#F0E6D4" stroke="#24160F" stroke-width="3"/>
    <path d="M18 32l12-8h32" fill="none" stroke="#24160F" stroke-width="3"/>`,
  scallion: `
    <path d="M24 58c6-18 8-28 6-40M34 60c4-20 8-30 4-42M46 58c6-16 10-28 6-40M56 56c4-14 8-24 4-36" fill="none" stroke="#2F7A42" stroke-width="4" stroke-linecap="round"/>
    <path d="M24 58h34" stroke="#E7F0D8" stroke-width="4"/>`,
  radish: `
    <path d="M30 34c8 0 20 8 20 20 0 14-10 24-18 24s-16-12-14-26c2-8 6-18 12-18z" fill="#FFF9F0" stroke="#24160F" stroke-width="3"/>
    <path d="M34 34c-2-10 4-16 6-20M42 32c4-10 12-12 14-18M38 30c8-6 16-4 18-10" fill="none" stroke="#3E7A4C" stroke-width="3" stroke-linecap="round"/>`,
  banana: `
    <path d="M22 30c18-8 36 4 36 22 0 10-6 20-16 24-4-8-6-20-8-28-6 6-12 4-12-18z" fill="#F2D15A" stroke="#24160F" stroke-width="3"/>
    <path d="M28 28c2-8 8-10 10-12" stroke="#6B4A12" stroke-width="3" fill="none"/>`,
  fish: `
    <ellipse cx="38" cy="42" rx="18" ry="12" fill="#8FB8D4" stroke="#24160F" stroke-width="3"/>
    <path d="M54 42l14-12v24z" fill="#6E9BBD" stroke="#24160F" stroke-width="3"/>
    <circle cx="28" cy="40" r="2" fill="#24160F"/>`,
  sprout: `
    <path d="M40 64V36" stroke="#3E7A4C" stroke-width="3"/>
    <path d="M40 42c-14-2-18-14-14-20 8 2 14 10 14 20z" fill="#D7E8A8" stroke="#24160F" stroke-width="3"/>
    <path d="M40 48c12-4 20-14 16-22-8 2-14 12-16 22z" fill="#B7D98A" stroke="#24160F" stroke-width="3"/>`,
  pumpkin: `
    <ellipse cx="40" cy="46" rx="20" ry="16" fill="#E9892E" stroke="#24160F" stroke-width="3"/>
    <path d="M40 30v32M28 40c4 4 8 6 12 6s8-2 12-6" fill="none" stroke="#24160F" stroke-width="3"/>
    <path d="M40 30c4-8 10-8 12-6" fill="none" stroke="#2F6B3A" stroke-width="3"/>`,
  mushroom: `
    <path d="M14 40c2-16 14-24 26-24s24 8 26 24z" fill="#8A5A3A" stroke="#24160F" stroke-width="3"/>
    <rect x="32" y="40" width="16" height="22" rx="4" fill="#F3E6D4" stroke="#24160F" stroke-width="3"/>
    <circle cx="28" cy="34" r="3" fill="#F4E2B8"/>
    <circle cx="46" cy="30" r="4" fill="#F4E2B8"/>`,
  orange: `
    <circle cx="40" cy="46" r="18" fill="#F0A03A" stroke="#24160F" stroke-width="3"/>
    <path d="M40 28c8 6 8 16 0 36M40 28c-8 6-8 16 0 36" fill="none" stroke="#C4882A" stroke-width="2"/>
    <path d="M40 24c6-6 12-4 14-2" fill="none" stroke="#2F6B3A" stroke-width="3"/>`,
};

function svg(markup) {
  return markup.replace(/>\s+</g, "><").trim();
}

export function itemIcon(item) {
  const shape = SHAPES[item.id] || `<circle cx="40" cy="40" r="16" fill="#fff" stroke="#24160F" stroke-width="3"/>`;
  return svg(`<svg class="icon" viewBox="0 0 80 80" aria-hidden="true"><rect width="80" height="80" rx="22" fill="${item.tone}"/>${shape}</svg>`);
}

export function townPoster() {
  return svg(`<svg class="town-sky" viewBox="0 0 360 200" role="img" aria-label="黃昏的小鎮街道">
    <defs>
      <linearGradient id="town-poster-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F2B56A"/>
        <stop offset="1" stop-color="#F8E3C4"/>
      </linearGradient>
    </defs>
    <rect width="360" height="200" fill="url(#town-poster-sky)"/>
    <circle cx="292" cy="48" r="24" fill="#FFF1C7"/>
    <ellipse cx="78" cy="118" rx="70" ry="28" fill="#E7B48A"/>
    <ellipse cx="250" cy="124" rx="120" ry="34" fill="#E3BE94"/>
    <path d="M18 150h70l10-28h36l10 28h16l8-20h28v20h18l12-36 28 36h24l-16-48h-24l-8 18h-12l-10-24H78L62 150H40L28 126H18z" fill="#7A2E24"/>
    <rect x="28" y="150" width="78" height="34" fill="#F7E7C8"/>
    <rect x="118" y="142" width="70" height="42" fill="#F3D7A2"/>
    <rect x="214" y="132" width="78" height="52" fill="#FFF9F0"/>
    <rect x="46" y="160" width="22" height="24" fill="#6B3E26"/>
    <rect x="132" y="154" width="16" height="14" fill="#D6453D"/>
    <rect x="154" y="158" width="16" height="14" fill="#7EAE55"/>
    <rect x="236" y="148" width="22" height="18" rx="8" fill="#F6C98A"/>
    <path d="M0 184h360v16H0z" fill="#C4A077"/>
  </svg>`);
}

export function townBanner() {
  return svg(`<svg class="town-sky is-banner" viewBox="0 0 360 112" aria-hidden="true">
    <defs>
      <linearGradient id="town-banner-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F2B56A"/>
        <stop offset="1" stop-color="#F8E3C4"/>
      </linearGradient>
    </defs>
    <rect width="360" height="112" fill="url(#town-banner-sky)"/>
    <circle cx="300" cy="36" r="18" fill="#FFF1C7"/>
    <ellipse cx="70" cy="78" rx="78" ry="24" fill="#E7B48A"/>
    <ellipse cx="240" cy="84" rx="130" ry="28" fill="#E3BE94"/>
    <path d="M0 100h360v12H0z" fill="#C4A077"/>
  </svg>`);
}

export function shopFront() {
  return svg(`<svg class="store-art" viewBox="0 0 160 112" aria-hidden="true">
    <rect x="8" y="42" width="144" height="66" rx="6" fill="#E7C99A" stroke="#24160F" stroke-width="3"/>
    <rect x="6" y="24" width="18" height="28" fill="#F4E2B8"/>
    <rect x="24" y="24" width="18" height="28" fill="#7A2E24"/>
    <rect x="42" y="24" width="18" height="28" fill="#F4E2B8"/>
    <rect x="60" y="24" width="18" height="28" fill="#7A2E24"/>
    <rect x="78" y="24" width="18" height="28" fill="#F4E2B8"/>
    <rect x="96" y="24" width="18" height="28" fill="#7A2E24"/>
    <rect x="114" y="24" width="18" height="28" fill="#F4E2B8"/>
    <rect x="132" y="24" width="20" height="28" fill="#7A2E24"/>
    <rect x="24" y="62" width="52" height="32" rx="3" fill="#FFF9F0" stroke="#24160F" stroke-width="3"/>
    <path d="M50 62v32M24 78h52" stroke="#24160F" stroke-width="3"/>
    <rect x="96" y="66" width="34" height="42" rx="3" fill="#6B3E26"/>
    <circle cx="118" cy="88" r="3" fill="#F4E2B8"/>
  </svg>`);
}

export function marketFront() {
  return svg(`<svg class="store-art" viewBox="0 0 160 112" aria-hidden="true">
    <path d="M10 34h140l-8 28H18z" fill="#E2B143"/>
    <path d="M18 34h18v28H14zM40 34h18v28H40zM62 34h18v28H62zM84 34h18v28H84zM106 34h18v28h-18zM128 34h16l-4 28h-16z" fill="#F6D56A"/>
    <rect x="18" y="66" width="36" height="28" rx="6" fill="#C4523A"/>
    <rect x="62" y="70" width="36" height="28" rx="6" fill="#3E7A4C"/>
    <rect x="106" y="64" width="36" height="30" rx="6" fill="#E9892E"/>
    <circle cx="30" cy="76" r="5" fill="#F4E2B8"/>
    <circle cx="74" cy="80" r="5" fill="#D7E8A8"/>
    <circle cx="118" cy="76" r="5" fill="#F8E7B8"/>
  </svg>`);
}

export function houseFront() {
  return svg(`<svg class="store-art" viewBox="0 0 160 112" aria-hidden="true">
    <path d="M20 52 80 16l60 36v50H20z" fill="#FFF9F0"/>
    <path d="M12 54 80 8l68 46H12z" fill="#7A2E24"/>
    <rect x="66" y="62" width="28" height="40" fill="#6B3E26"/>
    <rect x="34" y="62" width="22" height="20" rx="8" fill="#F6C98A" stroke="#24160F" stroke-width="3"/>
    <rect x="104" y="64" width="22" height="20" rx="8" fill="#F6C98A" stroke="#24160F" stroke-width="3"/>
    <circle cx="48" cy="96" r="8" fill="#3E7A4C"/>
    <rect x="46" y="96" width="4" height="12" fill="#6B3E26"/>
  </svg>`);
}

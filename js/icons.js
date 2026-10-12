const INK = "#2A2118";

function svg(markup) {
  return markup.replace(/>\s+</g, "><").trim();
}

function stroke() {
  return `fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
}

const SHAPES = {
  rice: `
    <path d="M27 34c1-8 25-8 26 0l3 6v24c0 8-7 12-16 12s-16-4-16-12V40z" fill="#F7E7C4" stroke="${INK}" stroke-width="2.4"/>
    <path d="M30 34c2-7 18-7 20 0" ${stroke()}/>
    <path d="M34 46h12M32 54h16" stroke="#C4553A" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="36" cy="64" r="1.6" fill="#C4882A"/>
    <circle cx="44" cy="66" r="1.6" fill="#C4882A"/>`,
  soy: `
    <rect x="34" y="12" width="12" height="7" rx="2" fill="#4E2A16"/>
    <path d="M29 20h22l-2 42c0 4-4 7-9 7s-9-3-9-7z" fill="#6B3418" stroke="${INK}" stroke-width="2.4"/>
    <rect x="33" y="32" width="14" height="12" rx="2" fill="#F6E2B4"/>
    <path d="M36 36h8M36 40h6" stroke="#6B3418" stroke-width="1.6"/>`,
  egg: `
    <ellipse cx="40" cy="44" rx="15" ry="21" fill="#FFF9F1" stroke="${INK}" stroke-width="2.4"/>
    <ellipse cx="34" cy="36" rx="4" ry="6" fill="#FFF" opacity=".8"/>
    <ellipse cx="40" cy="50" rx="6" ry="8" fill="#F3D48A"/>`,
  towel: `
    <path d="M20 30h40v32H20z" fill="#F4F8FC" stroke="${INK}" stroke-width="2.4"/>
    <path d="M20 38h40M26 30v32M54 30v32" stroke="#6FA0C8" stroke-width="2.4"/>
    <path d="M22 24h36l-2 8H24z" fill="#D5E6F4" stroke="${INK}" stroke-width="2.4"/>`,
  soap: `
    <rect x="16" y="36" width="42" height="22" rx="11" fill="#F7FBF4" stroke="${INK}" stroke-width="2.4"/>
    <path d="M24 46h18" stroke="#B7D2A4" stroke-width="2"/>
    <circle cx="58" cy="28" r="5" ${stroke()}/>
    <circle cx="66" cy="22" r="3" ${stroke()}/>`,
  tea: `
    <rect x="26" y="26" width="28" height="36" rx="5" fill="#6E8F45" stroke="${INK}" stroke-width="2.4"/>
    <rect x="32" y="16" width="16" height="12" rx="3" fill="#E4F0CC" stroke="${INK}" stroke-width="2.4"/>
    <path d="M34 40c3 4 9 4 12 0M35 48c2 3 7 3 10 0" stroke="#F4F8EA" stroke-width="2" fill="none"/>`,
  candy: `
    <path d="M14 40l12-7 6 7-6 7z" fill="#F3A8B8" stroke="${INK}" stroke-width="2.4"/>
    <rect x="30" y="32" width="20" height="16" rx="5" fill="#E25B78" stroke="${INK}" stroke-width="2.4"/>
    <path d="M54 40l12-7-6 7 6 7z" fill="#F3A8B8" stroke="${INK}" stroke-width="2.4"/>
    <path d="M36 36c4 4 6 4 8 0" stroke="#FFF" stroke-width="1.6" fill="none"/>`,
  can: `
    <ellipse cx="40" cy="24" rx="15" ry="6" fill="#F8E7B8" stroke="${INK}" stroke-width="2.4"/>
    <path d="M25 24v30c0 4 7 8 15 8s15-4 15-8V24" fill="#E0A84A" stroke="${INK}" stroke-width="2.4"/>
    <path d="M25 36c6 4 24 4 30 0" ${stroke()}/>
    <rect x="32" y="40" width="16" height="10" rx="2" fill="#F8E7C2"/>`,
  notebook: `
    <rect x="24" y="16" width="36" height="50" rx="3" fill="#FFF9F0" stroke="${INK}" stroke-width="2.4"/>
    <path d="M32 16v50" stroke="#C4523A" stroke-width="2.6"/>
    <path d="M38 30h14M38 38h14M38 46h10" stroke="#C4882A" stroke-width="2"/>`,
  slipper: `
    <path d="M16 50c6-16 22-20 36-12 8 4 14 6 14 14 0 4-4 8-10 8H24c-6 0-10-4-8-10z" fill="#E98B62" stroke="${INK}" stroke-width="2.4"/>
    <path d="M30 42c8-2 16 0 22 6" ${stroke()}/>`,
  umbrella: `
    <path d="M16 44c2-18 12-26 24-26s22 8 24 26z" fill="#D94B3A" stroke="${INK}" stroke-width="2.4"/>
    <path d="M40 18v44" stroke="${INK}" stroke-width="2.4"/>
    <path d="M22 44c6-6 10-6 18-6s12 0 18 6" stroke="#F8E2C4" stroke-width="2" fill="none"/>
    <path d="M40 62c8 0 10-6 6-8" ${stroke()}/>`,
  cup: `
    <path d="M24 26h28l-3 32H28z" fill="#FFF9F2" stroke="${INK}" stroke-width="2.4"/>
    <path d="M52 32h6c6 0 8 8 1 12h-7" ${stroke()}/>
    <path d="M30 26c2-8 16-8 18 0" fill="#C4523A"/>
    <ellipse cx="38" cy="46" rx="7" ry="3" fill="#F3D48A" opacity=".7"/>`,
  cabbage: `
    <ellipse cx="40" cy="48" rx="22" ry="16" fill="#F4FBEF" stroke="${INK}" stroke-width="2.4"/>
    <ellipse cx="40" cy="48" rx="13" ry="11" fill="#A9D37A" stroke="${INK}" stroke-width="2.4"/>
    <path d="M40 34c3 6 3 12 0 18" stroke="#2F6B3A" stroke-width="2" fill="none"/>
    <path d="M28 40c6 2 10 6 12 12M52 40c-6 2-10 6-12 12" stroke="#3E7A4C" stroke-width="1.8" fill="none"/>`,
  tomato: `
    <circle cx="40" cy="46" r="17" fill="#E24B3C" stroke="${INK}" stroke-width="2.4"/>
    <path d="M40 28c-4 4-2 8 0 10M31 32c6 1 12 1 18-1" stroke="#2F6B3A" stroke-width="2.2" fill="none"/>
    <ellipse cx="34" cy="42" rx="3" ry="5" fill="#F4A090" opacity=".7"/>`,
  tofu: `
    <path d="M18 36h30v24H18z" fill="#FFF9F1" stroke="${INK}" stroke-width="2.4"/>
    <path d="M48 36l12-8v24l-12 8z" fill="#F0E4D0" stroke="${INK}" stroke-width="2.4"/>
    <path d="M18 36l12-8h30" ${stroke()}/>
    <path d="M26 46h14M26 52h10" stroke="#E4D3BC" stroke-width="2"/>`,
  scallion: `
    <path d="M28 64c2-20 2-32-2-44M38 66c2-22 4-34 0-46M48 64c3-18 6-30 2-42" stroke="#2F7A42" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M24 58h30" stroke="#F7F3E8" stroke-width="6" stroke-linecap="round"/>
    <path d="M26 58h26" stroke="${INK}" stroke-width="2" fill="none"/>`,
  radish: `
    <path d="M34 30c10 0 18 10 16 24-2 12-10 20-16 20s-14-10-12-22c2-10 6-22 12-22z" fill="#FFF9F1" stroke="${INK}" stroke-width="2.4"/>
    <path d="M36 30c-2-8 2-14 4-18M44 28c6-8 12-10 14-16" stroke="#3E7A4C" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  banana: `
    <path d="M24 34c16-10 32 2 32 18 0 12-8 20-16 22-2-8-4-16-8-22-4 6-10 8-12-18z" fill="#F2D15A" stroke="${INK}" stroke-width="2.4"/>
    <path d="M30 30c2-6 8-8 12-10" stroke="#6B4A12" stroke-width="2.4" fill="none"/>
    <path d="M34 42c8 2 14 8 16 14" stroke="#E2B43A" stroke-width="2" fill="none"/>`,
  fish: `
    <ellipse cx="36" cy="42" rx="18" ry="11" fill="#8FB8D4" stroke="${INK}" stroke-width="2.4"/>
    <path d="M52 42l14-11v22z" fill="#6E9BBD" stroke="${INK}" stroke-width="2.4"/>
    <circle cx="28" cy="40" r="2" fill="${INK}"/>
    <path d="M34 48c4 2 8 2 12 0" stroke="#F4F8FC" stroke-width="1.8" fill="none"/>`,
  sprout: `
    <path d="M30 62c2-14 4-22 2-30M40 64c1-16 2-24 0-34M50 62c2-12 4-20 2-28" stroke="#F7F3E4" stroke-width="3" stroke-linecap="round"/>
    <circle cx="30" cy="30" r="3" fill="#E7D15A" stroke="${INK}" stroke-width="1.6"/>
    <circle cx="40" cy="28" r="3.2" fill="#E7D15A" stroke="${INK}" stroke-width="1.6"/>
    <circle cx="50" cy="32" r="3" fill="#E7D15A" stroke="${INK}" stroke-width="1.6"/>
    <path d="M24 58h32" stroke="#3E7A4C" stroke-width="3" stroke-linecap="round"/>`,
  pumpkin: `
    <ellipse cx="40" cy="48" rx="20" ry="15" fill="#E9892E" stroke="${INK}" stroke-width="2.4"/>
    <path d="M40 34v28M29 42c4 4 7 6 11 6s7-2 11-6" ${stroke()}/>
    <path d="M40 34c3-8 10-8 12-4" stroke="#2F6B3A" stroke-width="2.4" fill="none"/>`,
  mushroom: `
    <path d="M14 42c2-14 12-22 26-22s24 8 26 22z" fill="#8A5A3A" stroke="${INK}" stroke-width="2.4"/>
    <rect x="32" y="42" width="16" height="20" rx="4" fill="#F3E6D4" stroke="${INK}" stroke-width="2.4"/>
    <circle cx="28" cy="36" r="3" fill="#F6E7C4"/>
    <circle cx="48" cy="34" r="4" fill="#F6E7C4"/>
    <path d="M22 42h36" stroke="${INK}" stroke-width="2"/>`,
  orange: `
    <circle cx="40" cy="46" r="17" fill="#F0A03A" stroke="${INK}" stroke-width="2.4"/>
    <path d="M40 30v32M28 40c6 4 10 6 12 6s6-2 12-6" stroke="#C4882A" stroke-width="1.8" fill="none"/>
    <path d="M40 28c6-6 12-4 14-2" stroke="#2F6B3A" stroke-width="2.4" fill="none"/>`,
};

export function itemIcon(item) {
  const shape = SHAPES[item.id] || `<circle cx="40" cy="40" r="16" fill="#fff" stroke="${INK}" stroke-width="2.4"/>`;
  return svg(`<svg class="icon" viewBox="0 0 80 80" aria-hidden="true"><rect width="80" height="80" rx="22" fill="${item.tone}"/>${shape}</svg>`);
}

export function townPoster() {
  return svg(`<svg class="town-sky town-hero" viewBox="0 0 360 214" role="img" aria-label="黃昏的小鎮街道，有雜貨店、菜市場和住宅">
    <defs>
      <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F4B56A"/>
        <stop offset=".55" stop-color="#F8D7A4"/>
        <stop offset="1" stop-color="#F6E4C4"/>
      </linearGradient>
    </defs>
    <rect width="360" height="214" fill="url(#hero-sky)"/>
    <circle cx="300" cy="46" r="34" fill="#FFE7A3" opacity=".45"/>
    <circle cx="300" cy="46" r="20" fill="#FFF3C9"/>
    <path d="M0 126c40-28 78-18 120-6 36 10 70-8 110-16 34-6 78 8 130 2v108H0z" fill="#E7B48C"/>
    <path d="M0 150c48-20 90-8 140 2 42 8 80-10 124-6 28 2 62 12 96 4v64H0z" fill="#D9A37A"/>
    <path d="M18 168c8-28 18-46 22-70 6 20 16 38 18 62" fill="#2F6B3A"/>
    <ellipse cx="28" cy="108" rx="22" ry="14" fill="#3E7A4C"/>
    <ellipse cx="46" cy="116" rx="18" ry="12" fill="#2F6B3A"/>
    <rect x="34" y="150" width="6" height="28" rx="2" fill="#6B3E26"/>
    <path d="M78 150 L118 112 L166 150 V162 H78z" fill="#8E2E28"/>
    <path d="M86 146c10-8 16-8 26 0M112 142c8-7 14-7 22 0" stroke="#F6D7A8" stroke-width="2" fill="none"/>
    <rect x="86" y="150" width="72" height="36" fill="#F6E2C2"/>
    <rect x="86" y="150" width="10" height="16" fill="#F4E7C8"/>
    <rect x="106" y="150" width="10" height="16" fill="#8E2E28"/>
    <rect x="126" y="150" width="10" height="16" fill="#F4E7C8"/>
    <rect x="146" y="150" width="12" height="16" fill="#8E2E28"/>
    <rect x="98" y="170" width="22" height="16" fill="#FFF9F0" stroke="${INK}" stroke-width="1.6"/>
    <path d="M109 170v16M98 178h22" stroke="${INK}" stroke-width="1.4"/>
    <rect x="132" y="168" width="16" height="18" fill="#6B3E26"/>
    <path d="M186 158h78l-8 18h-62z" fill="#E2B143"/>
    <path d="M194 158h12v18h-14zM214 158h12v18h-12zM234 158h12v18h-14z" fill="#F6D56A"/>
    <rect x="198" y="176" width="18" height="12" rx="3" fill="#C4523A"/>
    <rect x="222" y="174" width="18" height="14" rx="3" fill="#3E7A4C"/>
    <rect x="246" y="176" width="16" height="12" rx="3" fill="#E9892E"/>
    <path d="M286 154 L314 118 L346 154 V164 H286z" fill="#8E2E28"/>
    <rect x="294" y="154" width="44" height="32" fill="#FFF8EE"/>
    <circle cx="316" cy="168" r="8" fill="#F6C98A" stroke="${INK}" stroke-width="1.6"/>
    <path d="M0 186h360v28H0z" fill="#C4A077"/>
    <path d="M0 196h360" stroke="#E7D3B0" stroke-width="3" stroke-dasharray="10 12"/>
  </svg>`);
}

export function shopFront() {
  return svg(`<svg class="store-art" viewBox="0 0 160 120" aria-hidden="true">
    <rect width="160" height="120" fill="#F6E2C2"/>
    <path d="M8 46 L80 14 L152 46 V58 H8z" fill="#8E2E28"/>
    <path d="M22 40c12-8 20-8 32 0M58 36c12-8 20-8 32 0M94 40c12-8 18-8 30 0" stroke="#F6D7A8" stroke-width="2.2" fill="none"/>
    <rect x="8" y="52" width="16" height="18" fill="#F4E7C8"/>
    <rect x="24" y="52" width="16" height="18" fill="#8E2E28"/>
    <rect x="40" y="52" width="16" height="18" fill="#F4E7C8"/>
    <rect x="56" y="52" width="16" height="18" fill="#8E2E28"/>
    <rect x="72" y="52" width="16" height="18" fill="#F4E7C8"/>
    <rect x="88" y="52" width="16" height="18" fill="#8E2E28"/>
    <rect x="104" y="52" width="16" height="18" fill="#F4E7C8"/>
    <rect x="120" y="52" width="16" height="18" fill="#8E2E28"/>
    <rect x="136" y="52" width="16" height="18" fill="#F4E7C8"/>
    <rect x="22" y="76" width="52" height="32" rx="3" fill="#FFF9F0" stroke="${INK}" stroke-width="2"/>
    <path d="M48 76v32M22 92h52" stroke="${INK}" stroke-width="2"/>
    <rect x="102" y="78" width="32" height="36" rx="2" fill="#6B3E26"/>
    <circle cx="122" cy="98" r="2.5" fill="#F4E2B8"/>
  </svg>`);
}

export function marketFront() {
  return svg(`<svg class="store-art" viewBox="0 0 160 120" aria-hidden="true">
    <rect width="160" height="120" fill="#F8E7C4"/>
    <path d="M10 34h140l-10 28H20z" fill="#E2B143"/>
    <path d="M18 34h16v28H14zM42 34h16v28H42zM66 34h16v28H66zM90 34h16v28H90zM114 34h16v28h-20zM136 34h14l-4 28h-16z" fill="#F6D56A"/>
    <rect x="16" y="78" width="36" height="28" rx="6" fill="#C4523A"/>
    <rect x="62" y="82" width="36" height="26" rx="6" fill="#3E7A4C"/>
    <rect x="108" y="76" width="36" height="30" rx="6" fill="#E9892E"/>
    <circle cx="28" cy="88" r="6" fill="#F4E2B8"/>
    <circle cx="40" cy="96" r="5" fill="#E24B3C"/>
    <path d="M74 96c6-10 16-10 16 0" fill="#D7E8A8" stroke="${INK}" stroke-width="1.4"/>
    <circle cx="126" cy="90" r="7" fill="#F2D15A"/>
  </svg>`);
}

export function houseFront() {
  return svg(`<svg class="store-art" viewBox="0 0 160 120" aria-hidden="true">
    <rect width="160" height="120" fill="#F8E7C4"/>
    <path d="M18 62 80 18l62 44v8H18z" fill="#8E2E28"/>
    <path d="M36 52c10-7 16-7 26 0M70 46c10-8 16-8 26 0M104 52c8-6 14-6 22 0" stroke="#F6D7A8" stroke-width="2" fill="none"/>
    <rect x="36" y="66" width="88" height="46" fill="#FFF8EE"/>
    <rect x="70" y="78" width="22" height="34" fill="#6B3E26"/>
    <circle cx="52" cy="84" r="9" fill="#F6C98A" stroke="${INK}" stroke-width="1.8"/>
    <circle cx="110" cy="84" r="9" fill="#F6C98A" stroke="${INK}" stroke-width="1.8"/>
    <circle cx="36" cy="104" r="8" fill="#3E7A4C"/>
    <rect x="34" y="104" width="4" height="10" fill="#6B3E26"/>
  </svg>`);
}

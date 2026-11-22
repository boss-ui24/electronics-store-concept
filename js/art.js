/* Рисованные иллюстрации товаров (SVG): без фото и логотипов, цвет — из отделки товара. */
(() => {
  const B = window.BOSS;
  let n = 0;
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (h, t) => { const c = hex(h).map((v) => Math.round(t < 0 ? v * (1 + t) : v + (255 - v) * t)); return `rgb(${c})`; };

  const draw = {
    phone: (c, g) => `
      <ellipse cx="120" cy="214" rx="54" ry="7" fill="#000" opacity=".12"/>
      <rect x="72" y="22" width="96" height="190" rx="22" fill="url(#${g})" stroke="${mix(c, -0.35)}" stroke-width="2.5"/>
      <rect x="78" y="28" width="84" height="178" rx="17" fill="${mix(c, 0.12)}" opacity=".5"/>
      <rect x="84" y="36" width="44" height="44" rx="12" fill="${mix(c, -0.12)}" stroke="${mix(c, -0.3)}"/>
      <circle cx="97" cy="49" r="8.5" fill="#15171b" stroke="${mix(c, -0.45)}" stroke-width="2.5"/>
      <circle cx="97" cy="67" r="8.5" fill="#15171b" stroke="${mix(c, -0.45)}" stroke-width="2.5"/>
      <circle cx="116" cy="58" r="8.5" fill="#15171b" stroke="${mix(c, -0.45)}" stroke-width="2.5"/>
      <circle cx="95" cy="47" r="2.4" fill="#5d6b85" opacity=".8"/><circle cx="114" cy="56" r="2.4" fill="#5d6b85" opacity=".8"/>
      <circle cx="120" cy="44" r="2.6" fill="#fff4cf"/>
      <path d="M150 30 q10 40 4 170" stroke="#fff" stroke-width="5" opacity=".18" fill="none" stroke-linecap="round"/>`,
    laptop: (c, g) => `
      <ellipse cx="120" cy="196" rx="98" ry="8" fill="#000" opacity=".12"/>
      <rect x="44" y="52" width="152" height="104" rx="9" fill="#111317" stroke="${mix(c, -0.3)}" stroke-width="3"/>
      <rect x="52" y="60" width="136" height="88" rx="3" fill="url(#${g}s)"/>
      <path d="M22 160 h196 l-10 22 q-2 5 -8 5 H40 q-6 0 -8 -5z" fill="url(#${g})" stroke="${mix(c, -0.35)}" stroke-width="2"/>
      <rect x="100" y="160" width="40" height="5" rx="2.5" fill="${mix(c, -0.25)}"/>`,
    tablet: (c, g) => `
      <ellipse cx="120" cy="212" rx="70" ry="7" fill="#000" opacity=".12"/>
      <rect x="54" y="26" width="132" height="182" rx="16" fill="${mix(c, -0.2)}" stroke="${mix(c, -0.4)}" stroke-width="2.5"/>
      <rect x="62" y="34" width="116" height="166" rx="9" fill="url(#${g}s)"/>
      <path d="M160 40 q8 60 2 150" stroke="#fff" stroke-width="5" opacity=".15" fill="none" stroke-linecap="round"/>`,
    buds: (c, g) => `
      <ellipse cx="120" cy="196" rx="64" ry="8" fill="#000" opacity=".12"/>
      <rect x="62" y="84" width="116" height="104" rx="38" fill="url(#${g})" stroke="${mix(c, -0.22)}" stroke-width="2.5"/>
      <path d="M64 118 H176" stroke="${mix(c, -0.2)}" stroke-width="2"/>
      <circle cx="120" cy="150" r="4" fill="#8fd18a"/>
      <path d="M92 40 q-14 0 -14 16 v30 q0 8 7 8 h4 q6 0 6 -8 V60 q8 -2 8 -10 q0 -10 -11 -10z" fill="#fff" stroke="${mix(c, -0.25)}" stroke-width="2"/>
      <path d="M148 40 q14 0 14 16 v30 q0 8 -7 8 h-4 q-6 0 -6 -8 V60 q-8 -2 -8 -10 q0 -10 11 -10z" fill="#fff" stroke="${mix(c, -0.25)}" stroke-width="2"/>`,
    watch: (c, g) => `
      <ellipse cx="120" cy="216" rx="46" ry="6" fill="#000" opacity=".12"/>
      <path d="M90 20 h60 l-4 50 H94z M94 170 h52 l4 44 H90z" fill="${mix(c, -0.1)}" stroke="${mix(c, -0.35)}" stroke-width="2"/>
      <rect x="70" y="62" width="100" height="116" rx="28" fill="url(#${g})" stroke="${mix(c, -0.4)}" stroke-width="3"/>
      <rect x="80" y="72" width="80" height="96" rx="20" fill="#0d0f12"/>
      <text x="120" y="126" text-anchor="middle" font-family="Unbounded, sans-serif" font-size="22" fill="#fff">10:09</text>
      <circle cx="104" cy="146" r="7" fill="none" stroke="#ff5a5f" stroke-width="3"/><circle cx="120" cy="146" r="7" fill="none" stroke="#b6f36b" stroke-width="3"/><circle cx="136" cy="146" r="7" fill="none" stroke="#5ad1ff" stroke-width="3"/>
      <rect x="170" y="98" width="7" height="22" rx="3" fill="${mix(c, -0.3)}"/>`,
    vacuum: (c, g) => `
      <ellipse cx="120" cy="214" rx="70" ry="7" fill="#000" opacity=".12"/>
      <rect x="114" y="70" width="12" height="122" rx="5" fill="${mix(c, 0.1)}" stroke="${mix(c, -0.35)}" stroke-width="2" transform="rotate(14 120 130)"/>
      <path d="M86 196 h86 q8 0 8 8 v4 H78 v-4 q0 -8 8 -8z" fill="#2b2d31"/>
      <rect x="100" y="30" width="44" height="60" rx="20" fill="url(#${g})" stroke="${mix(c, -0.35)}" stroke-width="2.5"/>
      <rect x="110" y="40" width="24" height="40" rx="12" fill="#c9d4e0" opacity=".55"/>
      <path d="M144 48 q26 4 24 30 q-2 14 -18 14" fill="none" stroke="#3a3c41" stroke-width="9" stroke-linecap="round"/>`,
  };

  B.art = (type, color = '#cfcfcb') => {
    const g = 'ag' + n++;
    return `<svg viewBox="0 0 240 240" class="art" aria-hidden="true"><defs>
      <linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mix(color, 0.35)}"/><stop offset=".55" stop-color="${color}"/><stop offset="1" stop-color="${mix(color, -0.25)}"/></linearGradient>
      <linearGradient id="${g}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b5bdb"/><stop offset=".5" stop-color="#7c3aed"/><stop offset="1" stop-color="#f97316"/></linearGradient>
    </defs>${(draw[type] || draw.phone)(color, g)}</svg>`;
  };
  B.artOf = (p, ci = 0) => B.art((B.CATS.find((c) => c.id === p.cat) || {}).art, p.colors[ci] || p.colors[0]);
})();

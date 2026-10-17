import { f, lantern, lanternDefs, ridge, rng, stars } from './lib.mjs';

const W = 390;
const H = 220;
const wrap = (label, defs, body) =>
  `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax slice" role="img" aria-label="${label}"><defs>${defs}</defs>${body}</svg>`;
const grad = (id, stops, vertical = true) =>
  `<linearGradient id="${id}" ${vertical ? 'x2="0" y2="1"' : ''}>${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;

/** A Japanese black pine: a leaning trunk carrying flat clouds of needles. */
function pine(x, y, s, trunk = '#1a1418', leaf = '#1f2a24', lit = null) {
  const pads = [
    [-14, -34, 16, 5], [10, -44, 18, 5.5], [-4, -56, 14, 5], [20, -28, 12, 4], [-22, -22, 10, 3.5],
  ];
  const t = `<path d="M${f(x)} ${f(y)}C${f(x + 2 * s)} ${f(y - 20 * s)} ${f(x - 6 * s)} ${f(y - 34 * s)} ${f(x + 2 * s)} ${f(y - 56 * s)}M${f(x - 1 * s)} ${f(y - 30 * s)}L${f(x - 14 * s)} ${f(y - 32 * s)}M${f(x + 1 * s)} ${f(y - 40 * s)}L${f(x + 12 * s)} ${f(y - 43 * s)}" stroke="${trunk}" stroke-width="${f(3 * s)}" stroke-linecap="round" fill="none"/>`;
  const p = pads
    .map(([dx, dy, rx, ry]) => {
      const cx = x + dx * s;
      const cy = y + dy * s;
      const clump = [[-0.45, 0.15, 0.6], [0, -0.1, 0.75], [0.45, 0.2, 0.55], [0.15, 0.35, 0.6]]
        .map(([ox, oy, k]) => `<ellipse cx="${f(cx + ox * rx * s)}" cy="${f(cy + oy * ry * s)}" rx="${f(rx * s * k)}" ry="${f(ry * s * (0.7 + k * 0.4))}" fill="${leaf}"/>`)
        .join('');
      const top = lit ? `<path d="M${f(cx - rx * s * 0.7)} ${f(cy - ry * s * 0.55)}Q${f(cx)} ${f(cy - ry * s * 1.3)} ${f(cx + rx * s * 0.75)} ${f(cy - ry * s * 0.45)}" stroke="${lit}" stroke-opacity=".55" stroke-width="${f(1.2 * s)}" fill="none" stroke-linecap="round"/>` : '';
      return clump + top;
    })
    .join('');
  return t + p;
}

export function coast(id = 'c') {
  const r = rng(21);
  const waves = [];
  for (let i = 0; i < 26; i++) {
    const y = 140 + r() ** 1.4 * 78;
    const x = r() * W;
    const w = 8 + (y - 130) * 0.35;
    waves.push(`<path d="M${f(x)} ${f(y)}q${f(w / 2)} -${f(w * 0.12)} ${f(w)} 0" stroke="#ffe0b8" stroke-opacity="${f(0.15 + (y - 140) / 260)}" stroke-width="1" fill="none"/>`);
  }
  const defs = grad(`${id}-sky`, [[0, '#2d3a6e'], [0.45, '#8a5a8a'], [0.75, '#f29a72'], [1, '#ffd9a0']]) +
    grad(`${id}-sea`, [[0, '#f0a27a'], [0.15, '#7a5a8a'], [1, '#1d2a4e']]) +
    `<radialGradient id="${id}-sun"><stop offset="0" stop-color="#fff4d6"/><stop offset=".25" stop-color="#ffd38a" stop-opacity=".9"/><stop offset="1" stop-color="#ff9a6a" stop-opacity="0"/></radialGradient>` +
    grad(`${id}-path`, [[0, '#ffe6b0', 0.9], [1, '#ffe6b0', 0]]);
  return wrap('The coast at dawn', defs, `<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>
<circle cx="250" cy="134" r="90" fill="url(#${id}-sun)"/><circle cx="250" cy="134" r="16" fill="#fff1d0"/>
<g fill="#f6b48a" opacity=".55"><path d="M40 70c20-6 44-4 60 2 18-6 46-4 60 4-30 4-80 4-120-6z"/><path d="M230 52c16-4 34-3 46 1 14-4 34-3 44 3-24 3-60 3-90-4z"/></g>
<path d="${ridge({ x0: 170, x1: W, y: 128, amp: 10, seed: 4, bottom: 136, step: 8 })}" fill="#7a5878" opacity=".7"/>
<rect y="134" width="${W}" height="86" fill="url(#${id}-sea)"/>
<path d="M250 136L232 220H268Z" fill="url(#${id}-path)" opacity=".55"/>
<g fill="#fff1d0" opacity=".7"><rect x="240" y="146" width="20" height="1.4"/><rect x="236" y="158" width="28" height="1.6"/><rect x="232" y="174" width="36" height="1.8"/><rect x="228" y="194" width="44" height="2"/></g>
${waves.join('')}
<g fill="#b8352a"><path d="M300 146Q322 142 344 146L343 150Q322 147 301 150Z"/><rect x="304" y="154" width="36" height="2.6"/><rect x="308" y="149" width="3.4" height="34"/><rect x="333" y="149" width="3.4" height="34"/></g>
<path d="M300 146Q322 142 344 146" stroke="#ffd9a0" stroke-width=".8" fill="none"/>
<g fill="#5a2a2a" opacity=".55"><rect x="308" y="183" width="3.4" height="14"/><rect x="333" y="183" width="3.4" height="14"/></g>
<path d="M150 150h30l-4 5h-22z" fill="#2a1e2a"/><path d="M163 150V128L176 148Z" fill="#efe3c8" opacity=".9"/>
<path d="M-10 220V110C10 104 30 106 44 116C60 120 74 132 84 150C96 170 110 200 120 220Z" fill="#1d1622"/>
<path d="M44 116C60 120 74 132 84 150" stroke="#ffb48a" stroke-opacity=".5" stroke-width="1.2" fill="none"/>
${pine(36, 114, 1.15, '#140f14', '#1a2420', '#ffb48a')}
<g fill="#1d1622"><rect x="96" y="196" width="40" height="24"/><path d="M90 196h52l-8-10h-36z"/></g><rect x="108" y="202" width="8" height="8" fill="#ffc070"/>`);
}

export function mountain(id = 'm') {
  const layers = [
    { y: 118, amp: 46, seed: 31, c: '#7a6a9a', freq: 0.9 },
    { y: 140, amp: 34, seed: 32, c: '#5a4a7a', freq: 1.4 },
    { y: 162, amp: 26, seed: 33, c: '#3a2e56', freq: 1.9 },
  ];
  const ridges = layers
    .map((l, i) => `<path d="${ridge({ x1: W, y: l.y, amp: l.amp, seed: l.seed, bottom: H, freq: l.freq })}" fill="${l.c}"/><rect y="${l.y + 10}" width="${W}" height="30" fill="url(#${id}-mist)" opacity="${0.9 - i * 0.2}"/>`)
    .join('');
  const steps = [];
  for (let i = 0; i < 14; i++) {
    const t = i / 13;
    const y = 214 - t * 74;
    const x = 210 + t * 30;
    const w = 26 - t * 16;
    steps.push(`<rect x="${f(x - w / 2)}" y="${f(y)}" width="${f(w)}" height="${f(2.2 - t)}" fill="#8a7a9a" opacity="${f(0.8 - t * 0.4)}"/>`);
  }
  const defs = grad(`${id}-sky`, [[0, '#1a1838'], [0.5, '#5a3a6a'], [0.85, '#d9785a'], [1, '#f2b06a']]) +
    grad(`${id}-mist`, [[0, '#e7b6b0', 0], [0.5, '#e7b6b0', 0.35], [1, '#e7b6b0', 0]]) +
    lanternDefs(id);
  const r = rng(5);
  return wrap('The mountain shrine at dusk', defs, `<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>
${stars(r, 30, W, H, { maxY: 70 })}
<path d="M70 120L130 34L156 70L172 52L230 120Z" fill="#9a88b0" opacity=".55"/><path d="M118 52L130 34L142 52L136 50L130 58L124 50Z" fill="#fff4f0" opacity=".8"/>
${ridges}
<path d="M150 220C180 180 210 150 260 136C300 128 340 132 400 140V220Z" fill="#241c34"/>
${steps.join('')}
<g fill="#1a1426"><rect x="236" y="116" width="34" height="22"/><path d="M226 118Q253 112 280 118L272 104H234Z"/><path d="M240 104Q253 96 266 104L262 98H244Z"/></g>
<rect x="248" y="124" width="10" height="12" fill="#ffc070"/>
${lantern(id, 232, 128, 2.6)}${lantern(id, 274, 128, 2.6)}
<g fill="#c0392b"><path d="M222 156Q240 152 258 156L257 159Q240 156 223 159Z"/><rect x="226" y="161" width="28" height="2"/><rect x="229" y="158" width="2.6" height="22"/><rect x="249" y="158" width="2.6" height="22"/></g>
<path d="M-10 220V170C20 160 60 162 90 176C110 186 124 200 132 220Z" fill="#120e1a"/>
${pine(52, 176, 1.3, '#0e0a12', '#141a1c', '#e98a6a')}${pine(360, 150, 0.9, '#120e1a', '#1a1e26', '#e98a6a')}`);
}

export function bamboo(id = 'b') {
  const r = rng(77);
  const layer = (n, colour, wMin, wMax, alpha) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const x = r() * (W + 20) - 10;
      const w = wMin + r() * (wMax - wMin);
      const lean = (r() - 0.5) * 10;
      out.push(`<path d="M${f(x)} ${H}L${f(x + lean)} -10" stroke="${colour}" stroke-width="${f(w)}" opacity="${alpha}"/>`);
      for (let y = H - 20 - r() * 20; y > 0; y -= 26 + r() * 10) {
        const nx = x + lean * (1 - y / H);
        out.push(`<path d="M${f(nx - w / 2)} ${f(y)}h${f(w)}" stroke="#0d1410" stroke-opacity=".5" stroke-width="1.2"/>`);
        if (r() > 0.75) out.push(`<path d="M${f(nx)} ${f(y)}q${f(10 + r() * 8)} -${f(4 + r() * 4)} ${f(20 + r() * 10)} ${f(2)}q-${f(12)} ${f(1)} -${f(20 + r() * 10)} -${f(2)}z" fill="${colour}" opacity="${alpha}"/>`);
      }
    }
    return out.join('');
  };
  const defs = grad(`${id}-sky`, [[0, '#9fb8a8'], [0.6, '#c9d6c0'], [1, '#e2e6cc']]) +
    grad(`${id}-fog`, [[0, '#dfe6d4', 0], [0.6, '#dfe6d4', 0.7], [1, '#dfe6d4', 0.9]]) +
    `<radialGradient id="${id}-ray" cx=".7" cy="0" r="1"><stop offset="0" stop-color="#fffbe0" stop-opacity=".6"/><stop offset="1" stop-color="#fffbe0" stop-opacity="0"/></radialGradient>`;
  return wrap('The bamboo grove in mist', defs, `<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>
${layer(26, '#8aa494', 4, 7, 0.7)}<rect width="${W}" height="${H}" fill="url(#${id}-fog)" opacity=".6"/>
${layer(16, '#4f7a5e', 6, 10, 0.9)}
<path d="M240 0L300 0L230 220H150Z" fill="url(#${id}-ray)" opacity=".7"/><path d="M320 0L350 0L300 220H250Z" fill="url(#${id}-ray)" opacity=".45"/>
<rect y="120" width="${W}" height="100" fill="url(#${id}-fog)" opacity=".7"/>
${layer(7, '#22382a', 11, 16, 1)}
<g fill="#1c2a20"><path d="M-10 220C20 206 50 204 80 212C100 206 120 210 130 220Z"/><path d="M290 220C310 206 350 202 400 210V220Z"/></g>`);
}

export function dunes(id = 'd') {
  const defs = grad(`${id}-sky`, [[0, '#3a5aa0'], [0.55, '#9ab8d8'], [1, '#f2d9a8']]) +
    grad(`${id}-lit`, [[0, '#f6c784'], [1, '#d89a5a']]) +
    grad(`${id}-shade`, [[0, '#a8643c'], [1, '#7a4428']]) +
    `<radialGradient id="${id}-sun"><stop offset="0" stop-color="#fffbe8"/><stop offset=".3" stop-color="#ffe9a8" stop-opacity=".6"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient>`;
  const dome = (x, w, y, h) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#c98a58"/><path d="M${x} ${y}a${w / 2} ${w / 2.2} 0 0 1 ${w} 0z" fill="#b87648"/><rect x="${x + w / 2}" y="${y}" width="${w / 2}" height="${h}" fill="#9a5e38" opacity=".55"/><rect x="${x + w * 0.38}" y="${y + h * 0.4}" width="${w * 0.24}" height="${h * 0.6}" rx="${w * 0.12}" fill="#4a2a1a"/>`;
  return wrap('The dune town at noon', defs, `<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>
<circle cx="300" cy="50" r="70" fill="url(#${id}-sun)"/><circle cx="300" cy="50" r="13" fill="#fffbe8"/>
<path d="M0 132C60 118 110 120 170 130C230 140 300 120 390 126V220H0Z" fill="#e2b07a" opacity=".7"/>
${dome(60, 30, 118, 26)}${dome(96, 22, 112, 32)}<rect x="124" y="94" width="10" height="50" fill="#b87648"/><path d="M122 94h14l-7-12z" fill="#9a5e38"/>${dome(140, 34, 122, 22)}${dome(220, 26, 120, 24)}
<path d="M0 150C70 130 140 136 200 152C250 166 320 140 390 146V220H0Z" fill="url(#${id}-lit)"/>
<path d="M200 152C250 166 320 140 390 146V220H260C240 190 220 168 200 152Z" fill="url(#${id}-shade)" opacity=".85"/>
<path d="M0 190C60 170 120 172 170 186C200 194 230 186 260 176C300 166 350 172 390 182V220H0Z" fill="url(#${id}-lit)"/>
<path d="M170 186C200 194 230 186 260 176C240 192 220 206 210 220H120C140 206 158 194 170 186Z" fill="url(#${id}-shade)" opacity=".7"/>
<g stroke="#fff3d6" stroke-opacity=".5" fill="none" stroke-width="1"><path d="M20 176C60 166 100 166 140 174"/><path d="M280 162C320 156 350 158 380 162"/></g>
`);
}

const INK = '#1d1510';
const iconWrap = (body) =>
  `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g stroke="${INK}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;

export const ICONS = {
  Lantern: iconWrap(`<circle cx="24" cy="25" r="20" fill="#ff9a3c" opacity=".18" stroke="none"/><path d="M24 4v5"/><rect x="17" y="8" width="14" height="4" rx="1" fill="#2a2030"/><ellipse cx="24" cy="25" rx="11" ry="13" fill="#e2532e"/><path d="M14.5 19h19M13.2 25h21.6M14.5 31h19" stroke-width="1" opacity=".6"/><ellipse cx="20" cy="22" rx="3" ry="6" fill="#ffd9a0" stroke="none" opacity=".75"/><rect x="17" y="37" width="14" height="4" rx="1" fill="#2a2030"/><path d="M24 41v4"/>`),
  Ramen: iconWrap(`<path d="M17 12c-2-3 2-5 0-8M24 12c-2-3 2-5 0-8M31 12c-2-3 2-5 0-8" stroke="#efe3c8" stroke-width="1.4" opacity=".8"/><path d="M28 6L40 22M33 5L43 20" stroke="#8a5a30" stroke-width="2"/><path d="M5 22h38a19 15 0 0 1-38 0z" fill="#c8452f"/><path d="M8 28h32" stroke="#efe3c8" stroke-width="1.4" stroke-dasharray="3 3"/><path d="M5 22h38" /><ellipse cx="24" cy="22" rx="19" ry="3" fill="#f3d88a"/><circle cx="18" cy="21.6" r="3" fill="#fff6e0"/><circle cx="18" cy="21.6" r="1.3" fill="#ffb02e" stroke="none"/><path d="M26 21l5 1.4" stroke="#3f7a3a" stroke-width="2.4"/><path d="M17 37h14v4H17z" fill="#8a3020"/>`),
  Scroll: iconWrap(`<rect x="10" y="9" width="28" height="30" fill="#efe3c8"/><rect x="7" y="6" width="34" height="5" rx="2.5" fill="#7a4a28"/><rect x="7" y="37" width="34" height="5" rx="2.5" fill="#7a4a28"/><path d="M16 17h16M16 22h12M16 27h16" stroke-width="1.4" opacity=".8"/><rect x="27" y="29" width="7" height="7" fill="#c0392b" stroke="none"/>`),
  Katana: iconWrap(`<path d="M9 39L34 9Q38 6 41 7Q40 11 36 13L13 42Z" fill="#dfe6ee"/><path d="M34 9Q38 6 41 7" stroke="#fff" stroke-width="1"/><path d="M11 40.5L35.5 11" stroke="#8fa3b6" stroke-width="1"/><ellipse cx="13" cy="36" rx="5" ry="2.4" transform="rotate(-50 13 36)" fill="#d9a441"/><path d="M5 46L12 38" stroke="#2a2030" stroke-width="5"/><path d="M6 44.4l1.6 1.4M8.4 41.6l1.6 1.4" stroke="#c0392b" stroke-width="1.4"/>`),
  Torii: iconWrap(`<path d="M4 11Q24 6 44 11L42 16Q24 12 6 16Z" fill="#d23a2c"/><rect x="9" y="19" width="30" height="4" fill="#d23a2c"/><rect x="12" y="15" width="5" height="29" fill="#d23a2c"/><rect x="31" y="15" width="5" height="29" fill="#d23a2c"/><rect x="22" y="15" width="4" height="5" fill="#2a2030"/><path d="M6 11Q24 7 42 11" stroke="#ffb48a" stroke-width="1"/>`),
  Onsen: iconWrap(`<path d="M15 20c-3-4 3-6 0-11M24 20c-3-4 3-6 0-11M33 20c-3-4 3-6 0-11" stroke="#efe3c8" stroke-width="2"/><ellipse cx="24" cy="32" rx="19" ry="9" fill="#6a5a50"/><ellipse cx="24" cy="31" rx="15" ry="6" fill="#57c7b8"/><path d="M14 31q5-2 10 0t10 0" stroke="#e8fffb" stroke-width="1.2" opacity=".8"/><circle cx="11" cy="37" r="3" fill="#8a7a6a"/><circle cx="37" cy="37.5" r="3.5" fill="#7a6a5a"/>`),
  Tea: iconWrap(`<path d="M18 14c-2-3 2-5 0-8M26 14c-2-3 2-5 0-8" stroke="#efe3c8" stroke-width="1.4" opacity=".8"/><path d="M9 18h30l-3 18a6 6 0 0 1-6 5H18a6 6 0 0 1-6-5z" fill="#4f7a5e"/><ellipse cx="24" cy="18" rx="15" ry="3" fill="#a8c46a"/><path d="M12 27h24" stroke="#2f5a3e" stroke-width="1.2"/><path d="M15 22l3 14" stroke="#7fa88a" stroke-width="2" opacity=".7"/>`),
  Seal: iconWrap(`<path d="M14 4h20v40H14z" fill="#f3e6c2"/><path d="M14 4h20v5H14z" fill="#d9a441"/><path d="M20 15c4 0 8 2 8 6s-6 3-6 7 4 5 6 8" stroke="#2a2030" stroke-width="2.4" fill="none"/><circle cx="24" cy="38" r="3.4" fill="#c0392b"/><path d="M18 14h-1M31 24h1" stroke-width="1.4"/>`),
  Dango: iconWrap(`<path d="M10 44L40 6" stroke="#b08a5a" stroke-width="2.4"/><circle cx="33" cy="15" r="7" fill="#f6a6bc"/><circle cx="25" cy="25" r="7" fill="#fff6e8"/><circle cx="17" cy="35" r="7" fill="#9ccf7a"/><g fill="#fff" stroke="none" opacity=".7"><circle cx="30.6" cy="12.6" r="1.8"/><circle cx="22.6" cy="22.6" r="1.8"/><circle cx="14.6" cy="32.6" r="1.8"/></g>`),
  Kunai: iconWrap(`<path d="M30 4L38 18L30 22L22 18Z" fill="#c9d2dc"/><path d="M30 4L30 22" stroke="#8fa3b6" stroke-width="1"/><path d="M26 22h8v14h-8z" fill="#2a2030"/><path d="M26 25.5l8 2M26 30.5l8 2" stroke="#7a6a5a" stroke-width="1.2"/><circle cx="30" cy="41" r="4" fill="none" stroke-width="2.4"/><path d="M8 14q4 6 0 12q4 6 0 12" stroke="#c0392b" stroke-width="1.6" fill="none"/>`),
  Onigiri: iconWrap(`<path d="M24 6C30 6 42 26 42 34C42 40 36 42 24 42C12 42 6 40 6 34C6 26 18 6 24 6Z" fill="#fbf6ea"/><path d="M15 32h18v10H15z" fill="#1f2a24"/><path d="M15 42c-6 0-9-2-9-8M33 42c6 0 9-2 9-8" fill="none"/><circle cx="24" cy="22" r="2.6" fill="#c0392b" stroke="none"/><path d="M14 22q2-6 6-10" stroke="#fff" stroke-width="2" opacity=".9"/>`),
  Fish: iconWrap(`<path d="M6 24C14 12 30 12 38 24C30 36 14 36 6 24Z" fill="#6f9fd8"/><path d="M38 24L46 16V32Z" fill="#4f7ab8"/><path d="M10 24C18 30 28 30 36 26" stroke="#d9e8f6" stroke-width="1.4" opacity=".8"/><circle cx="14" cy="22" r="2" fill="#1d1510"/><path d="M22 16q3 8 0 16M28 17q2 7 0 14" stroke-width="1" opacity=".6"/>`),
};

/** Fight stage: a clearing at night, two sides, a fire technique crossing between them. */
export function fight(id, allyPortrait, foePortrait) {
  const r = rng(9);
  const embers = [];
  for (let i = 0; i < 40; i++) {
    const t = r();
    const x = 100 + t * 190 + (r() - 0.5) * 40;
    const y = 214 - Math.sin(t * Math.PI) * 40 + (r() - 0.5) * 50;
    embers.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.6 + r() * 1.6)}" opacity="${f(0.4 + r() * 0.6)}"/>`);
  }
  const tongues = [];
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const x = 120 + t * 160;
    const y = 214 - Math.sin(t * Math.PI) * 34;
    const s = 10 + Math.sin(t * Math.PI) * 14 + t * 10;
    tongues.push(`<path d="M${f(x - s * 0.7)} ${f(y + s * 0.3)}C${f(x - s * 0.6)} ${f(y - s * 0.6)} ${f(x + s * 0.2)} ${f(y - s * 0.4)} ${f(x + s * 0.1)} ${f(y - s * 1.3)}C${f(x + s * 0.8)} ${f(y - s * 0.6)} ${f(x + s * 0.9)} ${f(y + s * 0.2)} ${f(x + s * 0.4)} ${f(y + s * 0.5)}Z" fill="url(#${id}-flame)" opacity="${f(0.55 + t * 0.4)}"/>`);
  }
  const trees = [];
  for (let i = 0; i < 9; i++) {
    const x = i * 48 + r() * 20 - 10;
    trees.push(`<path d="M${f(x)} 300V60" stroke="#141019" stroke-width="${f(8 + r() * 10)}"/>`);
  }
  const defs = lanternDefs(id) +
    grad(`${id}-sky`, [[0, '#0d0b1a'], [0.6, '#231b3a'], [1, '#3a2240']]) +
    grad(`${id}-groundg`, [[0, '#2a1f2c'], [1, '#100c14']]) +
    `<radialGradient id="${id}-flame" cx=".4" cy=".7" r=".8"><stop offset="0" stop-color="#fff6c8"/><stop offset=".35" stop-color="#ffc04a"/><stop offset=".75" stop-color="#ff6a2a"/><stop offset="1" stop-color="#c0291c" stop-opacity=".2"/></radialGradient>
<radialGradient id="${id}-burst"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".8"/><stop offset=".4" stop-color="#ff7a2a" stop-opacity=".35"/><stop offset="1" stop-color="#ff5a1a" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}-pool"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<clipPath id="${id}-ring-a"><circle cx="78" cy="196" r="44"/></clipPath><clipPath id="${id}-ring-b"><circle cx="312" cy="196" r="44"/></clipPath>`;
  const token = (cx, clip, portrait, colour) => `<ellipse cx="${cx}" cy="250" rx="54" ry="10" fill="url(#${id}-pool)"/>
<g clip-path="url(#${clip})"><svg x="${cx - 44}" y="152" width="88" height="110" viewBox="16 14 88 110">${portrait.replace(/<\/?svg[^>]*>/g, '')}</svg></g>
<circle cx="${cx}" cy="196" r="44" fill="none" stroke="${colour}" stroke-width="3"/><circle cx="${cx}" cy="196" r="48" fill="none" stroke="${colour}" stroke-opacity=".35" stroke-width="1"/>`;
  return `<svg viewBox="0 0 390 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A fight in the cedar clearing"><defs>${defs}</defs>
<rect width="390" height="300" fill="url(#${id}-sky)"/>
${stars(r, 40, 390, 300, { maxY: 90 })}
<path d="${ridge({ x1: 390, y: 120, amp: 14, seed: 41, bottom: 300 })}" fill="#1b1628"/>
${trees.join('')}
<path d="M0 238C80 226 160 230 200 232C260 234 330 226 390 236V300H0Z" fill="url(#${id}-groundg)"/>
<g stroke="#2e2434" stroke-width="1" opacity=".8"><path d="M20 262h60M110 276h90M240 266h70M300 284h70"/></g>
${lantern(id, 30, 112, 5)}${lantern(id, 362, 108, 5, { hue: 'white' })}
<circle cx="300" cy="196" r="90" fill="url(#${id}-burst)"/>
${tongues.join('')}
<g fill="#ffd27a">${embers.join('')}</g>
<path d="M120 222C170 168 236 166 286 196" stroke="#fff3c8" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".7"/>
${token(78, `${id}-ring-a`, allyPortrait, '#f0a050')}
${token(312, `${id}-ring-b`, foePortrait, '#e0566a')}
<g font-family="Shippori Mincho, serif" font-weight="700"><text x="300" y="134" fill="#fff3d6" font-size="15" text-anchor="middle" stroke="#1d1510" stroke-width="3" paint-order="stroke">Lantern Flare</text></g>
</svg>`;
}

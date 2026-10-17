import { blossom, f, lantern, lanternDefs, pagoda, ridge, rng, sagPath, sagPoint, stars, townhouse } from './lib.mjs';

/** Tōrōgakure at evening: the hub backdrop, 390×500. */
export function village(id = 'v', { bough: side = 'left', moon = [292, 96] } = {}) {
  const W = 390;
  const H = 500;
  const r = rng(7);
  const parts = [];

  // Sky and moon.
  parts.push(`<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>`);
  parts.push(stars(r, 90, W, H, { maxY: 230 }));
  parts.push(`<g transform="translate(${moon[0] - 292} ${moon[1] - 96})"><circle cx="292" cy="96" r="120" fill="url(#${id}-halo)"/>
<circle cx="292" cy="96" r="30" fill="url(#${id}-moon)"/>
<g fill="#d9c7a4" opacity=".35"><circle cx="283" cy="88" r="5"/><circle cx="301" cy="104" r="3.4"/><circle cx="296" cy="84" r="2"/><circle cx="279" cy="104" r="2.6"/></g>`);
  const moonClouds = '</g>';
  // Thin clouds drifting over the moon.
  parts.push(`<g fill="url(#${id}-cloud)">
<path d="M196 112c18-8 40-6 56-1 20-8 52-8 74 0 14-2 30 0 40 5-30 6-72 6-110 4-24 2-46 0-60-8z"/>
<path d="M232 72c14-5 30-4 42 0 16-5 38-4 52 2-22 4-52 4-72 3-10 0-18-2-22-5z" opacity=".7"/></g>${moonClouds}<g fill="url(#${id}-cloud)">
<path d="M-20 150c30-10 70-8 96 0 22-6 56-6 80 2-34 8-96 8-140 6-18 0-30-3-36-8z" opacity=".55"/></g>`);

  // Far mountains, mixing into the sky.
  parts.push(`<path d="${ridge({ x1: W, y: 238, amp: 46, seed: 3, bottom: H, freq: 1.2 })}" fill="#3a2c4c"/>`);
  parts.push(`<path d="${ridge({ x1: W, y: 262, amp: 30, seed: 11, bottom: H, freq: 1.8 })}" fill="#2c2240"/>`);
  parts.push(`<rect y="232" width="${W}" height="70" fill="url(#${id}-haze)"/>`);

  // Hill, Lantern Tower and its terrace.
  parts.push(`<path d="M-10 330C40 300 90 292 140 296C190 300 230 318 260 330V${H}H-10Z" fill="#221a30"/>`);
  parts.push(`<path d="M66 314H170L182 344H54Z" fill="#1c1626"/><g stroke="#2c2436" stroke-width="1"><path d="M62 324H174M58 334H178M80 314v10M110 314v10M140 314v10M70 324v10M96 324v10M126 324v10M156 324v10M88 334v10M118 334v10M148 334v10"/></g><path d="M104 344L110 314H126L132 344Z" fill="#241c2e"/><g stroke="#352c40"><path d="M106 336H130M108 328H128M109 320H127"/></g>`);
  const tower = pagoda(id, 118, 314, 1.05);
  parts.push(tower.svg);
  for (const [l, y, rr] of tower.corners) {
    parts.push(lantern(id, l, y + 6, 2.6, { hue: 'red' }));
    parts.push(lantern(id, rr, y + 6, 2.6, { hue: 'red' }));
  }
  // Back row of roofs on the far slope.
  const back = [];
  for (let x = 170; x < W + 20; x += 26 + r() * 8) {
    const h = 14 + r() * 10;
    const b = 322 + (x - 170) * 0.05;
    back.push(`<path d="M${f(x - 4)} ${f(b - h)}L${f(x + 4)} ${f(b - h - 8)}H${f(x + 22)}L${f(x + 30)} ${f(b - h)}Z" fill="#251d2f"/><rect x="${f(x)}" y="${f(b - h)}" width="26" height="${f(h + 20)}" fill="#1e1828"/>`);
    if (r() > 0.4) back.push(`<rect x="${f(x + 8)}" y="${f(b - h + 4)}" width="6" height="5" fill="#ffc070" opacity=".75"/>`);
  }
  parts.push(back.join(''));
  // Mist pooling in the valley.
  parts.push(`<rect y="318" width="${W}" height="60" fill="url(#${id}-mist)"/>`);

  // Near street: townhouses either side of a lane.
  const houses = [
    { x: -6, w: 70, base: 452, h: 96, lit: [true, true], noren: '#2e3d6b' },
    { x: 70, w: 54, base: 446, h: 74, lit: [false, true], noren: '#8a2b22' },
    { x: 262, w: 58, base: 446, h: 78, lit: [true, true], noren: '#2f5a4a' },
    { x: 326, w: 72, base: 454, h: 104, lit: [true, false], noren: '#8a2b22' },
  ];
  for (const h of houses) parts.push(townhouse(id, { ...h, r }));

  // A watcher crouched on the ridge of the tall house, cut out against the sky.
  parts.push(`<g fill="#0b0810" transform="translate(0 -17)"><circle cx="356" cy="326" r="4.2"/><path d="M352 325Q344 321 337 325Q345 324 352 327Z"/><path d="M354 331Q340 329 330 336Q342 334 353 335Z"/><path d="M352 330Q349 338 352 344L362 344Q362 336 359 330Z"/><path d="M352 344L345 353H360V346Z"/><path d="M358 344L366 339L369 353H364L363 346Z"/><path d="M358 332L367 340L365 342L356 336Z"/></g>`);

  // Ground: the lane running in, warm with reflected light.
  parts.push(`<path d="M0 440H${W}V${H}H0Z" fill="url(#${id}-ground)"/>
<path d="M150 440L124 ${H}H266L240 440Z" fill="#2b2230" opacity=".7"/>
<g stroke="#3a2e3e" stroke-width="1" opacity=".8"><path d="M120 456H270M112 472H278M102 490H288"/></g>`);
  // A torii framing the lane's end.
  parts.push(`<g fill="#7d2418"><path d="M150 388Q195 380 240 388L238 394Q195 388 152 394Z"/><rect x="156" y="400" width="78" height="4"/><rect x="164" y="392" width="5" height="52"/><rect x="221" y="392" width="5" height="52"/></g>
<path d="M150 388Q195 380 240 388" stroke="#ffb46a" stroke-opacity=".5" stroke-width="1" fill="none"/>`);

  // Lantern strings across the lane.
  const strings = [
    { a: [60, 372], b: [268, 378], sag: 12, n: 7 },
    { a: [-4, 404], b: [330, 398], sag: 16, n: 9 },
  ];
  for (const s of strings) {
    parts.push(`<path d="${sagPath(s.a, s.b, s.sag)}" stroke="#120d14" stroke-width="1" fill="none"/>`);
    for (let i = 1; i <= s.n; i++) {
      const [x, y] = sagPoint(s.a, s.b, s.sag, i / (s.n + 1));
      parts.push(lantern(id, x, y + 9, s.n > 7 ? 5.2 : 4, { hue: i % 3 === 0 ? 'white' : 'red', swing: (r() - 0.5) * 8 }));
    }
  }
  // Reflections of the light on the wet stones.
  parts.push(`<g fill="#ffa456" opacity=".14"><ellipse cx="96" cy="470" rx="5" ry="20"/><ellipse cx="190" cy="466" rx="4" ry="16"/><ellipse cx="280" cy="474" rx="6" ry="22"/><ellipse cx="34" cy="478" rx="4" ry="16"/></g>`);

  // A standing stone lantern by the right house.
  parts.push(`<g><rect x="244" y="430" width="10" height="16" fill="#3a3340"/><path d="M238 430h22l-4-6h-14z" fill="#4a4250"/><rect x="241" y="416" width="16" height="8" fill="#ffcf7a"/><rect x="241" y="416" width="16" height="8" fill="none" stroke="#3a3340" stroke-width="2"/><path d="M236 416h26l-13-9z" fill="#4a4250"/><circle cx="249" cy="420" r="18" fill="url(#${id}-glow)"/></g>`);

  // Foreground sakura bough from the top left, with falling petals.
  const bough = `M-10 18C30 22 62 34 92 52C110 62 130 64 150 60M60 32C70 14 84 6 100 2M92 52C96 70 92 84 82 96M120 60C134 74 146 78 162 78`;
  const mirror = side === 'right' ? ' transform="matrix(-1 0 0 1 390 0)"' : '';
  parts.push(`<g${mirror}>`);
  parts.push(`<path d="${bough}" stroke="#140e12" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M-10 18C30 22 62 34 92 52" stroke="#140e12" stroke-width="9" stroke-linecap="round" fill="none"/>`);
  const blooms = [];
  const along = [
    [20, 22], [40, 26], [58, 30], [74, 38], [88, 48], [104, 56], [124, 60], [142, 60], [158, 58],
    [66, 22], [74, 14], [86, 8], [98, 4], [94, 66], [90, 80], [84, 92], [132, 70], [146, 76], [160, 78],
  ];
  for (const [x, y] of along) {
    for (let k = 0; k < 3; k++) {
      blooms.push(blossom(x + (r() - 0.5) * 18, y + (r() - 0.5) * 16, 4 + r() * 3, r() * 72, k === 0 ? '#ffe6ec' : '#ffc4d3'));
    }
  }
  parts.push(blooms.join(''), '</g>');
  const petals = [];
  for (let i = 0; i < 26; i++) {
    const x = r() * W;
    const y = 60 + r() * 400;
    petals.push(`<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(1.6 + r() * 1.4)}" ry="${f(0.9 + r() * 0.6)}" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})" opacity="${f(0.5 + r() * 0.5)}"/>`);
  }
  parts.push(`<g fill="#ffc6d4">${petals.join('')}</g>`);

  // Vignette and a fade into the UI below.
  parts.push(`<rect width="${W}" height="${H}" fill="url(#${id}-vig)"/><rect y="${H - 90}" width="${W}" height="90" fill="url(#${id}-fade)"/>`);

  const defs = `<defs>${lanternDefs(id)}
<linearGradient id="${id}-sky" x2="0" y2="1"><stop offset="0" stop-color="#0c0a1f"/><stop offset=".35" stop-color="#231a44"/><stop offset=".6" stop-color="#5a2d55"/><stop offset=".8" stop-color="#b65a4e"/><stop offset="1" stop-color="#e9935a"/></linearGradient>
<radialGradient id="${id}-halo"><stop offset="0" stop-color="#ffe9c4" stop-opacity=".35"/><stop offset=".3" stop-color="#ffd9a8" stop-opacity=".12"/><stop offset="1" stop-color="#ffd9a8" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}-moon" cx=".4" cy=".38"><stop offset="0" stop-color="#fffaf0"/><stop offset=".7" stop-color="#f6e6c4"/><stop offset="1" stop-color="#e3c99a"/></radialGradient>
<linearGradient id="${id}-cloud" x2="0" y2="1"><stop offset="0" stop-color="#8a6a8e" stop-opacity=".55"/><stop offset="1" stop-color="#3a2a52" stop-opacity=".25"/></linearGradient>
<linearGradient id="${id}-haze" x2="0" y2="1"><stop offset="0" stop-color="#d77a5e" stop-opacity="0"/><stop offset=".6" stop-color="#d77a5e" stop-opacity=".28"/><stop offset="1" stop-color="#d77a5e" stop-opacity="0"/></linearGradient>
<linearGradient id="${id}-mist" x2="0" y2="1"><stop offset="0" stop-color="#c9839a" stop-opacity="0"/><stop offset=".5" stop-color="#b9789a" stop-opacity=".32"/><stop offset="1" stop-color="#b9789a" stop-opacity="0"/></linearGradient>
<linearGradient id="${id}-shoji" x2="0" y2="1"><stop offset="0" stop-color="#ffe0a0"/><stop offset="1" stop-color="#f08a3c"/></linearGradient>
<linearGradient id="${id}-ground" x2="0" y2="1"><stop offset="0" stop-color="#2a1e2a"/><stop offset="1" stop-color="#120e16"/></linearGradient>
<radialGradient id="${id}-vig" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#05040a" stop-opacity=".55"/></radialGradient>
<linearGradient id="${id}-fade" x2="0" y2="1"><stop offset="0" stop-color="#14121b" stop-opacity="0"/><stop offset="1" stop-color="#14121b"/></linearGradient>
</defs>`;
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Tōrōgakure at evening">${defs}${parts.join('\n')}</svg>`;
}

// Shared helpers for the art mockups: a seeded rng, ridgelines, lanterns, roofs.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const f = (n) => Math.round(n * 10) / 10;

/** A natural ridgeline from x0..x1 around baseline y, closed down to `bottom`. */
export function ridge({ x0 = 0, x1, y, amp, seed, step = 6, bottom, freq = 1 }) {
  const r = rng(seed);
  const waves = Array.from({ length: 4 }, (_, i) => ({
    k: ((0.6 + r() * 0.8) * (i + 1) * 2 * Math.PI * freq) / (x1 - x0),
    p: r() * Math.PI * 2,
    a: amp / (i + 1) ** 1.25,
  }));
  const pts = [];
  for (let x = x0; x <= x1 + 0.01; x += step) {
    let h = 0;
    for (const w of waves) h += Math.sin(x * w.k + w.p) * w.a;
    h += (r() - 0.5) * amp * 0.06;
    pts.push([x, y - h]);
  }
  return `M${x0} ${bottom}L${pts.map(([x, yy]) => `${f(x)} ${f(yy)}`).join('L')}L${x1} ${bottom}Z`;
}

/** Point on a quadratic sag between two hangs. */
export function sagPoint(a, b, sag, t) {
  const cx = (a[0] + b[0]) / 2;
  const cy = (a[1] + b[1]) / 2 + sag * 2;
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * cx + t * t * b[0], u * u * a[1] + 2 * u * t * cy + t * t * b[1]];
}

export function sagPath(a, b, sag) {
  const cx = (a[0] + b[0]) / 2;
  const cy = (a[1] + b[1]) / 2 + sag * 2;
  return `M${f(a[0])} ${f(a[1])}Q${f(cx)} ${f(cy)} ${f(b[0])} ${f(b[1])}`;
}

/** A paper chōchin lantern: glow, ribbed body, lacquer caps. `id` prefixes gradient ids. */
export function lantern(id, cx, cy, s, { glow = true, hue = 'red', swing = 0 } = {}) {
  const body = hue === 'red' ? `${id}-lb` : `${id}-lw`;
  const ribs = [];
  for (let i = -2; i <= 2; i++) {
    const y = cy + i * s * 0.36;
    const half = s * 0.8 * Math.sqrt(1 - (i * 0.36) ** 2);
    ribs.push(`M${f(cx - half)} ${f(y)}Q${f(cx)} ${f(y + s * 0.12)} ${f(cx + half)} ${f(y)}`);
  }
  return `<g transform="rotate(${swing} ${f(cx)} ${f(cy - s * 1.4)})">
${glow ? `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(s * 4.2)}" fill="url(#${id}-glow)"/>` : ''}
<path d="M${f(cx)} ${f(cy - s * 1.6)}V${f(cy - s)}" stroke="#120d14" stroke-width="${f(s * 0.12)}"/>
<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(s * 0.8)}" ry="${f(s)}" fill="url(#${body})"/>
<path d="${ribs.join('')}" stroke="#7a1d12" stroke-opacity=".45" stroke-width="${f(s * 0.07)}" fill="none"/>
<rect x="${f(cx - s * 0.42)}" y="${f(cy - s * 1.1)}" width="${f(s * 0.84)}" height="${f(s * 0.24)}" rx="${f(s * 0.05)}" fill="#141016"/>
<rect x="${f(cx - s * 0.42)}" y="${f(cy + s * 0.88)}" width="${f(s * 0.84)}" height="${f(s * 0.24)}" rx="${f(s * 0.05)}" fill="#141016"/>
<ellipse cx="${f(cx - s * 0.22)}" cy="${f(cy - s * 0.2)}" rx="${f(s * 0.18)}" ry="${f(s * 0.45)}" fill="#fff2c8" opacity=".55"/>
</g>`;
}

export function lanternDefs(id) {
  return `<radialGradient id="${id}-glow"><stop offset="0" stop-color="#ffb35c" stop-opacity=".55"/><stop offset=".35" stop-color="#ff8a3d" stop-opacity=".22"/><stop offset="1" stop-color="#ff7a2e" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}-lb" cx=".42" cy=".4" r=".7"><stop offset="0" stop-color="#ffe7a8"/><stop offset=".45" stop-color="#ff9a3c"/><stop offset="1" stop-color="#b8321c"/></radialGradient>
<radialGradient id="${id}-lw" cx=".42" cy=".4" r=".7"><stop offset="0" stop-color="#fffbe8"/><stop offset=".5" stop-color="#ffd890"/><stop offset="1" stop-color="#c77a2a"/></radialGradient>`;
}

/** A machiya townhouse: tiled roof with rim light, lit shoji, a noren at the door. */
export function townhouse(id, { x, w, base, h, storeys = 2, lit = [true, true], noren = '#2e3d6b', r }) {
  const out = [];
  const wall = '#17121d';
  out.push(`<rect x="${x}" y="${base - h}" width="${w}" height="${h}" fill="${wall}"/>`);
  const roof = (ey, rw, rh, over) => {
    const l = x - over;
    const rr = x + w + over;
    const tiles = [];
    for (let tx = l + 4; tx < rr - 2; tx += 3.2) {
      const top = tx < x + 6 || tx > x + w - 6 ? ey - rh * 0.6 : ey - rh;
      tiles.push(`M${f(tx)} ${f(ey - 1)}L${f(tx + (tx - (l + rr) / 2) * -0.04)} ${f(top + 1)}`);
    }
    return `<path d="M${l} ${ey + 1}Q${f((l + rr) / 2)} ${ey + 4} ${rr} ${ey + 1}L${rr - 2} ${ey - 3}L${x + w - 4} ${ey - rh}L${x + 4} ${ey - rh}L${l + 2} ${ey - 3}Z" fill="#241c2c"/>
<path d="${tiles.join('')}" stroke="#3b3044" stroke-width="1"/>
<path d="M${l} ${ey + 1}Q${f((l + rr) / 2)} ${ey + 4} ${rr} ${ey + 1}" stroke="#e6914e" stroke-opacity=".55" stroke-width="1.2" fill="none"/>
<path d="M${x + 4} ${ey - rh}H${x + w - 4}" stroke="#4a3a52" stroke-width="2"/>`;
  };
  const floorH = h / storeys;
  for (let s = 0; s < storeys; s++) {
    const top = base - h + s * floorH;
    const wy = top + floorH * 0.28;
    const wh = floorH * 0.5;
    const isLit = lit[s] ?? false;
    const panes = Math.max(2, Math.round(w / 14));
    const ww = (w - 10) / panes;
    for (let p = 0; p < panes; p++) {
      const on = isLit && r() > 0.22;
      const px = x + 5 + p * ww;
      out.push(
        `<rect x="${f(px + 0.6)}" y="${f(wy)}" width="${f(ww - 1.2)}" height="${f(wh)}" fill="${on ? `url(#${id}-shoji)` : '#2a2230'}"/>`,
      );
      if (on) {
        const lat = [];
        for (let g = 1; g < 3; g++) lat.push(`M${f(px + (ww * g) / 3)} ${f(wy)}v${f(wh)}`);
        lat.push(`M${f(px)} ${f(wy + wh / 2)}h${f(ww)}`);
        out.push(`<path d="${lat.join('')}" stroke="#5a2f17" stroke-opacity=".55" stroke-width=".7"/>`);
      }
    }
    if (s === storeys - 1 && noren) {
      const nx = x + w * 0.3;
      const nw = Math.min(w * 0.4, 26);
      const ny = top + floorH * 0.15;
      out.push(`<path d="M${f(nx)} ${f(ny)}h${f(nw)}v${f(floorH * 0.38)}h-${f(nw / 2 - 1)}v-${f(floorH * 0.3)}h-2v${f(floorH * 0.3)}h-${f(nw / 2 - 1)}Z" fill="${noren}"/>
<circle cx="${f(nx + nw * 0.25)}" cy="${f(ny + floorH * 0.14)}" r="${f(nw * 0.08)}" fill="#efe3c8" opacity=".8"/>`);
    }
    if (s > 0) out.push(roof(top, w, 6, 5));
  }
  out.push(roof(base - h, w, 14, 9));
  return out.join('\n');
}

/** A five-storey pagoda: the Lantern Tower over the village. */
export function pagoda(id, cx, base, scale = 1) {
  const out = [];
  let y = base;
  const tiers = 5;
  const tops = [];
  for (let i = 0; i < tiers; i++) {
    const bw = (46 - i * 6) * scale;
    const th = (20 - i * 1.5) * scale;
    const rw = bw + 26 * scale;
    const rh = 9 * scale;
    out.push(`<rect x="${f(cx - bw / 2)}" y="${f(y - th)}" width="${f(bw)}" height="${f(th)}" fill="#1a1422"/>`);
    const wn = 3;
    for (let k = 0; k < wn; k++) {
      const wx = cx - bw / 2 + bw * (0.18 + k * 0.26);
      out.push(
        `<rect x="${f(wx)}" y="${f(y - th * 0.78)}" width="${f(bw * 0.12)}" height="${f(th * 0.5)}" fill="url(#${id}-shoji)" opacity="${k === 1 ? 1 : 0.75}"/>`,
      );
    }
    y -= th;
    const l = cx - rw / 2;
    const r = cx + rw / 2;
    out.push(`<path d="M${f(l)} ${f(y - 5 * scale)}Q${f(l + 6 * scale)} ${f(y + 1)} ${f(l + 14 * scale)} ${f(y + 1)}H${f(r - 14 * scale)}Q${f(r - 6 * scale)} ${f(y + 1)} ${f(r)} ${f(y - 5 * scale)}L${f(cx + bw / 2 - 2)} ${f(y - rh)}H${f(cx - bw / 2 + 2)}Z" fill="#221a2a"/>
<path d="M${f(l)} ${f(y - 5 * scale)}Q${f(l + 6 * scale)} ${f(y + 1)} ${f(l + 14 * scale)} ${f(y + 1)}H${f(r - 14 * scale)}Q${f(r - 6 * scale)} ${f(y + 1)} ${f(r)} ${f(y - 5 * scale)}" stroke="#f0a050" stroke-opacity=".6" stroke-width="1.1" fill="none"/>`);
    tops.push([l + 1, y - 4 * scale, r - 1]);
    y -= rh;
  }
  out.push(`<path d="M${f(cx)} ${f(y)}V${f(y - 30 * scale)}" stroke="#2a2232" stroke-width="${f(2.4 * scale)}"/>`);
  for (let k = 0; k < 6; k++)
    out.push(`<ellipse cx="${f(cx)}" cy="${f(y - 6 * scale - k * 3.6 * scale)}" rx="${f(3.2 * scale)}" ry="${f(0.9 * scale)}" fill="#3a3040"/>`);
  out.push(`<circle cx="${f(cx)}" cy="${f(y - 33 * scale)}" r="${f(2.6 * scale)}" fill="#ffd27a"/>`);
  return { svg: out.join('\n'), corners: tops, top: y - 33 * scale };
}

/** A five-petal sakura blossom. */
export function blossom(cx, cy, s, rot, light = '#ffd6e0', dark = '#e889a6') {
  const petals = [];
  for (let i = 0; i < 5; i++) {
    const a = rot + i * 72;
    petals.push(`<ellipse cx="${f(cx)}" cy="${f(cy - s * 0.55)}" rx="${f(s * 0.36)}" ry="${f(s * 0.55)}" transform="rotate(${f(a)} ${f(cx)} ${f(cy)})"/>`);
  }
  return `<g fill="${light}" stroke="${dark}" stroke-width="${f(s * 0.08)}">${petals.join('')}</g><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(s * 0.2)}" fill="#c2405e"/>`;
}

export function stars(r, n, w, h, { maxY = h } = {}) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = r() * w;
    const y = r() ** 1.6 * maxY;
    const rad = r() < 0.08 ? 1.3 : 0.4 + r() * 0.6;
    out.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(rad)}" opacity="${f(0.35 + r() * 0.6)}"/>`);
  }
  return `<g fill="#fff6e0">${out.join('')}</g>`;
}

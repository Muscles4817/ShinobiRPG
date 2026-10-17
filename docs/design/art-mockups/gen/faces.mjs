// A parametric bust portrait, 120×150: every feature is its own part, so people differ in
// face shape, neck, eyes, brows, nose, ears, mouth, expression, age and marks, not just colour.
const INK = '#1d1510';
const f = (n) => Math.round(n * 10) / 10;
const CX = 60;

// ── Face shapes: temple, cheekbone, jaw-corner and chin widths, jaw and chin heights. ──
export const FACES = {
  oval: { tw: 18, cw: 20, jw: 15, jawY: 78, chinW: 5, chinY: 89, chinR: 2, corner: 0.5 },
  round: { tw: 20.5, cw: 24, jw: 21.5, jawY: 75, chinW: 10.5, chinY: 85, chinR: 3.6, corner: 0.8 },
  square: { tw: 19.5, cw: 21, jw: 20.5, jawY: 83, chinW: 10, chinY: 89, chinR: 1, corner: 0.1 },
  long: { tw: 16, cw: 17.5, jw: 14.5, jawY: 87, chinW: 6.5, chinY: 98, chinR: 2, corner: 0.45 },
  heart: { tw: 20.5, cw: 21, jw: 12, jawY: 79, chinW: 3, chinY: 90, chinR: 1.2, corner: 0.6 },
  angular: { tw: 15.5, cw: 21.5, jw: 13, jawY: 80, chinW: 4.5, chinY: 92, chinR: 0.6, corner: 0.2 },
};

/** One side of the face from temple to chin, as path commands; `s` is -1 left, +1 right. */
function side(g, s) {
  const x = (d) => f(CX + s * d);
  const jawBend = 6 + g.corner * 6;
  return [
    `C${x(g.tw)} 48 ${x(g.cw)} 51 ${x(g.cw)} 60`,
    `C${x(g.cw)} ${f(66 + g.corner * 2)} ${x(g.jw + (g.cw - g.jw) * g.corner)} ${f(g.jawY - jawBend)} ${x(g.jw)} ${g.jawY}`,
    `C${x(g.jw - (g.jw - g.chinW) * (0.25 + g.corner * 0.3))} ${f(g.jawY + (g.chinY - g.jawY) * (0.5 - g.corner * 0.2))} ${x(g.chinW + 2)} ${g.chinY} ${x(g.chinW)} ${g.chinY}`,
  ];
}

export function facePath(g) {
  const [l1, l2, l3] = side(g, -1);
  const right = side(g, 1);
  // Right side is walked chin→temple: reverse each curve's control points.
  const rev = (cmd, from) => {
    const n = cmd.slice(1).split(' ').map(Number);
    return `C${n[2]} ${n[3]} ${n[0]} ${n[1]} ${from[0]} ${from[1]}`;
  };
  const tempL = [f(CX - g.tw), 42];
  const tempR = [f(CX + g.tw), 42];
  const cheekR = [f(CX + g.cw), 60];
  const jawR = [f(CX + g.jw), g.jawY];
  return `M${tempL[0]} ${tempL[1]}${l1}${l2}${l3}Q${CX} ${f(g.chinY + g.chinR)} ${f(CX + g.chinW)} ${g.chinY}${rev(right[2], jawR)}${rev(right[1], cheekR)}${rev(right[0], tempR)}C${f(CX + g.tw)} 30 ${f(CX + 8)} 26 ${CX} 26C${f(CX - 8)} 26 ${f(CX - g.tw)} 30 ${tempL[0]} ${tempL[1]}Z`;
}

// ── Eyes: width, upper and lower lid depth, outer-corner tilt, iris size, lid type. ──
export const EYES = {
  almond: { w: 12.4, hu: 3.8, hl: 2.2, tilt: 0.8, iris: 3.3, crease: true },
  round: { w: 12, hu: 5.6, hl: 4.4, tilt: -0.2, iris: 4, crease: true },
  narrow: { w: 13, hu: 1.9, hl: 1, tilt: 0.4, iris: 2.8, crease: false },
  upturned: { w: 13, hu: 3.2, hl: 1.6, tilt: 4.2, iris: 3, crease: false },
  downturned: { w: 12, hu: 3.8, hl: 2.8, tilt: -3, iris: 3.3, crease: true },
  hooded: { w: 12.4, hu: 3.8, hl: 2.2, tilt: 0.2, iris: 3.2, crease: false, lid: 0.55 },
};

/** The viewer's left eye, drawn at the origin with its inner corner towards +x. */
function eyeShape(e, squint) {
  const hw = e.w / 2;
  const hl = Math.max(0.6, e.hl - squint);
  const upper = `M${hw} 0Q${f(-hw * 0.1)} ${f(-2 * e.hu)} ${-hw} ${f(-e.tilt)}`;
  const lower = `Q${f(-hw * 0.05)} ${f(2 * hl)} ${hw} 0`;
  return { white: `${upper}${lower}Z`, upper, hw, lowerLid: `M${-hw} ${f(-e.tilt)}${lower}` };
}

function eye(id, e, look, idx) {
  const { white, upper, hw, lowerLid } = eyeShape(e, look.squint);
  const happy = look.squint > 1 ? `<path d="${lowerLid}" stroke="${INK}" stroke-width="1.1" fill="none" stroke-linecap="round"/>` : '';
  const clip = `${id}-e${idx}`;
  const lidCover = e.lid ? `<path d="M${hw + 1} 1L${hw + 1} -9H${-hw - 1}V${f(-e.tilt + 1)}Q0 ${f(-e.hu * (2 - e.lid * 2.2))} ${hw + 1} 1Z" fill="${look.skin}"/>` : '';
  const lidLine = e.lid ? `<path d="M${hw} 0.2Q0 ${f(-e.hu * (2 - e.lid * 2.2))} ${-hw} ${f(-e.tilt + 0.4)}" stroke="${INK}" stroke-width="1.9" fill="none" stroke-linecap="round"/>` : `<path d="${upper}" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  const crease = e.crease ? `<path d="M${f(hw * 0.5)} ${f(-e.hu * 1.55)}Q${f(-hw * 0.2)} ${f(-e.hu * 2.05)} ${f(-hw * 0.95)} ${f(-e.tilt - e.hu * 0.9)}" stroke="${INK}" stroke-width=".6" fill="none" opacity=".55"/>` : '';
  const flick = `<path d="M${-hw} ${f(-e.tilt)}l-1.6 ${f(-1 - e.tilt * 0.25)}" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/>`;
  return `<clipPath id="${clip}"><path d="${white}"/></clipPath>
<path d="${white}" fill="#fbf6ee"/>
<g clip-path="url(#${clip})"><circle cx="-0.6" cy="${f(-e.tilt * 0.4 + 0.3)}" r="${e.iris}" fill="url(#${id}-iris)"/><circle cx="-0.6" cy="${f(-e.tilt * 0.4 + 0.3)}" r="${f(e.iris * 0.45)}" fill="${INK}"/><path d="M-9 -9H9V${f(-e.hu * 0.6)}Q0 ${f(-e.hu * 0.2)} -9 ${f(-e.hu * 0.6)}Z" fill="${INK}" opacity=".16"/></g>
<circle cx="${f(-0.6 + e.iris * 0.35)}" cy="${f(-e.tilt * 0.4 - e.iris * 0.35)}" r="${f(e.iris * 0.28)}" fill="#fff"/>
${lidCover}${lidLine}${crease}${flick}${happy}`;
}

// ── Brows: thickness, arch, angle; expression raises or furrows the inner end. ──
export const BROWS = {
  straight: { t: 1.6, arch: 0.8, angle: 0 },
  arched: { t: 1.4, arch: 3, angle: 0.5 },
  thick: { t: 2.8, arch: 1.2, angle: 0.2 },
  angled: { t: 1.8, arch: 1.4, angle: -2.2 },
  thin: { t: 0.9, arch: 2.2, angle: 0.6 },
  bushy: { t: 3.2, arch: 1, angle: 0, bushy: true },
};

function brow(b, e, look) {
  const inner = [e.w / 2 + 1.2, -e.hu - 4.2 + look.browInner];
  const outer = [-e.w / 2 - 1.4, -e.tilt - e.hu - 2.8 + b.angle + look.browOuter];
  const mid = [(inner[0] + outer[0]) / 2 - 1, Math.min(inner[1], outer[1]) - b.arch];
  const d = `M${f(inner[0])} ${f(inner[1])}Q${f(mid[0])} ${f(mid[1])} ${f(outer[0])} ${f(outer[1])}`;
  const tufts = b.bushy ? `<path d="M${f(inner[0])} ${f(inner[1] - 1)}l-2 -1.4M${f(mid[0] + 1)} ${f(mid[1] + 0.2)}l-2 -1.2M${f(outer[0] + 2)} ${f(outer[1] - 0.8)}l-1.6 -0.8" stroke="${look.browColour}" stroke-width="1" stroke-linecap="round"/>` : '';
  return `<path d="${d}" stroke="${look.browColour}" stroke-width="${b.t}" fill="none" stroke-linecap="round"/>${tufts}`;
}

// ── Noses: drawn from the bridge to the tip, with a shadow on the far side. ──
export const NOSES = {
  button: (y, c) => `<path d="M58.4 ${y - 0.6}Q60 ${y + 1} 61.6 ${y - 0.6}" stroke="${c}" stroke-width="1.3" fill="none" stroke-linecap="round"/><circle cx="60.8" cy="${y - 1.6}" r=".6" fill="#fff" opacity=".6"/>`,
  straight: (y, c) => `<path d="M61 ${y - 9}L62.2 ${y - 1}Q61.4 ${y + 1} 59 ${y + 0.4}" stroke="${c}" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M58 ${y}q.8 .8 1.6 .4" stroke="${c}" stroke-width=".8" fill="none"/>`,
  hooked: (y, c) => `<path d="M60.6 ${y - 10}Q64.6 ${y - 5} 63 ${y}L61.4 ${y - 6}Z" fill="${c}" opacity=".35"/><path d="M60.4 ${y - 10}Q64.4 ${y - 5} 62.8 ${y - 0.4}Q61.4 ${y + 1.6} 58.8 ${y + 0.4}" stroke="${c}" stroke-width="1.35" fill="none" stroke-linecap="round"/><path d="M62 ${y - 7}q1 2 .6 4" stroke="#fff" stroke-opacity=".45" stroke-width=".8" fill="none"/>`,
  broad: (y, c) => `<path d="M62 ${y - 9}Q64 ${y - 3} 64.6 ${y - 1}Q62.6 ${y} 62 ${y - 9}Z" fill="${c}" opacity=".35"/><path d="M55.6 ${y - 1.4}Q56.4 ${y + 1.2} 58.6 ${y + 0.8}M61.4 ${y + 0.8}Q63.6 ${y + 1.2} 64.4 ${y - 1.4}" stroke="${c}" stroke-width="1.35" fill="none" stroke-linecap="round"/><path d="M58.4 ${y + 0.6}Q60 ${y + 2} 61.6 ${y + 0.6}" stroke="${c}" stroke-width=".9" fill="none"/><path d="M62.2 ${y - 8}q.8 4 .6 6" stroke="${c}" stroke-width=".7" fill="none" opacity=".6"/>`,
  long: (y, c) => `<path d="M61 ${y - 11}Q62 ${y - 3} 62.6 ${y + 1.4}L61.2 ${y - 4}Z" fill="${c}" opacity=".35"/><path d="M60.8 ${y - 11}Q61.6 ${y - 3} 62.4 ${y + 1.4}Q61.2 ${y + 3} 59 ${y + 2.2}" stroke="${c}" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M57.6 ${y + 1.6}q1 .8 1.6.6" stroke="${c}" stroke-width=".8" fill="none"/>`,
  snub: (y, c) => `<path d="M57.4 ${y - 0.6}Q60 ${y - 3.4} 62.6 ${y - 0.6}Q60 ${y + 1} 57.4 ${y - 0.6}Z" fill="${c}" opacity=".35"/><circle cx="58.7" cy="${y - 0.2}" r=".8" fill="${c}"/><circle cx="61.3" cy="${y - 0.2}" r=".8" fill="${c}"/>`,
};

// ── Ears: placed on the cheek line, shaped and sized. ──
export const EARS = {
  small: { top: 58, bottom: 67, out: 4, lobe: 0 },
  large: { top: 55, bottom: 71, out: 6, lobe: 0 },
  protruding: { top: 57, bottom: 69, out: 8, lobe: 0 },
  lobed: { top: 57, bottom: 70, out: 4.6, lobe: 3 },
  pointed: { top: 52, bottom: 68, out: 5.6, lobe: 0, point: true },
};

function ear(ea, g, look) {
  const x = CX - g.cw + 0.8;
  const top = ea.point ? `L${f(x - ea.out - 1.4)} ${ea.top}` : `C${f(x - ea.out * 0.6)} ${ea.top - 1} ${f(x - ea.out)} ${ea.top + 2}`;
  const d = `M${x} ${ea.top + 2}${top} ${ea.point ? '' : `${f(x - ea.out)} ${ea.top + 5}`}C${f(x - ea.out)} ${ea.bottom - 3} ${f(x - ea.out * 0.6)} ${ea.bottom + ea.lobe} ${f(x - 1)} ${ea.bottom + ea.lobe}Z`;
  const inner = `M${f(x - 1)} ${ea.top + 4}C${f(x - ea.out * 0.75)} ${ea.top + 3} ${f(x - ea.out * 0.7)} ${ea.bottom - 4} ${f(x - 1.5)} ${ea.bottom - 3}`;
  const ring = look.earring ? `<circle cx="${f(x - ea.out * 0.45)}" cy="${f(ea.bottom + ea.lobe + 1.4)}" r="1.5" fill="none" stroke="#e0a83a" stroke-width="1"/>` : '';
  const one = `<path d="${d}" fill="${look.skin}" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/><path d="${inner}" stroke="${look.shade}" stroke-width="1" fill="none"/>`;
  return `${one}${ring}<g transform="matrix(-1 0 0 1 120 0)">${one}</g>`;
}

// ── Mouths, each with the brows, lids and lines that go with the expression. ──
export const EXPRESSIONS = {
  calm: { mouth: (y) => `M56 ${y}Q60 ${y + 1} 64 ${y}`, browInner: 0, browOuter: 0, squint: 0 },
  smile: { mouth: (y) => `M55 ${y - 1}Q60 ${y + 3.6} 65 ${y - 1}`, browInner: -0.6, browOuter: 0, squint: 1.4, cheeks: true },
  grin: { mouth: (y) => `M54.5 ${y - 1.4}Q60 ${y + 5.8} 65.5 ${y - 1.4}Q60 ${y + 1} 54.5 ${y - 1.4}Z`, teeth: true, browInner: -1, browOuter: -0.4, squint: 2, cheeks: true },
  smirk: { mouth: (y) => `M56 ${y + 0.6}Q60.5 ${y + 1.2} 64.6 ${y - 1.6}`, browInner: 0.4, browOuter: -1.2, squint: 0.5, dimple: true },
  stern: { mouth: (y) => `M56.4 ${y + 0.4}H63.6`, browInner: 1.8, browOuter: -0.2, squint: 0.4, corners: true },
  worried: { mouth: (y) => `M56 ${y + 1.2}Q60 ${y - 0.8} 64 ${y + 1.2}`, browInner: -2.2, browOuter: 1, squint: 0 },
  shout: { mouth: (y) => `M56 ${y - 1.4}Q60 ${y - 2.4} 64 ${y - 1.4}Q64.6 ${y + 4.6} 60 ${y + 5}Q55.4 ${y + 4.6} 56 ${y - 1.4}Z`, open: true, browInner: 2.2, browOuter: -0.6, squint: 0.8 },
};

function mouth(x, y, look) {
  const d = x.mouth(y);
  if (x.teeth) return `<path d="${d}" fill="#fbf6ee" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/><path d="M56 ${y - 0.4}Q60 ${y + 1.4} 64 ${y - 0.4}" stroke="${INK}" stroke-width=".5" fill="none" opacity=".4"/>`;
  if (x.open) return `<path d="${d}" fill="#5a1e1e" stroke="${INK}" stroke-width="1.1"/><path d="M57.6 ${y + 3.6}Q60 ${y + 1.6} 62.4 ${y + 3.6}Q60 ${y + 4.8} 57.6 ${y + 3.6}Z" fill="#c8525a"/><path d="M56.6 ${y - 1}H63.4V${y}H56.6Z" fill="#fbf6ee"/>`;
  const extras = [
    x.dimple ? `<path d="M65.6 ${y - 2.2}q.6 1.2 0 2" stroke="${look.shade}" stroke-width=".8" fill="none"/>` : '',
    x.corners ? `<path d="M56 ${y - 0.8}v2M64 ${y - 0.8}v2" stroke="${look.shade}" stroke-width=".7"/>` : '',
  ].join('');
  return `<path d="${d}" stroke="${look.lip}" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M58 ${y + 2.6}Q60 ${y + 3.2} 62 ${y + 2.6}" stroke="${look.shade}" stroke-width=".8" fill="none" opacity=".7"/>${extras}`;
}

// ── Age lines and facial hair. ──
function age(level, look, g) {
  if (!level) return '';
  const c = look.shade;
  const lines = [
    `M53.6 ${g.noseY + 1}Q51.6 ${g.noseY + 5} 53.4 ${g.mouthY + 2}M66.4 ${g.noseY + 1}Q68.4 ${g.noseY + 5} 66.6 ${g.mouthY + 2}`,
    level > 1 ? `M42.6 ${g.eyeY - 1}l-2 -1.2M42.6 ${g.eyeY + 1}l-2.2 .4M77.4 ${g.eyeY - 1}l2 -1.2M77.4 ${g.eyeY + 1}l2.2 .4` : '',
    level > 1 ? `M47 ${g.eyeY + 4.4}Q51 ${g.eyeY + 6.2} 55 ${g.eyeY + 4.2}M65 ${g.eyeY + 4.2}Q69 ${g.eyeY + 6.2} 73 ${g.eyeY + 4.4}` : '',
  ].join('');
  return `<path d="${lines}" stroke="${c}" stroke-width=".8" fill="none" stroke-linecap="round" opacity=".9"/>`;
}

function facialHair(kind, look, g) {
  const c = look.beardColour;
  const m = g.mouthY;
  switch (kind) {
    case 'stubble':
      return `<path d="M${CX - g.jw} ${g.jawY - 6}C${CX - g.jw + 2} ${g.chinY - 2} ${CX - 6} ${g.chinY + 1} ${CX} ${g.chinY + 1}C${CX + 6} ${g.chinY + 1} ${CX + g.jw - 2} ${g.chinY - 2} ${CX + g.jw} ${g.jawY - 6}L${CX + 6} ${m - 2}Q${CX} ${m - 4} ${CX - 6} ${m - 2}Z" fill="${c}" opacity=".22"/>`;
    case 'moustache':
      return `<path d="M54 ${m + 0.6}Q56 ${m - 3.6} 60 ${m - 2.2}Q64 ${m - 3.6} 66 ${m + 0.6}Q63 ${m - 1.2} 60 ${m - 0.8}Q57 ${m - 1.2} 54 ${m + 0.6}Z" fill="${c}" stroke="${INK}" stroke-width=".7"/>`;
    case 'goatee':
      return `<path d="M56.6 ${m + 3.4}Q60 ${m + 2.4} 63.4 ${m + 3.4}L62 ${g.chinY + 3}Q60 ${g.chinY + 5} 58 ${g.chinY + 3}Z" fill="${c}" stroke="${INK}" stroke-width=".7"/>${facialHair('moustache', look, g)}`;
    case 'beard':
      return `<path d="M${CX - g.cw + 1} 64C${CX - g.cw} ${g.jawY + 4} ${CX - 8} ${g.chinY + 9} ${CX} ${g.chinY + 9}C${CX + 8} ${g.chinY + 9} ${CX + g.cw} ${g.jawY + 4} ${CX + g.cw - 1} 64L${CX + g.cw - 4} 68Q${CX + 8} ${m - 1} ${CX} ${m + 3.6}Q${CX - 8} ${m - 1} ${CX - g.cw + 4} 68Z" fill="${c}" stroke="${INK}" stroke-width=".9"/>${facialHair('moustache', look, g)}`;
    default:
      return '';
  }
}

// ── Hair: back and front layers sized to the face. ──
export const HAIR = {
  spiky: {
    back: 'M36 66L28 52L37 50L30 32L42 36L42 18L53 28L60 10L67 27L79 16L79 34L91 30L84 46L93 52L84 66Z',
    front: 'M39 56C37 40 45 28 60 27C75 28 83 40 81 56L78 48L76 55L72 43L68 53L64 41L60 51L55 40L52 52L47 43L45 54L42 47Z',
  },
  cropped: {
    back: 'M38 56C36 36 46 24 60 24C74 24 84 36 82 56Z',
    front: 'M39 50C39 34 48 25 60 25C72 25 81 34 81 50C76 42 70 38 60 38C50 38 44 42 39 50Z',
  },
  long: {
    back: 'M37 72C32 50 40 26 60 25C80 26 88 50 83 72L82 108C76 112 70 110 68 104L72 70H48L52 104C50 110 44 112 38 108Z',
    front: 'M40 58C38 40 46 28 60 28C74 28 82 40 80 58C79 50 76 44 70 40C66 46 60 48 54 47C50 50 44 53 40 58Z',
  },
  bob: {
    back: 'M36 80C32 52 40 26 60 25C80 26 88 52 84 80C78 84 74 82 72 78L72 60H48L48 78C46 82 42 84 36 80Z',
    front: 'M40 56C38 38 47 27 60 27C73 27 82 38 80 56L80 50C76 46 70 44 60 44C50 44 44 46 40 50Z',
  },
  topknot: {
    back: 'M38 60C35 40 44 27 60 26C76 27 85 40 82 60Z',
    front: 'M40 52C40 37 48 29 60 29C72 29 80 37 80 52C76 44 70 40 60 40C50 40 44 44 40 52Z',
    top: '<ellipse cx="60" cy="20" rx="8" ry="6" fill="HAIR" stroke="INK" stroke-width="1.1"/><path d="M53 25Q60 27 67 25" stroke="#c8452f" stroke-width="2.2" fill="none"/>',
  },
  shaggy: {
    back: 'M34 72C30 54 36 30 50 25C56 22 66 22 72 25C86 31 90 54 86 72L80 66L78 74L72 62L48 62L42 74L40 66Z',
    front: 'M38 60C36 44 42 30 52 27L56 34L58 27L64 34L68 27C78 30 84 44 82 60L78 52L76 59L72 49L66 54L62 46L57 53L52 46L48 55L44 49L42 58Z',
  },
  shaved: { back: '', front: 'M41 46C42 34 50 28 60 28C70 28 78 34 79 46C72 40 66 38 60 38C54 38 48 40 41 46Z', faint: true },
  buns: {
    back: 'M38 64C34 44 42 29 60 28C78 29 86 44 82 64Z',
    front: 'M40 56C38 38 46 26 60 26C74 26 82 38 80 56L78 54L76 49L73 54L70 48L66 53L62 48L58 53L54 48L50 53L47 49L44 54L42 50Z',
    top: '<circle cx="40" cy="29" r="9" fill="HAIR" stroke="INK" stroke-width="1.1"/><circle cx="80" cy="29" r="9" fill="HAIR" stroke="INK" stroke-width="1.1"/>',
  },
};

// ── Bodies by build, with a neck to match. ──
export const BUILDS = {
  slight: { neck: 11, shoulders: 40, slope: 14 },
  average: { neck: 15, shoulders: 47, slope: 10 },
  broad: { neck: 21, shoulders: 54, slope: 6 },
};

function body(b, look, g) {
  const n = b.neck / 2;
  const s = b.shoulders;
  const top = g.jawY - 4;
  const neck = `<path d="M${CX - n} ${top}V${101 - b.slope * 0.2}Q${CX} ${106} ${CX + n} ${101 - b.slope * 0.2}V${top}Z" fill="${look.skin}" stroke="${INK}" stroke-width="1.1"/>
<path d="M${CX - n} ${g.jawY}Q${CX} ${g.chinY + 9} ${CX + n} ${g.jawY}V${g.chinY + 6}Q${CX} ${g.chinY + 12} ${CX - n} ${g.chinY + 6}Z" fill="${look.shade}" opacity=".8"/>
${b.neck > 18 ? `<path d="M${CX - n + 2} ${g.chinY + 6}L${CX - 3} 100M${CX + n - 2} ${g.chinY + 6}L${CX + 3} 100" stroke="${look.shade}" stroke-width=".9" fill="none"/>` : ''}`;
  const shoulders = `M${CX - s - 4} 151C${CX - s - 2} ${118 + b.slope} ${CX - s + 12} ${100 + b.slope * 0.6} ${CX - n - 1} 101L${CX} 110L${CX + n + 1} 101C${CX + s - 12} ${100 + b.slope * 0.6} ${CX + s + 2} ${118 + b.slope} ${CX + s + 4} 151Z`;
  return `${neck}<path d="${shoulders}" fill="${look.outfit}" stroke="${INK}" stroke-width="1.1"/>
<path d="M${CX} 110V151" stroke="${INK}" stroke-width=".8" opacity=".5"/>
<path d="M${CX - n - 1} 101L${CX} 113L${CX + n + 1} 101" fill="none" stroke="#efe3c8" stroke-width="2.6"/>
<g clip-path="url(#${look.id}-right)"><path d="${shoulders}" fill="#000" opacity=".28"/></g>`;
}

const SKIN_SHADE = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s) => Math.round(((n >> s) & 255) * 0.8);
  return `#${[16, 8, 0].map((s) => ch(s).toString(16).padStart(2, '0')).join('')}`;
};

/** Everything about one person's face, from feature names and colours. */
export function portrait(p, id) {
  const g0 = FACES[p.face];
  const e = EYES[p.eyes];
  const x = EXPRESSIONS[p.expression];
  const b = BUILDS[p.build];
  const longness = (g0.chinY - 89) * 0.35;
  const g = { ...g0, eyeY: 62 + longness * 0.4, noseY: 72 + longness * 0.9 + (p.nose === 'long' ? 1 : 0), mouthY: 80 + longness * 1.3 };
  const look = {
    id,
    skin: p.skin,
    shade: SKIN_SHADE(p.skin),
    browColour: p.browColour ?? p.hairShade ?? p.hair,
    lip: p.lip ?? '#7a3a2a',
    outfit: p.outfit,
    beardColour: p.beardColour ?? p.hair,
    earring: p.earring,
    ...x,
  };
  const hair = HAIR[p.hair_style];
  const face = facePath(g);
  const spacing = p.spacing ?? 9;
  const eyeL = `translate(${f(CX - spacing)} ${f(g.eyeY)})`;
  const eyeR = `translate(${f(CX + spacing)} ${f(g.eyeY)}) scale(-1 1)`;
  const hairFill = (s) => s.replaceAll('HAIR', p.hair).replaceAll('INK', INK);
  const hairScale = `translate(60 0) scale(${f(g.cw / 20)} 1) translate(-60 0)`;
  return `<svg viewBox="${p.frame ?? '14 13 92 115'}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${p.name}">
<defs>
<radialGradient id="${id}-bg" cx=".7" cy=".75" r=".9"><stop offset="0" stop-color="${p.glow}"/><stop offset=".55" stop-color="${p.bg}"/><stop offset="1" stop-color="#120f19"/></radialGradient>
<radialGradient id="${id}-iris" cx=".5" cy=".75" r=".75"><stop offset="0" stop-color="${p.irisLight}"/><stop offset="1" stop-color="${p.iris}"/></radialGradient>
<clipPath id="${id}-face"><path d="${face}"/></clipPath>
<clipPath id="${id}-right"><rect x="64" width="60" height="150"/></clipPath>
</defs>
<rect width="120" height="150" fill="url(#${id}-bg)"/>
<circle cx="94" cy="38" r="24" fill="${p.glow}" opacity=".16"/>
<g transform="${hairScale}">${hair.top ? hairFill(hair.top) : ''}${hair.back ? `<path d="${hair.back}" fill="${p.hair}" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/><g clip-path="url(#${id}-right)"><path d="${hair.back}" fill="#000" opacity=".3"/></g>` : ''}</g>
${body(b, look, g)}
${ear(EARS[p.ears], g, look)}
<path d="${face}" fill="${p.skin}" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/>
<g clip-path="url(#${id}-face)">
<path d="M${f(CX + g.cw * 0.62)} 26Q${f(CX + g.cw * 1.02)} 58 ${f(CX + g.cw * 0.12)} ${g.chinY + 4}H100V26Z" fill="${look.shade}" opacity=".45"/>
<path d="${hair.front}" transform="${hairScale} translate(1.4 3.4)" fill="${look.shade}" opacity=".7"/>
${p.freckles ? `<g fill="${look.shade}">${[[48, 70], [50, 72], [46, 72.5], [52, 70.6], [70, 70], [72, 72], [74, 72.5], [68, 70.6]].map(([a, c]) => `<circle cx="${a}" cy="${f(c + longness * 0.6)}" r=".55"/>`).join('')}</g>` : ''}
</g>
<path d="M${f(CX + g.cw * 0.97)} 50C${f(CX + g.cw)} 54 ${f(CX + g.cw)} 57 ${f(CX + g.cw)} 60C${f(CX + g.cw)} 68 ${f(CX + g.jw + 2)} ${g.jawY - 6} ${f(CX + g.jw)} ${g.jawY}" stroke="${p.rim}" stroke-opacity=".75" stroke-width="1.2" fill="none" stroke-linecap="round"/>
${x.cheeks ? `<ellipse cx="${CX - 12}" cy="${f(g.eyeY + 10)}" rx="4" ry="1.8" fill="#ff8a8a" opacity=".3"/><ellipse cx="${CX + 12}" cy="${f(g.eyeY + 10)}" rx="4" ry="1.8" fill="#ff8a8a" opacity=".3"/>` : ''}
${age(p.age, look, g)}
<g transform="${eyeL}">${eye(id, e, look, 0)}${brow(BROWS[p.brows], e, look)}</g>
<g transform="${eyeR}">${eye(id, e, look, 1)}${brow(BROWS[p.brows], e, look)}</g>
${NOSES[p.nose](f(g.noseY), look.shade)}
${facialHair(p.facialHair, look, g)}
${mouth(x, f(g.mouthY), look)}
${p.scar ?? ''}${p.mole ? `<circle cx="${p.mole[0]}" cy="${p.mole[1]}" r=".8" fill="#4a2a1a"/>` : ''}${p.paint ?? ''}
<g transform="${hairScale}">${hair.front ? `<path d="${hair.front}" fill="${p.hair}" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round" ${hair.faint ? 'opacity=".55"' : ''}/>` : ''}</g>
${p.headband ? `<path d="M${f(CX - g.tw - 1)} 46Q60 40 ${f(CX + g.tw + 1)} 46L${f(CX + g.tw + 1)} 52.5Q60 46.5 ${f(CX - g.tw - 1)} 52.5Z" fill="#2b3a66" stroke="${INK}" stroke-width="1.1"/><rect x="49" y="41.8" width="22" height="9.8" rx="1.6" fill="#c9ccd6" stroke="${INK}" stroke-width="1.1"/><g stroke="#4a5060" stroke-width=".9" fill="none"><ellipse cx="60" cy="46.7" rx="2.6" ry="3.1"/><path d="M57.4 46.7H62.6"/></g>` : ''}
</svg>`;
}

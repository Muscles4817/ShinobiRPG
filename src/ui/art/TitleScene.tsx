/**
 * The title screen's picture: a string of paper lanterns over a sleeping village, under the
 * moon. The middle lantern is the game's mark (忍 brushed on lit paper). Inline SVG, so it
 * works offline; the lanterns sway and glow by CSS (menu.css), still under reduced motion.
 */

/** The half-width of a lantern's body at height `y`: it swells in the middle like a chōchin. */
function bodyHalfWidth(y: number): number {
  return 26 + 13 * Math.sin((Math.PI * (y - 22)) / 80);
}

const RIBS = [30, 38, 46, 54, 62, 70, 78, 86, 94];

/** Where the ground meets the foot of the picture. */
const GROUND = 304;
const FOOT = 330;

/** A roof with its eaves turned up at the tips, from `left` to `right`, eaves at `eave`. */
function roof(left: number, right: number, eave: number, peak: number): string {
  const mid = (left + right) / 2;
  return `M${left - 4} ${eave - 5}Q${left + 4} ${eave} ${left + 12} ${eave - 2}L${mid} ${peak}L${right - 12} ${eave - 2}Q${right - 4} ${eave} ${right + 4} ${eave - 5}L${right - 2} ${eave + 3}H${left + 2}Z`;
}

/** A house: walls down to the ground under its roof. */
function house(left: number, right: number, eave: number, peak: number): string {
  return `${roof(left, right, eave, peak)}M${left + 4} ${eave + 2}H${right - 4}V${FOOT}H${left + 4}Z`;
}

/** A three-tier pagoda: each roof narrower, a spire on top. */
function pagoda(centre: number): string {
  const tiers = [
    [30, 262],
    [24, 240],
    [18, 220],
  ] as const;
  const roofs = tiers
    .map(([half, eave]) => roof(centre - half, centre + half, eave, eave - 10))
    .join('');
  const walls = tiers
    .map(
      ([half, eave]) =>
        `M${centre - half + 8} ${eave}H${centre + half - 8}V${eave + 22}H${centre - half + 8}Z`,
    )
    .join('');
  return `${roofs}${walls}M${centre - 1} 196h2v14h-2Z`;
}

/** The village asleep along the foot of the picture, in the page's own colour. */
const ROOFLINE = [
  `M0 ${GROUND}H390V${FOOT}H0Z`,
  house(-6, 40, 286, 270),
  pagoda(70),
  house(100, 150, 290, 272),
  house(146, 196, 280, 262),
  house(200, 252, 292, 276),
  house(250, 300, 284, 266),
  house(306, 350, 290, 274),
  house(346, 396, 282, 266),
].join('');

/** Lamps still lit behind paper windows. */
const WINDOWS = 'M116 296h8v6h-8zM166 290h7v8h-7zM224 298h8v6h-8zM322 296h7v6h-7zM64 268h5v6h-5z';

interface LanternProps {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  /** `paper` is the lit white chōchin; `red` the shop-front kind. */
  readonly kind: 'paper' | 'red';
  /** One brushed character on the paper, or none. */
  readonly glyph?: string;
  /** Which sway: they don't swing in step. */
  readonly sway: 1 | 2 | 3;
}

function Lantern({ x, y, scale, kind, glyph, sway }: LanternProps) {
  const fill = kind === 'paper' ? 'url(#paper-lit)' : 'url(#red-lit)';
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle className="lantern-glow" cx="0" cy="62" r="78" fill="url(#glow)" />
      <g className={`lantern-sway sway-${sway}`}>
        <path d="M0 0V14" stroke="#2a1d18" strokeWidth="1.6" />
        <path d="M-20 14h40l2 8h-44Z" fill="#17100e" />
        <path
          d="M-26 22C-45 44-45 80-26 102H26C45 80 45 44 26 22Z"
          fill={fill}
          stroke="#6a2a14"
          strokeWidth="0.6"
        />
        {RIBS.map((ry) => {
          const w = bodyHalfWidth(ry);
          return (
            <path
              key={ry}
              d={`M${-w} ${ry}Q0 ${ry + 3.5} ${w} ${ry}`}
              stroke={kind === 'paper' ? '#9a4a1e' : '#4a0f0a'}
              strokeOpacity="0.35"
              strokeWidth="0.8"
              fill="none"
            />
          );
        })}
        {glyph && (
          <text x="0" y="74" textAnchor="middle" className="lantern-glyph">
            {glyph}
          </text>
        )}
        <path d="M-22 102h44l-2 8h-40Z" fill="#17100e" />
        <path d="M-3 110h6v4h-6Z" fill="#17100e" />
        <path
          d="M0 114c-1 6-2 12-4 18M0 114v19M0 114c1 6 2 12 4 18"
          stroke="#8f2a1c"
          strokeWidth="1.2"
          fill="none"
        />
      </g>
    </g>
  );
}

export function TitleScene() {
  return (
    <svg
      className="title-scene"
      viewBox="0 0 390 330"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="paper-lit" cx="50%" cy="48%" r="60%">
          <stop offset="0" stopColor="#fff2cf" />
          <stop offset="0.55" stopColor="#f6c27a" />
          <stop offset="1" stopColor="#c9692b" />
        </radialGradient>
        <radialGradient id="red-lit" cx="50%" cy="45%" r="62%">
          <stop offset="0" stopColor="#ff9a6a" />
          <stop offset="0.5" stopColor="#d2412c" />
          <stop offset="1" stopColor="#7c1a14" />
        </radialGradient>
        <radialGradient id="glow">
          <stop offset="0" stopColor="#f0a050" stopOpacity="0.2" />
          <stop offset="0.7" stopColor="#f0a050" stopOpacity="0.05" />
          <stop offset="1" stopColor="#f0a050" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="292" cy="150" r="46" fill="#f3e6c4" opacity="0.05" />
      <circle cx="292" cy="150" r="25" fill="#efe1bd" opacity="0.88" />
      <path
        d="M0 214C38 196 62 178 96 186c30 7 44-14 74-10 26 4 40 22 70 16 32-7 52-30 86-24 26 5 44 18 64 26V330H0Z"
        fill="#221e2f"
      />
      <path
        d="M-6 246c34-12 60-8 88-14 34-7 50-20 86-14 30 5 46 20 80 18 36-2 58-16 94-8 20 4 34 10 48 16V330H-6Z"
        fill="#1b1825"
      />
      <path d={ROOFLINE} fill="var(--bg)" />
      <path d={WINDOWS} fill="#f0a050" opacity="0.6" />
      <path
        d="M-8 38C70 84 130 98 196 92S320 70 398 30"
        stroke="#3b2c27"
        strokeWidth="1.4"
        fill="none"
      />
      <Lantern x={74} y={66} scale={0.62} kind="red" sway={2} />
      <Lantern x={196} y={92} scale={1} kind="paper" glyph="忍" sway={1} />
      <Lantern x={322} y={54} scale={0.55} kind="red" sway={3} />
    </svg>
  );
}

/**
 * A seal pressed in red ink (a hanko, white characters cut into red): two characters read top
 * to bottom in one column, with the rough edge real ink leaves.
 */
export function InkSeal({ glyphs }: { readonly glyphs: readonly [string, string] }) {
  const [first, second] = glyphs;
  return (
    <svg className="ink-seal" viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <filter id="ink-edge">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="2.2" />
        </filter>
      </defs>
      <g filter="url(#ink-edge)">
        <rect x="2" y="2" width="44" height="44" rx="3" fill="var(--seal)" />
        <text x="24" y="22" textAnchor="middle" className="seal-glyph">
          {first}
        </text>
        <text x="24" y="42" textAnchor="middle" className="seal-glyph">
          {second}
        </text>
      </g>
    </svg>
  );
}

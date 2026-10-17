import type { House } from './buildings';
import { Townhouse } from './buildings';
import type { Point } from './kit';
import { Clouds, LanternString, SkyLights, paint } from './lights';
import { Crown } from './nature';

/**
 * The forest village: a cliff carved with great faces over the rooftops, a ring of broadleaf
 * crowns, a round red-roofed hall, and lit houses along the street with lanterns between.
 */

const FACES: readonly Point[] = [
  [214, 122],
  [258, 116],
  [302, 118],
  [346, 124],
];

/** A face carved into the rock: hair over a brow, deep sockets, the far cheek in shadow. */
function CarvedFace({ at: [x, y] }: { readonly at: Point }) {
  return (
    <g>
      <ellipse className="bd-mid" cx={x} cy={y} rx="14" ry="18" />
      <path
        className="bd-near"
        d={`M${x - 15} ${y - 4}C${x - 16} ${y - 20} ${x + 16} ${y - 22} ${x + 15} ${y - 4}C${x + 8} ${y - 12} ${x - 8} ${y - 12} ${x - 15} ${y - 4}Z`}
      />
      <path
        d={`M${x + 2} ${y - 17}C${x + 16} ${y - 12} ${x + 16} ${y + 10} ${x + 4} ${y + 18}C${x + 10} ${y + 6} ${x + 10} ${y - 6} ${x + 2} ${y - 17}Z`}
        fill="#000"
        opacity=".22"
      />
      <g fill="#000" opacity=".3">
        <ellipse cx={x - 5.5} cy={y - 1} rx="3.6" ry="2.2" />
        <ellipse cx={x + 5.5} cy={y - 1} rx="3.6" ry="2.2" />
        <path d={`M${x} ${y + 1}L${x + 3} ${y + 8}H${x - 1}Z`} />
        <rect x={x - 4} y={y + 11} width="8" height="1.6" rx=".8" />
      </g>
      <path
        d={`M${x - 11} ${y - 5}Q${x - 6} ${y - 7} ${x - 2} ${y - 5}`}
        stroke="#fff"
        strokeOpacity=".18"
        strokeWidth="1.4"
        fill="none"
      />
    </g>
  );
}

const CLIFF = 'M150 240V122C164 102 196 94 236 92C290 90 344 94 410 106V240Z';
const STRATA = 'M160 150C220 144 300 146 400 152M156 176C230 170 320 172 400 178';

const BACK_CROWNS = [8, 40, 74, 150, 186, 222, 258, 294, 330, 366, 398].map((x, i) => ({
  at: [x, 178 + ((i * 5) % 9)] as Point,
  size: 20 + ((i * 7) % 6),
  seed: 40 + i,
}));

const HOUSES: readonly House[] = [
  { x: -6, w: 58, base: 238, h: 56, noren: '#2f5a4a' },
  { x: 150, w: 48, base: 236, h: 44 },
  { x: 204, w: 56, base: 237, h: 52, noren: '#8a2b22' },
  { x: 290, w: 50, base: 236, h: 46, noren: '#2e3d6b' },
  { x: 346, w: 60, base: 238, h: 60 },
];

/** The round hall: a drum with a ring of lit windows under a wide red roof. */
function RoundHall({ uid }: { readonly uid: string }) {
  return (
    <g>
      <rect className="bd-near" x="80" y="160" width="56" height="78" />
      <rect className="bd-lamp" x="84" y="176" width="48" height="8" fill={paint(uid, 'shoji')} />
      <path className="bd-tile" d="M92 176v8M104 176v8M116 176v8M128 176v8" strokeWidth="1" />
      <rect className="bd-lamp" x="84" y="200" width="48" height="8" fill={paint(uid, 'shoji')} />
      <path d="M70 162Q108 134 146 162L140 166Q108 146 76 166Z" fill="#b8352a" />
      <path d="M80 152Q108 126 136 152L132 156Q108 138 84 156Z" fill="#9a2a20" />
      <path className="bd-rim" d="M70 162Q108 134 146 162" strokeWidth="1.1" fill="none" />
      <circle cx="108" cy="134" r="2.4" fill="#ffd27a" />
    </g>
  );
}

export function LeafVillage({ uid }: { readonly uid: string }) {
  return (
    <>
      <SkyLights uid={uid} moon={[132, 42]} sun={[128, 40]} seed={29} starDepth={100} />
      <Clouds at={[10, 80]} scale={0.7} />
      <path className="bd-far" d={CLIFF} />
      <path className="bd-tile" d={STRATA} fill="none" opacity=".6" strokeWidth="1" />
      {FACES.map((f) => (
        <CarvedFace key={f[0]} at={f} />
      ))}
      {[176, 236, 296, 356, 400].map((x, i) => (
        <Crown key={x} at={[x, 96 - (i % 2) * 3]} size={12} seed={60 + i} />
      ))}
      <rect y="150" width="400" height="40" fill={paint(uid, 'mist')} />
      {BACK_CROWNS.map((c) => (
        <Crown key={c.seed} at={c.at} size={c.size} seed={c.seed} />
      ))}
      <RoundHall uid={uid} />
      {HOUSES.map((h) => (
        <Townhouse key={h.x} uid={uid} house={h} />
      ))}
      <path d="M0 232H400V240H0Z" fill={paint(uid, 'ground')} />
      <LanternString
        uid={uid}
        from={[52, 196]}
        to={[150, 200]}
        hang={{ sag: 6, count: 4, size: 3.4 }}
      />
      <LanternString
        uid={uid}
        from={[260, 198]}
        to={[346, 192]}
        hang={{ sag: 6, count: 3, size: 3.4 }}
      />
      <Crown at={[-6, 214]} size={30} seed={90} />
      <Crown at={[408, 206]} size={30} seed={91} />
    </>
  );
}

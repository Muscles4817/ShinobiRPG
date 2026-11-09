import { r1, ridge, scatter } from './kit';
import { Lantern, SkyLights, paint } from './lights';
import { Boulder, Tufts } from './terrain';
import { Bamboo, Cedar } from './trees';

/**
 * The cedar deep: an old forest of sugi standing in rank on rank, shafts of light between the
 * trunks, moss underfoot, and in a clearing a hermit's hut with one lantern at its door and a
 * ring of stones for travellers' fires.
 */

const HILLS = ridge({ x1: 400, y: 140, amp: 24, seed: 41, bottom: 240, freq: 1.1 });

/** Three ranks of cedars, the far ones small and pale, the near ones tall and dark. */
const RANKS = [
  { y: 166, scale: 0.55, count: 18, seed: 410, className: 'bd-far' },
  { y: 186, scale: 0.8, count: 14, seed: 420, className: 'bd-mid' },
  { y: 208, scale: 1.1, count: 9, seed: 430, className: 'bd-near' },
] as const;

const SHAFTS = [
  [70, 0.18],
  [150, 0.12],
  [300, 0.16],
] as const;

const STONES = (() => {
  const next = scatter(43);
  return Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2;
    return { x: r1(268 + Math.cos(a) * 16), y: r1(224 + Math.sin(a) * 4), r: r1(2 + next() * 1.4) };
  });
})();

function Rank({ y, scale, count, seed, className }: (typeof RANKS)[number]) {
  const next = scatter(seed);
  return (
    <g className={className}>
      {Array.from({ length: count }, (_, i) => {
        const x = r1((i + 0.3 + next() * 0.4) * (420 / count) - 10);
        const h = 70 * scale * (0.8 + next() * 0.4);
        return (
          <path
            key={i}
            d={`M${x} ${r1(y - h)}L${r1(x + 9 * scale)} ${r1(y - h * 0.35)}L${r1(x + 4 * scale)} ${r1(y - h * 0.38)}L${r1(x + 12 * scale)} ${y}H${r1(x - 12 * scale)}L${r1(x - 4 * scale)} ${r1(y - h * 0.38)}L${r1(x - 9 * scale)} ${r1(y - h * 0.35)}Z`}
          />
        );
      })}
    </g>
  );
}

function Hut({ uid }: { readonly uid: string }) {
  return (
    <g>
      <rect className="bd-front" x="300" y="196" width="42" height="28" />
      <path className="bd-roof" d="M292 198L321 178L350 198Z" />
      <path className="bd-rim" d="M292 198L321 178L350 198" strokeWidth="1" fill="none" />
      <path
        d="M296 196L321 180L346 196"
        stroke="#8a7a5a"
        strokeOpacity=".5"
        strokeWidth="2"
        fill="none"
      />
      <rect className="bd-dark" x="312" y="204" width="12" height="20" />
      <rect className="bd-lamp" x="328" y="204" width="9" height="8" fill={paint(uid, 'shoji')} />
      <Lantern uid={uid} at={[306, 206]} size={2.4} />
    </g>
  );
}

export function CedarForest({ uid }: { readonly uid: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-shaft`} x2="0" y2="1">
          <stop offset="0" stopColor="#fff2d0" stopOpacity=".3" />
          <stop offset="1" stopColor="#fff2d0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <SkyLights uid={uid} moon={[210, 46]} sun={[200, 40]} seed={41} starDepth={70} />
      <path className="bd-far" d={HILLS} opacity=".7" />
      {RANKS.map((r, i) => (
        <g key={r.seed}>
          <Rank {...r} />
          {i < 2 && <rect y={r.y - 20} width="400" height="26" fill={paint(uid, 'mist')} />}
        </g>
      ))}
      <g className="bd-day">
        {SHAFTS.map(([x, o]) => (
          <path
            key={x}
            d={`M${x} 0L${x + 40} 0L${x + 90} 240H${x + 40}Z`}
            fill={paint(uid, 'shaft')}
            opacity={o * 2}
          />
        ))}
      </g>
      <path
        className="bd-near"
        d="M-10 214C50 204 120 206 190 214C250 220 330 210 410 212V240H-10Z"
      />
      <Tufts from={[0, 230]} to={[400, 226]} count={40} seed={44} height={6} />
      <Hut uid={uid} />
      <g fill="#8a8476" opacity=".8">
        {STONES.map((s) => (
          <circle key={`${s.x}-${s.y}`} cx={s.x} cy={s.y} r={s.r} />
        ))}
      </g>
      <circle className="bd-lit" cx="268" cy="222" r="14" fill={paint(uid, 'glow')} />
      <Cedar at={[22, 242]} scale={2} seed={45} />
      <Cedar at={[78, 238]} scale={1.5} seed={46} />
      <Cedar at={[140, 234]} scale={1.15} seed={47} />
      <Cedar at={[186, 236]} scale={1.35} seed={52} />
      <Cedar at={[378, 242]} scale={2.1} seed={48} />
      <Bamboo at={[222, 236]} scale={0.7} seed={49} />
      <Boulder at={[112, 240]} size={14} seed={50} />
      <Boulder at={[356, 236]} size={9} seed={51} className="bd-near" />
    </>
  );
}

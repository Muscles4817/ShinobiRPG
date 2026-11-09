import { r1, scatter } from './kit';
import { SkyLights, paint } from './lights';
import { Boulder, Spire, Waterfall } from './terrain';

/**
 * A hidden mountain of the toads: stone spires standing out of the mist like fingers, falls of
 * oil pouring from their sides, round huts hung from them, and in front the giant plants of the
 * place, broad leaves taller than a man and toadstools as big as roofs.
 */

const SPIRES = [
  { at: [40, 176], height: 110, width: 34, className: 'bd-far' },
  { at: [120, 170], height: 140, width: 30, className: 'bd-far' },
  { at: [300, 172], height: 128, width: 36, className: 'bd-far' },
  { at: [370, 178], height: 96, width: 26, className: 'bd-far' },
  { at: [200, 186], height: 120, width: 40, className: 'bd-mid' },
  { at: [80, 196], height: 80, width: 28, className: 'bd-mid' },
  { at: [340, 196], height: 90, width: 30, className: 'bd-mid' },
] as const;

const SPORES = (() => {
  const next = scatter(161);
  return Array.from({ length: 22 }, () => ({ x: r1(next() * 400), y: r1(90 + next() * 120) }));
})();

/** A broad leaf on a stalk, its vein down the middle. */
function Leaf({
  at: [x, y],
  s,
  lean,
}: {
  readonly at: readonly [number, number];
  readonly s: number;
  readonly lean: number;
}) {
  const tx = r1(x + lean * s);
  const ty = r1(y - 60 * s);
  return (
    <g>
      <path
        className="bd-front-stroke"
        d={`M${x} ${y}Q${x} ${r1(y - 30 * s)} ${tx} ${ty}`}
        strokeWidth={r1(2 * s)}
        fill="none"
      />
      <path
        className="bd-leaf"
        d={`M${r1(x + lean * 0.4 * s)} ${r1(y - 30 * s)}C${r1(x - 30 * s)} ${r1(y - 46 * s)} ${r1(tx - 20 * s)} ${r1(ty - 14 * s)} ${tx} ${r1(ty - 20 * s)}C${r1(tx + 24 * s)} ${r1(ty - 8 * s)} ${r1(x + 30 * s)} ${r1(y - 40 * s)} ${r1(x + lean * 0.4 * s)} ${r1(y - 30 * s)}Z`}
      />
    </g>
  );
}

/** A toadstool the size of a roof: stem, a domed cap and its pale spots. */
function Toadstool({
  at: [x, y],
  s,
}: {
  readonly at: readonly [number, number];
  readonly s: number;
}) {
  return (
    <g>
      <path
        d={`M${r1(x - 5 * s)} ${y}Q${x} ${r1(y - 24 * s)} ${r1(x - 3 * s)} ${r1(y - 32 * s)}H${r1(x + 3 * s)}Q${x} ${r1(y - 24 * s)} ${r1(x + 5 * s)} ${y}Z`}
        fill="#d8ccb0"
      />
      <path
        d={`M${r1(x - 26 * s)} ${r1(y - 30 * s)}Q${x} ${r1(y - 58 * s)} ${r1(x + 26 * s)} ${r1(y - 30 * s)}Z`}
        fill="#b04a30"
      />
      <g fill="#f4e8d0" opacity=".8">
        <circle cx={r1(x - 10 * s)} cy={r1(y - 38 * s)} r={r1(2.6 * s)} />
        <circle cx={r1(x + 6 * s)} cy={r1(y - 44 * s)} r={r1(2 * s)} />
        <circle cx={r1(x + 16 * s)} cy={r1(y - 35 * s)} r={r1(1.8 * s)} />
      </g>
    </g>
  );
}

/** A round hut hung on a spire's side: a gourd-shaped body under a cap, one lit window. */
function Hut({
  uid,
  at: [x, y],
}: {
  readonly uid: string;
  readonly at: readonly [number, number];
}) {
  return (
    <g>
      <ellipse className="bd-near" cx={x} cy={y} rx="9" ry="8" />
      <path className="bd-roof" d={`M${x - 11} ${y - 4}Q${x} ${y - 18} ${x + 11} ${y - 4}Z`} />
      <circle className="bd-lamp" cx={x} cy={y + 1} r="2.4" fill={paint(uid, 'shoji')} />
    </g>
  );
}

export function ToadMountain({ uid }: { readonly uid: string }) {
  return (
    <>
      <SkyLights uid={uid} moon={[250, 44]} sun={[250, 40]} seed={161} starDepth={70} />
      {SPIRES.slice(0, 4).map((s) => (
        <Spire key={s.at[0]} at={s.at} height={s.height} width={s.width} className={s.className} />
      ))}
      <rect y="140" width="400" height="50" fill={paint(uid, 'mist')} />
      {SPIRES.slice(4).map((s) => (
        <Spire key={s.at[0]} at={s.at} height={s.height} width={s.width} className={s.className} />
      ))}
      <Waterfall top={[206, 90]} foot={186} width={8} seed={162} />
      <Waterfall top={[84, 130]} foot={196} width={6} seed={163} />
      <Hut uid={uid} at={[214, 120]} />
      <Hut uid={uid} at={[346, 136]} />
      <Hut uid={uid} at={[70, 150]} />
      <rect y="180" width="400" height="30" fill={paint(uid, 'mist')} />
      <path
        className="bd-near"
        d="M-10 240V208C60 200 140 204 220 212C300 220 360 206 410 204V240Z"
      />
      <g className="bd-lit" fill="#e8f0a0" opacity=".6">
        {SPORES.map((p) => (
          <circle key={`${p.x}-${p.y}`} cx={p.x} cy={p.y} r=".9" />
        ))}
      </g>
      <Toadstool at={[300, 226]} s={1.1} />
      <Toadstool at={[338, 230]} s={0.6} />
      <Leaf at={[30, 244]} s={1.6} lean={10} />
      <Leaf at={[70, 244]} s={1.1} lean={-12} />
      <Leaf at={[384, 244]} s={1.4} lean={-8} />
      <Boulder at={[170, 240]} size={14} seed={164} />
    </>
  );
}

import { r1, ridge, scatter } from './kit';
import { Campfire, Lantern, SkyLights, paint } from './lights';
import { Crown } from './nature';
import { Boulder, Tufts } from './terrain';

/**
 * A broadleaf forest: trunks as wide as houses going up out of the frame, their crowns closing
 * over the road, light coming down in patches, long grass underfoot, and the fallen watch post where
 * patrols sleep, its lantern still hung on the one post left standing.
 */

const HILLS = ridge({ x1: 400, y: 150, amp: 16, seed: 161, bottom: 240, freq: 1.4 });

interface Trunk {
  readonly x: number;
  readonly w: number;
  readonly base: number;
  readonly className: string;
}

const TRUNKS: readonly Trunk[] = [
  { x: 92, w: 10, base: 190, className: 'bd-mid' },
  { x: 156, w: 8, base: 186, className: 'bd-mid' },
  { x: 236, w: 9, base: 188, className: 'bd-mid' },
  { x: 318, w: 11, base: 192, className: 'bd-mid' },
  { x: 24, w: 30, base: 242, className: 'bd-near' },
  { x: 196, w: 22, base: 236, className: 'bd-near' },
  { x: 372, w: 34, base: 242, className: 'bd-near' },
];

const CROWNS = (() => {
  const next = scatter(162);
  return Array.from({ length: 16 }, (_, i) => ({
    x: r1(i * 27 - 6 + next() * 10),
    y: r1(18 + next() * 46),
    size: r1(34 + next() * 22),
    seed: 1620 + i,
  }));
})();

const DAPPLES = (() => {
  const next = scatter(163);
  return Array.from({ length: 12 }, () => ({
    x: r1(next() * 400),
    y: r1(206 + next() * 30),
    rx: r1(6 + next() * 14),
  }));
})();

/** A trunk with a flared root and a few bark lines. */
function TrunkShape({ x, w, base, className }: Trunk) {
  return (
    <g>
      <path
        className={className}
        d={`M${x - w / 2} 0V${base - w}Q${x - w / 2} ${base} ${x - w * 1.3} ${base}H${x + w * 1.3}Q${x + w / 2} ${base} ${x + w / 2} ${base - w}V0Z`}
      />
      <path
        className="bd-rim"
        d={`M${x - w * 0.2} 20V${base - w * 1.4}M${x + w * 0.15} 60V${base - w * 2}`}
        strokeWidth=".7"
        opacity=".4"
        fill="none"
      />
    </g>
  );
}

function WatchPost({ uid }: { readonly uid: string }) {
  return (
    <g>
      <path className="bd-front-stroke" d="M262 228V186M300 228L292 200" strokeWidth="3" />
      <path className="bd-front" d="M254 214H306V220H254Z" />
      <path
        className="bd-front-stroke"
        d="M256 214L284 196L300 204"
        strokeWidth="1.6"
        fill="none"
      />
      <Lantern uid={uid} at={[262, 192]} size={2.6} />
      <Campfire uid={uid} at={[280, 230]} size={0.9} />
    </g>
  );
}

export function BroadleafForest({ uid }: { readonly uid: string }) {
  return (
    <>
      <SkyLights uid={uid} moon={[200, 30]} sun={[200, 30]} seed={161} starDepth={40} />
      <path className="bd-far" d={HILLS} />
      <rect y="140" width="400" height="50" fill={paint(uid, 'mist')} />
      {TRUNKS.slice(0, 4).map((t) => (
        <TrunkShape key={t.x} {...t} />
      ))}
      <path
        className="bd-near"
        d="M-10 240V204C80 196 160 200 220 206C300 214 360 204 410 200V240Z"
      />
      <path d="M150 240L190 206H230L262 240Z" fill="#b8a889" opacity=".2" />
      <g className="bd-day" fill="#fff2c8" opacity=".3">
        {DAPPLES.map((d) => (
          <ellipse key={`${d.x}-${d.y}`} cx={d.x} cy={d.y} rx={d.rx} ry={r1(d.rx * 0.25)} />
        ))}
      </g>
      <WatchPost uid={uid} />
      {TRUNKS.slice(4).map((t) => (
        <TrunkShape key={t.x} {...t} />
      ))}
      {CROWNS.map((c) => (
        <Crown key={c.seed} at={[c.x, c.y]} size={c.size} seed={c.seed} />
      ))}
      <Tufts from={[0, 238]} to={[400, 236]} count={36} seed={164} height={9} />
      <Boulder at={[120, 240]} size={12} seed={165} />
    </>
  );
}

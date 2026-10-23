import { r1, ridge, scatter } from './kit';
import { SkyLights, paint } from './lights';
import { Boulder, Spire, Waterfall } from './terrain';
import { Cedar, Maple } from './trees';

/**
 * Lanternfall: a white fall dropping from a cliff into a round pool high on the pass, the rocks
 * below it worn into the bowls where the old lanterns were washed, a few lanterns still floating
 * on the water, crags on either side and a lone cedar on the lip.
 */

const BACK = ridge({ x1: 400, y: 110, amp: 30, seed: 71, bottom: 240, freq: 1.3 });

const FLOATING = (() => {
  const next = scatter(72);
  return Array.from({ length: 6 }, () => ({
    x: r1(130 + next() * 140),
    y: r1(206 + next() * 18),
  }));
})();

/** A paper lantern floating on the pool: a lit box and its reflection. */
function Floating({
  uid,
  at: [x, y],
}: {
  readonly uid: string;
  readonly at: readonly [number, number];
}) {
  return (
    <g>
      <circle className="bd-lit" cx={x} cy={y} r="10" fill={paint(uid, 'glow')} />
      <rect x={x - 3} y={y - 5} width="6" height="5" fill={paint(uid, 'shoji')} />
      <rect x={x - 3} y={y} width="6" height="3" fill={paint(uid, 'shoji')} opacity=".3" />
    </g>
  );
}

export function WaterfallPool({ uid }: { readonly uid: string }) {
  return (
    <>
      <SkyLights uid={uid} moon={[300, 40]} sun={[90, 40]} seed={71} starDepth={60} />
      <path className="bd-far" d={BACK} />
      <rect y="110" width="400" height="40" fill={paint(uid, 'mist')} />
      <path className="bd-mid" d="M130 240V92C150 80 170 76 196 78C220 80 246 78 270 90V240Z" />
      <Waterfall top={[200, 84]} foot={196} width={26} seed={73} />
      <path className="bd-near" d="M-10 240V60C30 66 70 64 100 80C130 96 150 140 160 240Z" />
      <path className="bd-near" d="M410 240V52C370 58 330 62 296 80C268 96 252 150 244 240Z" />
      <path
        className="bd-rim"
        d="M100 80C130 96 150 140 160 240M296 80C268 96 252 150 244 240"
        strokeWidth="1"
        fill="none"
        opacity=".6"
      />
      <Spire at={[40, 140]} height={70} width={30} className="bd-mid" />
      <path className="bd-sea" d="M110 240C120 214 160 200 200 200C240 200 290 212 300 240Z" />
      <g stroke="#f4f8fb" fill="none" strokeOpacity=".3">
        <path d="M150 222q20 -3 40 0M210 230q24 -3 48 0M170 236q20 -2 36 0" />
      </g>
      {FLOATING.map((f) => (
        <Floating key={`${f.x}-${f.y}`} uid={uid} at={[f.x, f.y]} />
      ))}
      <g className="bd-front">
        <ellipse cx="120" cy="236" rx="26" ry="8" />
        <ellipse cx="300" cy="234" rx="30" ry="9" />
      </g>
      <g className="bd-dark">
        <ellipse cx="114" cy="232" rx="7" ry="2" />
        <ellipse cx="296" cy="230" rx="8" ry="2.2" />
      </g>
      <Cedar at={[306, 84]} scale={0.8} seed={74} />
      <Maple at={[30, 236]} scale={1.1} seed={75} />
      <Boulder at={[372, 240]} size={16} seed={76} />
    </>
  );
}

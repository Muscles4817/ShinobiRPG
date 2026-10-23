import { r1, ridge, scatter } from './kit';
import { Clouds, SkyLights, paint } from './lights';
import { Boulder, Reeds } from './terrain';
import { Cedar } from './trees';
import { StiltHouse } from './waterTown';

/**
 * A coast with a bridge being built: the great span striding out over the strait on its piers
 * and stopping short in scaffolding and cranes, a poor village of stilt houses on the near shore,
 * the far coast low in the sea mist, and reeds and rocks at the water's edge.
 */

const HORIZON = 152;
const FAR_COAST = ridge({ x0: 230, x1: 410, y: 146, amp: 6, seed: 141, bottom: HORIZON + 2 });

const DECK_Y = 124;
const PIERS = [-4, 56, 116, 176, 236];
const SPAN_END = 250;

const WAVES = (() => {
  const next = scatter(142);
  return Array.from({ length: 26 }, () => {
    const y = HORIZON + 6 + next() ** 1.3 * 80;
    const w = 6 + (y - HORIZON) * 0.35;
    return `M${r1(next() * 400)} ${r1(y)}q${r1(w / 2)} -${r1(w * 0.14)} ${r1(w)} 0`;
  });
})();

function Bridge() {
  const arches = PIERS.slice(0, -1)
    .map((x, i) => {
      const next = PIERS[i + 1] ?? x;
      return `M${x + 10} ${DECK_Y + 8}H${next}V${DECK_Y + 30}Q${(x + next) / 2 + 5} ${DECK_Y + 10} ${x + 10} ${DECK_Y + 30}Z`;
    })
    .join('');
  return (
    <g>
      <path className="bd-mid" d={`M-10 ${DECK_Y}H${SPAN_END}V${DECK_Y + 8}H-10Z`} />
      {PIERS.map((x) => (
        <rect
          key={x}
          className="bd-mid"
          x={x}
          y={DECK_Y}
          width="10"
          height={HORIZON + 40 - DECK_Y}
        />
      ))}
      <path className="bd-mid" d={arches} />
      <g className="bd-front-stroke" strokeWidth="1.3" fill="none">
        <path d={`M${SPAN_END} ${DECK_Y}V${DECK_Y - 22}H${SPAN_END + 26}V${DECK_Y + 50}`} />
        <path
          d={`M${SPAN_END} ${DECK_Y - 11}H${SPAN_END + 26}M${SPAN_END} ${DECK_Y - 22}L${SPAN_END + 26} ${DECK_Y}M${SPAN_END + 13} ${DECK_Y - 22}V${DECK_Y + 50}M${SPAN_END} ${DECK_Y + 20}H${SPAN_END + 26}`}
        />
        <path
          d={`M${SPAN_END - 14} ${DECK_Y}V${DECK_Y - 46}L${SPAN_END + 30} ${DECK_Y - 40}`}
          strokeWidth="1.4"
        />
        <path d={`M${SPAN_END + 22} ${DECK_Y - 41}V${DECK_Y - 18}`} />
      </g>
    </g>
  );
}

export function BridgeCoast({ uid }: { readonly uid: string }) {
  return (
    <>
      <SkyLights uid={uid} moon={[330, 44]} sun={[340, 54]} seed={141} starDepth={110} />
      <Clouds at={[140, 50]} scale={0.8} />
      <path className="bd-far" d={FAR_COAST} />
      <rect className="bd-sea" y={HORIZON} width="400" height={240 - HORIZON} />
      <Bridge />
      <rect y={HORIZON - 4} width="400" height="22" fill={paint(uid, 'mist')} />
      <g stroke="#fff3e0" fill="none" strokeWidth="1" strokeOpacity=".25">
        {WAVES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <path className="bd-near" d="M250 240C280 210 320 196 410 190V240Z" />
      <StiltHouse uid={uid} house={{ x: 268, w: 40, h: 26 }} waterline={222} />
      <StiltHouse uid={uid} house={{ x: 322, w: 46, h: 30 }} waterline={208} />
      <Cedar at={[388, 196]} scale={0.9} seed={143} />
      <Reeds at={[240, 236]} count={9} seed={144} scale={1} />
      <Boulder at={[30, 240]} size={18} seed={145} />
      <Boulder at={[64, 242]} size={10} seed={146} className="bd-near" />
    </>
  );
}

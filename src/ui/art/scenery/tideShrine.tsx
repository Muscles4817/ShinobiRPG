import { Torii } from './buildings';
import { r1, ridge, scatter } from './kit';
import { Clouds, Lantern, SkyLights, paint } from './lights';
import { Boulder } from './terrain';

/**
 * The drowned shrine: a small hall standing on its stilts out in the bay, the tide half way up
 * its steps, a torii before it with the sea between its posts, weed on the rocks, and the lights
 * of the harbour far off along the shore.
 */

const HORIZON = 150;
const SHORE = ridge({ x0: 0, x1: 170, y: 148, amp: 8, seed: 81, bottom: HORIZON + 2 });

const WAVES = (() => {
  const next = scatter(82);
  return Array.from({ length: 34 }, () => {
    const y = HORIZON + 6 + next() ** 1.3 * 84;
    const w = 6 + (y - HORIZON) * 0.4;
    return {
      d: `M${r1(next() * 400)} ${r1(y)}q${r1(w / 2)} -${r1(w * 0.14)} ${r1(w)} 0`,
      o: r1(0.12 + (y - HORIZON) / 240),
    };
  });
})();

const TOWN_LIGHTS = [12, 22, 31, 44, 58, 70, 86, 98];

function Hall({ uid }: { readonly uid: string }) {
  return (
    <g>
      <g className="bd-front-stroke" strokeWidth="2.2">
        <path d="M232 196V222M248 196V224M264 196V224M280 196V222" />
      </g>
      <rect className="bd-front" x="226" y="190" width="60" height="6" />
      <rect className="bd-front" x="234" y="164" width="44" height="26" />
      <path className="bd-roof" d="M222 168Q256 160 290 168L282 152H230Z" />
      <path className="bd-roof" d="M236 152Q256 146 276 152L270 144H242Z" />
      <path className="bd-rim" d="M222 168Q256 160 290 168" strokeWidth="1" fill="none" />
      <rect className="bd-lamp" x="250" y="172" width="12" height="14" fill={paint(uid, 'shoji')} />
      <Lantern uid={uid} at={[240, 178]} size={2.4} />
      <Lantern uid={uid} at={[272, 178]} size={2.4} />
      <g fill="#c8bca8" opacity=".55">
        <rect x="244" y="198" width="24" height="2" />
        <rect x="242" y="203" width="28" height="2" />
      </g>
    </g>
  );
}

export function TideShrine({ uid }: { readonly uid: string }) {
  return (
    <>
      <SkyLights uid={uid} moon={[320, 56]} sun={[330, 80]} seed={81} starDepth={110} />
      <Clouds at={[180, 46]} scale={0.7} />
      <path className="bd-far" d={SHORE} />
      <g className="bd-lit">
        {TOWN_LIGHTS.map((x) => (
          <circle key={x} cx={x} cy={146} r="1.2" fill="#ffd890" />
        ))}
      </g>
      <rect className="bd-sea" y={HORIZON} width="400" height={240 - HORIZON} />
      <path d={`M320 ${HORIZON}L300 240H340Z`} fill="#fff1d0" opacity=".12" />
      <g stroke="#fff3e0" fill="none" strokeWidth="1">
        {WAVES.map((w) => (
          <path key={w.d} d={w.d} strokeOpacity={w.o} />
        ))}
      </g>
      <Hall uid={uid} />
      <rect className="bd-sea" x="222" y="208" width="68" height="20" opacity=".7" />
      <Torii at={[150, 180]} w={40} h={44} />
      <rect className="bd-sea" x="150" y="214" width="40" height="14" opacity=".75" />
      <g stroke="#fff3e0" strokeOpacity=".4" fill="none">
        <path d="M150 214q10 -2 20 0q10 2 20 0M222 208q12 -2 24 0q12 2 24 0q12 -2 22 0" />
      </g>
      <Boulder at={[60, 232]} size={22} seed={83} />
      <Boulder at={[96, 236]} size={12} seed={84} className="bd-near" />
      <Boulder at={[360, 236]} size={18} seed={85} />
      <g fill="#3e5a3a" opacity=".7">
        <path d="M42 222q4 -6 10 -4q-2 6 -10 4zM72 214q6 -4 10 0q-4 4 -10 0zM350 222q5 -5 10 -2q-3 5 -10 2z" />
      </g>
    </>
  );
}

import { Pagoda, Torii } from './buildings';
import { r1, ridge } from './kit';
import { Clouds, Lantern, SkyLights, paint } from './lights';
import { Boulder } from './terrain';
import { Bamboo, Cypress } from './trees';

/**
 * A temple on its hill: the great hall and its pagoda among dark cypresses on the summit, a
 * long stone stair climbing to it through a torii, stone lanterns at the turns, and thick bamboo
 * in the foreground where the path starts.
 */

const FAR = ridge({ x1: 400, y: 140, amp: 26, seed: 151, bottom: 240, freq: 1.2 });

/** The hill the temple stands on, and the stair up its face. */
const HILL = 'M60 240C100 200 140 150 190 128C220 116 260 116 290 128C330 146 360 190 400 240Z';
const STAIR_FOOT: readonly [number, number] = [222, 240];
const STAIR_TOP: readonly [number, number] = [240, 136];

function Stair() {
  const [x0, y0] = STAIR_FOOT;
  const [x1, y1] = STAIR_TOP;
  const steps = Array.from({ length: 22 }, (_, i) => {
    const t = i / 21;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    const w = 26 - t * 18;
    return `M${r1(x - w / 2)} ${r1(y)}h${r1(w)}`;
  }).join('');
  return (
    <g>
      <path
        d={`M${x0 - 14} ${y0}L${x1 - 4} ${y1}H${x1 + 4}L${x0 + 14} ${y0}Z`}
        fill="#a8a092"
        opacity=".35"
      />
      <path d={steps} stroke="#e8e0d0" strokeOpacity=".3" strokeWidth=".8" />
    </g>
  );
}

function Hall({ uid }: { readonly uid: string }) {
  return (
    <g>
      <rect className="bd-near" x="196" y="114" width="64" height="22" />
      <path className="bd-roof" d="M182 118Q228 106 274 118L262 100H194Z" />
      <path className="bd-roof" d="M204 100Q228 94 252 100L244 90H212Z" />
      <path className="bd-rim" d="M182 118Q228 106 274 118" strokeWidth="1" fill="none" />
      <rect className="bd-lamp" x="210" y="122" width="36" height="9" fill={paint(uid, 'shoji')} />
    </g>
  );
}

export function TempleHill({ uid }: { readonly uid: string }) {
  return (
    <>
      <SkyLights uid={uid} moon={[80, 46]} sun={[70, 44]} seed={151} starDepth={90} />
      <Clouds at={[260, 44]} scale={0.8} />
      <path className="bd-far" d={FAR} />
      <rect y="136" width="400" height="34" fill={paint(uid, 'mist')} />
      <path className="bd-mid" d={HILL} />
      <Pagoda uid={uid} at={[296, 140]} scale={0.55} />
      <Cypress at={[176, 140]} scale={0.8} seed={152} />
      <Cypress at={[190, 134]} scale={0.6} seed={153} />
      <Cypress at={[272, 136]} scale={0.7} seed={154} />
      <Hall uid={uid} />
      <Stair />
      <Torii at={[218, 186]} w={30} h={30} />
      <Lantern uid={uid} at={[214, 214]} size={2.2} white />
      <Lantern uid={uid} at={[244, 176]} size={1.8} white />
      <path className="bd-near" d="M-10 240V214C40 206 120 212 200 236H-10Z" />
      <path className="bd-near" d="M410 240V206C370 210 320 220 250 240Z" />
      <Bamboo at={[20, 242]} scale={0.95} seed={155} />
      <Bamboo at={[64, 240]} scale={0.7} seed={156} />
      <Bamboo at={[380, 242]} scale={0.9} seed={157} />
      <Cypress at={[330, 236]} scale={1.1} seed={158} />
      <Boulder at={[120, 240]} size={12} seed={159} />
    </>
  );
}

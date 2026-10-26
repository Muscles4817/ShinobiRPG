import { SkyLights, paint } from './lights';
import { Boulder, Tufts } from './terrain';
import { Snag } from './trees';
import { PlankBridge } from './waterTown';

/**
 * A rope bridge over a gorge: two cliff walls falling away to a thread of river far below, the
 * bridge slung between them on its posts, the far hills beyond, a dead pine on the
 * near lip and the old toll hut at the bridge-head.
 */

function TollHut({ uid }: { readonly uid: string }) {
  return (
    <g>
      <rect className="bd-front" x="18" y="132" width="34" height="22" />
      <path className="bd-roof" d="M12 134L35 118L58 134Z" />
      <rect className="bd-lamp" x="24" y="138" width="8" height="7" fill={paint(uid, 'shoji')} />
    </g>
  );
}

export function GorgeBridge({ uid }: { readonly uid: string }) {
  return (
    <>
      <SkyLights uid={uid} moon={[200, 40]} sun={[210, 44]} seed={201} starDepth={90} />
      <path className="bd-far" d="M-10 130L60 100L120 120L190 90L260 116L330 92L410 120V240H-10Z" />
      <rect y="110" width="400" height="30" fill={paint(uid, 'mist')} />
      <path className="bd-mid" d="M-10 240V150H110C130 170 140 200 150 240Z" />
      <path className="bd-mid" d="M410 240V146H290C270 170 258 200 250 240Z" />
      <path d="M170 240Q200 200 196 160Q202 200 230 240Z" fill={paint(uid, 'mist')} opacity=".6" />
      <path className="bd-sea" d="M184 240Q196 214 198 196Q202 214 214 240Z" />
      <path className="bd-near" d="M-10 240V150H100C116 160 126 190 132 240Z" />
      <path className="bd-near" d="M410 240V148H300C286 164 276 196 268 240Z" />
      <path
        className="bd-rim"
        d="M100 150C116 160 126 190 132 240M300 148C286 164 276 196 268 240"
        strokeWidth="1"
        fill="none"
        opacity=".6"
      />
      <PlankBridge from={[100, 150]} to={[300, 148]} sag={34} />
      <path className="bd-front-stroke" d="M100 150V132M300 148V130" strokeWidth="3" />
      <TollHut uid={uid} />
      <Snag at={[360, 150]} scale={0.9} seed={202} />
      <Boulder at={[80, 240]} size={18} seed={203} />
      <Tufts from={[0, 238]} to={[120, 236]} count={10} seed={204} />
    </>
  );
}

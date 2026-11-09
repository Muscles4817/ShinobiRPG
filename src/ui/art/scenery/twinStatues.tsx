import { SkyLights, paint } from './lights';
import { Pine } from './nature';
import { Boulder, Waterfall } from './terrain';

/**
 * Two stone giants facing each other across a waterfall, each on its own cliff with one hand
 * raised in a sign, the river pouring between them into a round pool, and the forest on the
 * rim above.
 */

/** A stone giant from the waist up, facing across the falls; `facing` 1 looks right. */
function Giant({ x, facing }: { readonly x: number; readonly facing: 1 | -1 }) {
  return (
    <g transform={`translate(${x} 150) scale(${facing * 1.2} 1.2) translate(0 -150)`}>
      <path className="bd-near" d="M-26 150V88Q-24 70 0 66Q24 70 26 88V150Z" />
      <circle className="bd-near" cx="0" cy="52" r="14" />
      <path className="bd-near" d="M-6 40Q0 30 6 40Z" />
      <path className="bd-near" d="M14 84L34 70L38 50L30 48L28 64L12 74Z" />
      <path
        className="bd-rim"
        d="M-26 88Q-24 70 0 66M-14 52a14 14 0 0 1 14 -14M-20 150V96"
        strokeWidth=".9"
        fill="none"
        opacity=".6"
      />
    </g>
  );
}

export function TwinStatues({ uid }: { readonly uid: string }) {
  return (
    <>
      <SkyLights uid={uid} moon={[200, 30]} sun={[200, 26]} seed={211} starDepth={60} />
      <path className="bd-far" d="M-10 120Q100 100 200 112Q300 100 410 116V240H-10Z" />
      <rect y="100" width="400" height="30" fill={paint(uid, 'mist')} />
      <Waterfall top={[200, 112]} foot={204} width={44} seed={212} />
      <path className="bd-near" d="M-10 240V150H150C166 170 172 200 170 240Z" />
      <path className="bd-near" d="M410 240V150H250C234 170 228 200 230 240Z" />
      <Giant x={110} facing={1} />
      <Giant x={290} facing={-1} />
      <path className="bd-sea" d="M150 240C160 214 180 204 200 204C220 204 240 214 250 240Z" />
      <g stroke="#f4f8fb" fill="none" strokeOpacity=".35">
        <path d="M168 226q16 -3 32 0M204 234q16 -3 32 0" />
      </g>
      <Pine at={[30, 152]} scale={0.6} />
      <Pine at={[372, 152]} scale={0.5} />
      <Boulder at={[40, 240]} size={16} seed={213} />
      <Boulder at={[364, 240]} size={12} seed={214} />
    </>
  );
}

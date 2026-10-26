import { r1 } from './kit';
import { Clouds, Lantern, SkyLights, paint } from './lights';
import { Pine } from './nature';
import { Boulder } from './terrain';

/**
 * A pilgrims' stair up a cliff: stone steps zigzagging up the rock face out of the clouds below,
 * paper lanterns at the turns, pines clinging to the ledges, and halfway up a shrine no bigger
 * than a cupboard with sandals in a row before it.
 */

const CLIFF = 'M120 240V60C150 40 200 30 250 40C290 48 320 70 340 110L360 240Z';

/** The stair's flights, each from one turn to the next. */
const FLIGHTS: readonly (readonly [number, number, number, number])[] = [
  [170, 236, 260, 196],
  [260, 196, 200, 160],
  [200, 160, 280, 124],
  [280, 124, 232, 92],
  [232, 92, 262, 64],
];

/** Height of a step, and the width of the stair, in scene units. */
const TREAD_RISE = 4;
const STAIR_WIDTH = 14;

function Flight({ flight: [x0, y0, x1, y1] }: { readonly flight: (typeof FLIGHTS)[number] }) {
  const steps = Math.round(Math.abs(y1 - y0) / TREAD_RISE);
  const treads = Array.from({ length: steps }, (_, i) => {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    return `M${r1(x - STAIR_WIDTH / 2)} ${r1(y)}h${STAIR_WIDTH}`;
  }).join('');
  return (
    <g>
      <path
        d={`M${x0} ${y0}L${x1} ${y1}`}
        stroke="#a8a092"
        strokeOpacity=".45"
        strokeWidth={STAIR_WIDTH - 2}
      />
      <path d={treads} stroke="#e8e0d0" strokeOpacity=".3" strokeWidth=".8" />
    </g>
  );
}

function Shrine({ uid }: { readonly uid: string }) {
  return (
    <g>
      <rect className="bd-front" x="200" y="146" width="14" height="14" />
      <path className="bd-roof" d="M196 148L207 138L218 148Z" />
      <rect className="bd-lamp" x="204" y="150" width="6" height="6" fill={paint(uid, 'shoji')} />
      <path d="M188 160h5M195 160h5M218 160h6" stroke="#c8a070" strokeWidth="1.6" />
    </g>
  );
}

export function MountainStair({ uid }: { readonly uid: string }) {
  return (
    <>
      <SkyLights uid={uid} moon={[70, 40]} sun={[60, 44]} seed={191} starDepth={70} />
      <path className="bd-far" d="M-10 240V120L40 80L80 110L120 70L140 240Z" />
      <path className="bd-far" d="M340 240L360 100L400 70L410 240Z" />
      <path className="bd-mid" d={CLIFF} />
      <path className="bd-rim" d="M120 60C150 40 200 30 250 40" strokeWidth="1" fill="none" />
      {FLIGHTS.map((f) => (
        <Flight key={f.join()} flight={f} />
      ))}
      <Shrine uid={uid} />
      <Lantern uid={uid} at={[260, 190]} size={2} white />
      <Lantern uid={uid} at={[280, 118]} size={1.6} white />
      <Lantern uid={uid} at={[262, 58]} size={1.4} white />
      <Pine at={[300, 108]} scale={0.5} />
      <Pine at={[150, 62]} scale={0.4} />
      <rect y="186" width="400" height="34" fill={paint(uid, 'mist')} />
      <Clouds at={[-10, 200]} scale={1.3} />
      <Clouds at={[260, 214]} scale={1.1} />
      <path className="bd-near" d="M-10 240V222C40 214 100 216 170 236V240Z" />
      <path className="bd-near" d="M410 240V218C380 216 350 226 330 240Z" />
      <Boulder at={[60, 240]} size={14} seed={192} />
      <Pine at={[380, 240]} scale={1.1} />
    </>
  );
}

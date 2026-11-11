import type { Dress, HeadbandPlace } from '@/game';

import { Brush } from './Brush';
import { points } from './brush';
import { INK, SHADE } from './ink';

/**
 * What someone wears, from the collar down: a shinobi's jacket, a senior's flak vest with its
 * high collar and scroll pouches, or a villager's robe. One colour, the person's own, with the
 * fall of the cloth as two folds of shadow.
 */

const SHOULDERS =
  'M12 500C16 436 52 398 112 380C142 372 166 364 178 348L264 338C296 356 352 366 380 418C390 444 394 472 396 500Z';
const NEAR_FOLD =
  'M264 338C300 358 350 370 380 418C390 444 394 472 396 500L330 500C336 440 320 396 270 362Z';
const FAR_FOLD = 'M12 500C16 440 44 404 96 386C74 410 62 444 62 500Z';
const COLLAR = 'M148 372C146 340 176 328 218 330C262 332 292 346 290 380C254 406 190 404 148 372Z';
const LINING = '#f1e6cc';

function Flak({ cloth }: { readonly cloth: string }) {
  return (
    <g>
      <path d={COLLAR} fill={cloth} />
      <path d={COLLAR} fill={SHADE} opacity=".4" />
      <Brush
        pts={points([148, 374, 150, 346, 182, 331, 220, 330, 262, 334, 290, 352, 290, 380])}
        w={4.5}
        land={0.15}
        lift={0.15}
      />
      <Brush pts={points([150, 374, 190, 396, 240, 398, 288, 382])} w={3.4} land={0.2} lift={0.2} />
      <g fill="none" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" opacity=".8">
        <path d="M70 430L116 422L122 462L76 470Z" />
        <path d="M286 428L332 434L328 474L282 468Z" />
      </g>
      <Brush pts={points([206, 400, 208, 440, 206, 500])} w={3} opacity={0.8} land={0.1} />
    </g>
  );
}

function Robe({ cloth }: { readonly cloth: string }) {
  const bands = [
    points([168, 356, 196, 404, 228, 462]),
    points([276, 342, 256, 394, 226, 458]),
  ] as const;
  return (
    <g>
      <path d="M176 352L226 452L270 342L262 338L178 348Z" fill={LINING} />
      <path d="M176 352L226 452L236 430L196 350Z" fill={SHADE} opacity=".2" />
      {bands.map((pts, i) => (
        <g key={i}>
          <Brush pts={pts} w={9} colour={cloth} land={0.1} lift={0.12} />
          <Brush pts={pts} w={9} colour={SHADE} opacity={0.45} land={0.1} lift={0.12} />
        </g>
      ))}
      <Brush pts={points([164, 360, 192, 410, 222, 468])} w={3.2} land={0.15} lift={0.2} />
      <Brush pts={points([282, 344, 260, 400, 230, 462])} w={3.2} land={0.15} lift={0.2} />
    </g>
  );
}

function Jacket() {
  return (
    <g>
      <path d="M180 350L222 430L266 340L262 338L180 348Z" fill={LINING} />
      <path d="M180 350L222 430L230 414L198 350Z" fill={SHADE} opacity=".2" />
      <Brush pts={points([172, 354, 196, 396, 222, 440])} w={4} land={0.12} lift={0.2} />
      <Brush pts={points([272, 342, 250, 392, 222, 440])} w={4} land={0.12} lift={0.2} />
      <Brush pts={points([222, 440, 222, 462, 220, 500])} w={3} opacity={0.8} land={0.1} />
    </g>
  );
}

/** A headband worn loose at the throat: the plate sits under the chin. */
function ThroatBand() {
  return (
    <g>
      <path
        d="M176 352C200 366 240 362 262 344L264 358C240 378 200 380 178 366Z"
        fill="#2c3147"
        stroke={INK}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M198 358L236 354L238 370L200 374Z"
        fill="#c9cdc8"
        stroke={INK}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </g>
  );
}

interface DressProps {
  readonly uid: string;
  readonly dress: Dress;
  readonly cloth: string;
  readonly headband: HeadbandPlace;
}

export function Clothes({ uid, dress, cloth, headband }: DressProps) {
  return (
    <g>
      <path d={SHOULDERS} fill={cloth} />
      <path d={SHOULDERS} fill={`url(#${uid}-cloth)`} />
      <path d={NEAR_FOLD} fill={SHADE} opacity=".3" />
      <path d={FAR_FOLD} fill={SHADE} opacity=".22" />
      {dress === 'flak' && <Flak cloth={cloth} />}
      {dress === 'robe' && <Robe cloth={cloth} />}
      {dress === 'jacket' && <Jacket />}
      {headband === 'neck' && dress !== 'flak' && <ThroatBand />}
      {/* The line of the shoulders, pressed where the weight sits. */}
      <Brush
        pts={points([12, 500, 24, 434, 62, 398, 112, 380, 150, 370])}
        w={5.5}
        land={0.25}
        lift={0.35}
      />
      <Brush pts={points([290, 352, 336, 368, 372, 404, 391, 452, 396, 500])} w={6} lift={0.2} />
    </g>
  );
}

/** A forehead protector: cloth round the brow, and its plate. Hair falls over it. */
export function Headband() {
  const band = 'M108 176C150 136 244 126 298 168L296 192C246 152 152 162 110 200Z';
  return (
    <g>
      <path d={band} fill="#2c3147" />
      <path
        d="M108 176C150 136 244 126 298 168L297 176C246 138 152 146 109 184Z"
        fill="#fff"
        opacity=".14"
      />
      <Brush
        pts={points([108, 177, 150, 150, 204, 138, 256, 146, 298, 168])}
        w={2.6}
        land={0.1}
        lift={0.1}
      />
      <Brush
        pts={points([110, 200, 152, 172, 204, 160, 256, 166, 296, 192])}
        w={2.6}
        land={0.1}
        lift={0.1}
      />
      <path d="M146 148L218 134L222 160L150 174Z" fill="#c9cdc8" />
      <path d="M146 148L218 134L219 141L147 155Z" fill="#fff" opacity=".5" />
      <path
        d="M146 148L218 134L222 160L150 174Z"
        fill="none"
        stroke={INK}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <g fill={INK}>
        <circle cx="154" cy="152" r="1.6" />
        <circle cx="213" cy="140" r="1.6" />
        <circle cx="157" cy="168" r="1.6" />
        <circle cx="216" cy="156" r="1.6" />
      </g>
    </g>
  );
}

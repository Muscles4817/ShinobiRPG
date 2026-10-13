import type { ReactElement } from 'react';

import type { ActionCue } from '@/game';

/**
 * The small drawings behind each action cue. Parts that move carry a class (`cue-steam`,
 * `cue-stroke`…) and `styles/cues.css` animates them; the drawing itself stays still.
 */

const STEAM = (
  <>
    <path className="cue-steam" d="M48 50 q-6 -9 0 -18 q6 -9 0 -18" />
    <path className="cue-steam" d="M60 48 q-6 -9 0 -18 q6 -9 0 -18" />
    <path className="cue-steam" d="M72 50 q-6 -9 0 -18 q6 -9 0 -18" />
  </>
);

const CUE_ART: Readonly<Record<ActionCue, ReactElement>> = {
  eat: (
    <>
      {STEAM}
      <path className="cue-ink" d="M78 30 L100 62 M86 28 L104 58" />
      <path className="cue-ware" d="M22 62 H98 Q96 92 60 96 Q24 92 22 62 Z" />
      <path className="cue-rim" d="M22 62 H98" />
    </>
  ),
  cook: (
    <>
      <circle className="cue-bubble" cx="48" cy="44" r="4" />
      <circle className="cue-bubble" cx="62" cy="40" r="3" />
      <circle className="cue-bubble" cx="74" cy="46" r="3.5" />
      <path className="cue-ware" d="M30 52 H90 V80 Q90 88 82 88 H38 Q30 88 30 80 Z" />
      <path className="cue-rim" d="M24 52 H96 M24 60 H30 M90 60 H96" />
      <path className="cue-flame" d="M44 104 q4 -10 8 -2 q4 -10 8 0 q4 -10 8 0 q4 -8 8 2" />
    </>
  ),
  sleep: (
    <>
      <path className="cue-moon" d="M70 26 A34 34 0 1 0 94 80 A28 28 0 1 1 70 26 Z" />
      <circle className="cue-star" cx="30" cy="34" r="2.5" />
      <circle className="cue-star" cx="96" cy="30" r="2" />
      <circle className="cue-star" cx="24" cy="70" r="2" />
    </>
  ),
  rest: (
    <>
      {STEAM}
      <path className="cue-ware" d="M34 60 H86 V82 Q86 94 60 94 Q34 94 34 82 Z" />
      <path className="cue-rim" d="M86 66 Q98 66 98 76 Q98 84 86 84" />
    </>
  ),
  train: (
    <>
      <path className="cue-stroke" d="M24 40 Q60 28 96 38" />
      <path className="cue-stroke" d="M20 62 Q62 52 100 60" />
      <path className="cue-stroke" d="M28 84 Q60 76 92 82" />
    </>
  ),
  study: (
    <>
      <rect className="cue-paper" x="30" y="30" width="60" height="60" />
      <path className="cue-roller" d="M26 26 V94 M94 26 V94" />
      <path className="cue-stroke thin" d="M78 40 V80 M66 40 V72 M54 40 V78 M42 40 V66" />
    </>
  ),
  heal: (
    <>
      <circle className="cue-ring" cx="60" cy="60" r="16" />
      <circle className="cue-ring" cx="60" cy="60" r="16" />
      <path className="cue-leaf" d="M60 78 Q40 60 60 40 Q80 60 60 78 Z M60 78 V46" />
    </>
  ),
  coins: (
    <>
      <g className="cue-coin">
        <circle cx="48" cy="60" r="9" />
        <rect x="45" y="57" width="6" height="6" />
      </g>
      <g className="cue-coin">
        <circle cx="62" cy="54" r="9" />
        <rect x="59" y="51" width="6" height="6" />
      </g>
      <g className="cue-coin">
        <circle cx="74" cy="61" r="9" />
        <rect x="71" y="58" width="6" height="6" />
      </g>
      <path className="cue-ware" d="M36 64 Q30 96 60 98 Q90 96 84 64 Z" />
      <path className="cue-rim" d="M40 64 Q60 56 80 64" />
    </>
  ),
  gear: (
    <>
      <path className="cue-blade" d="M60 18 L70 64 H50 Z" />
      <path className="cue-rim" d="M44 66 H76 M60 68 V92" />
      <circle className="cue-rim" cx="60" cy="98" r="6" />
      <path className="cue-glint" d="M54 26 L66 26" />
    </>
  ),
  toast: (
    <>
      <path className="cue-ware cue-cup-left" d="M26 50 H52 L48 80 H30 Z" />
      <path className="cue-ware cue-cup-right" d="M68 50 H94 L90 80 H72 Z" />
      <circle className="cue-drop" cx="56" cy="40" r="2.5" />
      <circle className="cue-drop" cx="62" cy="34" r="2" />
      <circle className="cue-drop" cx="66" cy="42" r="2.5" />
    </>
  ),
  sight: (
    <>
      <path className="cue-trail" d="M18 90 Q40 40 62 64 T104 28" />
      <circle className="cue-firefly" cx="30" cy="70" r="3.5" />
      <circle className="cue-firefly" cx="62" cy="62" r="3" />
      <circle className="cue-firefly" cx="92" cy="38" r="4" />
    </>
  ),
  bond: (
    <>
      <path className="cue-thread" d="M40 34 Q60 10 80 34" />
      <rect className="cue-lantern" x="26" y="36" width="28" height="34" rx="10" />
      <rect className="cue-lantern" x="66" y="36" width="28" height="34" rx="10" />
      <path className="cue-rim" d="M34 34 H46 M74 34 H86 M34 72 H46 M74 72 H86" />
    </>
  ),
};

export function CueArt({ kind }: { readonly kind: ActionCue }) {
  return (
    <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
      {CUE_ART[kind]}
    </svg>
  );
}

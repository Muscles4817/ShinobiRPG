import type { ReactNode } from 'react';

import type { Appearance } from '@/game';

/**
 * A bust portrait drawn from an Appearance, in the manner of a woodblock print: flat colour
 * held by an ink outline, almond eyes and a kimono collar. Used for the player and every
 * generated or authored person, so it never needs image files.
 */

/** The print's key-block ink, outlining every shape. */
const INK = '#1d1510';
const LINE = { stroke: INK, strokeWidth: 1.4, strokeLinejoin: 'round' } as const;
const HAIR: Readonly<Record<Appearance['hairStyle'], (c: string) => ReactNode>> = {
  spiky: (c) => (
    <path
      d="M18 40 L14 22 L24 30 L26 12 L34 26 L40 8 L46 26 L54 12 L56 30 L66 22 L62 40 Q40 26 18 40Z"
      fill={c}
    />
  ),
  short: (c) => <path d="M18 42 Q16 18 40 16 Q64 18 62 42 Q54 30 40 30 Q26 30 18 42Z" fill={c} />,
  long: (c) => (
    <path
      d="M16 44 Q14 16 40 15 Q66 16 64 44 L66 80 L56 80 L58 44 Q40 30 22 44 L24 80 L14 80Z"
      fill={c}
    />
  ),
  ponytail: (c) => (
    <>
      <path d="M18 42 Q16 18 40 16 Q64 18 62 42 Q50 28 40 30 Q30 28 18 42Z" fill={c} />
      <path d="M58 22 Q74 24 70 52 Q66 40 60 34Z" fill={c} />
    </>
  ),
  buns: (c) => (
    <>
      <circle cx="22" cy="20" r="8" fill={c} />
      <circle cx="58" cy="20" r="8" fill={c} />
      <path d="M18 42 Q16 20 40 18 Q64 20 62 42 Q50 30 40 31 Q30 30 18 42Z" fill={c} />
    </>
  ),
  shaved: (c) => (
    <path d="M20 38 Q20 20 40 19 Q60 20 60 38 Q40 30 20 38Z" fill={c} opacity="0.55" />
  ),
};

function Headband({ place }: { readonly place: Appearance['headband'] }) {
  const plate = (y: number) => (
    <>
      <rect x="16" y={y} width="48" height="7" rx="2" fill="#2f3a5a" />
      <rect x="32" y={y + 0.5} width="16" height="6" rx="1.5" fill="#c9ccd6" />
      <path d={`M36 ${y + 3.5} h8`} stroke="#5a6070" strokeWidth="1.2" />
    </>
  );
  if (place === 'forehead') return plate(30);
  if (place === 'neck') return plate(64);
  return null;
}

/** A bust shows the shoulders; a face is cropped square to the head, for avatars. */
const FRAMES = {
  bust: { viewBox: '0 0 80 96', aspect: 96 / 80 },
  face: { viewBox: '10 8 60 60', aspect: 1 },
} as const;

interface PortraitProps {
  readonly appearance: Appearance;
  readonly size?: number;
  readonly framing?: keyof typeof FRAMES;
}

export function Portrait({ appearance: a, size = 80, framing = 'bust' }: PortraitProps) {
  const frame = FRAMES[framing];
  return (
    <svg
      className="portrait"
      viewBox={frame.viewBox}
      width={size}
      height={size * frame.aspect}
      aria-hidden="true"
    >
      <path d="M6 96 Q8 72 40 70 Q72 72 74 96Z" fill={a.outfitColour} {...LINE} />
      {/* Kimono collar: the pale under-collar crossing at the chest. */}
      <path d="M32 70 L40 86 L48 70" fill="none" stroke="#efe3c8" strokeWidth="3" />
      <path d="M29 71 L40 90 L51 71" fill="none" stroke={INK} strokeWidth="1.2" />
      {a.headband === 'arm' && <rect x="8" y="82" width="12" height="6" rx="1.5" fill="#c9ccd6" />}
      {a.headband === 'belt' && (
        <rect x="30" y="90" width="20" height="6" rx="1.5" fill="#c9ccd6" />
      )}
      <rect x="34" y="58" width="12" height="14" fill={a.skinTone} {...LINE} />
      <path d="M34 62 Q40 67 46 62 L46 67 Q40 70 34 67Z" fill="rgb(0 0 0 / 0.18)" />
      <path
        d="M19 42 Q19 20 40 20 Q61 20 61 42 Q61 58 48 65 Q40 69 32 65 Q19 58 19 42Z"
        fill={a.skinTone}
        {...LINE}
      />
      <g fill="none" stroke={INK} strokeLinecap="round">
        <path d="M27.5 40.5 Q31.5 38.6 35.5 40" strokeWidth="1.3" />
        <path d="M44.5 40 Q48.5 38.6 52.5 40.5" strokeWidth="1.3" />
        <path d="M28 46.5 Q32 43.6 36 46.5" strokeWidth="1.7" />
        <path d="M44 46.5 Q48 43.6 52 46.5" strokeWidth="1.7" />
        <path d="M40.5 49 Q42 52.5 39.5 53.5" strokeWidth="1" />
      </g>
      <circle cx="32" cy="47.2" r="1.6" fill={a.eyeColour} stroke={INK} strokeWidth="0.6" />
      <circle cx="48" cy="47.2" r="1.6" fill={a.eyeColour} stroke={INK} strokeWidth="0.6" />
      <path
        d="M37 58.5 Q40 59.6 43 58.5"
        stroke="#7a3a2a"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
      <g {...LINE}>
        {HAIR[a.hairStyle](a.hairColour)}
        <Headband place={a.headband} />
      </g>
    </svg>
  );
}

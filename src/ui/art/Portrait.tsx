import type { ReactNode } from 'react';

import type { Appearance } from '@/game';

/**
 * A flat bust portrait drawn from an Appearance. Used for the player now and for every
 * generated or authored person later, so it never needs image files.
 */
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
      <path d="M6 96 Q8 72 40 70 Q72 72 74 96Z" fill={a.outfitColour} />
      {a.headband === 'arm' && <rect x="8" y="82" width="12" height="6" rx="1.5" fill="#c9ccd6" />}
      {a.headband === 'belt' && (
        <rect x="30" y="90" width="20" height="6" rx="1.5" fill="#c9ccd6" />
      )}
      <rect x="33" y="58" width="14" height="14" fill={a.skinTone} />
      <ellipse cx="40" cy="44" rx="21" ry="24" fill={a.skinTone} />
      <ellipse cx="32" cy="46" rx="3.2" ry="3.8" fill="#fff" />
      <ellipse cx="48" cy="46" rx="3.2" ry="3.8" fill="#fff" />
      <circle cx="32" cy="46.5" r="2.3" fill={a.eyeColour} />
      <circle cx="48" cy="46.5" r="2.3" fill={a.eyeColour} />
      <path
        d="M35 58 Q40 61 45 58"
        stroke="#5a3a2a"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
      {HAIR[a.hairStyle](a.hairColour)}
      <Headband place={a.headband} />
    </svg>
  );
}

import type { Dress, Expression, HairStyle, Look } from '@/game';

import { FRAMES } from './head';

/**
 * A lantern shadow: someone's profile cut from black paper against lit paper, for wherever a
 * face is too small to draw. Who it is reads from the silhouette (hair, headband, the set of
 * the shoulders), which is what holds up at the size of a thumb.
 */

export const SHADOW_BOX = 200;
export const SHADOW_INK = '#211a14';
export const SHADOW_LIT = '#f6dca0';
const BOX = SHADOW_BOX;
const INK = SHADOW_INK;
const LIT = SHADOW_LIT;

/** The lit paper behind a shadow: a warm lantern, or a red one for the other side of a fight. */
const GLOWS = {
  warm: ['#ffe9b4', '#f2c476', '#d9953f'],
  red: ['#ffd0b0', '#ee8a66', '#b8432f'],
} as const;
export type ShadowTone = keyof typeof GLOWS;

interface GroundProps {
  readonly uid: string;
  readonly tone: ShadowTone;
}

export function LanternGround({ uid, tone }: GroundProps) {
  const [core, mid, rim] = GLOWS[tone];
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-glow`} cx=".5" cy=".42" r=".7">
          <stop offset="0" stopColor={core} />
          <stop offset=".6" stopColor={mid} />
          <stop offset="1" stopColor={rim} />
        </radialGradient>
      </defs>
      <rect width={BOX} height={BOX} fill={`url(#${uid}-glow)`} />
    </>
  );
}

/** A plain head and shoulders in profile: what anyone is cut from. */
export const SHADOW_HEAD =
  'M44 200C46 174 66 164 90 158L90 142C76 134 68 114 70 94C72 62 98 46 122 50C142 53 152 66 153 82L155 92L152 97L164 114L156 119L159 125L155 129L158 134L154 139C155 147 148 153 138 153L127 151L126 162C144 166 160 176 162 200Z';

/** The shoulders a dress adds to the silhouette; a jacket is the bare line of the body. */
const SHOULDERS: Readonly<Record<Dress, string | null>> = {
  jacket: null,
  flak: 'M30 200C34 170 60 160 86 152L84 136L120 140L128 150L130 164C152 168 172 178 176 200Z',
  robe: 'M34 200C38 172 62 164 90 158L128 160C150 166 166 178 168 200Z',
};

export const SHADOW_CROP =
  'M70 96C62 60 92 38 124 42C146 45 156 62 156 80L150 78C140 70 128 70 116 76C108 96 100 112 96 128L84 126C76 118 72 108 70 96Z';

const HAIR: Readonly<Record<HairStyle, string>> = {
  shaved: '',
  short: SHADOW_CROP,
  long: 'M70 96C62 58 92 36 124 40C148 43 158 62 157 82L150 78C140 70 128 72 118 78C112 96 106 114 100 130C104 156 100 180 92 200L40 200C54 170 62 130 70 96Z',
  bob: 'M68 98C58 58 92 34 126 39C150 43 160 64 158 86L150 80C138 72 126 74 118 82C116 104 112 124 104 140L72 142C66 128 66 112 68 98Z',
  topknot: `${SHADOW_CROP}M84 46C76 30 84 16 98 16C112 16 118 30 110 44Z`,
  buns: `${SHADOW_CROP}M70 62C54 56 52 34 68 28C84 24 94 40 88 54ZM112 44C106 28 118 14 132 18C146 22 148 40 136 48Z`,
  ponytail: `${SHADOW_CROP}M78 58C50 54 34 78 40 112C44 134 52 150 60 160C54 134 56 104 78 84Z`,
  spiky:
    'M70 100L52 92L66 80L50 62L72 62L66 36L88 50L96 22L110 46L130 26L132 50L154 46L150 68L160 82L150 80C140 72 128 72 116 78C108 98 100 112 96 128L84 126C76 118 72 108 70 100Z',
  shaggy:
    'M66 104L52 100L62 88C56 56 90 34 124 40C148 44 158 62 158 84L150 80C140 72 128 72 118 80L122 96L110 92C106 112 100 130 90 146L82 132L72 140C66 128 64 116 66 104Z',
};

/** Smiling eyes close to an arc; hard ones slant; the rest are a plain cut. */
function eyeCut(expression: Expression) {
  if (expression === 'smile' || expression === 'grin') {
    return (
      <path
        d="M134 100Q141 104 148 100"
        stroke={LIT}
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  const hard = expression === 'stern' || expression === 'smirk';
  return <path d={hard ? 'M133 97L149 101L146 104Z' : 'M133 100L149 99L146 104Z'} fill={LIT} />;
}

interface ShadowProps {
  readonly uid: string;
  readonly look: Look;
  readonly size: number;
  readonly tone?: ShadowTone;
}

export function Shadow({ uid, look, size, tone = 'warm' }: ShadowProps) {
  const dress = look.bearing?.dress ?? 'jacket';
  const shoulders = SHOULDERS[dress];
  const span = FRAMES[look.face.figure].span;
  return (
    <svg
      className="portrait shadow"
      viewBox={`0 0 ${BOX} ${BOX}`}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <LanternGround uid={uid} tone={tone} />
      <g transform="translate(-30 -6) scale(1.3)">
        <g fill={INK} transform={`translate(104 0) scale(${span} 1) translate(-104 0)`}>
          <path d={SHADOW_HEAD} />
          {shoulders && <path d={shoulders} />}
          {HAIR[look.hairStyle] && <path d={HAIR[look.hairStyle]} />}
        </g>
        {look.headband === 'forehead' && (
          <>
            <path d="M70 84C96 74 128 72 157 80L158 88C128 80 98 82 71 93Z" fill={LIT} />
            <rect
              x="128"
              y="74"
              width="20"
              height="11"
              rx="1.5"
              transform="rotate(8 138 80)"
              fill={INK}
            />
          </>
        )}
        {eyeCut(look.face.expression)}
        {look.face.mark === 'scar' && (
          <path d="M118 96L128 124" stroke={LIT} strokeWidth="2.2" strokeLinecap="round" />
        )}
        <path
          d={dress === 'flak' ? 'M88 150L126 156' : 'M96 166L122 198'}
          stroke={LIT}
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity=".8"
        />
      </g>
    </svg>
  );
}

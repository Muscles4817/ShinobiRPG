import { useId } from 'react';

import type { CombatForm, Look } from '@/game';

import {
  LanternGround,
  Shadow,
  SHADOW_BOX,
  SHADOW_CROP,
  SHADOW_HEAD,
  SHADOW_INK,
  SHADOW_LIT,
  type ShadowTone,
} from './Shadow';

/**
 * A fighter as a lantern shadow. Someone with a look of their own is cut as themselves; anyone
 * else is cut as the kind of body they are: a common foe in a hood or a straw hat, a beast, a
 * swarm, a spirit. Your side stands against a warm lantern, the other against a red one.
 */

/** What a common foe wears on their head, so a band of them isn't one shape four times. */
const HEADGEAR = [
  'M60 150C56 110 64 66 96 46C122 34 150 44 158 72L152 80C140 70 126 72 116 80C110 100 108 124 112 150Z',
  'M40 86L112 30L186 82C150 70 90 72 40 86Z',
  SHADOW_CROP,
  `${SHADOW_CROP}M84 46C76 30 84 16 98 16C112 16 118 30 110 44Z`,
] as const;

/** Which headgear a name gets: the same for every "Bandit Thug", whatever their number. */
function headgearOf(name: string): string {
  const kind = name.replace(/[\d\s]+$/, '');
  let sum = 0;
  for (const letter of kind) sum += letter.codePointAt(0) ?? 0;
  return HEADGEAR[sum % HEADGEAR.length] ?? SHADOW_CROP;
}

function CommonFoe({ name }: { readonly name: string }) {
  return (
    <g transform="translate(-30 -6) scale(1.3)">
      <g fill={SHADOW_INK}>
        <path d={SHADOW_HEAD} />
        <path d={headgearOf(name)} />
      </g>
      <path d="M133 97L149 101L146 104Z" fill={SHADOW_LIT} />
    </g>
  );
}

function Beast() {
  return (
    <g>
      <g fill={SHADOW_INK}>
        <path d="M30 200C36 156 58 134 86 124C82 102 90 82 104 68L100 34L124 60C134 58 146 60 154 66L180 94L190 104C194 110 190 118 182 118L160 122L152 136L132 140C128 152 132 162 140 174C148 184 152 192 152 200Z" />
        <path d="M112 66L124 30L138 62Z" />
      </g>
      <path d="M138 86L154 90L145 95Z" fill={SHADOW_LIT} />
      <path
        d="M162 121L170 128L174 120"
        fill="none"
        stroke={SHADOW_LIT}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** Where a swarm's insects hang, and how big each is drawn. */
const SWARM: readonly (readonly [number, number, number])[] = [
  [70, 70, 7],
  [100, 58, 9],
  [130, 72, 6],
  [88, 92, 10],
  [120, 98, 8],
  [150, 96, 6],
  [62, 108, 6],
  [104, 122, 9],
  [138, 126, 7],
  [80, 140, 7],
  [118, 150, 6],
  [96, 168, 5],
  [150, 150, 5],
  [60, 150, 4],
  [160, 70, 4],
];

function Swarm() {
  return (
    <g fill={SHADOW_INK}>
      {SWARM.map(([x, y, r]) => (
        <ellipse
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          rx={r}
          ry={r * 0.7}
          transform={`rotate(${(x + y) % 60} ${x} ${y})`}
        />
      ))}
    </g>
  );
}

function Spirit() {
  return (
    <g>
      <path
        d="M100 30C128 34 150 60 150 96C150 124 140 140 146 164C150 178 160 184 168 186C150 196 132 192 122 180C116 192 104 198 92 190C84 198 68 196 58 184C68 176 66 160 60 140C52 116 50 94 54 78C60 50 78 30 100 30Z"
        fill={SHADOW_INK}
      />
      <g fill={SHADOW_LIT}>
        <ellipse cx="86" cy="88" rx="7" ry="10" />
        <ellipse cx="116" cy="88" rx="7" ry="10" />
        <ellipse cx="101" cy="120" rx="6" ry="9" />
      </g>
    </g>
  );
}

function figureOf(form: CombatForm, name: string) {
  if (form === 'beast') return <Beast />;
  if (form === 'swarm') return <Swarm />;
  return form === 'spirit' ? <Spirit /> : <CommonFoe name={name} />;
}

interface FighterShadowProps {
  /** Their own look, when they have one. */
  readonly look: Look | undefined;
  readonly form: CombatForm | undefined;
  readonly name: string;
  readonly tone: ShadowTone;
  readonly size: number;
}

export function FighterShadow({ look, form, name, tone, size }: FighterShadowProps) {
  const uid = `fs${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  if (look) return <Shadow uid={uid} look={look} size={size} tone={tone} />;
  return (
    <svg
      className="portrait shadow"
      viewBox={`0 0 ${SHADOW_BOX} ${SHADOW_BOX}`}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <LanternGround uid={uid} tone={tone} />
      {figureOf(form ?? 'person', name)}
    </svg>
  );
}

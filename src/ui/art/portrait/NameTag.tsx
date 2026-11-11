import { INK, PAPER } from './ink';

interface NameTagProps {
  readonly uid: string;
  /** The character on the tag. */
  readonly seal: string;
  /** The person's art, as a discipline id, for the tag's dot; none leaves it seal red. */
  readonly art: string | undefined;
}

const TAG = 'M10 0L70 0L80 12V116H0V12Z';
const WOOD = '#c79f63';
const WOOD_LINE = '#4d3115';

/** A wooden name tag hung on a red cord in the corner of a portrait. */
export function NameTag({ uid, seal, art }: NameTagProps) {
  return (
    <g transform="translate(300 352) rotate(4)">
      <path d="M40 -2V-34" stroke="#a23b2a" strokeWidth="4" strokeLinecap="round" />
      <path d={TAG} fill="#000" opacity=".22" transform="translate(4 5)" />
      <path d={TAG} fill={WOOD} />
      <path d={TAG} fill={`url(#${uid}-wood)`} />
      <path
        d="M6 34C28 30 52 38 76 32M4 70C30 64 50 74 78 68M6 98C30 94 54 102 76 96"
        stroke="#8a6431"
        strokeWidth="1.3"
        fill="none"
        opacity=".55"
      />
      <path d={TAG} fill="none" stroke={WOOD_LINE} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="40" cy="13" r="4.6" fill={PAPER} stroke={WOOD_LINE} strokeWidth="2" />
      <text x="40" y="84" textAnchor="middle" className="portrait-seal" fontSize="62" fill={INK}>
        {seal}
      </text>
      <circle
        cx="66"
        cy="104"
        r="7"
        stroke={WOOD_LINE}
        strokeWidth="1.6"
        style={{ fill: art ? `var(--${art}, var(--seal))` : 'var(--seal)' }}
      />
    </g>
  );
}

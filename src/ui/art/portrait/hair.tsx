import type { ReactNode } from 'react';

import type { HairStyle } from '@/game';

import { INK } from './ink';

/**
 * Hair in two layers: what falls behind the head and shoulders, and the fringe over the brow.
 * Drawn for a face 20 wide at the cheekbones and stretched to the face it sits on.
 */

interface HairDrawing {
  readonly back?: string;
  readonly front: string;
  /** Knots and buns above the head, drawn behind everything. */
  readonly crown?: (colour: string) => ReactNode;
  /** Close-shaved: the fringe is a shadow of stubble, not a lock of hair. */
  readonly faint?: boolean;
}

const tied = (colour: string) => (
  <>
    <ellipse cx="60" cy="20" rx="8" ry="6" fill={colour} stroke={INK} strokeWidth="1.1" />
    <path d="M53 25Q60 27 67 25" stroke="#c8452f" strokeWidth="2.2" fill="none" />
  </>
);

export const HAIR: Readonly<Record<HairStyle, HairDrawing>> = {
  spiky: {
    back: 'M36 66L28 52L37 50L30 32L42 36L42 18L53 28L60 10L67 27L79 16L79 34L91 30L84 46L93 52L84 66Z',
    front:
      'M39 56C37 40 45 28 60 27C75 28 83 40 81 56L78 48L76 55L72 43L68 53L64 41L60 51L55 40L52 52L47 43L45 54L42 47Z',
  },
  short: {
    back: 'M38 56C36 36 46 24 60 24C74 24 84 36 82 56Z',
    front: 'M39 50C39 34 48 25 60 25C72 25 81 34 81 50C76 42 70 38 60 38C50 38 44 42 39 50Z',
  },
  long: {
    back: 'M37 72C32 50 40 26 60 25C80 26 88 50 83 72L82 108C76 112 70 110 68 104L72 70H48L52 104C50 110 44 112 38 108Z',
    front:
      'M40 58C38 40 46 28 60 28C74 28 82 40 80 58C79 50 76 44 70 40C66 46 60 48 54 47C50 50 44 53 40 58Z',
  },
  ponytail: {
    back: 'M38 58C36 38 46 25 60 25C74 25 84 38 82 58ZM76 30Q96 32 92 64Q88 78 82 84Q86 62 78 44Z',
    front: 'M40 54C39 38 47 28 60 28C73 28 81 38 80 54C76 44 68 38 58 40C52 42 45 46 40 54Z',
  },
  buns: {
    back: 'M38 64C34 44 42 29 60 28C78 29 86 44 82 64Z',
    front:
      'M40 56C38 38 46 26 60 26C74 26 82 38 80 56L78 54L76 49L73 54L70 48L66 53L62 48L58 53L54 48L50 53L47 49L44 54L42 50Z',
    crown: (colour) => (
      <>
        <circle cx="40" cy="29" r="9" fill={colour} stroke={INK} strokeWidth="1.1" />
        <circle cx="80" cy="29" r="9" fill={colour} stroke={INK} strokeWidth="1.1" />
      </>
    ),
  },
  shaved: {
    front: 'M41 46C42 34 50 28 60 28C70 28 78 34 79 46C72 40 66 38 60 38C54 38 48 40 41 46Z',
    faint: true,
  },
  bob: {
    back: 'M36 80C32 52 40 26 60 25C80 26 88 52 84 80C78 84 74 82 72 78L72 60H48L48 78C46 82 42 84 36 80Z',
    front: 'M40 56C38 38 47 27 60 27C73 27 82 38 80 56L80 50C76 46 70 44 60 44C50 44 44 46 40 50Z',
  },
  topknot: {
    back: 'M38 60C35 40 44 27 60 26C76 27 85 40 82 60Z',
    front: 'M40 52C40 37 48 29 60 29C72 29 80 37 80 52C76 44 70 40 60 40C50 40 44 44 40 52Z',
    crown: tied,
  },
  shaggy: {
    back: 'M34 72C30 54 36 30 50 25C56 22 66 22 72 25C86 31 90 54 86 72L80 66L78 74L72 62L48 62L42 74L40 66Z',
    front:
      'M38 60C36 44 42 30 52 27L56 34L58 27L64 34L68 27C78 30 84 44 82 60L78 52L76 59L72 49L66 54L62 46L57 53L52 46L48 55L44 49L42 58Z',
  },
};

/** Stretches hair drawn for a standard face to one `cheekWidth` wide. */
export const hairFit = (cheekWidth: number): string =>
  `translate(60 0) scale(${Math.round((cheekWidth / 20) * 100) / 100} 1) translate(-60 0)`;

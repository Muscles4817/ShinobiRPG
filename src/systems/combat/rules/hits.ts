import { ELEMENTS, type Discipline, type Element } from '@/systems/techniques';

/**
 * What kind of hurt a hit does, which is what armour meets (`armour.ts`): a blow's weight
 * (blunt), an edge (cut) or a point (pierce: thrown steel, needles, a spear), the raw chakra of a
 * technique with no element, one of the elements, or an illusion (mind), which no armour stops.
 */
export const HIT_TYPES = ['blunt', 'cut', 'pierce', 'chakra', 'mind', ...ELEMENTS] as const;
export type HitType = (typeof HIT_TYPES)[number];

/** What kind of attack lands, which decides what armour and spirits shrug off. */
export type AttackKind = 'blow' | 'weapon' | 'jutsu' | 'seal';

/** The physical kinds of hurt: what worn armour was made for. */
export const PHYSICAL_HITS: readonly HitType[] = ['blunt', 'cut', 'pierce'];

/** What a hit says about itself, for reading its type when it doesn't name one. */
export interface HitShape {
  readonly kind: AttackKind;
  /** Hand to hand (a thrown weapon isn't). */
  readonly physical: boolean;
  readonly discipline?: Discipline;
  readonly element?: Element;
  /** Its type, when the weapon behind it says (`weaponClasses.ts`). */
  readonly hit?: HitType;
}

/**
 * A hit's type: its own when it names one; an illusion is mind; a blow is blunt and a blade a
 * cut, a thrown weapon a point; a technique's element, or raw chakra without one.
 */
export function hitTypeOf(shape: HitShape): HitType {
  if (shape.hit) return shape.hit;
  if (shape.discipline === 'genjutsu') return 'mind';
  switch (shape.kind) {
    case 'blow':
      return 'blunt';
    case 'weapon':
      return shape.physical ? 'cut' : 'pierce';
    case 'jutsu':
    case 'seal':
      return shape.element ?? 'chakra';
  }
}

export function isPhysicalHit(hit: HitType): boolean {
  return PHYSICAL_HITS.includes(hit);
}

import type { Element } from '@/systems/techniques';

import type { CombatTechnique } from '../contract';

/**
 * The elemental cycle: each element overpowers the next. A fighter's nature is their affinity:
 * techniques of their own element come out stronger. It never shields them: elements meet only
 * where techniques meet, when an elemental wall takes an attack or two elemental attacks clash
 * (`plan/clash.ts`), and there the element that overpowers the other wins.
 */

const BEATS: Readonly<Record<Element, Element>> = {
  fire: 'wind',
  wind: 'lightning',
  lightning: 'earth',
  earth: 'water',
  water: 'fire',
};

export const OWN_NATURE_BONUS = 1.15;

/** How one element fares against another where techniques meet. */
export type Matchup = 'strong' | 'weak' | 'even';

export function matchup(element: Element | undefined, against: Element | undefined): Matchup {
  if (!element || !against) return 'even';
  if (BEATS[element] === against) return 'strong';
  if (BEATS[against] === element) return 'weak';
  return 'even';
}

/** A technique of the user's own nature comes out stronger. */
export function elementMultiplier(
  technique: Pick<CombatTechnique, 'element'>,
  attacker: Element | undefined,
): number {
  return technique.element !== undefined && technique.element === attacker ? OWN_NATURE_BONUS : 1;
}

/**
 * Element combos: two fighters on one side hitting the same foe in one exchange with natures
 * that feed each other. The second hit lands harder, whichever came first.
 */
const COMBOS: readonly { readonly pair: readonly [Element, Element]; readonly line: string }[] = [
  { pair: ['wind', 'fire'], line: 'The wind feeds the flames!' },
  { pair: ['water', 'lightning'], line: 'The water carries the lightning!' },
  { pair: ['earth', 'water'], line: 'Earth and water churn into a sucking mire!' },
];

export const ELEMENT_COMBO_BONUS = 1.35;

/** The combo two elements make together, in either order, or null when they don't combine. */
export function elementCombo(
  first: Element | undefined,
  second: Element | undefined,
): { readonly line: string } | null {
  if (!first || !second) return null;
  const found = COMBOS.find(
    ({ pair: [a, b] }) => (a === first && b === second) || (a === second && b === first),
  );
  return found ? { line: found.line } : null;
}

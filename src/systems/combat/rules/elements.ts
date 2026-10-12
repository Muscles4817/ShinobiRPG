import type { Element } from '@/systems/techniques';

import type { CombatTechnique } from '../contract';

/**
 * The elemental cycle: each nature overpowers the next. Using your own nature strengthens a
 * technique; hitting a nature your element beats strengthens it further.
 */

const BEATS: Readonly<Record<Element, Element>> = {
  fire: 'wind',
  wind: 'lightning',
  lightning: 'earth',
  earth: 'water',
  water: 'fire',
};

export const OWN_NATURE_BONUS = 1.15;
export const ADVANTAGE = 1.3;
export const DISADVANTAGE = 0.8;

export type Matchup = 'strong' | 'weak' | 'even';

export function matchup(attack: Element | undefined, defender: Element | undefined): Matchup {
  if (!attack || !defender) return 'even';
  if (BEATS[attack] === defender) return 'strong';
  if (BEATS[defender] === attack) return 'weak';
  return 'even';
}

export function elementMultiplier(
  technique: Pick<CombatTechnique, 'element'>,
  attacker: Element | undefined,
  defender: Element | undefined,
): number {
  const own = technique.element !== undefined && technique.element === attacker;
  const versus = matchup(technique.element, defender);
  const edge = versus === 'strong' ? ADVANTAGE : versus === 'weak' ? DISADVANTAGE : 1;
  return (own ? OWN_NATURE_BONUS : 1) * edge;
}

/** Narration for an elemental matchup, or null when it's even. */
export function matchupLine(versus: Matchup, targetName: string): string | null {
  if (versus === 'strong') return `The element overwhelms ${targetName}!`;
  if (versus === 'weak') return `${targetName}'s nature blunts the attack.`;
  return null;
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

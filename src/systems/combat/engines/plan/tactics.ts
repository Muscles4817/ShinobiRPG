import { clamp } from '@/core';

import type { CombatTechnique, RangeBand } from '../../contract';
import { alive, chakraCost, hasPerk } from '../../rules/body';
import { inReach, reachOf, stepTowards } from '../../rules/range';
import type { Condition, PlanAction, PlanFighter, Rule, TacticId } from './state';

/**
 * Tactics are battle plans: where to fight from and an ordered list of rules. Each exchange a
 * fighter follows the first rule that applies and can be carried out. How reliably the player
 * sticks to the plan depends on intellect (and insight).
 */

export interface Tactic {
  readonly id: TacticId;
  readonly label: string;
  readonly summary: string;
  /** The range this plan fights from. */
  readonly range: RangeBand;
  readonly rules: readonly Rule[];
}

export const TACTICS: readonly Tactic[] = [
  {
    id: 'rush',
    label: 'Rush',
    summary: 'Close in fast. Taijutsu and blades; finish dazed foes with your best.',
    range: 'close',
    rules: [
      { when: 'low-health', then: 'heal' },
      { when: 'out-of-position', then: 'move' },
      { when: 'enemy-dazed', then: 'strongest' },
      { when: 'always', then: 'physical-technique' },
      { when: 'always', then: 'attack' },
    ],
  },
  {
    id: 'technician',
    label: 'Technician',
    summary: 'Keep your distance and lead with your strongest jutsu while chakra lasts.',
    range: 'mid',
    rules: [
      { when: 'low-health', then: 'heal' },
      { when: 'out-of-position', then: 'move' },
      { when: 'always', then: 'strongest' },
      { when: 'always', then: 'attack' },
    ],
  },
  {
    id: 'patient',
    label: 'Patient',
    summary: 'Guard when hurt, save chakra, and strike hard only when the moment comes.',
    range: 'mid',
    rules: [
      { when: 'low-health', then: 'heal' },
      { when: 'low-health', then: 'guard' },
      { when: 'out-of-position', then: 'move' },
      { when: 'enemy-dazed', then: 'strongest' },
      { when: 'chakra-high', then: 'strongest' },
      { when: 'always', then: 'attack' },
    ],
  },
  {
    id: 'trickster',
    label: 'Trickster',
    summary: 'Daze and seal them first, then make them pay while they reel.',
    range: 'mid',
    rules: [
      { when: 'out-of-position', then: 'move' },
      { when: 'enemy-fresh', then: 'stun' },
      { when: 'enemy-dazed', then: 'strongest' },
      { when: 'always', then: 'attack' },
    ],
  },
];

export function tacticById(id: TacticId): Tactic {
  const tactic = TACTICS.find((t) => t.id === id);
  if (!tactic) throw new Error(`Unknown tactic "${id}"`);
  return tactic;
}

/** What a fighter actually does this exchange. */
export type Deed =
  | { readonly kind: 'move'; readonly to: RangeBand }
  | { readonly kind: 'technique'; readonly technique: CombatTechnique }
  | { readonly kind: 'strike' }
  | { readonly kind: 'throw' }
  | { readonly kind: 'guard' };

export interface Situation {
  readonly range: RangeBand;
  readonly goal: RangeBand;
  readonly foe: PlanFighter | undefined;
}

const LOW_HEALTH = 0.35;
const HIGH_CHAKRA = 0.6;

function holds(when: Condition, self: PlanFighter, s: Situation): boolean {
  switch (when) {
    case 'always':
      return true;
    case 'out-of-position':
      return s.range !== s.goal;
    case 'low-health':
      return self.health < self.maxHealth * LOW_HEALTH;
    case 'enemy-dazed':
      return (s.foe?.stunned ?? 0) > 0;
    case 'enemy-fresh':
      return s.foe?.stunned === 0 && s.foe.sealed === 0;
    case 'chakra-high':
      return self.chakra >= self.maxChakra * HIGH_CHAKRA;
  }
}

/** Techniques this fighter could use right now, strongest first. */
export function usable(self: PlanFighter, range: RangeBand): CombatTechnique[] {
  if (self.sealed > 0) return [];
  return self.techniques
    .filter((t) => inReach(reachOf(t), range) && chakraCost(self, t) <= self.chakra)
    .sort((a, b) => b.power - a.power);
}

function pick(
  list: readonly CombatTechnique[],
  test: (t: CombatTechnique) => boolean,
): Deed | null {
  const technique = list.find(test);
  return technique ? { kind: 'technique', technique } : null;
}

export function basicAttack(range: RangeBand): Deed {
  return range === 'close' ? { kind: 'strike' } : { kind: 'throw' };
}

function carryOut(then: PlanAction, self: PlanFighter, s: Situation): Deed | null {
  const list = usable(self, s.range);
  switch (then) {
    case 'move':
      return s.range === s.goal ? null : { kind: 'move', to: stepTowards(s.range, s.goal) };
    case 'strongest':
      return pick(list, (t) => t.effect === 'damage');
    case 'physical-technique':
      return pick(
        list,
        (t) =>
          t.effect === 'damage' && (t.discipline === 'taijutsu' || t.discipline === 'kenjutsu'),
      );
    case 'stun':
      return pick(list, (t) => t.effect === 'stun' || t.effect === 'seal');
    case 'heal':
      return self.health < self.maxHealth ? pick(list, (t) => t.effect === 'heal') : null;
    case 'guard':
      return { kind: 'guard' };
    case 'attack':
      return basicAttack(s.range);
  }
}

/** The first rule that applies and can be carried out. */
export function decideByPlan(self: PlanFighter, rules: readonly Rule[], s: Situation): Deed {
  for (const rule of rules) {
    if (!holds(rule.when, self, s)) continue;
    const deed = carryOut(rule.then, self, s);
    if (deed) return deed;
  }
  return s.foe && alive(s.foe) ? basicAttack(s.range) : { kind: 'guard' };
}

/** How reliably a fighter sticks to the plan: intellect, plus insight to see it coming. */
export function execution(self: PlanFighter): number {
  const sight = hasPerk(self, 'insight') ? 0.15 : 0;
  return clamp(0.65 + self.attributes.intellect * 0.02 + sight, 0.5, 0.97);
}

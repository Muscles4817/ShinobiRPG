import { breathOf, effortOf } from './effort';
import { type TechniqueEffect, type Verb } from '@/systems/techniques';

import type { CombatTechnique, RangeBand } from '../../contract';
import { conditionResist } from '../../rules/avoidance';
import { BLOW_DAMAGE, techniqueDamage } from '../../rules/damage';
import { attackKindOf } from '../../rules/kit';
import { strikeWith, throwWith } from '../../rules/weapons';
import { avoidOdds, blowSkill, techniqueIncoming } from './avoid';
import { playsAnywhere, type Card } from './cards';
import { hiveToll } from './swarm';
import type { PlanFighter, Round } from './state';

/**
 * What an attack is worth against one foe, as a fighter reckons it before choosing
 * (`choose.ts`): the chance it reaches them (the avoid roll they'd make, `avoid.ts`), times what
 * it does when it does (the hit from the gap formula, plus what its conditions are worth if
 * they take hold, and the insects it would kill in a host's hive: an area, an element the strain
 * fears), a little less for the chakra it costs. It reads the same rules the fight
 * plays by, so a sharp mind picks what works here, not just what is strongest on paper. A
 * reckoning, not a forecast: it ignores clones, defences that react and what the ground does.
 */

/** What a condition that takes hold is worth, in plain blows (a daze costs the foe a turn and opens them to a finisher). */
const CONDITION_WORTH: Readonly<Partial<Record<Verb, number>>> = {
  daze: 1.5,
  seal: 0.6,
  confuse: 0.6,
  pin: 0.5,
  drain: 0.3,
  knock: 0.2,
  afflict: 0.6,
};
/** A host's whole hive is worth this much health to them: it is their arsenal. */
const WHOLE_HIVE_WORTH = 60;
/** How much of its worth an attack loses for spending all the chakra its user has left. */
const COST_WEIGHT = 0.5;

/** The fight as a reckoning sees it: who is where, nothing more. */
function sketch(fighters: readonly PlanFighter[], band: RangeBand): Round {
  return { number: 1, fighters: [...fighters], range: band, lines: [], seen: {}, intents: {} };
}

/** Whether an effect takes health. */
function wounds(e: TechniqueEffect): boolean {
  return e.verb === 'damage' || e.verb === 'area' || e.verb === 'break';
}

/** What one effect is worth if it reaches its target. */
function effectWorth(
  self: PlanFighter,
  foe: PlanFighter,
  t: CombatTechnique,
  e: TechniqueEffect,
): number {
  if (e.verb === 'damage' || e.verb === 'area' || e.verb === 'break') {
    // Nothing is worth more than the whole of them.
    return Math.min(techniqueDamage(self, foe, { technique: t, effect: e }, 0.5), foe.maxHealth);
  }
  const worth = CONDITION_WORTH[e.verb];
  if (worth === undefined) return 0;
  const holds = 1 - conditionResist(self, foe, { technique: t, effect: e });
  return worth * BLOW_DAMAGE * holds;
}

function techniqueWorth(
  self: PlanFighter,
  foe: PlanFighter,
  t: CombatTechnique,
  round: Round,
): number {
  const incoming = techniqueIncoming(self, foe, t, round.range);
  if (!incoming) return 0;
  const reaches = 1 - avoidOdds(round, incoming);
  const worths = t.effects.map((e) => ({ e, worth: effectWorth(self, foe, t, e) }));
  const dealt = worths.filter(({ e }) => wounds(e)).reduce((sum, { worth }) => sum + worth, 0);
  const hurts = worths.reduce((sum, { worth }) => sum + worth, 0);
  const does = hurts + hiveToll(foe, t, dealt) * WHOLE_HIVE_WORTH;
  const { pool, amount } = effortOf(self, t);
  const spent = amount / Math.max(1, pool === 'breath' ? breathOf(self) : self.chakra);
  return reaches * does * Math.max(0, 1 - COST_WEIGHT * spent);
}

function blowWorth(self: PlanFighter, foe: PlanFighter, thrown: boolean, round: Round): number {
  const attack = thrown ? throwWith(self, foe, 0.5) : strikeWith(self, foe, 0.5);
  const kind = attackKindOf(null, thrown);
  const incoming = {
    form: 'blow' as const,
    attacker: self,
    target: foe,
    skill: blowSkill(self, kind, thrown),
    threat: attack.raw / Math.max(1, foe.maxHealth),
    ...(thrown ? {} : { paceSpeed: self.attributes.speed }),
  };
  return (1 - avoidOdds(round, incoming)) * Math.min(attack.raw, foe.maxHealth);
}

/** What an attack card is worth against this foe; null for anything that isn't an attack. */
export function cardWorth(
  self: PlanFighter,
  foe: PlanFighter,
  card: Card,
  where: { readonly band: RangeBand; readonly fighters: readonly PlanFighter[] },
): number | null {
  if (playsAnywhere(card)) return null;
  const round = sketch(where.fighters.length > 0 ? where.fighters : [self, foe], where.band);
  switch (card.kind) {
    case 'jutsu':
      return techniqueWorth(self, foe, card.technique, round);
    case 'strike':
      return blowWorth(self, foe, false, round);
    case 'throw':
      return blowWorth(self, foe, true, round);
    case 'step':
    case 'counter':
      return null;
  }
}

import type { PersonDef } from '@/content';
import type { CombatantSetup } from '@/systems/combat';
import { createStats, type StatDelta, type Stats } from '@/systems/stats';
import type { Discipline } from '@/systems/techniques';
import { maxChakra, maxHealth } from '@/systems/vitals';

import { attributesOf } from '../combatants';
import type { GameContext } from '../context';
import type { GameState } from '../state';

/**
 * Genin who fight beside you (teammates) or against you (sparring partners). They have no
 * stored stats: they grow with your record, so your teammates keep pace with you.
 */

const COMPANION_BASE = 5;
const SPECIALTY_BONUS = 4;
/** Body stats a genin trains alongside their specialty. */
const BODY_BONUS: StatDelta = { strength: 1, speed: 1, stamina: 1 };
const GROWTH_PER_MISSION = 0.4;
const MAX_GROWTH = 12;

export function companionStats(person: PersonDef, state: GameState): Stats {
  const growth = Math.min(MAX_GROWTH, state.standing.missionsCompleted * GROWTH_PER_MISSION);
  const specialty: StatDelta = person.specialty ? { [person.specialty]: SPECIALTY_BONUS } : {};
  return createStats(COMPANION_BASE + growth, { ...BODY_BONUS, ...specialty });
}

function companionTechniques(person: PersonDef, ctx: GameContext): string[] {
  const { content } = ctx;
  const specialty: Discipline | undefined = person.specialty;
  const clan = person.clanId ? content.clans.get(person.clanId) : undefined;
  return [
    ...new Set([
      ...content.academyTechniques,
      ...(specialty ? [content.disciplineStarters[specialty]] : []),
      ...(clan?.startingTechniqueIds ?? []),
    ]),
  ];
}

/** A person as a combatant, fully rested. `tag` labels them on the fight screen. */
export function companionCombatant(
  person: PersonDef,
  state: GameState,
  ctx: GameContext,
  tag: string,
): CombatantSetup {
  const stats = companionStats(person, state);
  return {
    id: `person:${person.id}`,
    name: person.name,
    tag,
    attributes: attributesOf(stats),
    health: maxHealth(stats),
    maxHealth: maxHealth(stats),
    chakra: maxChakra(stats),
    maxChakra: maxChakra(stats),
    techniques: companionTechniques(person, ctx).map((id) => ctx.content.techniques.require(id)),
  };
}

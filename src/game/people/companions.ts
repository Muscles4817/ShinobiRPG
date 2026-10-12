import type { PersonDef } from '@/content';
import type { CombatantSetup, CombatTrait } from '@/systems/combat';
import type { Discipline } from '@/systems/techniques';
import { maxChakra, MAX_HEALTH } from '@/systems/vitals';

import { attributesOf } from '../combatants';
import type { GameContext } from '../context';
import type { GameState } from '../state';
import { personStats } from './progress';

/**
 * Genin who fight beside you (teammates) or against you (sparring partners), from their real
 * stats: what they were made with plus how far they have grown (`people/progress.ts`).
 */

/** Combatant ids for people start with this, so a fight's people can be traced back. */
export const PERSON_PREFIX = 'person:';

/**
 * How a genin fights follows from what they're good at: taijutsu specialists only fight up
 * close, blade specialists are quick on their feet, genjutsu specialists hide in illusions.
 * Ninjutsu and fūinjutsu specialists fight at any range.
 */
const SPECIALTY_KIT: Readonly<Record<Discipline, readonly CombatTrait[]>> = {
  taijutsu: ['brawler'],
  kenjutsu: ['swift'],
  genjutsu: ['illusionist'],
  ninjutsu: [],
  fuuinjutsu: [],
};

export function companionTraits(person: PersonDef): readonly CombatTrait[] {
  return person.specialty ? SPECIALTY_KIT[person.specialty] : [];
}

/**
 * What a genin knows: the academy's techniques, their specialty's starter, their clan's, and
 * the half of each combination technique in their specialty (no clan's), so a teammate can
 * join yours.
 */
function companionTechniques(person: PersonDef, ctx: GameContext): string[] {
  const { content } = ctx;
  const specialty: Discipline | undefined = person.specialty;
  const clan = person.clanId ? content.clans.get(person.clanId) : undefined;
  const combos = content.techniques.all.filter(
    (t) => t.combo && !t.clan && t.discipline === specialty,
  );
  return [
    ...new Set([
      ...content.academyTechniques,
      ...(specialty ? [content.disciplineStarters[specialty]] : []),
      ...(clan?.startingTechniqueIds ?? []),
      ...combos.map((t) => t.id),
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
  const stats = personStats(person, state);
  return {
    id: `${PERSON_PREFIX}${person.id}`,
    name: person.name,
    tag,
    attributes: attributesOf(stats),
    health: MAX_HEALTH,
    maxHealth: MAX_HEALTH,
    chakra: maxChakra(stats),
    maxChakra: maxChakra(stats),
    techniques: companionTechniques(person, ctx).map((id) => ctx.content.techniques.require(id)),
    traits: companionTraits(person),
  };
}

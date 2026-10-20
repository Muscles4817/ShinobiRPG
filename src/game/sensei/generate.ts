import {
  CLASS_REGARDS,
  NOMINATION_HABITS,
  PUNCTUALITIES,
  READINESS_BY_PHILOSOPHY,
  RITUAL_LINES,
  SENSEI_ARCHETYPES,
  type PersonDef,
  type SenseiArchetype,
  type SenseiGrip,
  type SenseiReward,
  type SenseiWays,
} from '@/content';
import { fillSlots, hashUnit } from '@/core';
import { TIME_SLOTS } from '@/systems/time';

import { personSlots } from '../people/pronouns';

/**
 * How a sensei runs a team: their authored ways, or, for a sensei the pack wrote none for,
 * ways generated from their id. An archetype (the drillmaster, the strategist…) fixes what
 * makes them that kind and the rest is rolled; the rules `validateSenseis` checks hold by
 * construction (and a test rolls many to make sure).
 */

/** Sessions a week a grip allows: a tight grip holds you often, a loose one hardly at all. */
const SESSIONS_BY_GRIP: Readonly<Record<SenseiGrip, readonly [number, number]>> = {
  tight: [3, 6],
  firm: [2, 4],
  loose: [1, 3],
};
/** They train you by day. */
const DAY_SLOTS = TIME_SLOTS.slice(0, 3);
const FIRST_LOOSENING = 2;
const LOOSENING_STAGES = 3;

function pick<T>(person: PersonDef, what: string, items: readonly T[]): T {
  const item = items[Math.floor(hashUnit(person.id, what) * items.length)];
  if (item === undefined) throw new Error(`Nothing to pick for ${what}`);
  return item;
}

function between(person: PersonDef, what: string, [low, high]: readonly [number, number]) {
  return low + Math.floor(hashUnit(person.id, what) * (high - low + 1));
}

/** What they give: what they can give, in a rolled order, praise always among them. */
function rewards(person: PersonDef): SenseiReward[] {
  const can: SenseiReward[] = ['praise', 'meal', 'gear'];
  if ((person.teacher?.teaches.length ?? 0) > 0) can.push('signature');
  if (person.favouriteRecipeId !== undefined) can.push('recipe');
  return can.sort((a, b) => hashUnit(person.id, 'reward', a) - hashUnit(person.id, 'reward', b));
}

function archetypeOf(person: PersonDef): SenseiArchetype {
  // A distracted teacher can't be the one who spots hidden talent.
  const fits = SENSEI_ARCHETYPES.filter(
    (a) => !(a.lens === 'hidden-talent' && person.teacher?.quirk === 'distracted'),
  );
  return pick(person, 'archetype', fits);
}

export function generatedWays(person: PersonDef): SenseiWays {
  return waysFor(person, archetypeOf(person));
}

/** Ways of a given kind for this person: the kind fixed, the rest rolled from their id. */
export function waysFor(person: PersonDef, kind: SenseiArchetype): SenseiWays {
  const slots = personSlots('name', person);
  return {
    philosophy: kind.philosophy,
    lens: kind.lens,
    grip: kind.grip,
    loosensAtStage: between(person, 'loosens', [FIRST_LOOSENING, LOOSENING_STAGES + 1]),
    cadence: {
      sessions: between(person, 'sessions', SESSIONS_BY_GRIP[kind.grip]),
      slot: pick(person, 'slot', DAY_SLOTS),
      punctuality: pick(person, 'punctuality', PUNCTUALITIES),
    },
    formats: kind.formats,
    feedback: kind.feedback,
    rituals: kind.rituals.map((ritual) => ({
      kind: ritual,
      line: fillSlots(RITUAL_LINES[ritual], slots),
    })),
    rewards: rewards(person),
    onMissions: kind.onMissions,
    test: kind.test,
    gatekeeping: {
      passStage: between(person, 'pass', [1, 2]),
      permitStage: between(person, 'permit', [2, 3]),
      nominates: pick(person, 'nominates', NOMINATION_HABITS),
      readiness: READINESS_BY_PHILOSOPHY[kind.philosophy],
    },
    classRegard: pick(person, 'class', CLASS_REGARDS),
    story: { wound: fillSlots(kind.wound, slots), beats: [] },
  };
}

const generated = new WeakMap<PersonDef, SenseiWays>();

/** How this sensei runs a team; null for someone who isn't a sensei. */
export function waysOf(person: PersonDef): SenseiWays | null {
  if (!person.sensei) return null;
  if (person.sensei.ways) return person.sensei.ways;
  const known = generated.get(person);
  if (known) return known;
  const ways = generatedWays(person);
  generated.set(person, ways);
  return ways;
}

import type { EnemyDef, FoePronouns } from '@/content';
import { counted, hashUnit, listed, plural } from '@/core';

/**
 * How the story names foes. A foe with a name of their own is told by it ("Ren"); any other is
 * "the bandit thug", and several of a kind are counted ("two bandit thugs and an archer").
 * Creatures and spirits are "it"; people are he or she, read from the fighter's id so the same
 * foe in the same fight is always the same.
 */

/** Kinds of foe the story calls "it" unless the foe says otherwise. */
const CREATURE_KINDS: readonly string[] = ['Beast', 'Spirit'];

export function foeGrammar(def: EnemyDef, combatantId: string): FoePronouns {
  if (def.pronouns) return def.pronouns;
  if (CREATURE_KINDS.includes(def.kind) || def.traits?.includes('spirit')) return 'it';
  return hashUnit(combatantId, 'pronouns') < 0.5 ? 'he' : 'she';
}

/** The common noun for one of them: "bandit thug", "Reikon macaque". */
export function foeNoun(def: EnemyDef): string {
  return def.noun ?? def.name.toLowerCase();
}

/** What the story calls one foe mid-sentence: "the storehouse wraith", or their name. */
export function foeCalled(def: EnemyDef): string {
  return def.proper ? def.name : `the ${foeNoun(def)}`;
}

/** A list of foes for the story: "the storehouse wraith", "two bandit thugs and an archer". */
export function foeList(defs: readonly EnemyDef[]): string {
  const kinds = [...new Map(defs.map((d) => [d.id, d])).values()];
  if (kinds.length === 1 && defs.length === 1 && kinds[0]) return foeCalled(kinds[0]);
  return listed(
    kinds.map((def) => {
      const count = defs.filter((d) => d.id === def.id).length;
      if (def.proper) return listed(Array.from({ length: count }, () => def.name));
      const noun = foeNoun(def);
      return counted(count, noun, plural(noun));
    }),
  );
}

/**
 * The debrief's fact for a won fight, written without a subject so the debrief can run it on
 * ("You beat two bandit thugs and found…"). A mixed party is a list with an "and" of its own,
 * so it stands as its own sentence, after a comma.
 */
export function beatenLine(defs: readonly EnemyDef[]): string {
  if (defs.length === 0) return 'Won the fight.';
  const kinds = new Set(defs.map((d) => d.id)).size;
  const foes = foeList(defs);
  return kinds === 1 ? `Beat ${foes}.` : `Fought ${foes}, and won.`;
}

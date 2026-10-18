import { fillSlots, listed, pronounForms, type Grammar, type PronounForm } from '@/core';

import { namedLine } from './narration';

/**
 * Telling a fight in sentences that agree with who is in them. A template names fighters by
 * slot (`{a}` for whoever acts, `{t}` for whom it lands on, any other key as needed) and the
 * forms that agree with each: `{a.poss}` (your, Gōran’s, the storehouse wraith’s), the pronouns
 * `{a.they}`, `{a.them}`, `{a.their}`, `{a.theirs}`, `{a.themself}`, and the verb endings
 * that agree with `{a}` as the subject: `{a.s}`, `{a.es}`, `{a.is}`, `{a.was}`, `{a.has}`,
 * `{a.does}`. So "{a} search{a.es} the field" is "You search the field" for the player and
 * "Gōran searches the field" for anyone else. A slot that opens a sentence is capitalised. The
 * line carries the ids of the fighters it named, in order (`namedLine`), so the fight screen
 * can tell whom it was about without reading names.
 */

/** A fighter as the story speaks of them. */
export interface Told {
  readonly id: string;
  readonly name: string;
  readonly called?: string;
  readonly grammar?: Grammar;
}

/** What a template's slots are filled with: fighters, several fighters, or plain words. */
export type Cast = Readonly<Record<string, Told | readonly Told[] | string>>;

/** Old saves and shelved engines have no grammar: they read as "they". */
const FALLBACK_GRAMMAR: Grammar = 'they';

const PRONOUNS: readonly PronounForm[] = ['they', 'them', 'their', 'theirs', 'themself', "'s"];
const VERB_ENDINGS: readonly PronounForm[] = ['s', 'es', 'is', 'was', 'has', 'does'];

/** What the story calls a fighter mid-sentence: "you", "Gōran", "the first bandit thug". */
export function calledOf(f: Told): string {
  return f.called ?? f.name;
}

/** "your", "Gōran’s", "the storehouse wraith’s". */
export function possessive(f: Told): string {
  return f.grammar === 'you' ? 'your' : `${calledOf(f)}’s`;
}

function slotsOf(key: string, f: Told): [string, string][] {
  const grammar = f.grammar ?? FALLBACK_GRAMMAR;
  const pronouns = pronounForms(grammar);
  // A name is a singular subject, whatever the pronouns; only "you" takes "you search".
  const verbs = pronounForms(grammar === 'you' ? 'you' : 'it');
  return [
    [key, calledOf(f)],
    [`${key}.poss`, possessive(f)],
    ...PRONOUNS.map((form): [string, string] => [`${key}.${form}`, pronouns[form]]),
    ...VERB_ENDINGS.map((form): [string, string] => [`${key}.${form}`, verbs[form]]),
  ];
}

/** Several fighters as one subject: "the first thug and the second thug" take "search". */
function crowdSlots(key: string, many: readonly Told[]): [string, string][] {
  const [one] = many;
  const single = many.length === 1 && one?.grammar !== 'you';
  const verbs = pronounForms(single ? 'it' : 'they');
  return [
    [key, listed(many.map(calledOf))],
    ...VERB_ENDINGS.map((form): [string, string] => [`${key}.${form}`, verbs[form]]),
  ];
}

function isTold(value: Told | readonly Told[] | string): value is Told {
  return typeof value === 'object' && !Array.isArray(value);
}

/** Fighters' ids in the order the template first names their slots. */
function namedIds(template: string, cast: Cast): string[] {
  const order = [...template.matchAll(/\{([a-zA-Z0-9-]+)[.}]/g)].map((m) => m[1] ?? '');
  const ids = [...new Set(order)].flatMap((key) => {
    const value = cast[key];
    if (value === undefined || typeof value === 'string') return [];
    return isTold(value) ? [value.id] : value.map((f) => f.id);
  });
  return [...new Set(ids)];
}

/** Fills a template with the fighters and words given, marking whom it named. */
export function tell(template: string, cast: Cast): string {
  const slots = Object.entries(cast).flatMap(([key, value]): [string, string][] => {
    if (typeof value === 'string') return [[key, value]];
    return isTold(value) ? slotsOf(key, value) : crowdSlots(key, value);
  });
  return namedLine(fillSlots(template, Object.fromEntries(slots)), namedIds(template, cast));
}

import type { PersonDef } from '@/content';
import { hashUnit, pronounForms } from '@/core';
import type { Pronouns } from '@/systems/profile';

/**
 * How lines speak of someone. Authored people declare their pronouns; generated classmates and
 * composed senseis get theirs from a hash when they are made, and a person from an older save
 * that never had them is read the same way from their id, so they never change.
 */

/** A small share of people are they; the rest he or she in equal measure. */
const THEY_SHARE = 0.08;

export function rolledPronouns(key: string): Pronouns {
  const roll = hashUnit(key, 'pronouns');
  if (roll < THEY_SHARE) return 'they';
  return roll < (1 + THEY_SHARE) / 2 ? 'he' : 'she';
}

export function pronounsOf(person: Pick<PersonDef, 'id' | 'pronouns'>): Pronouns {
  return person.pronouns ?? rolledPronouns(person.id);
}

/**
 * The slots a line about this person may use under `key`: `{key}` is their name, and
 * `{key.they}`, `{key.them}`, `{key.their}`, `{key.theirs}`, `{key.themself}` and the verb
 * endings `{key.s}`, `{key.es}`, `{key.is}`, `{key.was}`, `{key.has}`, `{key.does}`,
 * `{key.'s}` agree with their pronouns.
 */
export function personSlots(
  key: string,
  person: Pick<PersonDef, 'id' | 'name' | 'pronouns'>,
): Readonly<Record<string, string>> {
  const forms = Object.entries<string>(pronounForms(pronounsOf(person))).map(
    ([form, word]): [string, string] => [`${key}.${form}`, word],
  );
  return { [key]: person.name, ...Object.fromEntries(forms) };
}

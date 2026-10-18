/**
 * Small pieces of English the game's text is put together with: a person's pronouns and the
 * verb endings that agree with them, lists, articles, counts in words, and slot filling that
 * capitalises a slot opening a sentence. Knows nothing about the game.
 */

export const PRONOUN_SETS = ['he', 'she', 'they'] as const;
export type PronounSet = (typeof PRONOUN_SETS)[number];

/**
 * Whom a line speaks of, for narration that tells a fight to the player: a person's pronouns,
 * the player ("you"), or a creature or spirit ("it").
 */
export const GRAMMARS = [...PRONOUN_SETS, 'you', 'it'] as const;
export type Grammar = (typeof GRAMMARS)[number];

/**
 * Every form a line may need of someone, and the verb endings that agree with them: "say{s}"
 * (says, or say for they), "go{es}", is, was, has, does, and "{'s}" for he's or they're.
 */
export const PRONOUN_FORMS = [
  'they',
  'them',
  'their',
  'theirs',
  'themself',
  's',
  'es',
  'is',
  'was',
  'has',
  'does',
  "'s",
] as const;
export type PronounForm = (typeof PRONOUN_FORMS)[number];
export type PronounForms = Readonly<Record<PronounForm, string>>;

const FORMS: Readonly<Record<Grammar, PronounForms>> = {
  he: {
    they: 'he',
    them: 'him',
    their: 'his',
    theirs: 'his',
    themself: 'himself',
    s: 's',
    es: 'es',
    is: 'is',
    was: 'was',
    has: 'has',
    does: 'does',
    "'s": '’s',
  },
  she: {
    they: 'she',
    them: 'her',
    their: 'her',
    theirs: 'hers',
    themself: 'herself',
    s: 's',
    es: 'es',
    is: 'is',
    was: 'was',
    has: 'has',
    does: 'does',
    "'s": '’s',
  },
  they: {
    they: 'they',
    them: 'them',
    their: 'their',
    theirs: 'theirs',
    themself: 'themself',
    s: '',
    es: '',
    is: 'are',
    was: 'were',
    has: 'have',
    does: 'do',
    "'s": '’re',
  },
  you: {
    they: 'you',
    them: 'you',
    their: 'your',
    theirs: 'yours',
    themself: 'yourself',
    s: '',
    es: '',
    is: 'are',
    was: 'were',
    has: 'have',
    does: 'do',
    "'s": '’re',
  },
  it: {
    they: 'it',
    them: 'it',
    their: 'its',
    theirs: 'its',
    themself: 'itself',
    s: 's',
    es: 'es',
    is: 'is',
    was: 'was',
    has: 'has',
    does: 'does',
    "'s": '’s',
  },
};

export const pronounForms = (set: Grammar): PronounForms => FORMS[set];

/** "A", "A and B", "A, B and C". */
export function listed(words: readonly string[]): string {
  if (words.length <= 1) return words[0] ?? '';
  return `${words.slice(0, -1).join(', ')} and ${words.at(-1) ?? ''}`;
}

/** Words that start with a vowel letter but not a vowel sound, and the reverse. */
const SOUNDS_CONSONANT = /^(uni|use|usu|one|once|eu)/i;
const SOUNDS_VOWEL = /^(hour|honest|honour|heir)/i;

/** "a bandit", "an archer", "an hour", "a uniform". */
export function withArticle(noun: string): string {
  const vowel = SOUNDS_VOWEL.test(noun) || (/^[aeiou]/i.test(noun) && !SOUNDS_CONSONANT.test(noun));
  return `${vowel ? 'an' : 'a'} ${noun}`;
}

const NUMBER_WORDS = [
  'no',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
] as const;

/** A count for story text, which never carries numerals: "two", "twelve", "dozens". */
export function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? (n < 100 ? 'dozens of' : 'hundreds of');
}

/** "a day", "two days", "no days". */
export function counted(n: number, singular: string, plural = `${singular}s`): string {
  return n === 1 ? withArticle(singular) : `${numberWord(n)} ${plural}`;
}

const ORDINAL_WORDS = [
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eighth',
  'ninth',
  'tenth',
] as const;

/** "first", "second"… for telling apart things that share a name; past ten, "next". */
export function ordinalWord(nth: number): string {
  return ORDINAL_WORDS[nth - 1] ?? 'next';
}

/** Nouns whose plural is the same word: "two genin", "three samurai". */
const UNCHANGED_PLURAL = /(nin|samurai|deer|sheep|fish|ronin|rōnin)$/i;

/** A noun's plural, for the regular cases and the few that come up: "thugs", "wolves", "men". */
export function plural(noun: string): string {
  if (UNCHANGED_PLURAL.test(noun)) return noun;
  if (/man$/i.test(noun)) return `${noun.slice(0, -3)}men`;
  if (/[^aeiou]y$/i.test(noun)) return `${noun.slice(0, -1)}ies`;
  if (/(lf|rf)$/i.test(noun)) return `${noun.slice(0, -1)}ves`;
  if (/(s|sh|ch|x|z)$/i.test(noun)) return `${noun}es`;
  return `${noun}s`;
}

export const capitalise = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

const SLOT = /\{([a-zA-Z0-9-]+(?:\.[a-zA-Z']+)?)\}/g;
/** The text before a slot ends a sentence (or opens speech), so the slot starts one. */
const SENTENCE_OPEN = /(^|[.!?][”’]?\s+|“)$/;

/**
 * Fills `{slot}` and `{slot.form}` from the values given (a person's slots come from their
 * pronouns), capitalising a value that opens a sentence. Slots with no value are left for a
 * later fill.
 */
export function fillSlots(text: string, values: Readonly<Record<string, string>>): string {
  return text.replace(SLOT, (whole, name: string, at: number) => {
    const value = values[name];
    if (value === undefined) return whole;
    return SENTENCE_OPEN.test(text.slice(0, at)) ? capitalise(value) : value;
  });
}

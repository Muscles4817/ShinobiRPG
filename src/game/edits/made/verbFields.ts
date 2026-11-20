import { STAT_IDS } from '@/systems/stats';
import {
  AFFLICTIONS,
  AREA_SIZES,
  CLONE_KINDS,
  FIELD_IDS,
  SHROUD_KINDS,
  type FightStat,
  type Verb,
} from '@/systems/techniques';

/**
 * The verbs a technique made in the editor may use, and what each asks for besides its power,
 * declared once: the form draws its fields from this, the checker reads it and a draft read
 * back from the device is held to it. Summoning is left out (a summon needs a contract behind
 * it), as is anything that opens a ladder (the Gates' steps are the pack's own).
 */

export const MADE_VERBS = [
  'damage',
  'break',
  'area',
  'daze',
  'pin',
  'seal',
  'confuse',
  'drain',
  'afflict',
  'heal',
  'knock',
  'move',
  'conceal',
  'sense',
  'field',
  'trap',
  'counter',
  'substitute',
  'shroud',
  'empower',
  'clone',
] as const satisfies readonly Verb[];
export type MadeVerb = (typeof MADE_VERBS)[number];

/** What a verb does, in a few words, for the form's verb picker. */
export const VERB_LABEL: Readonly<Record<MadeVerb, string>> = {
  damage: 'Wound',
  break: 'Break through a guard',
  area: 'Blast an area',
  daze: 'Daze',
  pin: 'Pin in place',
  seal: 'Seal their chakra',
  confuse: 'Confuse',
  drain: 'Drain chakra',
  afflict: 'Leave a wound that lingers',
  heal: 'Heal',
  knock: 'Throw or pull',
  move: 'Move',
  conceal: 'Hide',
  sense: 'Sense the hidden',
  field: 'Fill the field',
  trap: 'Lay a trap',
  counter: 'Ready a riposte',
  substitute: 'Swap out of a hit',
  shroud: 'Cast armour',
  empower: 'Power up',
  clone: 'Make clones',
};

const BANDS = ['close', 'mid', 'far'] as const;
/** The stats a power-up may raise: every fight stat (reserves size the tank, never a fight). */
export const BOOSTABLE: readonly FightStat[] = STAT_IDS.filter(
  (id): id is FightStat => id !== 'reserves',
);

/** One thing a verb asks for besides its power. */
export type VerbField =
  | {
      readonly kind: 'choice';
      readonly key: string;
      readonly label: string;
      readonly values: readonly string[];
      /** Left unset, the verb's default; the form offers it as its first choice. */
      readonly unset: string | null;
    }
  | { readonly kind: 'flag'; readonly key: string; readonly label: string }
  | {
      readonly kind: 'count';
      readonly key: string;
      readonly label: string;
      readonly min: number;
      readonly max: number;
      /** Left unset (or at this), the verb's default. */
      readonly unset: number | null;
    }
  | { readonly kind: 'stats'; readonly key: string; readonly label: string };

export const VERB_FIELDS: Readonly<Record<MadeVerb, readonly VerbField[]>> = {
  damage: [{ kind: 'count', key: 'hits', label: 'Blows', min: 1, max: 5, unset: 1 }],
  break: [],
  area: [{ kind: 'choice', key: 'size', label: 'Ground', values: AREA_SIZES, unset: 'small' }],
  daze: [],
  pin: [{ kind: 'flag', key: 'channelled', label: 'Held by its caster (their turns go on it)' }],
  seal: [],
  confuse: [],
  drain: [
    { kind: 'flag', key: 'absorb', label: 'Flows back to the user' },
    { kind: 'flag', key: 'will', label: 'Wears the mind, not the chakra' },
  ],
  afflict: [{ kind: 'choice', key: 'harm', label: 'Leaves', values: AFFLICTIONS, unset: null }],
  heal: [],
  knock: [{ kind: 'choice', key: 'to', label: 'Leaves them', values: BANDS, unset: null }],
  move: [{ kind: 'choice', key: 'to', label: 'To', values: BANDS, unset: 'where they fight best' }],
  conceal: [],
  sense: [],
  field: [{ kind: 'choice', key: 'field', label: 'With', values: FIELD_IDS, unset: null }],
  trap: [{ kind: 'flag', key: 'dazes', label: 'Dazes whoever springs it' }],
  counter: [],
  substitute: [{ kind: 'flag', key: 'spins', label: 'A spin that turns every hit aside' }],
  shroud: [{ kind: 'choice', key: 'kind', label: 'Made of', values: SHROUD_KINDS, unset: null }],
  empower: [
    { kind: 'stats', key: 'boosts', label: 'Raises' },
    {
      kind: 'count',
      key: 'healthPerExchange',
      label: 'Health it costs each exchange',
      min: 1,
      max: 20,
      unset: null,
    },
  ],
  clone: [
    { kind: 'choice', key: 'kind', label: 'Made of', values: CLONE_KINDS, unset: 'its element' },
    { kind: 'flag', key: 'strikes', label: 'Solid: they strike too' },
  ],
};

export function isMadeVerb(value: unknown): value is MadeVerb {
  return typeof value === 'string' && (MADE_VERBS as readonly string[]).includes(value);
}

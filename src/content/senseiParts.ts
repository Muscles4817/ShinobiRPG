import type { Discipline, Element } from '@/systems/techniques';

import type { Tone } from './people';
import type { MissionPosture, SenseiGrip, SenseiVoice } from './senseis';
import type { TeachingQuirk } from './teachers';

/**
 * The parts generated senseis are made from (`docs/design/sensei-generation-plan.md`). Every
 * part is written by hand; the game picks parts that fit each other and fills them with names
 * and places from the world (`game/sensei/pool/`). A **temperament** is how they talk and
 * teach, a **past** is what happened to them and the story they tell you over four
 * conversations, ending in two jobs of their own, and a **ground** (each pack's) is where that
 * story is settled.
 *
 * Slots, filled when a sensei is made: `{name}` their given name; `{art}` their specialty in
 * lower case; `{lost}` someone from their past; `{foe}` the one their story ends against;
 * `{keepsake}` something they carry; `{place}` where the story is settled. In conversations,
 * `{you}` and `{them}` are filled as anywhere else. Every person slot (`name`, `lost`, `foe`,
 * `them`) has its pronoun forms, since names and pronouns are drawn: `{name.their}`,
 * `{foe.them}`, and verbs that agree, "keep{name.s}".
 */

/** Where they go when they aren't teaching. */
export const HAUNTS = ['tavern', 'onsen', 'market', 'wilds', 'library', 'home'] as const;
export type Haunt = (typeof HAUNTS)[number];

export interface SenseiTemperament {
  readonly id: string;
  /** The kind of sensei they are (`SENSEI_ARCHETYPES`): their ways follow from it. */
  readonly archetype: string;
  /** How they teach, in one line (the team assignment card). */
  readonly style: string;
  /** What a weekly lesson with them is like (story text). */
  readonly lesson: string;
  /** Who they are, in a sentence or two, before you know their past. */
  readonly bio: string;
  /** Trait ids they get on best with. */
  readonly favouredTraits: readonly string[];
  /** Their own traits (a person's `traitIds`). */
  readonly traits: readonly string[];
  readonly quirk?: TeachingQuirk;
  /** Where they spend their evenings. */
  readonly haunt: Haunt;
  readonly voice: SenseiVoice;
}

/** One of the four personal conversations of a past, at bond stages one to four. */
export interface SenseiPastBeat {
  readonly opener: string;
  readonly choices: readonly {
    readonly label: string;
    readonly tone: Tone;
    readonly reply: string;
  }[];
}

/** Who their story ends against: a foe made for each sensei from this. */
export interface SenseiPastFoe {
  /** An epithet after the name, e.g. "the Black Wing". */
  readonly epithet: string;
  /** The banner in a fight: "Rogue", "Deserter", "Spirit". */
  readonly kind: string;
  readonly description: string;
  /**
   * The art they fight with (their techniques are the pack's of this art), or `theirs`: the
   * sensei's own, for a rival or a student.
   */
  readonly art: Discipline | 'theirs';
  /** The encounter they are met in (`content.encounters`): a camp, a lone rogue, a spirit. */
  readonly encounter: string;
  /** The epithet is the whole name (a spirit has no other). */
  readonly nameless?: true;
  /**
   * The foe is the one they lost (a rival, a student, a friend who went another way): `{foe}`
   * is then `{lost}`'s name.
   */
  readonly isLost?: true;
}

/**
 * The two jobs that close a past, written once and filled per sensei. Job one finds the foe
 * (a road, a check that fails forward, a camp, an ending); job two settles it (a road, a
 * decision between mercy and an end, the foe, and an ending for each).
 */
export interface SenseiPastArc {
  readonly title: string;
  readonly summary: string;
  readonly find: {
    readonly title: string;
    readonly summary: string;
    readonly act: string;
    readonly gate: string;
    readonly road: string;
    readonly check: string;
    readonly found: string;
    readonly lost: string;
    readonly camp: string;
    readonly ending: string;
    readonly home: string;
  };
  readonly settle: {
    readonly title: string;
    readonly summary: string;
    readonly act: string;
    readonly road: string;
    readonly question: string;
    readonly mercy: { readonly label: string; readonly reply: string };
    readonly leave: { readonly label: string; readonly reply: string };
    readonly finish: { readonly label: string; readonly reply: string };
    readonly appears: string;
    readonly spared: string;
    readonly ended: string;
    readonly home: string;
  };
}

export interface SenseiPast {
  readonly id: string;
  /** What weighs on them, in a line (shown on their sheet once the third beat is heard). */
  readonly wound: string;
  /** Temperaments who could carry this past (ids). */
  readonly temperaments: readonly string[];
  /** Arts it fits; left out, any. */
  readonly arts?: readonly Discipline[];
  /** A nature it needs; left out, any. */
  readonly nature?: Element;
  /** Grounds' regions it can be settled in. */
  readonly regions: readonly string[];
  /** How it bends their ways: a grip, a stance on jobs. */
  readonly nudge?: { readonly grip?: SenseiGrip; readonly onMissions?: MissionPosture };
  /** Things they might carry from it, one picked per sensei. */
  readonly keepsakes: readonly string[];
  readonly foe: SenseiPastFoe;
  readonly beats: readonly [SenseiPastBeat, SenseiPastBeat, SenseiPastBeat, SenseiPastBeat];
  readonly arc: SenseiPastArc;
}

/** A pack's place to settle a past: where, by which road, and what kind of ground. */
export interface SenseiGround {
  readonly id: string;
  /** The place in a phrase, mid-sentence: "the old quarry above Shiomachi". */
  readonly place: string;
  /** A road-event region (`content.roadEvents`). */
  readonly region: string;
  /** Days on the road each way. */
  readonly days: number;
}

/**
 * A pack's parts: the shared temperaments and pasts it uses, and its own grounds and names
 * (grown-ups' names, apart from the genin's, for the senseis and the people of their pasts).
 */
export interface SenseiParts {
  readonly temperaments: readonly SenseiTemperament[];
  readonly pasts: readonly SenseiPast[];
  readonly grounds: readonly SenseiGround[];
  readonly names: { readonly given: readonly string[]; readonly family: readonly string[] };
}

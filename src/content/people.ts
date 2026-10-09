import type { Appearance } from '@/systems/profile';
import type { Discipline, Element } from '@/systems/techniques';
import type { TimeSlot } from '@/systems/time';

/** Content schemas for the cast: people, how they talk, and the names generated genin get. */
/** How a reply in conversation comes across. People's traits decide which tones land. */
export const TONES = [
  'praise',
  'challenge',
  'joke',
  'earnest',
  'kind',
  'tease',
  'curious',
  'quiet',
] as const;
export type Tone = (typeof TONES)[number];

export type PersonRole = 'genin' | 'sensei' | 'instructor' | 'leader' | 'villager';

/** What a jōnin is like as a sensei; used to offer the two best fits at team assignment. */
export interface SenseiProfile {
  readonly specialty: Discipline;
  /** Trait ids this sensei gets on best with. */
  readonly favouredTraits: readonly string[];
  readonly nature?: Element;
  /** One line on how they teach. */
  readonly style: string;
}

/**
 * Someone in the world. Authored people live in a pack; generated genin are built from the
 * pack's name pools at runtime and stored in the save, with exactly this shape.
 */
export interface PersonDef {
  readonly id: string;
  readonly name: string;
  readonly familyName: string;
  readonly role: PersonRole;
  /** Shown under the name, e.g. "Jōnin", "Ramen chef". */
  readonly title: string;
  readonly clanId?: string;
  readonly traitIds: readonly string[];
  readonly appearance: Appearance;
  readonly specialty?: Discipline;
  readonly bio: string;
  /** Where they are in each time slot: a place id in the start location, or null (away). */
  readonly schedule: Readonly<Record<TimeSlot, string | null>>;
  readonly sensei?: SenseiProfile;
}

export interface ConversationChoice {
  readonly label: string;
  readonly tone: Tone;
  readonly reply: string;
}

/**
 * A short exchange: they open, you pick a reply, they answer. `{you}` and `{them}` are
 * replaced with names. Without `personId` it is generic and anyone may say it.
 */
export interface ConversationDef {
  readonly id: string;
  readonly personId?: string;
  /** Minimum friendship stage (0 = stranger … 4 = bonded). */
  readonly minStage: number;
  readonly opener: string;
  readonly choices: readonly ConversationChoice[];
}

export interface NamePools {
  readonly given: readonly string[];
  readonly family: readonly string[];
}

/** Team assignment wording. */
export interface TeamText {
  readonly intro: string;
  readonly choose: string;
  readonly formed: string;
}

import type { CombatPerk, WeaponMastery } from '@/systems/combat';
import type { Appearance, Pronouns } from '@/systems/profile';
import type { Rank } from '@/systems/standing';
import type { Aptitude, Stats } from '@/systems/stats';
import type { Discipline, Element } from '@/systems/techniques';
import type { TimeSlot } from '@/systems/time';

import type { RecipeLesson } from './items';
import type { SenseiVoice, SenseiWays } from './senseis';
import type { RiteOffer } from './strains';
import type { TeacherProfile } from './teachers';

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
  'cruel',
] as const;
export type Tone = (typeof TONES)[number];

/**
 * What someone does in the village. `leader` covers the kage and clan heads; `shinobi` is a
 * chūnin, jōnin or legend with no post the game models (guards, examiners, ANBU).
 */
export const PERSON_ROLES = [
  'genin',
  'sensei',
  'instructor',
  'leader',
  'shinobi',
  'villager',
] as const;
export type PersonRole = (typeof PERSON_ROLES)[number];

/** A person's shinobi rank (as the player's standing names them); villagers are civilians. */
export type PersonRank = 'civilian' | Exclude<Rank, 'academy'>;

/** What a jōnin is like as a sensei; used to offer the two best fits at team assignment. */
export interface SenseiProfile {
  readonly specialty: Discipline;
  /** Trait ids this sensei gets on best with. */
  readonly favouredTraits: readonly string[];
  readonly nature?: Element;
  /** One line on how they teach. */
  readonly style: string;
  /** Story text for a weekly lesson (no numbers). */
  readonly lesson: string;
  /**
   * Whether they let another genin sit an exam in place of a teammate who can't or won't.
   * Left out, they refuse: a team is a team.
   */
  readonly toleratesReplacement?: boolean;
  /**
   * False for a sensei who already leads a team of their own (canon): team assignment never
   * offers them, though a save made with them as its sensei keeps them. Left out, they take one.
   */
  readonly offered?: boolean;
  /** How they run your genin years. Left out, ways are generated from an archetype. */
  readonly ways?: SenseiWays;
  /** How they speak at the moments that are theirs (`senseiParts.ts`). */
  readonly voice?: SenseiVoice;
  /**
   * Made from parts (`game/sensei/pool/`): one of a pool of senseis a save draws a few from,
   * present only in the saves that drew them. Says which temperament and past they are made of.
   */
  readonly pooled?: { readonly temperament: string; readonly past: string };
}

/**
 * Someone in the world. Authored people live in a pack; generated genin are built from the
 * pack's name pools at runtime and stored in the save, with exactly this shape.
 */
export interface PersonDef {
  readonly id: string;
  readonly name: string;
  readonly familyName: string;
  /**
   * How lines speak of them. Authored people declare theirs (validated); generated and composed
   * people get theirs when they are made.
   */
  readonly pronouns?: Pronouns;
  readonly role: PersonRole;
  readonly rank: PersonRank;
  /**
   * Their stats as the game begins (authored with `statLine`). Genin grow from here; the save
   * keeps how far (`people.progress`).
   */
  readonly stats: Stats;
  /** Their talent. Left out, it is rolled from their id, like a classmate's (by clan). */
  readonly aptitude?: Aptitude;
  /** Shown under the name, e.g. "Jōnin", "Ramen chef". */
  readonly title: string;
  readonly clanId?: string;
  readonly traitIds: readonly string[];
  readonly appearance: Appearance;
  readonly specialty?: Discipline;
  readonly bio: string;
  /**
   * Where they live, when not in the start village: a town they are met in, never sent on your
   * village's jobs or teams. Only `shinobi` and `villager` roles live elsewhere (validated).
   */
  readonly homeLocationId?: string;
  /** Where they are in each time slot: a place id in their home location, or null (away). */
  readonly schedule: Readonly<Record<TimeSlot, string | null>>;
  readonly sensei?: SenseiProfile;
  /** How they teach and what they ask. Every sensei has one (their signatures live here). */
  readonly teacher?: TeacherProfile;
  /** A recipe they love: serve it at dinner and the evening means more to them. */
  readonly favouriteRecipeId?: string;
  /** Recipes they teach, in order, once you are close enough. */
  readonly recipes?: readonly RecipeLesson[];
  /** Their clan's hive rite, which they will teach once you are close enough. */
  readonly hiveRite?: RiteOffer;
  /** How they fight, when it is their own and not their specialty's generic kit. */
  readonly arsenal?: PersonArsenal;
}

/**
 * A person's own way of fighting: the techniques they bring to every fight (in place of the
 * academy's and their specialty's starter), the perks they fight with (a transplanted eye's
 * insight) and, for someone known by their kit, the gear they wear and the tools in their pouch.
 * Every technique is one of the pack's, learnable somewhere like any other, and fits its owner's
 * grade in its art (validated).
 */
export interface PersonArsenal {
  readonly techniqueIds: readonly string[];
  readonly perks?: readonly CombatPerk[];
  /**
   * Perks they keep covered until a fight calls for them (a transplanted eye under a headband):
   * uncovered as a turn, and a drain on chakra while open (`CombatantSetup.veiled`).
   */
  readonly veiled?: readonly CombatPerk[];
  /** The pack's gear they fight in, a piece per slot (validated). Left out, armed as their kit. */
  readonly gearIds?: readonly string[];
  /** The pack's fight tools they carry into every fight, by id, and how many. */
  readonly tools?: Readonly<Record<string, number>>;
  /**
   * How well they know each class of weapon, 0 to 1 (`rules/mastery.ts`), read with their gear.
   * Left out, they are at home with whatever they carry.
   */
  readonly weaponMastery?: WeaponMastery;
  /** The dust they command (a `DustDef` id), a full store of it in every fight. */
  readonly dust?: string;
  /** The puppets they work on threads (`PuppetDef` ids), each unsealed by its own technique. */
  readonly puppets?: readonly string[];
}

/**
 * How someone talks, read from their traits (`TraitDef.register`): blunt, warm, wry or formal.
 * A templated line may be phrased once per register, so two people never say the same words.
 * Blunt and wry are the dry pair, warm and formal the courteous one; a line phrased for one of
 * each pair reads right for everyone.
 */
export const REGISTERS = ['blunt', 'warm', 'wry', 'formal'] as const;
export type Register = (typeof REGISTERS)[number];

/** Phrasings of one line, by the register of whoever says it. */
export type Phrasings = Partial<Readonly<Record<Register, string>>>;

/** A line said the same way by everyone, or phrased by register. */
export type Phrased = string | Phrasings;

export interface ConversationChoice {
  readonly label: string;
  readonly tone: Tone;
  /** Their answer when your reply lands plainly, and whenever it has no warm or cool one. */
  readonly reply: Phrased;
  /** Their answer when your reply lands well (a tone they like). Every template has one. */
  readonly warm?: Phrased;
  /** Their answer when your reply grates (a tone they dislike). Every template has one. */
  readonly cool?: Phrased;
  /** Picking this reply does the favour a teacher asked for (`SimplePrice` favour id). */
  readonly favour?: string;
  /** The village remembers it (`village.marks`): a sensei's story opening their arc. */
  readonly worldMark?: string;
}

/**
 * What a templated conversation is about, taken from the person: the art they specialise in,
 * one of their traits, their clan or their role in the village.
 */
export const TOPIC_KINDS = ['specialty', 'trait', 'clan', 'role'] as const;
export type TopicKind = (typeof TOPIC_KINDS)[number];

/**
 * The words a templated conversation is filled with for one topic: for the `specialty` topic
 * `taijutsu`, say, `{art}` is "taijutsu" and `{drill}` "a thousand kicks at the post".
 */
export interface ConversationTopic {
  readonly kind: TopicKind;
  /** A discipline, trait id, clan id or person role, by `kind`. */
  readonly key: string;
  readonly values: Readonly<Record<string, string>>;
}

/**
 * A short exchange: they open, you pick a reply, they answer. `{you}` and `{them}` are
 * replaced with names. Without `personId` it is generic and anyone may say it. With `about`
 * it is a template: anyone with a topic of that kind may say it, and its other `{slots}` are
 * filled from that topic's values.
 */
export interface ConversationDef {
  readonly id: string;
  readonly personId?: string;
  /** Minimum friendship stage (0 = stranger … 4 = bonded). */
  readonly minStage: number;
  readonly about?: TopicKind;
  /** Phrased by register in every template (validated). */
  readonly opener: Phrased;
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

import type { CombatTrait } from '@/systems/combat';
import type { MissionRole } from '@/systems/missions';
import type { BodyStat, CompanionTemperament, PlayKind } from '@/systems/companions';
import type { StatDelta, StatId } from '@/systems/stats';
import type { Element } from '@/systems/techniques';

import type { Biome } from './biomes';

/**
 * Bodies that fight beside someone (`docs/design/retinue-plan.md`): a foe's retinue, and the
 * kinds of creature that may become a companion.
 */

/**
 * How plainly a retinue shows before the fight: `open` (a hound at heel, anyone sees it),
 * `kept` (out of sight but carried: a sharp look may catch it) or `hidden` (inside the body:
 * even the sharpest eyes rarely see it). In the fight every body on the field is seen.
 */
export const RETINUE_TELLS = ['open', 'kept', 'hidden'] as const;
export type RetinueTell = (typeof RETINUE_TELLS)[number];

/** One body in a foe's retinue: another enemy, fighting beside them. */
export interface RetinueEntry {
  readonly enemyId: string;
  readonly tell: RetinueTell;
}

/** Where a stray of a kind turns up in the start village, and how likely a save meets one. */
export interface StrayHaunt {
  /** Places in the start village it may be found at, one a day. */
  readonly placeIds: readonly string[];
  /** The share of saves in which one ever turns up. */
  readonly chance: number;
  /** What you see of it, e.g. "A thin grey hound noses through the scraps by the stalls." */
  readonly line: string;
  /** What spending time with it looks like, for the journal. */
  readonly visit: string;
  /** The day it follows you home. */
  readonly follows: string;
}

/**
 * Where a wild one of a kind lives: some wild places of its biome, read from the seed (not
 * every woods has a wolf in it), and tracked there on purpose over days until it comes to you.
 */
export interface WildHaunt {
  readonly biome: Biome;
  /** The share of wild places of its biome where one lives, in a save. */
  readonly chance: number;
  /** What you notice of it there, e.g. "Prints the size of your hand in the mud by the stream." */
  readonly sign: string;
  /** A day's tracking that brings you closer. */
  readonly closer: string;
  /** A day the trail goes cold. */
  readonly lost: string;
  /** The day it comes to you. */
  readonly comes: string;
  /**
   * A changed kind's foe (an enemy id): its signs show only to someone who has fought one of its
   * kind (the field book's foes), as nobody looks for what they have never seen.
   */
  readonly after?: string;
}

/** A kind of creature that may become a companion: a breed of ninken, a stray hound. */
export interface CompanionKindDef {
  readonly id: string;
  /** What it is, shown on its banner and sheet: "Ninken", "Stray hound". */
  readonly name: string;
  readonly description: string;
  /** How it takes to people (`systems/companions`): bred, stray or wild. */
  readonly temperament: CompanionTemperament;
  /** Its grown body, and how long a pup takes to grow into it (`systems/companions/growth.ts`). */
  readonly body: CompanionBody;
  /** Where its skills start (taijutsu, wits, will); the body stats come from `body`. */
  readonly baseStat: number;
  readonly statBonuses: StatDelta;
  /** Health as a multiple of a human's 100. */
  readonly healthScale: number;
  readonly maxChakra: number;
  /** Its chakra nature; a kind of a chakra beast's line has its beast's own (validated). */
  readonly nature?: Element;
  readonly traits?: readonly CombatTrait[];
  /** Its talent per stat, 1 when left out; 0 is an art it can never learn. */
  readonly aptitude: Partial<Readonly<Record<StatId, number>>>;
  /** Ingredients it eats; one is each animal's favourite, drawn from the seed. */
  readonly diet: readonly string[];
  /** The games it loves and the ones it can't stand. */
  readonly plays: { readonly likes: readonly PlayKind[]; readonly dislikes: readonly PlayKind[] };
  /** Names one may be given, one drawn from the seed. */
  readonly names: readonly string[];
  /** Where a stray of this kind may be found, for kinds that live on the streets. */
  readonly stray?: StrayHaunt;
  /** Where a wild one lives, for kinds tracked in the wilds. */
  readonly wild?: WildHaunt;
  /** What it can learn to do in a fight, as the bond opens it (and a handler, for some). */
  readonly techniques?: readonly KindTechnique[];
  /** The checks it can take on a job for you once close enough (a tracker follows the trail). */
  readonly roles?: readonly MissionRole[];
}

/**
 * A technique a kind can come to use: open at a bond stage, or, with `handler`, taught by a
 * handler once the bond is there (a clan's deeper arts). A technique held only by kinds is
 * never learned by people.
 */
export interface KindTechnique {
  readonly techniqueId: string;
  readonly stage: number;
  readonly handler?: true;
}

/** A clinic's handling: sessions with a kennel master or clan handler, better than your own. */
export interface HandlerFields {
  /** How much better a session is than your own handling (×1.6 a kennel master, ×2 a clan's). */
  readonly quality: number;
  readonly price: number;
  /** The bond stage with the vet before they'll work with your companion. */
  readonly minStage: number;
  /** Kind techniques they teach (each `handler` technique needs someone to teach it). */
  readonly teaches?: readonly string[];
}

/** Written handling lore (a kennel master's notes): makes your own sessions count for more. */
export interface CompanionLoreDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly cost: number;
  /** How much better your own sessions are with it read (×1.25). */
  readonly handling: number;
}

/** A kind's grown body: the adult value of each body stat, and days of growing to reach it. */
export interface CompanionBody {
  readonly adult: Readonly<Record<BodyStat, number>>;
  readonly maturesInDays: number;
}

/** The companion a clan's children grow up with, and the bond they start with. */
export interface ClanCompanion {
  readonly kindId: string;
  readonly bond: number;
}

/** An animal clinic: its vet treats an injured companion and sells medicine. */
export interface VetFields {
  readonly kind: 'vet';
  /** The vet, a person of the pack. */
  readonly keeperId: string;
  readonly treatmentCost: number;
  readonly medicineCost: number;
  /** A clan whose own are treated free (the clan's kennels). */
  readonly freeForClanId?: string;
  /** Pups bred here, for someone without a companion. */
  readonly pups?: KennelPups;
  /** The vet works with companions too: handling sessions, and a clan's arts. */
  readonly handling?: HandlerFields;
}

/** A kennel's pups: given to a friend of the vet, or sold to anyone else. */
export interface KennelPups {
  /** A bred kind of the pack. */
  readonly kindId: string;
  readonly price: number;
  /** The bond stage with the vet at which a pup is a gift. */
  readonly giftStage: number;
  /** What you see of the litter. */
  readonly line: string;
}

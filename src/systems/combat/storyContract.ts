import type { AreaSize, Element } from '@/systems/techniques';

import type { RangeBand } from './sides';

/**
 * THE FIGHT AS AN ORDERED LIST OF EVENTS (`docs/design/event-stream-plan.md`).
 *
 * An engine tells its fight as events, appended where the values they report are set, so their
 * order is the order things happened: a line of the story (`told`), and the changes between lines
 * (someone's health, pools or statuses moving, someone joining, falling or leaving). Each stretch
 * the screen plays opens with where everyone stands (`stand`), so folding a stretch's events in
 * order (`foldStory`) gives the fight as it stands at every point of it. Everything a reader needs
 * is a field here, said by whoever did it: nothing is read back out of the words.
 */

/** What a defence did about an attack, or (`missed`) that it was slipped without one. */
export const NARRATION_REACTIONS = [
  'dodged',
  'missed',
  'dodge-missed',
  'guarded',
  'guard-broken',
  'countered',
  'swapped',
  'shielded',
] as const;
export type NarrationReaction = (typeof NARRATION_REACTIONS)[number];

/**
 * Why a player's turn played something they never slotted: nothing slotted would do here, so
 * they threw a plain blow or stepped (`improvised`), or no one was in sight to hit (`looking`).
 */
export const NARRATION_OFF_PLAN = ['improvised', 'looking'] as const;
export type NarrationOffPlan = (typeof NARRATION_OFF_PLAN)[number];

/**
 * Why something went as it did (audit P1.1): why an attack was slipped, why a hold didn't take,
 * why a step failed. The engine says it from the roll that decided it; the screen shows it as a
 * stamp, in words, never odds. A line carries at most one cause.
 */
export const NARRATION_CAUSES = [
  // A move that took no turn.
  'teleport',
  // An attack slipped.
  'saw-through',
  'foresaw',
  'evading',
  'dodge-ready',
  'familiar',
  'wild',
  'quicker',
  'read-it',
  'ready-for-it',
  'blinded',
  'small-target',
  'slipped',
  // A hold, daze, seal or drain that reached but didn't take.
  'braced',
  'resisted',
  // A step that failed.
  'held',
  'no-room',
  'outpaced',
  'cut-off',
  'kept-pace',
  'held-off',
  // A technique that came apart before it was cast.
  'crowded',
] as const;
export type NarrationCause = (typeof NARRATION_CAUSES)[number];

/**
 * What a cause is about, for whoever it is about (its subject): their attack was slipped, their
 * step failed, their hold didn't take, their technique came apart, or they moved without it
 * costing a turn (a teleport).
 */
export const CAUSE_KINDS = [
  'slipped',
  'step-failed',
  'hold-failed',
  'cast-broken',
  'moved',
] as const;
export type CauseKind = (typeof CAUSE_KINDS)[number];

/** Each cause's kind: one place, so every reader sorts causes the same way. */
export const CAUSE_KIND: Readonly<Record<NarrationCause, CauseKind>> = {
  teleport: 'moved',
  'saw-through': 'slipped',
  foresaw: 'slipped',
  evading: 'slipped',
  'dodge-ready': 'slipped',
  familiar: 'slipped',
  wild: 'slipped',
  quicker: 'slipped',
  'read-it': 'slipped',
  'ready-for-it': 'slipped',
  blinded: 'slipped',
  'small-target': 'slipped',
  slipped: 'slipped',
  braced: 'hold-failed',
  resisted: 'hold-failed',
  held: 'step-failed',
  'no-room': 'step-failed',
  outpaced: 'step-failed',
  'cut-off': 'step-failed',
  'kept-pace': 'step-failed',
  'held-off': 'step-failed',
  crowded: 'cast-broken',
};

export type NarrationAmountKind = 'harm' | 'heal';

/** An amount a line reports, shown as a chip since story text never shows numbers. */
export interface NarrationAmount {
  readonly kind: NarrationAmountKind;
  readonly amount: number;
}

/** How big a turn was: its maker's grade in the art (0 for E up to 5 for S), area, element. */
export interface NarrationForce {
  readonly grade: number;
  readonly size: AreaSize | null;
  readonly element: Element | null;
}

/** A defence at work: what it did, who kept it (`by`) and whose attack it met (`on`). */
export interface ToldReaction {
  readonly reaction: NarrationReaction;
  readonly by?: string;
  readonly on?: string;
}

/** Why it went as it did, and whom it is about (`subject`: whose attack, step or hold). */
export interface ToldCause {
  readonly cause: NarrationCause;
  readonly kind: CauseKind;
  readonly subject?: string;
}

/** A line of the story, with everything the screen says beside it. */
export interface ToldEvent {
  readonly kind: 'told';
  readonly text: string;
  /** Whose turn it was told in (a combatant id), when the engine says. */
  readonly actor?: string;
  /** The fighters it names, by id, in the order it names them. */
  readonly named?: readonly string[];
  /** The distance the fight stands at as of this line, when the engine says. */
  readonly range?: RangeBand;
  /** How big the turn it was told in was. */
  readonly force?: NarrationForce;
  /** Which bank and template its words came from ("search.2"), so words aren't picked twice. */
  readonly voices?: readonly string[];
  /** Harm or healing it reports, as chips. */
  readonly amounts?: readonly NarrationAmount[];
  /** Defences that reacted in it. */
  readonly reactions?: readonly ToldReaction[];
  readonly cause?: ToldCause;
  /** The player's turn played off their plan, and why. */
  readonly offPlan?: NarrationOffPlan;
  /** A divider between exchanges or rounds ("— Second exchange —"), not a line of the fight. */
  readonly divider?: true;
  /** The divider opens a round: what follows is that round's story. */
  readonly opensRound?: true;
  /** What the player's fighter noticed: a read of a foe, in their own terms. */
  readonly read?: true;
}

/** One fighter's health and pools, by pool ("health", "chakra", "breath", "will", "hive"…). */
export type StoryPools = Readonly<Record<string, number>>;

/**
 * Why someone's health moved: a hit (`by` whoever landed it), healing, a price paid, running
 * off, a shadow clone popping, a body raised, put down with its mind, or (`settled`) brought
 * level with the fight where no writer said more.
 */
export const HEALTH_CAUSES = [
  'hit',
  'heal',
  'price',
  'fled',
  'popped',
  'raised',
  'put-down',
  'settled',
] as const;
export type HealthCause = (typeof HEALTH_CAUSES)[number];

export type CombatEvent =
  | ToldEvent
  /** Where someone stands as a stretch opens: on the field, with these pools and statuses. */
  | {
      readonly kind: 'stand';
      readonly who: string;
      readonly pools: StoryPools;
      readonly statuses: readonly string[];
    }
  /** Someone comes onto the field (a summons, a shadow clone), standing like this. */
  | {
      readonly kind: 'join';
      readonly who: string;
      readonly pools: StoryPools;
      readonly statuses: readonly string[];
    }
  | {
      readonly kind: 'health';
      readonly who: string;
      readonly to: number;
      readonly cause: HealthCause;
      /** Who did it, when someone did. */
      readonly by?: string;
    }
  /** Pools other than health that moved, and where they stand now (only those that moved). */
  | { readonly kind: 'pools'; readonly who: string; readonly to: StoryPools }
  | { readonly kind: 'status'; readonly who: string; readonly statuses: readonly string[] }
  /** Someone goes down (their health has just reached nothing). */
  | { readonly kind: 'fall'; readonly who: string }
  /** Someone is gone from the field (a clone burst, a summons sent home). */
  | { readonly kind: 'leave'; readonly who: string };

export type CombatEventKind = CombatEvent['kind'];

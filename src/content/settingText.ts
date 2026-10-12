import type { AptitudeBand } from '@/systems/stats';

/** Setting-specific wording: what the engine and UI say that belongs to the setting. */

/** The ranks a promotion can raise you to, each with its ceremony. */
export type PromotedRank = 'chunin' | 'jonin';

/** A promotion ceremony's words. `{you}` is your name, `{leader}` the leader's title. */
export interface PromotionText {
  /** Where it happens, as the scene's heading ("Before the Tōrokage"). */
  readonly title: string;
  /** What is said to you. */
  readonly speech: string;
  /** What you are handed, as a line (the vest at chūnin). */
  readonly gift: string;
}

/** Setting-specific wording the engine and UI need. Keeps names out of code. */
export interface SettingText {
  readonly nation: string;
  readonly leaderTitle: string;
  readonly currency: string;
  /** Intro shown on the new-game screen and as the first record entry. */
  readonly intro: string;
  /** Button on the new-game screen. */
  readonly graduate: string;
  readonly sleepWell: string;
  readonly sleepHungry: string;
  readonly sleepLockedOut: string;
  readonly hospitalWake: string;
  /** How talent shows itself as you train. */
  readonly aptitude: AptitudeText;
  /** The promotion ceremonies, by the rank you are raised to. */
  readonly promotions: Readonly<Record<PromotedRank, PromotionText>>;
}

/** Words for aptitude, which players only ever learn as rough reads (never numbers). */
export interface AptitudeText {
  /** Journal line when the first sessions in a stat give a rough read, by band. */
  readonly reads: Readonly<Record<AptitudeBand, string>>;
  /** Short phrase for the Shinobi screen, by band. */
  readonly senses: Readonly<Record<AptitudeBand, string>>;
  /** Shinobi screen phrase before any read. */
  readonly unknown: string;
  /** Why a drill or scroll in an art you have no talent for is refused, once you know it. */
  readonly blocked: string;
}

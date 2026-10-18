import type { AptitudeBand, StatKind } from '@/systems/stats';
import type { Element } from '@/systems/techniques';

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

/**
 * Why a genin is raised without the exam, said before the ceremony's words. `{you}` is your
 * name and `{leader}` the leader's title, as in `PromotionText`.
 */
export interface PromotionRouteText {
  /** A field promotion for one job; `{job}` is its title. */
  readonly field: string;
  /** Your sensei's recommendation; `{sensei}` is their name. */
  readonly sensei: string;
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
  /** The setting's night sounds, one of which may close a good night's sleep. */
  readonly sleepWell: readonly string[];
  readonly sleepHungry: string;
  readonly sleepLockedOut: string;
  readonly hospitalWake: string;
  /** How talent shows itself as you train. */
  readonly aptitude: AptitudeText;
  /** The promotion ceremonies, by the rank you are raised to. */
  readonly promotions: Readonly<Record<PromotedRank, PromotionText>>;
  /** Why a genin is raised without sitting the exam (an arc says its own words). */
  readonly promotionRoutes: PromotionRouteText;
  /** The chakra paper test that tells you your nature. */
  readonly chakraPaper: ChakraPaperText;
}

/** The chakra paper scene's words. `{sensei}` is your sensei's name. */
export interface ChakraPaperText {
  readonly heading: string;
  /** What your sensei says, holding out the paper. */
  readonly speech: string;
  /** The button. */
  readonly prompt: string;
  /** What the paper does, by nature. */
  readonly results: Readonly<Record<Element, string>>;
  /** What your sensei says afterwards. */
  readonly verdict: string;
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
  /** Shinobi screen phrase for a stat close to or at its natural limit, by kind of stat. */
  readonly limits: Readonly<Record<StatKind, { readonly near: string; readonly reached: string }>>;
}

/**
 * Content schema for teachers: how someone teaches when you train with them, and what they ask
 * in return. Anyone ranked shinobi can be trained with in a stat they are ahead of you in; a
 * `TeacherProfile` on a `PersonDef` gives them a temperament, signature techniques and a price.
 * Prices are templates with the teacher's own words, so the same kinds read differently per
 * person.
 */

/** How a teacher's sessions go: each is a teaching multiplier and a manner (game rules). */
export const TEACHING_QUIRKS = ['patient', 'harsh', 'natural', 'distracted'] as const;
export type TeachingQuirk = (typeof TEACHING_QUIRKS)[number];

/** What a steering teacher puts you to work on. */
export type SteeringFocus = 'specialty' | 'weakest';

/**
 * A teacher who chooses what you train: their specialty, or the stat of yours furthest behind
 * among those they are ahead in. Once your bond reaches `freeAtStage` they let you choose.
 */
export interface Steering {
  readonly focus: SteeringFocus;
  readonly freeAtStage: number;
}

/** One kind of price. `line` is the teacher's own words for it (no numbers). */
export type SimplePrice =
  | { readonly kind: 'bond'; readonly minStage: number; readonly line?: string }
  | { readonly kind: 'ryo'; readonly perSession: number; readonly line?: string }
  /** A job (mission id) you must have completed once. */
  | { readonly kind: 'mission'; readonly missionId: string; readonly line?: string }
  /**
   * A once-off favour (`favourId`), done by picking a conversation reply that names it
   * (`ConversationChoice.favour`). `ask` says what they want.
   */
  | { readonly kind: 'favour'; readonly favourId: string; readonly ask: string };

/** What a teacher asks: one kind, or several that must all be met. */
export type PriceTemplate =
  SimplePrice | { readonly kind: 'all'; readonly parts: readonly SimplePrice[] };

export interface TeacherProfile {
  /** Left out, they teach plainly (no quirk), like someone with no profile. */
  readonly quirk?: TeachingQuirk;
  /** Left out, they let you choose from the first session. */
  readonly steers?: Steering;
  /** Signature techniques, taught in order once you are close enough. */
  readonly teaches: readonly string[];
  /** Left out, it follows their rank (genin daily, chūnin twice, jōnin once). */
  readonly sessionsPerWeek?: number;
  /** Your own sensei waives it. Left out, they ask a bond stage by rank, like someone with no profile. */
  readonly price?: PriceTemplate;
}

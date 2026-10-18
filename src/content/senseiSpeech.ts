import type { RitualKind, SenseiFeedback, SenseiGrip, SessionFormat } from './senseis';

/**
 * Content schema for what a sensei says around the week (`game/sensei/`): how a short session
 * goes and how they send you off, what you hear the morning after you missed them, and where
 * they expect you today. Banks, not single lines: the game picks among them so that nothing
 * repeats within a few days (`tellFresh`). Story text, no numbers. `{name}` is the sensei, with
 * every pronoun form (`{name.they}`, `{name.s}`…).
 */

export interface SenseiSpeech {
  /** How a short session goes, by format. */
  readonly sessions: Readonly<Record<SessionFormat, readonly string[]>>;
  /** What they say as a session ends, by how they give feedback. */
  readonly signOffs: Readonly<Record<SenseiFeedback, readonly string[]>>;
  /** A sensei who keeps you waiting, before the session. */
  readonly late: readonly string[];
  /**
   * The morning after a missed meeting, by how hard they take it. `{place}` is where they
   * waited, `{what}` the meeting ("your lesson", "the march").
   */
  readonly missed: Readonly<Record<SenseiGrip, readonly string[]>>;
  /** Said after a missed meeting when you missed the team day too. `{ritual}` is the team day. */
  readonly teamAlso: readonly string[];
  /** A missed team day on its own. */
  readonly teamMissed: readonly string[];
  /** Where they expect you today: `{place}`, `{when}` ("this morning"), `{for}` ("for a march"). */
  readonly expects: readonly string[];
  /** A meeting as a noun, for `{what}`. */
  readonly meetingNames: Readonly<Record<SessionFormat | 'lesson', string>>;
  /** What a meeting is for, for `{for}`. */
  readonly meetingFor: Readonly<Record<SessionFormat | 'lesson', string>>;
  /** A team day as a noun, for `{ritual}`. */
  readonly ritualNames: Readonly<Record<RitualKind, string>>;
}

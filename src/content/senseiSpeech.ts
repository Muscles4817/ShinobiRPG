import type {
  RitualKind,
  SenseiFeedback,
  SenseiGrip,
  SenseiReward,
  SessionFormat,
} from './senseis';

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
  /** After the weekly lesson, and at the farewell. */
  readonly coaching: SenseiCoachingSpeech;
}

type ByFeedback = Readonly<Record<SenseiFeedback, readonly string[]>>;

/** The layers of defence a sensei may warn you about (`game/sensei/read.ts`). */
export type DefenceWarning = 'evasion' | 'guard' | 'will' | 'toughness';

/**
 * The parts of a sensei's word after the lesson, put together into one speech
 * (`game/sensei/coaching.ts`): how they open, their verdict on the work they set, the read of
 * you and the next work. Spoken parts carry no quotation marks unless they are whole lines;
 * `{stat}` and `{art}` are stats in lower case.
 */
export interface SenseiCoachingSpeech {
  /** Narration that opens a word with no work to judge. */
  readonly opening: readonly string[];
  /** Narration as they look at the work they set: done, or not. */
  readonly checked: Readonly<Record<'met' | 'missed', readonly string[]>>;
  /** Their verdict, spoken (no quotation marks), for a sensei with no voice of their own. */
  readonly verdicts: Readonly<Record<'met' | 'missed', ByFeedback>>;
  /** Narration before what beat you on a job. */
  readonly beaten: string;
  /** What you are good at: a spoken clause, no full stop. */
  readonly edge: readonly string[];
  /** The same, when the work just judged was in that art and has been named already. */
  readonly edgeAgain: string;
  /** What will get you killed: a spoken clause in lower case, no full stop. */
  readonly dangers: Readonly<Record<DefenceWarning, string>>;
  /** A talent you haven't found: a spoken clause in lower case. */
  readonly gift: string;
  /** The next work, spoken. */
  readonly assign: ByFeedback;
  /** The next work, when it is the art they just praised. */
  readonly assignMore: ByFeedback;
  /** The next work, when it is the gift they just named. */
  readonly assignGift: string;
  readonly farewell: SenseiFarewellSpeech;
}

/** The farewell at the chūnin ceremony, one speech. `{gift}` is what they give. */
export interface SenseiFarewellSpeech {
  readonly opening: readonly string[];
  readonly words: ByFeedback;
  readonly gifts: Readonly<Record<SenseiReward | 'signature', string>>;
  /** Said after their catchphrase, one last time: an attribution, no full stop. */
  readonly catchphrase: string;
  readonly closing: readonly string[];
}

import type { PersonDef } from '@/content';

import type { GameContext } from '../context';
import type { GameState } from '../state';

/**
 * What the world does to you, declared (`docs/design/happenings-plan.md`). A verb is what you do;
 * a happening is what follows from it or from time passing: a rival's challenge, a friend's gift,
 * the village's ceremony, a day's healing. Each says what it needs (who must be where) and what
 * happens instead when that isn't so, and the lists they sit in are the order they run in.
 */

/** Who must be where, or what must be clear, for a happening to run. */
export type Need =
  /** Nothing else has the screen: no job, scene, exam or ceremony under way (`busyReason`). */
  | { readonly kind: 'free' }
  /** You are in your home village (`atHomeVillage`), whatever you are doing there. */
  | { readonly kind: 'atHome' }
  /** You are not out on a job, a journey or an exam. */
  | { readonly kind: 'offDuty' }
  /** You are in this person's town and off duty (`inTownWith`); none to find, never met. */
  | {
      readonly kind: 'with';
      readonly who: string;
      readonly person: (state: GameState, ctx: GameContext) => PersonDef | undefined;
    };

/** What a happening runs on: the state as it now stands, and where it came from. */
export interface Moment {
  readonly ctx: GameContext;
  /** The state as earlier happenings in the list have left it. */
  readonly now: GameState;
  /** The state before the action (or the stretch of time). */
  readonly before: GameState;
}

/** As time passes: how many days ended in the stretch. */
export interface TimeMoment extends Moment {
  readonly days: number;
}

export interface Happening<M extends Moment> {
  /** Named in the order test and in a trace. */
  readonly id: string;
  /** All must hold for `run`; none, and it always runs. */
  readonly needs: readonly Need[];
  readonly run: (moment: M) => GameState;
  /** What happens instead when a need doesn't hold (told which); left out, nothing does. */
  readonly otherwise?: (moment: M, unmet: readonly Need['kind'][]) => GameState;
}

/** When a time happening runs within a stretch of time passing. */
export type TimeCadence =
  /** Whenever time passes at all. */
  | 'stretch'
  /** Once, if the stretch ended a day (it catches up the days itself). */
  | 'newDay'
  /** Once for each day the stretch ended, in order. */
  | 'eachDay';

export interface TimeHappening extends Happening<TimeMoment> {
  readonly every: TimeCadence;
}

/** One happening's turn in a run: whether it ran, and if not, what it lacked. */
export interface HappeningTrace {
  readonly id: string;
  readonly ran: boolean;
  readonly unmet: readonly Need['kind'][];
}

import type { JobGrade } from '../reports';

/**
 * What happened, as it happened (`docs/design/happenings-plan.md`, "Facts"). A fact is written
 * where the change it records is made, through the one function that makes it (`inflict` adds
 * an injury, `afterStage` finishes a job), so nothing has to work
 * it out afterwards by comparing the state before and after, or by reading what was written for
 * the player. Whoever needs to know what happened (the day's sheet, your sensei settling a day)
 * reads the facts and switches over their kinds, so a new kind is one more case the compiler
 * asks every reader about.
 *
 * Every fact carries the day it happened on. They are kept only as long as a reader may still
 * ask (`daybook/record.ts` lets them go as a new day opens).
 */
export type Fact =
  /** You were hurt: `instance` is the injury's own number, kept as long as you carry it. */
  | {
      readonly kind: 'injuryAdded';
      readonly day: number;
      readonly instance: number;
      readonly injuryId: string;
    }
  /** A job was seen through and paid; its title as it was posted, and how cleanly it went. */
  | {
      readonly kind: 'jobDone';
      readonly day: number;
      readonly missionId: string;
      readonly title: string;
      readonly grade: JobGrade;
    }
  /**
   * A slot of the day passed with you at hand for your sensei: home, not out on a job or laid
   * up (`sensei/whereabouts.ts`). Your sensei judges a missed meeting by these, never by where
   * you happen to be when the day is settled.
   */
  | { readonly kind: 'atHand'; readonly day: number; readonly slot: number };

export type FactKind = Fact['kind'];

/** The facts of one kind. */
export type FactOf<K extends FactKind> = Extract<Fact, { readonly kind: K }>;

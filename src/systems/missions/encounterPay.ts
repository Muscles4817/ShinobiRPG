import type { JobKind } from './encounter';

/**
 * How an encounter's way of ending pays, by the kind of job. Every rule about it lives here: an
 * escort that arrives safely is fully paid however it got past; an elimination is paid only when
 * the foes are dealt with, and a negotiated surrender pays more reputation and less ryo.
 */

/** How the foes were got past: beaten, slipped by, talked or frightened off, or paid off. */
export type EncounterEnd = 'fought' | 'slipped-past' | 'talked-down' | 'paid-off';

/** Multipliers on the mission's reward, and whether the job is still done. */
export interface StagePay {
  readonly ryo: number;
  readonly reputation: number;
  /** False when the way past leaves the job undone (sneaking by the foes you were sent for). */
  readonly jobDone: boolean;
}

const FULL: StagePay = { ryo: 1, reputation: 1, jobDone: true };
const UNDONE: StagePay = { ryo: 0, reputation: 0, jobDone: false };
/** Foes who surrender go to the village's cells: less to collect, more to be known for. */
const SURRENDER: StagePay = { ryo: 0.6, reputation: 1.5, jobDone: true };
/** Foes paid to leave are gone, but nobody admires a bought peace. */
const BOUGHT_OFF: StagePay = { ryo: 0.5, reputation: 1, jobDone: true };
/** A patrol that slips round trouble saw it, and did nothing about it. */
const LOOKED_AWAY: StagePay = { ryo: 0.5, reputation: 0.5, jobDone: true };
/** The watch frowns on a patrol that pays its way. */
const PATROL_BRIBE: StagePay = { ryo: 1, reputation: 0.5, jobDone: true };

const PAY: Readonly<Record<JobKind, Readonly<Record<EncounterEnd, StagePay>>>> = {
  escort: { fought: FULL, 'slipped-past': FULL, 'talked-down': FULL, 'paid-off': FULL },
  deliver: { fought: FULL, 'slipped-past': FULL, 'talked-down': FULL, 'paid-off': FULL },
  retrieve: { fought: FULL, 'slipped-past': FULL, 'talked-down': FULL, 'paid-off': FULL },
  eliminate: {
    fought: FULL,
    'slipped-past': UNDONE,
    'talked-down': SURRENDER,
    'paid-off': BOUGHT_OFF,
  },
  patrol: {
    fought: FULL,
    'slipped-past': LOOKED_AWAY,
    'talked-down': FULL,
    'paid-off': PATROL_BRIBE,
  },
};

export function stagePay(job: JobKind, end: EncounterEnd): StagePay {
  return PAY[job][end];
}

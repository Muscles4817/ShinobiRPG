import type { CombatResult } from '@/systems/combat';
import type { StatGrade } from '@/systems/stats';

/**
 * Result cards: moments the player should stop and see (a fight's end, a mission's
 * debrief). Stored in state so they survive closing the app, shown oldest first and
 * dismissed with the `dismissReport` action.
 */
export type Report =
  | {
      readonly kind: 'fight';
      readonly result: CombatResult;
      readonly enemies: string;
      readonly rounds: number;
      readonly damageTaken: number;
      readonly chakraSpent: number;
      readonly health: number;
      readonly maxHealth: number;
      /** What the fight taught you, as display labels ("Taijutsu +0.05"). */
      readonly taught?: readonly string[];
    }
  | {
      readonly kind: 'mission-complete';
      readonly title: string;
      readonly client: string;
      readonly ryo: number;
      readonly reputation: number;
      readonly missionsCompleted: number;
      /** Kinds of work newly trusted to you (not shown by name: the board reveals them). */
      readonly unlocked: readonly string[];
      /** Ryo docked from the posted reward because things went wrong. */
      readonly docked?: number;
      /** Bond gained with each teammate; absent on reports saved before team missions. */
      readonly teamBond?: number;
    }
  | {
      readonly kind: 'mission-failed';
      readonly title: string;
      readonly reason: string;
      readonly reputationLost: number;
    }
  | {
      readonly kind: 'defeat';
      readonly title: string | null;
      readonly hospitalFee: number;
      readonly reputationLost: number;
      readonly text: string;
      /** The injury the beating left, by name. */
      readonly injury?: string;
      /** What the fight taught you, even in defeat, as display labels. */
      readonly taught?: readonly string[];
    }
  | {
      readonly kind: 'lesson';
      readonly sensei: string;
      readonly text: string;
      /** Stat gains as display labels, e.g. "Ninjutsu +1.4". */
      readonly gains: readonly string[];
      readonly bond: number;
      readonly technique: {
        readonly name: string;
        readonly mastered: boolean;
        readonly percent: number;
      } | null;
    }
  | {
      readonly kind: 'spar';
      readonly opponent: string;
      readonly result: 'won' | 'lost' | 'yielded';
      readonly text: string;
      readonly gains: readonly string[];
      readonly bond: number;
    }
  | {
      /** A stat crossed into a new grade. */
      readonly kind: 'grade';
      readonly stat: string;
      readonly grade: StatGrade;
      /** The shinobi rank the grade belongs to, e.g. "Chūnin". */
      readonly rank: string;
      /** What the new grade opens: techniques now within reach, and where they are taught. */
      readonly opens: readonly { readonly name: string; readonly where: string }[];
    }
  | {
      readonly kind: 'team-formed';
      readonly sensei: string;
      readonly senseiTitle: string;
      readonly teammates: readonly string[];
      readonly text: string;
    };

export function addReport<S extends { readonly reports: readonly Report[] }>(
  state: S,
  report: Report,
): S {
  return { ...state, reports: [...state.reports, report] };
}

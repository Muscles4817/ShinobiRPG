import type { CombatResult } from '@/systems/combat';
import type { StatGrade } from '@/systems/stats';
import type { Element } from '@/systems/techniques';

/** A line of how a job went, for its debrief: what happened, and the pay it moved. */
export interface DebriefLine {
  readonly text: string;
  readonly tone: 'gain' | 'cost' | 'plain';
  /** The pay it moved, as a chip ("−25% pay"), or null. */
  readonly pay: string | null;
  /** Something found worth remembering (a clue); absent on older reports. */
  readonly noted?: true;
}

/** Someone who went with you: how much closer you came, and the last thing they said. */
export interface DebriefCrew {
  readonly name: string;
  readonly bond: number;
  readonly quote: string | null;
}

/** How cleanly a job went: nothing lost, something lost, or too much lost. */
export type JobGrade = 'clean' | 'rough' | 'botched';

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
      /** A bout only watched (versus): who won, as the card's title ("Haku wins"). */
      readonly verdict?: string;
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
      /** How a job that ends on a check turned out; the scene closes before it can show. */
      readonly ending?: string;
      /** Ryo docked from the posted reward because things went wrong. */
      readonly docked?: number;
      /** Bond gained with each teammate; absent on reports saved before team missions. */
      readonly teamBond?: number;
      /** The technique scroll the client handed over, by name. */
      readonly scroll?: string;
      /** The gear the client handed over (a named weapon), by name. */
      readonly gear?: string;
      /** The recipe the client taught you, by name. */
      readonly recipe?: string;
      /** The animal you rescued, waiting at the animal clinic, by the name you gave it. */
      readonly companion?: string;
      /** How the job went, line by line (absent on reports from before the ledger). */
      readonly road?: readonly DebriefLine[];
      readonly crew?: readonly DebriefCrew[];
      readonly grade?: JobGrade;
    }
  | {
      readonly kind: 'mission-failed';
      readonly title: string;
      readonly reason: string;
      readonly reputationLost: number;
      /** How the job went until it failed. */
      readonly road?: readonly DebriefLine[];
      /** What would have helped, read from what you faced. */
      readonly helped?: string;
    }
  | {
      readonly kind: 'defeat';
      readonly title: string | null;
      readonly hospitalFee: number;
      readonly reputationLost: number;
      readonly text: string;
      /** The injury the beating left, by name. */
      readonly injury?: string;
      /** On a job: what would have helped, read from who beat you. */
      readonly helped?: string;
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
      /** Home from a trip of your own: what the village did while you were gone. */
      readonly kind: 'home-again';
      readonly place: string;
      readonly days: number;
      readonly news: readonly {
        readonly label: string;
        readonly value: string;
        readonly tone?: 'gain' | 'cost' | 'harm';
      }[];
      readonly text: string;
    }
  | {
      /** The chakra paper showed your nature. */
      readonly kind: 'nature';
      readonly nature: Element;
      /** "Fire nature". */
      readonly name: string;
      readonly text: string;
      /** What the nature is like in a fight. */
      readonly line: string;
      /** What knowing it does, as display labels. */
      readonly effects: readonly string[];
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

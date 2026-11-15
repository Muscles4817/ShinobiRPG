import type { RangeBand } from '../../../contract';
import type { AttackStyle, DefenceKind } from '../readShape';

/**
 * The mind's shapes (`docs/design/combat-ai-plan.md` Part 5), importing nothing that imports the
 * fight state, so the state can hold them. What a fighter saw happen (a `Witness`) and what they
 * have come to believe about each other fighter (`Beliefs`): evidence for and against each
 * hypothesis, never a confidence, which is worked out from it (`evidence.ts`).
 */

/** What a technique or blow showed it can do: reach far, catch an area, hold, heal. */
export type Capability = 'far' | 'area' | 'hold' | 'heal';

/** Something done in a fight, and who saw it done (opponents with the doer in sight). */
export type Witness =
  | {
      readonly kind: 'attack';
      readonly of: string;
      /** Its id: a technique's, or the kind of blow. */
      readonly card: string;
      /** How it read as an attack; absent for what wasn't one (a heal, an empower). */
      readonly style?: AttackStyle;
      readonly shows: readonly Capability[];
      readonly seenBy: readonly string[];
    }
  | {
      readonly kind: 'defence';
      readonly of: string;
      readonly band: RangeBand;
      readonly defence: DefenceKind;
      readonly seenBy: readonly string[];
    };

/** Weighted observations for and against one hypothesis, and when it was last seen either way. */
export interface Evidence {
  readonly seen: number;
  readonly against: number;
  readonly at: number;
}

/**
 * Hypotheses about one fighter, by key: `defence:<band>:<kind>` (keeps it ready there),
 * `style:<style>` (leans on attacks of that style), `card:<id>` (keeps coming back to it),
 * `can:<capability>`, `low:chakra`, `low:breath`.
 */
export type Beliefs = Readonly<Record<string, Evidence>>;

/** A fighter's mind: beliefs about every other fighter, by id. Absent: nothing believed yet. */
export interface Minded {
  readonly minds?: Readonly<Record<string, Beliefs>>;
}

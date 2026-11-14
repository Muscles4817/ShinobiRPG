import { cardId } from './cards';
import type { Chosen } from './slots';
import type { CombatState } from '../../contract';
import { decode, type CardId, type PlanFighter, type PlanState, type Round } from './state';
import { sourceOf, type Decision, type Odds, type Why } from './whyShape';

/**
 * The decision log, kept as a fight is fought (`whyShape.ts`): only in a fight whose setup asks
 * for it (`CombatSetup.trace`), so an ordinary fight carries nothing extra. Writing it touches no
 * Rng and changes nothing anyone does: benches and tests read it back (`decisionsOf`).
 */

/** What the log calls a turn spent pulling a teammate free of a hold (`struggle.ts`). */
export const PULLED_FREE = 'pull-free';

/** A foe's announcement for the next exchange, and the rule that chose it (`intent.ts`). */
export interface Announcement {
  readonly card: CardId;
  readonly why: Why;
  readonly odds?: readonly Odds[];
}

interface Noted extends Announcement {
  readonly targetId?: string;
}

function line(at: Pick<Decision, 'round' | 'phase' | 'fighterId'>, noted: Noted): Decision {
  return { ...at, source: sourceOf(noted.why), ...noted };
}

/** A turn's choice, noted on the round when the fight is traced. */
export function decided(
  round: Round,
  actor: PlanFighter,
  chosen: Chosen | typeof PULLED_FREE,
): Round {
  if (!round.decisions) return round;
  const noted: Noted =
    chosen === PULLED_FREE
      ? { card: PULLED_FREE, why: 'aid' }
      : {
          card: cardId(chosen.card),
          why: chosen.why,
          ...(chosen.target ? { targetId: chosen.target.id } : {}),
          ...(chosen.odds ? { odds: chosen.odds } : {}),
        };
  const turn = line({ round: round.number, phase: 'turn', fighterId: actor.id }, noted);
  return { ...round, decisions: [...round.decisions, turn] };
}

/** The foes' announcements for the next exchange: their intents, and, traced, why. */
export function announced(
  state: PlanState,
  announcements: Readonly<Record<string, Announcement>>,
): PlanState {
  const intents = Object.fromEntries(
    Object.entries(announcements).map(([id, { card }]) => [id, card]),
  );
  if (!state.decisions) return { ...state, intents };
  const lines = Object.entries(announcements).map(([fighterId, noted]) =>
    line({ round: state.round, phase: 'announce', fighterId }, noted),
  );
  return { ...state, intents, decisions: [...state.decisions, ...lines] };
}

/** Everything a traced fight has decided so far, oldest first; nothing for an untraced one. */
export function decisionsOf(state: CombatState): readonly Decision[] {
  return decode(state).decisions ?? [];
}

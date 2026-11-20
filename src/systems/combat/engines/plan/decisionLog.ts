import { cardId } from './cards';
import type { Chosen } from './slots';
import type { CombatState } from '../../contract';
import { decode, type CardId, type PlanFighter, type PlanState, type Round } from './state';
import { sourceOf, type Decision, type Odds, type Why } from './whyShape';
import type { HeldPlan } from './mind/shape';
import { killersFacing } from './survival';

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
  /** The plan a thinking foe now holds (`mind/planner/`); kept on the fighter. */
  readonly planned?: HeldPlan;
}

/**
 * Fighters with the plans their announcements made, and the killers each faced as it settled on
 * its move (`newKiller` in `survival.ts`).
 */
function withPlans(state: PlanState, announcements: Readonly<Record<string, Announcement>>) {
  const moment = {
    fighters: state.fighters,
    range: state.range,
    ...(state.distances ? { distances: state.distances } : {}),
    intents: {},
    number: state.round,
  };
  return state.fighters.map((f) => {
    const told = announcements[f.id];
    if (!told) return f;
    const faced = killersFacing(f, moment);
    const planned = told.planned ? { planned: told.planned } : {};
    const { facedKillers: _was, ...rest } = f;
    return { ...rest, ...planned, ...(faced.length > 0 ? { facedKillers: faced } : {}) };
  });
}

interface Noted extends Announcement {
  readonly targetId?: string;
}

function line(at: Pick<Decision, 'round' | 'phase' | 'fighterId'>, noted: Noted): Decision {
  return { ...at, source: sourceOf(noted.why), ...noted };
}

/** The objective a fighter held as they chose, for the log. */
function aimOf(fighters: readonly PlanFighter[], id: string): Pick<Decision, 'objective'> {
  const objective = fighters.find((f) => f.id === id)?.objective?.id;
  return objective ? { objective } : {};
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
  const turn = {
    ...line({ round: round.number, phase: 'turn', fighterId: actor.id }, noted),
    ...aimOf(round.fighters, actor.id),
  };
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
  const told = { ...state, intents, fighters: withPlans(state, announcements) };
  if (!state.decisions) return told;
  const lines = Object.entries(announcements).map(([fighterId, { planned: _plan, ...noted }]) => ({
    ...line({ round: state.round, phase: 'announce', fighterId }, noted),
    ...aimOf(state.fighters, fighterId),
  }));
  return { ...told, decisions: [...state.decisions, ...lines] };
}

/** Everything a traced fight has decided so far, oldest first; nothing for an untraced one. */
export function decisionsOf(state: CombatState): readonly Decision[] {
  return decode(state).decisions ?? [];
}

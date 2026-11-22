import type { CombatEvent, CombatInspection, CombatState, CombatView } from '@/systems/combat';

import { combatFinaleView } from '../combatFinale';
import type { GameContext } from '../context';
import { engineFor } from '../fightStyle';
import type { GameState } from '../state';
import type { FightRecord } from './state';

/**
 * Keeping the fight record as a fight is fought (`noteFight`, called by `dispatch` after every
 * action). A record opens at the first fight state it sees, before or after the action, since
 * versus starts its bout outside `dispatch`; each step adds the lines the engine wrote since
 * (read by their place in the whole story, `storyOffset`) and everyone as they stand; and the fight
 * laid open at its end is handed over by the act that ended it (`fightEnd`), since its state is
 * gone once the result is settled.
 */

function viewOf(state: GameState, combat: CombatState, ctx: GameContext): CombatView {
  return engineFor({ ...state, combat }, ctx).view(combat);
}

function inspectionOf(
  state: GameState,
  combat: CombatState,
  ctx: GameContext,
): CombatInspection | null {
  return engineFor({ ...state, combat }, ctx).inspect?.(combat) ?? null;
}

/** The events of a view the record hasn't got yet, with a note where some went unseen. */
function newEvents(record: FightRecord, view: CombatView): readonly CombatEvent[] {
  const offset = view.storyOffset ?? 0;
  const have = record.story.length;
  if (have >= offset) return view.story.slice(have - offset);
  const gap: CombatEvent = { kind: 'told', text: `[${offset - have} events went by unrecorded]` };
  return [gap, ...view.story];
}

function stepped(record: FightRecord, view: CombatView, choice: string | null): FightRecord {
  const step = {
    step: record.steps.length,
    choice,
    round: view.round,
    range: view.range ?? null,
    combatants: view.combatants,
  };
  return {
    ...record,
    story: [...record.story, ...newEvents(record, view)],
    steps: [...record.steps, step],
  };
}

function opened(state: GameState, combat: CombatState, ctx: GameContext): FightRecord {
  const fresh: FightRecord = {
    open: true,
    engineId: combat.engineId,
    began: state.time,
    start: inspectionOf(state, combat, ctx),
    end: null,
    story: [],
    steps: [],
    result: null,
  };
  return stepped(fresh, viewOf(state, combat, ctx), null);
}

/** What the screen shows of the fight after the action: in progress, or just finished. */
function viewAfter(before: GameState, after: GameState, ctx: GameContext): CombatView | null {
  if (after.combat) return viewOf(after, after.combat, ctx);
  if (before.combat && after.combatFinale) return combatFinaleView(after.combatFinale);
  return null;
}

function choiceOf(action: { readonly type: string; readonly optionId?: string }): string {
  return action.optionId ?? action.type;
}

function closed(record: FightRecord, after: GameState): FightRecord {
  const report = after.reports[0];
  return {
    ...record,
    open: false,
    end: after.fightEnd ?? record.end,
    result: report?.kind === 'fight' ? report : null,
  };
}

interface Act {
  readonly type: string;
  readonly optionId?: string;
}

/** The record after this action's step: the open one, or one opened for this fight. */
function recordAfter(
  before: GameState,
  after: GameState,
  act: Act,
  ctx: GameContext,
): FightRecord | null {
  const view = viewAfter(before, after, ctx);
  const current = after.fightRecord;
  if (current?.open && before.combat) return view ? stepped(current, view, choiceOf(act)) : current;
  // A fight already under way before this action (versus starts outside `dispatch`) opens
  // from where it stood then; one that began with this action opens as it is now.
  if (before.combat) {
    const from = opened(before, before.combat, ctx);
    return view ? stepped(from, view, choiceOf(act)) : from;
  }
  return after.combat ? opened(after, after.combat, ctx) : null;
}

/** The state with the fight record kept up after an action. */
export function noteFight(
  before: GameState,
  after: GameState,
  act: Act,
  ctx: GameContext,
): GameState {
  if (!before.combat && !after.combat) return after;
  const record = recordAfter(before, after, act, ctx);
  if (!record) return after;
  const { fightEnd: _handed, ...rest } = after;
  return { ...rest, fightRecord: after.combat ? record : closed(record, after) };
}

/** The state with the fight laid open as it ended, for `noteFight` to keep (combat's act). */
export function withFightEnd(state: GameState, combat: CombatState, ctx: GameContext): GameState {
  const end = inspectionOf(state, combat, ctx);
  return end ? { ...state, fightEnd: end } : state;
}

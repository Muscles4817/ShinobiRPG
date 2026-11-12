import type { CombatOption } from '../../contract';
import { RANGE_LABEL } from '../../rules/range';
import { isPinned } from '../../rules/verbs';
import { alive } from '../../rules/body';
import { CALLED_FOR, ownCallsLeft } from './roundCalls';
import { slotLimit } from './cards';
import { bandOf } from './distance';
import { groundNote } from './groundPlay';
import { teamOptions } from './orders';
import { withTraceNotes } from './slotTrace';
import { withForecasts } from './forecast';
import { playerOf, type PlanState } from './state';
import { seenByPlayer } from './statusView';
import { survivalWarning } from './survival';
import { tableOptions } from './table';
import { ROUND_EXCHANGES } from './roundEnd';

/**
 * What the player may do at each point of a planned fight, and the one line that tells them:
 * the card table between rounds (or when a round stops for a call, `calls.ts`), the next
 * exchange or the rest of the round while it plays, and flight.
 */

/** A fight only watched: play on, a round, or to the end. */
const WATCH_OPTIONS: readonly CombatOption[] = [
  { id: 'next', label: 'Next exchange', detail: '', kind: 'continue' },
  { id: 'round', label: 'Watch the round', detail: '', kind: 'continue' },
  { id: 'finish', label: 'Watch to the end', detail: '', kind: 'continue' },
];

function fleeBlocker(state: PlanState): { disabledReason?: string } {
  if (!state.canFlee) return { disabledReason: 'You cannot flee this fight' };
  return isPinned(playerOf(state))
    ? { disabledReason: 'You are pinned. Wait for the hold to loosen.' }
    : {};
}

/** Beginning the round, or (after a call stopped it) playing on through the rest of it. */
function beginLabel(state: PlanState): string {
  if (state.exchange > 0) return 'Play on';
  return state.bout === 1 ? 'Begin the fight' : `Begin round ${state.bout}`;
}

const TIMES_LEFT = ['', 'Once more this fight', 'Twice more this fight'];

/** Stopping the round to re-plan, while you have calls of your own left and it is under way. */
function haltOption(state: PlanState): CombatOption[] {
  const left = ownCallsLeft(state);
  if (left <= 0 || state.exchange === 0) return [];
  const detail = TIMES_LEFT[left] ?? 'A few more times this fight';
  return [{ id: 'halt', label: 'Stop and re-plan', detail, kind: 'continue' }];
}

export function options(state: PlanState): readonly CombatOption[] {
  if (state.result) return [];
  if (state.watching) return WATCH_OPTIONS;
  const flee: CombatOption = { id: 'flee', label: 'Flee', detail: 'Try to escape', kind: 'escape' };
  const escape = { ...flee, ...fleeBlocker(state) };
  if (state.phase === 'loadout') {
    const player = playerOf(state);
    const begin = beginLabel(state);
    return [
      ...withForecasts(
        withTraceNotes(
          tableOptions(
            player,
            state.fighters.some((f) => f.side === 'player' && !f.isPlayer),
          ),
          state.slotTrace,
        ),
        state,
      ),
      ...teamOptions(state),
      { id: 'begin', label: begin, detail: '', kind: 'continue' },
      escape,
    ];
  }
  return [
    { id: 'next', label: 'Next exchange', detail: '', kind: 'continue' },
    { id: 'round', label: 'Watch the round', detail: '', kind: 'continue' },
    ...haltOption(state),
    escape,
  ];
}

export function prompt(state: PlanState): string {
  if (state.phase === 'loadout') {
    const over = state.bout > 1 ? 'The round is over. ' : '';
    if (state.called)
      return `${CALLED_FOR[state.called]} Change your plan for the rest of the round, or play on.`;
    const pick = `${over}Round ${state.bout}: pick up to ${slotLimit(playerOf(state))} actions for each distance, higher first, and the defence you keep ready there.`;
    const hidden = state.fighters.some(
      (f) => f.side === 'enemy' && alive(f) && f.hidden && !seenByPlayer(state, f),
    );
    const ground = groundNote(state.ground);
    const hiding = hidden ? 'Someone is hidden: Search or Dispel finds them.' : null;
    // A killer facing you is said plainly: the choice of how to meet them is yours (`survival.ts`).
    const killer = survivalWarning(playerOf(state), state);
    return [pick, killer, hiding, ground].filter((part) => part !== null).join(' ');
  }
  const where = `${RANGE_LABEL[bandOf(state, playerOf(state))]} range, round ${state.bout}, exchange ${state.exchange + 1} of ${ROUND_EXCHANGES}`;
  // A watched fight has no card table to show the ground on.
  const ground = state.watching ? groundNote(state.ground) : null;
  return ground ? `${where}. ${ground}` : where;
}

import type { CombatOption, RangeBand } from '../../contract';
import { chakraCost } from '../../rules/body';
import { inReach, RANGE_BANDS, reachOf, STRIKE_REACH, THROW_REACH } from '../../rules/range';
import type { MindFighter, Move, MoveKind } from './state';

/**
 * The moves of the mind game, where each can be used, and the tell each one gives away.
 * Strike beats feints and interrupts jutsu; feints break guards and bait counters; guards
 * stop strikes and soften jutsu; counters punish strikes and, up close, jutsu.
 */

const FEINT_REACH: readonly RangeBand[] = ['close', 'mid'];
const COUNTER_REACH: readonly RangeBand[] = ['close'];

export function reachOfMove(move: Move): readonly RangeBand[] {
  switch (move.kind) {
    case 'strike':
      return STRIKE_REACH;
    case 'throw':
      return THROW_REACH;
    case 'feint':
      return FEINT_REACH;
    case 'counter':
      return COUNTER_REACH;
    case 'jutsu':
      return move.technique ? reachOf(move.technique) : RANGE_BANDS;
    case 'guard':
    case 'step-in':
    case 'step-back':
    case 'idle':
      return RANGE_BANDS;
  }
}

export const TELLS: Readonly<Record<MoveKind, string>> = {
  strike: 'Fists clenched, weight forward',
  throw: 'Fingers on a kunai pouch',
  feint: 'Light on their feet, shifting',
  guard: 'Arms up, turtled in',
  counter: 'Very still, watching your hands',
  jutsu: 'Hands sliding into seals',
  'step-in': 'Edging closer',
  'step-back': 'Easing away',
  idle: 'Reeling',
};

/** Why a fighter can't use a move right now, or null. */
export function moveBlocker(f: MindFighter, move: Move, range: RangeBand): string | null {
  if (move.kind === 'step-in' && range === 'close') return 'Already close';
  if (move.kind === 'step-back' && range === 'far') return 'Already far';
  if (!inReach(reachOfMove(move), range)) return `Out of reach at ${range} range`;
  if (move.kind !== 'jutsu' || !move.technique) return null;
  if (f.sealed > 0) return 'Your chakra is sealed';
  return chakraCost(f, move.technique) > f.chakra ? 'Not enough chakra' : null;
}

const BASICS: readonly { id: MoveKind; label: string; detail: string; targeted: boolean }[] = [
  { id: 'strike', label: 'Strike', detail: 'Beats feints, cuts off jutsu', targeted: true },
  { id: 'throw', label: 'Kunai', detail: 'A light hit from range', targeted: true },
  { id: 'feint', label: 'Feint', detail: 'Breaks guards, baits counters', targeted: true },
  { id: 'guard', label: 'Guard', detail: 'Stops strikes, halves jutsu', targeted: false },
  { id: 'counter', label: 'Counter', detail: 'Punishes strikes and close jutsu', targeted: false },
];

export const TECHNIQUE_PREFIX = 'tech:';

/** The player's options this round, each saying why not when it can't be used. */
export function playerOptions(
  player: MindFighter,
  range: RangeBand,
  canFlee: boolean,
): CombatOption[] {
  const disabled = (move: Move) => {
    const reason = moveBlocker(player, move, range);
    return reason ? { disabledReason: reason } : {};
  };
  const basics = BASICS.map((b): CombatOption => ({
    id: b.id,
    label: b.label,
    detail: b.detail,
    kind: 'basic',
    ...(b.targeted ? { targeted: true } : {}),
    ...disabled({ kind: b.id }),
  }));
  const techniques = player.techniques.map((t): CombatOption => ({
    id: `${TECHNIQUE_PREFIX}${t.id}`,
    label: t.name,
    detail: `${chakraCost(player, t)} chakra · ${reachOf(t).join('/')}`,
    kind: 'technique',
    discipline: t.discipline,
    ...(t.effect === 'heal' ? {} : { targeted: true }),
    ...disabled({ kind: 'jutsu', technique: t }),
  }));
  const moves: CombatOption[] = [
    {
      id: 'step-in',
      label: 'Step in',
      detail: 'Close the distance',
      kind: 'move',
      ...disabled({ kind: 'step-in' }),
    },
    {
      id: 'step-back',
      label: 'Step back',
      detail: 'Open the distance',
      kind: 'move',
      ...disabled({ kind: 'step-back' }),
    },
  ];
  const flee: CombatOption = { id: 'flee', label: 'Flee', detail: 'Try to escape', kind: 'escape' };
  return [
    ...basics,
    ...techniques,
    ...moves,
    canFlee ? flee : { ...flee, disabledReason: 'You cannot flee this fight' },
  ];
}

/** Turns an option id back into a move. */
export function moveFromOption(player: MindFighter, optionId: string): Move | null {
  if (optionId.startsWith(TECHNIQUE_PREFIX)) {
    const id = optionId.slice(TECHNIQUE_PREFIX.length);
    const technique = player.techniques.find((t) => t.id === id);
    return technique ? { kind: 'jutsu', technique } : null;
  }
  const basic = BASICS.find((b) => b.id === optionId);
  if (basic) return { kind: basic.id };
  return optionId === 'step-in' || optionId === 'step-back' ? { kind: optionId } : null;
}

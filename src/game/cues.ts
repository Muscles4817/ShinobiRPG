import { stageOf } from '@/systems/bonds';

import type { GameAction, GameActionType } from './actions/types';
import type { GameState } from './state';

/**
 * Which small animation an action plays once it has happened: steam off a bowl, a pot on the
 * boil, ink strokes for training, coins for a purchase. A bond reaching a new stage outranks
 * the action's own cue, whatever brought it there. The game decides it (so a headless test can
 * check it); the screen only draws it, and only when the player has animations on.
 */

export const ACTION_CUES = [
  'eat',
  'cook',
  'sleep',
  'rest',
  'train',
  'study',
  'heal',
  'coins',
  'gear',
  'toast',
  'sight',
  'bond',
] as const;
export type ActionCue = (typeof ACTION_CUES)[number];

const CUE_FOR: Readonly<Partial<Record<GameActionType, ActionCue>>> = {
  eat: 'eat',
  cook: 'cook',
  hostDinner: 'cook',
  sleep: 'sleep',
  rest: 'rest',
  train: 'train',
  trainWith: 'train',
  study: 'study',
  studyScroll: 'study',
  treat: 'heal',
  buyGear: 'coins',
  buyTool: 'coins',
  buyIntel: 'coins',
  buyIngredient: 'coins',
  payRent: 'coins',
  equipGear: 'gear',
  unequipGear: 'gear',
  buyRound: 'toast',
  followSight: 'sight',
};

/** Someone you know moved up a bond stage (acquaintance to friend…). */
function bondRose(before: GameState, after: GameState): boolean {
  return Object.entries(after.people.bonds).some(
    ([id, bond]) => stageOf(bond.points) > stageOf(before.people.bonds[id]?.points ?? 0),
  );
}

/** The cue for an action that went through, or null (none for it, or animations off). */
export function cueAfter(
  action: GameAction,
  before: GameState,
  after: GameState,
): ActionCue | null {
  if (!after.settings.animations) return null;
  if (bondRose(before, after)) return 'bond';
  return CUE_FOR[action.type] ?? null;
}

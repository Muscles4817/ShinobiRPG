import { combatAct } from './combat';
import { eat, rest, sleep, train } from './daily';
import { missionChoose, missionContinue, startMission } from './mission';
import { study } from './study';
import type { ActionHandler, ActionOf, GameActionType } from './types';

type Registry = { readonly [T in GameActionType]: ActionHandler<ActionOf<T>> };

/** One handler per action type. The mapped type makes a missing handler a compile error. */
export const HANDLERS: Registry = {
  train,
  eat,
  rest,
  sleep,
  study,
  startMission,
  missionChoose,
  missionContinue,
  combatAct,
};

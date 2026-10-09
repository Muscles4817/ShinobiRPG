import { combatAct } from './combat';
import { eat, rest, sleep, train } from './daily';
import { missionChoose, missionContinue, startMission } from './mission';
import { payRent, treat } from './services';
import { lesson } from './lesson';
import { spar } from './spar';
import { study } from './study';
import { endConversation, reply, talk } from './talk';
import { assignTeam, chooseSensei } from './team';
import { dismissReport, travel } from './travel';
import type { ActionHandler, ActionOf, GameActionType } from './types';

type Registry = { readonly [T in GameActionType]: ActionHandler<ActionOf<T>> };

/** One handler per action type. The mapped type makes a missing handler a compile error. */
export const HANDLERS: Registry = {
  train,
  eat,
  rest,
  sleep,
  payRent,
  treat,
  travel,
  dismissReport,
  study,
  startMission,
  missionChoose,
  missionContinue,
  combatAct,
  assignTeam,
  chooseSensei,
  talk,
  reply,
  endConversation,
  lesson,
  spar,
};

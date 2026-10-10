import { combatAct } from './combat';
import { eat, rest, sleep, train } from './daily';
import { missionChoose, missionContinue, startMission } from './mission';
import { payRent, treat } from './services';
import { hostDinner } from './dinner';
import { cook } from './kitchen';
import { lesson } from './lesson';
import { setCombatStyle } from './settings';
import { buyIntel } from './intel';
import { buyGear, buyIngredient, buyTool, equipGear, unequipGear } from './shop';
import { spar } from './spar';
import { study } from './study';
import { buyRound } from './tavern';
import { endConversation, reply, talk } from './talk';
import { assignTeam, chooseSensei } from './team';
import { dismissReport, travel } from './travel';
import { followSight } from './village';
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
  setCombatStyle,
  buyGear,
  buyTool,
  buyIntel,
  equipGear,
  unequipGear,
  buyIngredient,
  cook,
  followSight,
  hostDinner,
  buyRound,
};

import { combatAct } from './combat';
import { eat, rest, sleep, train } from './daily';
import { encounterApproach, encounterRecon } from './encounter';
import { acceptPromotion, enterExam, examAnswer, examContinue, examFinal } from './exam';
import { watchFinals } from './watchFinals';
import { missionChoose, missionContinue, startMission } from './mission';
import { missionCamp, missionDecide } from './missionStory';
import { payRent, treat } from './services';
import { hostDinner } from './dinner';
import { takeRoom } from './inn';
import { buyHouse } from './house';
import { practise } from './practise';
import { turnBack } from './turnBack';
import { cook } from './kitchen';
import { experiment } from './experiment';
import { fish, forage } from './gather';
import { buyCookbook, learnRecipe } from './recipes';
import { dismissDay, setAnimations, setCombatStyle, setDayEnd, setMapStyle } from './settings';
import { acceptChallenge, answerRival, declineChallenge } from './rival';
import { challengeRival, runRaceLeg } from './rivalContest';
import { buyFurnishing, moveHome, placeFurnishing } from './home';
import { inviteGuest, pickBed, plantBed, sendGuestHome } from './homeRooms';
import { buyIntel } from './intel';
import { buyGear, buyIngredient, buyTool, equipGear, unequipGear } from './shop';
import { spar } from './spar';
import { studyScroll } from './scrollStudy';
import { study } from './study';
import { trainWith } from './trainWith';
import { senseiSession } from './senseiSession';
import { senseiTest } from './senseiTest';
import { heedSensei } from './heedSensei';
import { teamDay } from './teamDay';
import { buyRound, drinkWith } from './tavern';
import { playDice } from './dice';
import { soak } from './onsen';
import { endConversation, reply, talk } from './talk';
import { testChakraPaper } from './chakraPaper';
import { assignTeam, chooseSensei } from './team';
import { dismissReport, leaveFight, travel } from './travel';
import { followSight } from './village';
import { befriendStray } from './companions';
import { takePup, trackWild } from './finding';
import { buyLore, handlerSession, handlerTeach } from './handling';
import { leaveOffering, signTeacherContract, tearUpContract } from './contracts';
import { crossAJar, nameYourStrain, searchForInsects, studyAJar } from './hives';
import { learnRiteFrom, readRite, takeAHive } from './rites';
import { buyABatch, makeABatch, studyDustScroll } from './dust';
import { rehomeCompanion, takeRescued } from './rehoming';
import { doseCompanion, feedCompanion, playWithCompanion } from './companionCare';
import { trainCompanion } from './companionTraining';
import { buyMedicine, treatCompanion } from './vet';
import type { ActionHandler, ActionOf, GameActionType } from './types';

type Registry = { readonly [T in GameActionType]: ActionHandler<ActionOf<T>> };

/** One handler per action type. The mapped type makes a missing handler a compile error. */
export const HANDLERS: Registry = {
  train,
  eat,
  rest,
  sleep,
  takeRoom,
  buyHouse,
  practise,
  payRent,
  treat,
  travel,
  turnBack,
  dismissReport,
  study,
  studyScroll,
  startMission,
  missionChoose,
  missionContinue,
  missionDecide,
  missionCamp,
  encounterRecon,
  encounterApproach,
  combatAct,
  assignTeam,
  chooseSensei,
  testChakraPaper,
  talk,
  reply,
  endConversation,
  trainWith,
  senseiSession,
  senseiTest,
  heedSensei,
  teamDay,
  spar,
  setCombatStyle,
  setAnimations,
  setMapStyle,
  setDayEnd,
  dismissDay,
  answerRival,
  acceptChallenge,
  declineChallenge,
  challengeRival,
  runRaceLeg,
  moveHome,
  buyFurnishing,
  placeFurnishing,
  plantBed,
  pickBed,
  inviteGuest,
  sendGuestHome,
  leaveFight,
  buyGear,
  buyTool,
  buyIntel,
  equipGear,
  unequipGear,
  buyIngredient,
  cook,
  experiment,
  forage,
  fish,
  buyCookbook,
  learnRecipe,
  followSight,
  befriendStray,
  trackWild,
  takePup,
  takeRescued,
  rehomeCompanion,
  handlerSession,
  handlerTeach,
  buyLore,
  signContract: signTeacherContract,
  makeOffering: leaveOffering,
  breakContract: tearUpContract,
  seekInsects: searchForInsects,
  studyJar: studyAJar,
  crossJar: crossAJar,
  nameStrain: nameYourStrain,
  readRite,
  learnRite: learnRiteFrom,
  takeHive: takeAHive,
  studyDustScroll,
  makeDust: makeABatch,
  buyDust: buyABatch,
  feedCompanion,
  playWithCompanion,
  doseCompanion,
  trainCompanion,
  treatCompanion,
  buyMedicine,
  hostDinner,
  buyRound,
  playDice,
  drinkWith,
  soak,
  enterExam,
  examAnswer,
  examFinal,
  examContinue,
  watchFinals,
  acceptPromotion,
};

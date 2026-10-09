// Public API of the game layer. This is the only module the UI and platform may import.
export type { GameState, Character } from './state';
export type { Report } from './reports';
export {
  createGameContext,
  contextForPack,
  packChoices,
  type GameContext,
  type PackChoice,
} from './context';
export {
  createNewGame,
  aptitudeChoices,
  newGameView,
  type NewGameOptions,
  type AptitudeChoice,
  type NewGameView,
} from './newGame';
export type { GameAction, GameActionType } from './actions/types';
export { dispatch, blockerFor } from './dispatch';
export { serialize, deserialize, SAVE_VERSION, type SaveStore } from './persistence/save';
export type { Choice, Discipline } from './views/common';
export { headerView, type HeaderView, type Meter } from './views/header';
export { hubView, type HubView, type PlaceCard } from './views/hub';
export {
  trainingView,
  type TrainingView,
  type Drill,
  type DrillGroup,
  type StatPreview,
} from './views/training';
export { marketView, type MarketView, type MarketItem } from './views/market';
export { homeView, hospitalView, type HomeView, type HospitalView } from './views/home';
export {
  missionBoardView,
  academyView,
  type MissionBoardView,
  type Notice,
  type AcademyView,
  type Scroll,
} from './views/boards';
export { travelView, type Destination } from './views/travel';
export {
  jutsuDeck,
  shinobiView,
  recordView,
  type JutsuCard,
  type ShinobiView,
  type StatLine,
  type RecordDay,
  type RecordLine,
} from './views/you';
export {
  missionScene,
  combatScene,
  type MissionScene,
  type SceneLine,
  type SceneChoice,
} from './views/scene';
export type { CombatView, CombatOption, CombatantView } from '@/systems/combat';
export type { BackdropId, IconId, PlaceKind } from '@/content';
export type { TimeSlot } from '@/systems/time';

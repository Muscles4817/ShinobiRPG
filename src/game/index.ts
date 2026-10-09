// Public API of the game layer. This is the only module the UI and platform may import.
export type { GameState, Character } from './state';
export { createDefaultContext, type GameContext } from './context';
export {
  createNewGame,
  aptitudeChoices,
  type NewGameOptions,
  type AptitudeChoice,
} from './newGame';
export type { GameAction, GameActionType } from './actions/types';
export { dispatch, blockerFor } from './dispatch';
export { serialize, deserialize, SAVE_VERSION, type SaveStore } from './persistence';
export {
  statusView,
  characterView,
  journalView,
  type StatusView,
  type Meter,
  type CharacterView,
  type JournalLine,
} from './views/status';
export {
  trainingOptions,
  foodOptions,
  restOptions,
  missionOptions,
  techniqueOptions,
  type ActionOption,
  type TechniqueEntry,
} from './views/activities';
export { missionView, combatView, type MissionView, type MissionChoice } from './views/mission';
export type { CombatView, CombatOption, CombatantView } from '@/systems/combat';
export { WORLD } from '@/content';

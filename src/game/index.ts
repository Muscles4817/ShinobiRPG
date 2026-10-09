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
  draftProblems,
  rollBreakIn,
  type CreationDraft,
  type NewGameOptions,
  type BreakInRoll,
} from './creation';
export {
  creationView,
  defaultDraft,
  type CreationView,
  type ClanOption,
  type TraitOption,
  type ProfileOption,
} from './views/creation';
export type { GameAction, GameActionType } from './actions/types';
export { dispatch, blockerFor } from './dispatch';
export { serialize, deserialize, SAVE_VERSION, type SaveStore } from './persistence/save';
export type { Choice, Discipline } from './views/common';
export { headerView, type HeaderView, type Meter } from './views/header';
export { hubView, type HubView, type PlaceCard } from './views/hub';
export {
  villageView,
  type FestivalBanner,
  type NightSight,
  type VillageView,
} from './views/village';
export {
  trainingView,
  type TrainingView,
  type Drill,
  type DrillGroup,
  type StatPreview,
} from './views/training';
export { marketView, type MarketView, type MarketItem, type IngredientItem } from './views/market';
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
export { fightStyles, type FightStyleOption } from './views/fightStyle';
export {
  gearShopView,
  loadoutView,
  type GearShopView,
  type GearItem,
  type LoadoutView,
  type LoadoutSlot,
} from './views/shops';
export { kitchenView, type KitchenView, type RecipeCard } from './views/kitchen';
export type { LessonCard, SparOption } from './views/team';
export {
  jutsuDeck,
  recordView,
  type JutsuCard,
  type RecordDay,
  type RecordLine,
} from './views/you';
export { shinobiView, type ShinobiView, type StatLine } from './views/shinobi';
export {
  missionScene,
  combatScene,
  type MissionScene,
  type SceneLine,
  type SceneChoice,
} from './views/scene';
export {
  bondsView,
  personSheet,
  type BondsView,
  type PersonCard,
  type PersonFace,
  type PersonSheet,
  type Relation,
} from './views/people';
export {
  activeScene,
  conversationScene,
  teamScene,
  type SceneKind,
  type ConversationScene,
  type TeamScene,
  type SenseiOffer,
} from './views/peopleScenes';
export type {
  CombatView,
  CombatOption,
  CombatantView,
  CombatMeter,
  RangeBand,
} from '@/systems/combat';
export type { BackdropId, IconId, PlaceKind } from '@/content';
export type { TimeSlot } from '@/systems/time';
export type {
  Appearance,
  Grade,
  Grades,
  Pronouns,
  HairStyle,
  HeadbandPlace,
} from '@/systems/profile';
export { gradesFromQuickPick, pointsSpent } from '@/systems/profile';
export type { Element } from '@/systems/techniques';
export type { EffectLine } from '@/systems/modifiers';

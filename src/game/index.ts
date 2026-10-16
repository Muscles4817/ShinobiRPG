// Public API of the game layer. This is the only module the UI and platform may import.
export type { GameState, Character } from './state';
export type { DebriefCrew, DebriefLine, JobGrade, Report } from './reports';
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
  type StandingOption,
  type ProfileOption,
  type UpbringingOption,
  type ArchetypeOption,
} from './views/creation';
export { fileView, type BloomOption, type FileStatLine, type FileView } from './views/academyFile';
export {
  chooseQuickPick,
  lowerStat,
  markGift,
  raiseStat,
  reviseDraft,
  setBloom,
} from './creationDraft';
export type { GameAction, GameActionType } from './actions/types';
export { dispatch, blockerFor } from './dispatch';
export { saveSummary, type SaveSummary } from './views/menu';
export {
  createVersus,
  VERSUS_GROUNDS,
  VERSUS_GROUPS,
  VERSUS_SIDE_MAX,
  versusProblem,
  versusRoster,
  type VersusFighter,
  type VersusGround,
  type VersusGroup,
  type VersusPick,
} from './versus';
export { chakraPaperScene, type ChakraPaperScene } from './views/chakraPaper';
export { serialize, deserialize, SAVE_VERSION, type SaveStore } from './persistence/save';
export type { Choice, Discipline } from './views/common';
export { headerView, type HeaderView, type HungerNote, type Meter } from './views/header';
export { hubView, type HubView, type PlaceCard } from './views/hub';
export { senseiWeekView, type SenseiWeekDay, type SenseiWeekView } from './views/senseiWeek';
export { examFinalsView, type ExamFinalsView } from './views/examFinals';
export { senseiTestScene, type SenseiTestScene } from './views/senseiTest';
export {
  tavernView,
  type BarSeat,
  type DrinkChoice,
  type PastimeView,
  type TavernView,
} from './views/tavern';
export type { DiceBet, DiceStake, DiceTableView, LastCup } from './views/diceTable';
export { onsenView, type Bather, type OnsenView } from './views/onsen';
export type { Companion, ToneRead } from './views/outings';
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
  type ExerciseCard,
  type StatPreview,
} from './views/training';
export {
  marketView,
  type MarketView,
  type MarketItem,
  type IngredientItem,
  type CookbookItem,
} from './views/market';
export { homeView, hospitalView, type HomeView, type HospitalView } from './views/home';
export { innView, type InnView } from './views/inn';
export { houseView, type HouseView } from './views/house';
export type { ConditionView, InjuryLine } from './views/condition';
export { missionBoardView, type MissionBoardView, type Notice, type Foe } from './views/boards';
export type { ArcView } from './views/arcs';
export { academyView, type AcademyView, type Scroll } from './views/academy';
export type { SheetLine, SheetReach, TechniqueSheet } from './views/techniqueSheet';
export {
  libraryView,
  scrollDesk,
  type LibraryView,
  type ScrollDesk,
  type Stack,
} from './views/library';
export {
  travelView,
  type CompanionOption,
  type Destination,
  type TravelView,
} from './views/travel';
export type {
  AtlasLabel,
  MapLabelSide,
  MapPlace,
  MapPoint,
  MapRoad,
  TravelMap,
} from './views/travelMap';
export { fightStyles, type FightStyleMenu, type FightStyleOption } from './views/fightStyle';
export {
  animationSetting,
  mapStyleOptions,
  type AnimationSetting,
  type MapStyleOption,
} from './views/settings';
export type { MapStyle } from './mapStyle';
export { ACTION_CUES, cueAfter, type ActionCue } from './cues';
export {
  DEFAULT_AUDIO_SETTINGS,
  MAX_VOLUME,
  MUSIC_MOODS,
  SOUNDS,
  VOLUME_STEP,
  beatSound,
  clampVolume,
  musicMood,
  readAudioSettings,
  reportSound,
  soundAfter,
  writeAudioSettings,
  type AudioSettings,
  type MusicMood,
  type Sound,
  type SoundCue,
  type SoundForce,
} from './sound';
export {
  gearShopView,
  loadoutView,
  type GearShopView,
  type GearItem,
  type ToolItem,
  type LoadoutView,
  type LoadoutSlot,
} from './views/shops';
export { kitchenView, type DinnerInvite, type KitchenView, type RecipeCard } from './views/kitchen';
export { STOVE_BEATS, EXPERIMENT_LIMIT, type StoveBeat } from './views/stove';
export { wildsView, type WildsView, type FishingSpotView, type WhatsAbout } from './views/wilds';
export type { CookingSteps } from '@/systems/cooking';
export {
  cookbookView,
  type CookbookView,
  type CookbookEntry,
  type SealedRecipe,
} from './views/cookbook';
export type { SparOption } from './views/team';
export type { TeacherOffer, TeachStat } from './views/teachers';
export type { PricePart } from './people/price';
export {
  jutsuDeck,
  recordView,
  type JutsuCard,
  type JutsuEffect,
  type RecordDay,
  type RecordLine,
} from './views/you';
export {
  shinobiView,
  type ShinobiView,
  type StatGrade,
  type StatLine,
  type TierRead,
} from './views/shinobi';
export type { Pace, ScoutingRead, StatCompare, Threat, TraitNote } from './scouting';
export { combatScene, finishedFightScene, combatScouting } from './views/scene';
export {
  missionScene,
  type MissionScene,
  type SceneLine,
  type SceneChoice,
  type ThreadView,
  type RouteMark,
} from './views/missionScene';
export { combatLog, type CombatLogLine } from './views/combatLog';
export { fightReplay, storyEnd, type FightBeat } from './views/fightReplay';
export {
  examScene,
  type ConductLine,
  type ExamChoice,
  type ExamScene,
  type ExamStageMark,
  type ExamVerdict,
} from './views/exam';
export { examNotice, type ExamEntry, type ExamNotice, type ExamTeammate } from './views/examNotice';
export { promotionScene, type PromotionScene } from './views/promotion';
export type { Unlock } from './exam/unlocks';
export {
  encounterScene,
  type ApproachCard,
  type EncounterFoe,
  type EncounterScene,
  type FactLine,
  type ReconCard,
} from './views/encounter';
export {
  bondsView,
  type BondsView,
  type PersonCard,
  type PersonFace,
  type Relation,
} from './views/people';
export { personSheet, type PersonSheet } from './views/personSheet';
export type { BondPath, BondStep } from './views/bondPath';
export type { ArtChip, Arts, DaySlot, Growth } from './views/personFacts';
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
export {
  fateStanding,
  type ArchetypeId,
  type Bloom,
  type ClassStanding,
  type Gift,
  type QuickPick,
} from '@/systems/profile';
export type { StatGroup, StatId, StatKind } from '@/systems/stats';
export type { Element } from '@/systems/techniques';
export type { EffectLine } from '@/systems/modifiers';

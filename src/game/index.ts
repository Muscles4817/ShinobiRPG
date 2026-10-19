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
export { notesProblems } from './notes';
export { notesPage, toggledNotes, type NoteCard } from './views/creationNotes';
export { quirkCards } from './views/creationQuirks';
export { fileReadBack } from './views/fileReadBack';
export type { FacePalettes } from './views/facePalettes';
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
// The content editor's whole public API (`edits/index.ts`).
export * from './edits';
export { saveSummary, type SaveSummary } from './views/menu';
export {
  browseRoster,
  createVersus,
  OPEN_FILTER,
  VERSUS_GROUNDS,
  VERSUS_SIDE_MAX,
  versusProblem,
  versusProfile,
  versusRoster,
  withGroup,
  type FacetOption,
  type RosterBrowse,
  type VersusFighter,
  type VersusFilter,
  type VersusGround,
  type VersusProfile,
} from './versus';
export { chakraPaperScene, type ChakraPaperScene } from './views/chakraPaper';
export { serialize, deserialize, SAVE_VERSION, type SaveStore } from './persistence/save';
export type { Choice, Discipline } from './views/common';
export { headerView, type HeaderView, type HungerNote, type Meter } from './views/header';
export { hubView, isRestKind, type HubView, type PlaceCard, type RestKind } from './views/hub';
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
export { marketView, type MarketItem, type CookbookItem } from './views/market';
export { homeView, hospitalView, type HomeView, type HospitalView } from './views/home';
export { innView, type InnView } from './views/inn';
export { houseView, type HouseView } from './views/house';
export type { ConditionView, InjuryLine } from './views/condition';
export { missionBoardView, type MissionBoardView, type Notice, type Foe } from './views/boards';
export type { ArcJob, ArcRule, ArcView } from './views/arcs';
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
  dayEndOptions,
  mapStyleOptions,
  type AnimationSetting,
  type DayEndOption,
  type MapStyleOption,
} from './views/settings';
export { dayEndView, type DayEndView } from './views/dayEnd';
export { rivalChallengeView, rivalScene, type RivalChallengeView } from './views/rival';
export { rivalryView, type ContestOffer, type RivalryView } from './views/rivalry';
export { raceView } from './views/race';
export { lettingsView, type FurnishingCard, type HomeCard } from './views/lettings';
export { furnishView, type SpotView } from './views/homeFurnish';
export { homeRoomsView, type HomeRoomsView } from './views/homeRooms';
export { keepsakeShelf } from './views/keepsakes';
export { fieldBookView, type FieldBookView, type FieldPage } from './views/fieldBook';
export type { FieldEntry } from './views/fieldBookEntries';
export {
  classHonoursView,
  type ClassHonoursView,
  type Classmate,
  type Honour,
} from './views/classHonours';
export type { DayHook } from './views/dayHooks';
export type { DayFind, DayHurt, DayMoment, DayPerson } from './views/dayEndRows';
export type { DayGrowth } from './views/dayEndGrowth';
export { openDay } from './daybook/open';
export type { DayEndMode, PurseLine } from './daybook/state';
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
  type GearItem,
  type ToolItem,
  type LoadoutView,
  type LoadoutSlot,
} from './views/shops';
export { kitchenView, type DinnerInvite, type KitchenView, type RecipeCard } from './views/kitchen';
export { STOVE_BEATS, EXPERIMENT_LIMIT, type StoveBeat } from './views/stove';
export { wildsView, type WildsView, type FishingSpotView, type WhatsAbout } from './views/wilds';
export type { CookingSteps } from '@/systems/cooking';
export { cookbookView, type CookbookEntry, type SealedRecipe } from './views/cookbook';
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
export type { CompanionNote, Pace, ScoutingRead, StatCompare, Threat, TraitNote } from './scouting';
export { combatScene, finishedFightScene, combatScouting, fightTechnique } from './views/scene';
export {
  missionScene,
  type MissionScene,
  type SceneLine,
  type SceneChoice,
  type ThreadView,
  type RouteMark,
} from './views/missionScene';
export { missionSoFar, type MissionSoFar } from './views/missionSoFar';
export { sceneBeside, type SceneBeside } from './views/sceneBeside';
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
export { bondsView, type PersonCard, type PersonFace, type Relation } from './views/people';
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
export {
  fateStanding,
  type Age,
  type Appearance,
  type ArchetypeId,
  type Bloom,
  type BrowShape,
  type ClassStanding,
  type EarShape,
  type Expression,
  type EyeShape,
  type FaceParts,
  type FaceShape,
  type FacialHair,
  type Figure,
  type Gift,
  type Grade,
  type Grades,
  type HairStyle,
  type HeadbandPlace,
  type Look,
  type Mark,
  type NoseShape,
  type Pronouns,
  type QuickPick,
} from '@/systems/profile';
export type { StatGroup, StatId, StatKind } from '@/systems/stats';
export type { Element } from '@/systems/techniques';
export type { EffectLine } from '@/systems/modifiers';
export type { CompanionCard, StrayNotice } from './views/companion';
export { compoundView, quarterView, type CompoundView, type QuarterView } from './views/compounds';
export { companionSheet, type CompanionSheet, type CompanionStrip } from './views/companionCare';
export { vetView, type VetView } from './views/vet';
export { contractCard, type ContractCard } from './views/contract';
export { hiveCard, type HiveCard } from './views/hiveCard';

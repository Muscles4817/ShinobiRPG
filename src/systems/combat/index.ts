// Public API of the combat system. Consumers depend on the contract, never on an engine's
// internals; the engine factory is only referenced by the composition root.
export type {
  CombatAttributes,
  CombatTechnique,
  CombatantSetup,
  CombatGrammar,
  CombatCall,
  SummonFate,
  CombatSetup,
  CombatState,
  CombatSide,
  CombatantView,
  CombatOption,
  CombatView,
  CombatResult,
  CombatOutcome,
  CombatCost,
  CombatOpening,
  CombatOpeningField,
  CombatEngine,
  CombatChoice,
  CombatMeter,
  CombatPerk,
  CombatProvision,
  CombatTrait,
  CombatItem,
  CombatItemEffect,
  RangeBand,
  CombatRow,
  BodySize,
  CombatGround,
  CombatForm,
  CombatOccasion,
  CombatPreviewExchange,
} from './contract';
export type { CombatInspection, InspectedFighter } from './inspectionContract';
export {
  COMBAT_TRAITS,
  COMBAT_ITEM_EFFECTS,
  COMBAT_PROVISIONS,
  COMBAT_GROUNDS,
  SUMMON_FATES,
} from './contract';
export type { CombatOrders, CombatStance, CombatUsage, StanceKind } from './teamContract';
export { STANCE_KINDS } from './teamContract';
export type { CombatMind } from './mindContract';
export {
  DUST_GIFTS,
  DUST_QUALITIES,
  type CombatDust,
  type DustBane,
  type DustGift,
  type DustKind,
  type DustQuality,
} from './dustContract';
export {
  SWARM_GIFTS,
  SWARM_QUALITIES,
  type CombatSwarm,
  type SwarmGift,
  type SwarmQuality,
  type SwarmStrain,
} from './swarmContract';
export type {
  ArmourLevel,
  CombatArmour,
  CombatFocus,
  CombatGear,
  CombatWeapon,
  FocusTarget,
  GearRank,
  WeaponClass,
  WeaponEffect,
  WeaponMastery,
  WeaponShape,
} from './gearContract';
export {
  ARMOUR_LEVELS,
  GEAR_RANKS,
  HELD_SHAPES,
  SHAPE_OF_CLASS,
  shapeOf,
  WEAPON_CLASSES,
  WEAPON_EFFECTS,
  WEAPON_SHAPES,
} from './gearContract';
export { masteryShare, MASTERY_FLOOR } from './rules/mastery';
export { overpoweredBy } from './rules/elements';
// Gear's numbers, for describing a piece the same way the fight applies it.
export { armourKept, armourSlows, STRENGTH_CARRIES } from './rules/armour';
export { HIT_TYPES, hitTypeOf, type HitType } from './rules/hits';
export { chakraCost, holdTurns } from './rules/body';
export {
  BODY_ARTS,
  effortOf,
  isBodyArt,
  isBodyMove,
  type BodyArt,
  type Effort,
  type EffortPool,
} from './rules/breath';
export { defaultRepertoire, fitsRepertoire, repertoireSize } from './engines/plan/repertoire';
export { CHAINS_KEPT, chainLength, chainProblem, defaultChains, fitsChain } from './rules/chains';
export { equalHitShare } from './rules/damage';
export { focusScale } from './rules/focus';
export { MAX_BLADES, weaponNumbers, type WeaponNumbers } from './rules/weapons';
export { speedOf, strikeReach, weaponGuard } from './rules/weaponClasses';
export {
  CAUSE_KIND,
  CAUSE_KINDS,
  HEALTH_CAUSES,
  NARRATION_CAUSES,
  NARRATION_OFF_PLAN,
  NARRATION_REACTIONS,
  type CauseKind,
  type CombatEvent,
  type CombatEventKind,
  type HealthCause,
  type NarrationAmount,
  type NarrationAmountKind,
  type NarrationCause,
  type NarrationForce,
  type NarrationOffPlan,
  type NarrationReaction,
  type StoryPools,
  type ToldCause,
  type ToldEvent,
  type ToldReaction,
} from './storyContract';
export {
  foldEvent,
  foldStory,
  NO_STANDING,
  recentTold,
  toldIn,
  toldText,
  type StoryStanding,
} from './storyFold';
/** A story told the old way (lines carrying their facts), read into events: old saves only. */
export { storyOfLines } from './rules/narrationLegacy';
export { RANGE_BANDS, RANGE_LABEL, reachOf } from './rules/range';
export { readingOf, tagsOf, type TagReading } from './rules/tags';
export { GROUND_RULES, type GroundRule } from './rules/ground';
export { potencyOf as fieldPotencyOf } from './rules/verbs/field';
export { AFFLICT_EXCHANGES } from './rules/verbs/lingering';
export { stepToll, type StepToll } from './rules/verbs/tolls';
export { wearsBody } from './rules/verbs/ladders';
export { createDuelEngine } from './engines/duel/engine';
/** Shelved: kept compiling and tested, but not offered as a fight style (see `game/context.ts`). */
export { createDeckEngine } from './engines/deck/engine';
export { createPlanEngine } from './engines/plan/engine';
export { decisionsOf } from './engines/plan/decisionLog';
export {
  COMBAT_PHILOSOPHIES,
  type CombatFighting,
  type CombatPhilosophy,
} from './fightingContract';
export {
  INSTINCT_WHYS,
  PLAN_WHYS,
  TURN_WHYS,
  type Decision,
  type Odds,
  type Why,
} from './engines/plan/whyShape';
/** Status words the plan engine builds from a table, for the fight glossary. */
export { HARM_STATUS } from './engines/plan/lingering';
export { stepStatus } from './engines/plan/ladderWords';
export { SHROUD_STATUS } from './engines/plan/shrouds';

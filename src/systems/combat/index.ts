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
} from './contract';
export {
  COMBAT_TRAITS,
  COMBAT_ITEM_EFFECTS,
  COMBAT_PROVISIONS,
  COMBAT_GROUNDS,
  SUMMON_FATES,
} from './contract';
export type { CombatOrders, CombatStance, CombatUsage, StanceKind } from './teamContract';
export { STANCE_KINDS } from './teamContract';
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
// Gear's numbers, for describing a piece the same way the fight applies it.
export { armourKept, armourSlows, STRENGTH_CARRIES } from './rules/armour';
export { HIT_TYPES, hitTypeOf, type HitType } from './rules/hits';
export { chakraCost, holdTurns } from './rules/body';
export { effortOf, isBodyMove, type Effort, type EffortPool } from './rules/breath';
export { defaultRepertoire, fitsRepertoire, repertoireSize } from './engines/plan/repertoire';
export { equalHitShare } from './rules/damage';
export { focusScale } from './rules/focus';
export { MAX_BLADES, weaponNumbers, type WeaponNumbers } from './rules/weapons';
export { speedOf, strikeReach, weaponGuard } from './rules/weaponClasses';
export { splitNarration } from './rules/narration';
export { RANGE_BANDS, RANGE_LABEL, reachOf } from './rules/range';
export { GROUND_RULES, type GroundRule } from './rules/ground';
export { potencyOf as fieldPotencyOf } from './rules/verbs/field';
export { AFFLICT_EXCHANGES } from './rules/verbs/lingering';
export type {
  Narration,
  NarrationAmount,
  NarrationAmountKind,
  NarrationForce,
  NarrationReaction,
} from './rules/narration';
export { createDuelEngine } from './engines/duel/engine';
/** Shelved: kept compiling and tested, but not offered as a fight style (see `game/context.ts`). */
export { createDeckEngine } from './engines/deck/engine';
export { createPlanEngine } from './engines/plan/engine';

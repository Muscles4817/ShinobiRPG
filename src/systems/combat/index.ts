// Public API of the combat system. Consumers depend on the contract, never on an engine's
// internals; the engine factory is only referenced by the composition root.
export type {
  CombatAttributes,
  CombatTechnique,
  CombatantSetup,
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
  CombatTrait,
  CombatItem,
  CombatItemEffect,
  RangeBand,
  CombatRow,
} from './contract';
export { COMBAT_TRAITS, COMBAT_ITEM_EFFECTS } from './contract';
export type { CombatOrders, CombatStance, CombatUsage, StanceKind } from './teamContract';
export { STANCE_KINDS } from './teamContract';
export type {
  ArmourLevel,
  CombatArmour,
  CombatFocus,
  CombatGear,
  CombatWeapon,
  FocusTarget,
  GearRank,
  WeaponEffect,
  WeaponShape,
} from './gearContract';
export {
  ARMOUR_LEVELS,
  GEAR_RANKS,
  HELD_SHAPES,
  WEAPON_EFFECTS,
  WEAPON_SHAPES,
} from './gearContract';
// Gear's numbers, for describing a piece the same way the fight applies it.
export { armourKept, armourSlows, STRENGTH_CARRIES } from './rules/armour';
export { chakraCost } from './rules/body';
export { focusScale } from './rules/focus';
export { weaponNumbers, type WeaponNumbers } from './rules/weapons';
export { splitNarration } from './rules/narration';
export { RANGE_BANDS, RANGE_LABEL } from './rules/range';
export { potencyOf as fieldPotencyOf } from './rules/verbs/field';
export type { Narration, NarrationAmount, NarrationAmountKind } from './rules/narration';
export { createDuelEngine } from './engines/duel/engine';
/** Shelved: kept compiling and tested, but not offered as a fight style (see `game/context.ts`). */
export { createDeckEngine } from './engines/deck/engine';
export { createPlanEngine } from './engines/plan/engine';

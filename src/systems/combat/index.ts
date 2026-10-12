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
} from './contract';
export { COMBAT_TRAITS, COMBAT_ITEM_EFFECTS } from './contract';
export { splitNarration } from './rules/narration';
export type { Narration, NarrationAmount, NarrationAmountKind } from './rules/narration';
export { createDuelEngine } from './engines/duel/engine';
/** Shelved: kept compiling and tested, but not offered as a fight style (see `game/context.ts`). */
export { createDeckEngine } from './engines/deck/engine';
export { createPlanEngine } from './engines/plan/engine';

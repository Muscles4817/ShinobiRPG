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
  CombatEngine,
  CombatChoice,
  CombatMeter,
  CombatPerk,
  RangeBand,
} from './contract';
export { createDuelEngine } from './engines/duel/engine';
export { createMindEngine } from './engines/mind/engine';
export { createDeckEngine } from './engines/deck/engine';
export { createPlanEngine } from './engines/plan/engine';

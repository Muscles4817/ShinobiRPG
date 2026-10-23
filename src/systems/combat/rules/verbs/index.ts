// Verbs: what techniques do, each rule and scaling profile defined once for every engine.
export { VERB_PROFILES, profileOf, type VerbAim, type VerbProfile } from './profiles';
export {
  driveOf,
  effectsOf,
  hasVerb,
  isHarmful,
  isHindering,
  isWounding,
  landingUse,
  primaryEffect,
  resistOf,
  techniquePower,
  type EffectUse,
} from './use';
export { upgradeTechnique } from './legacy';
export { concealmentFrom, concealmentOf, senseChance, type Hider } from './hiding';
export {
  blinds,
  covered,
  dulled,
  FIELD_RULES,
  fieldLeft,
  fieldMissChance,
  fieldPotency,
  potencyOf,
  raiseField,
  type ActiveField,
  type FieldRule,
  type FieldSource,
} from './field';
export { moveGoal, spins, substitutable } from './footwork';
export { AREA_RULES, afterBlast, areaSize, type AreaRule } from './area';
export {
  BREAK_ARMOUR,
  BREAK_TOUGHNESS,
  brokenScale,
  confuseTurns,
  MAX_CONFUSION_TURNS,
  toughnessKept,
} from './hold';
export {
  attributesAfterEmpower,
  empower,
  empowerCostsOwed,
  empowerEnds,
  empowerExchanges,
  empowerPrice,
  empowerShare,
  EMPOWER_HEALTH_FLOOR,
  healthAfterPrice,
  MAX_EMPOWER_EXCHANGES,
  type Empowered,
  type Empowerment,
  type EmpowerMemory,
} from './empower';
export {
  CHAKRA_SURGE_PER_STEP,
  GIVE_OUT_SHARE,
  STEP_TRIAL,
  canOpen,
  givesOut,
  isOpenFor,
  ladderHolds,
  lastsOpen,
  openStep,
  opensOf,
  stepBand,
  stepShare,
  wearsBody,
  worthOpening,
  type ClimbReasons,
} from './ladders';
export { spentBody, stepBreathPrice, stepToll, type StepToll } from './tolls';
export {
  cloneBlowScale,
  drawFireChance,
  carriesThrough,
  CLONE_CARRY_SCALE,
  cloneStepBonus,
  cloneCount,
  clonesFrom,
  clonesLeft,
  decoyChance,
  MAX_CLONES,
  oneBurst,
  type CloneBody,
  type Clones,
} from './clones';
export { springs, spotChance, trapAt, type SetTrap, type TrapMemory } from './trap';
export {
  ABSORB_SHARE,
  AFFLICT_EXCHANGES,
  afflicted,
  afflictionFrom,
  afflictionsTick,
  drainAmount,
  isPinned,
  MAX_BLEEDS,
  PIN_SLIP,
  POISON_SAP,
  poisonSap,
  riposteFrom,
  riposteTechnique,
  withSap,
  type Affliction,
  type Sap,
  type HoldGrip,
  type LingeringMemory,
  type Riposte,
} from './lingering';
export { CLONE_RULES, cloneKindFor, cloneUpkeep, kindOf, type CloneRule } from './cloneKinds';

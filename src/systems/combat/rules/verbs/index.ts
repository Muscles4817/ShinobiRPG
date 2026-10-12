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
  CLONE_BLOW_SCALE,
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

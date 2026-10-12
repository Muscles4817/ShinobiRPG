// Verbs: what techniques do, each rule and scaling profile defined once for every engine.
export { VERB_PROFILES, profileOf, type VerbAim, type VerbProfile } from './profiles';
export {
  driveOf,
  effectsOf,
  hasVerb,
  isHarmful,
  landingUse,
  primaryEffect,
  resistOf,
  techniquePower,
  type EffectUse,
} from './use';
export { upgradeTechnique } from './legacy';

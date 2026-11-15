/**
 * The mind (`docs/design/combat-ai-plan.md` Parts 3 and 5): what each fighter sees happen and
 * what they come to believe of each other. Shown only for now: nothing in the fight reads it.
 */
export { beliefsAfter, clarity } from './beliefs';
export { confidence, surenessOf, type Sureness } from './evidence';
export { witnessAct, witnessDefence } from './observe';
export { beliefLines, held, type Held } from './words';
export type { Beliefs, Capability, Evidence, Minded, Witness } from './shape';
export { competenceOf, recognises, tierFor, type Competence } from './competence';
export { identityOf, identityProblems, type Identity } from './identity';
export { assess, type Assessment } from './assess';
export { objectivesAfter } from './aims';
export { choose, scored } from './objectives';
export { OBJECTIVES, type HeldObjective, type Objective } from './shape';

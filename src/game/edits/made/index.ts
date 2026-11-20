/**
 * Techniques made in the editor: the draft a form holds, the technique it becomes, keeping and
 * dropping them, and the forge's view of one as a fight will read it.
 */
export {
  BLANK_DRAFT,
  MAX_EFFECTS,
  MAX_POWER,
  blankEffect,
  draftOf,
  draftProblems,
  type DraftEffect,
  type EffectOption,
  type TechniqueDraft,
} from './draft';
export { FORGE_CHOICES, choiceLabel, type ForgeChoice, type ForgeChoices } from './choices';
export { shelfForRank, shelfWords, type TaughtShelf } from './shelving';
export { dropTechnique, keepTechnique, madeDraft, resetFighters, type KeptTechnique } from './edit';
export { madeFrom } from './read';
export {
  BOOSTABLE,
  MADE_VERBS,
  VERB_FIELDS,
  VERB_LABEL,
  type MadeVerb,
  type VerbField,
} from './verbFields';
export { forgeView, madeShelf, type ForgeView, type MadeShelfItem } from './view';

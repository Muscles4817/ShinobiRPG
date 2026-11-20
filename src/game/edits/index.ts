/**
 * The content editor: overrides a player lays over a pack's content (fighters) and techniques
 * they make, kept on the device and copied into each new game.
 */
export { NO_EDITS, hasEdits, madeTechniques, type ContentEdits, type FighterEdit } from './state';
export { withEdits } from './apply';
export {
  EMPTY_BOOK,
  editsFrom,
  packEdits,
  readEditBook,
  withPackEdits,
  writeEditBook,
  type EditBook,
} from './book';
export { EDIT_STAT_MAX, EDIT_STAT_MIN, editStat, editTechniques, resetFighter } from './edit';
export {
  editorRoster,
  fighterEditor,
  type EditorStat,
  type EditorTechnique,
  type FighterEditor,
} from './view';
export {
  BLANK_DRAFT,
  BOOSTABLE,
  FORGE_CHOICES,
  choiceLabel,
  type ForgeChoice,
  type ForgeChoices,
  MADE_VERBS,
  MAX_EFFECTS,
  MAX_POWER,
  VERB_FIELDS,
  VERB_LABEL,
  blankEffect,
  draftOf,
  draftProblems,
  dropTechnique,
  forgeView,
  keepTechnique,
  madeDraft,
  madeShelf,
  resetFighters,
  type DraftEffect,
  type EffectOption,
  type ForgeView,
  type KeptTechnique,
  type MadeShelfItem,
  type MadeVerb,
  type TechniqueDraft,
  type VerbField,
} from './made';

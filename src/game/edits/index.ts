/**
 * The content editor: overrides a player lays over a pack's content (fighters, to begin
 * with), kept on the device and copied into each new game.
 */
export { NO_EDITS, hasEdits, type ContentEdits, type FighterEdit } from './state';
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

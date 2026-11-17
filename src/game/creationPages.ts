/** The academy file's later pages, as the creation scene reads them: part of the public API. */
export { notesProblems } from './notes';
export { notesPage, toggledNotes, type NoteCard } from './views/creationNotes';
export { quirkCards } from './views/creationQuirks';
export { techniquesPage, type TaughtCard, type TechniquesPage } from './views/creationTechniques';
export { taughtProblems, toggledTechnique } from './creationTechniques';
export { fileReadBack } from './views/fileReadBack';
export type { FacePalettes } from './views/facePalettes';
export { fileView, type BloomOption, type FileStatLine, type FileView } from './views/academyFile';

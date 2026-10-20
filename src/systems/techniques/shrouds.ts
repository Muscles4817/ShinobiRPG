/**
 * What a cast armour is made of (the `shroud` verb): lightning run over the skin, a shell of
 * sand, hardened earth or raw chakra. What each does in a fight lives once in the combat
 * system's `rules/verbs/shrouds.ts`.
 */
export const SHROUD_KINDS = ['lightning', 'sand', 'earth', 'chakra'] as const;
export type ShroudKind = (typeof SHROUD_KINDS)[number];

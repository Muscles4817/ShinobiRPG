/**
 * The shape of the fight glossary (`fightGlossary.ts`): one entry per status or card kind, each a
 * one-sentence rule and what answers it, in the group the reference sheet lists it under.
 */

/** The reference sheet's groups, in the order it lists them. */
export const GLOSSARY_GROUPS = [
  'conditions',
  'readied',
  'team',
  'defences',
  'actions',
  'footwork',
] as const;
export type GlossaryGroup = (typeof GLOSSARY_GROUPS)[number];

export interface GlossaryEntry {
  readonly id: string;
  /** What the sheet calls it (and, for most statuses, the very word the fight screen shows). */
  readonly name: string;
  readonly group: GlossaryGroup;
  /** What it does, in one sentence and no numbers. */
  readonly rule: string;
  /** What answers it (or, for a card, what beats it). */
  readonly counter: string;
  /** Other status words it explains, read from the engine's own tables (every gate). */
  readonly also?: readonly string[];
  /** Status words with a part that varies (a count, a name). */
  readonly pattern?: RegExp;
}

/** An entry whose id is read from its name. */
export function glossaryEntry(
  group: GlossaryGroup,
  name: string,
  rule: string,
  counter: string,
): GlossaryEntry {
  return { id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, group, rule, counter };
}

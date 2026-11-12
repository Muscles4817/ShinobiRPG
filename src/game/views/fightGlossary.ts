import { CARD_ENTRIES } from './fightGlossaryCards';
import { STATUS_ENTRIES } from './fightGlossaryStatuses';
import { GLOSSARY_GROUPS, type GlossaryEntry, type GlossaryGroup } from './fightGlossaryTypes';

/**
 * The fight glossary: one table of every status the fight screens show and every kind of card a
 * plan holds, each with the rule in a sentence and what answers it. The fight screens ask
 * `statusHelp` for the word under a fighter's name, and the "How fighting works" sheet lists the
 * whole table by group (`fightGlossary`).
 */

export const FIGHT_GLOSSARY: readonly GlossaryEntry[] = [...STATUS_ENTRIES, ...CARD_ENTRIES];

/** What a status word on the fight screen means, and what answers it. */
export interface StatusHelp {
  readonly entryId: string;
  readonly rule: string;
  readonly counter: string;
}

function explains(entry: GlossaryEntry, status: string): boolean {
  return (
    entry.name === status ||
    (entry.also ?? []).includes(status) ||
    (entry.pattern?.test(status) ?? false)
  );
}

/** The glossary's word on a status, or null for one it doesn't know. */
export function statusHelp(status: string): StatusHelp | null {
  const entry = STATUS_ENTRIES.find((e) => explains(e, status));
  return entry ? { entryId: entry.id, rule: entry.rule, counter: entry.counter } : null;
}

const GROUP_TITLES: Readonly<Record<GlossaryGroup, string>> = {
  conditions: 'Conditions',
  readied: 'Getting ready',
  team: 'Sides and stances',
  defences: 'Defences',
  actions: 'Actions',
  footwork: 'Distance and footwork',
};

const GROUP_NOTES: Readonly<Record<GlossaryGroup, string>> = {
  conditions: 'What a fight leaves on a fighter.',
  readied: 'What a fighter has made ready on themselves.',
  team: 'How fighters stand with their side.',
  defences:
    'One defence is kept ready at each distance and reacts on its own; Evade and Brace are actions that spend the turn on it.',
  actions: 'What a plan slots at each distance, played in order.',
  footwork: 'Where everyone stands, and moving there.',
};

export interface GlossarySection {
  readonly group: GlossaryGroup;
  readonly title: string;
  readonly note: string;
  readonly entries: readonly GlossaryEntry[];
}

/** The reference sheet: every entry, by group, in the order the sheet lists them. */
export function fightGlossary(): readonly GlossarySection[] {
  return GLOSSARY_GROUPS.map((group) => ({
    group,
    title: GROUP_TITLES[group],
    note: GROUP_NOTES[group],
    entries: FIGHT_GLOSSARY.filter((e) => e.group === group),
  }));
}

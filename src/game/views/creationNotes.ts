import { describeSpec, type EffectLine } from '@/systems/modifiers';
import { notesLeft, notesProblem, STANDING_INFO, type NoteWeight } from '@/systems/profile';

import type { GameContext } from '../context';
import type { CreationDraft } from '../creation';
import { notesOf } from '../notes';
import { statEffects } from './creation';

/**
 * The special notes page of the academy file: how much room your standing gives (as slots
 * that fill as you pick), and every note by weight, each saying what it does and, when it
 * can't go on, why. A note picked drops one that contradicts it.
 */

export interface NoteCard {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly weight: NoteWeight;
  readonly effects: readonly EffectLine[];
  readonly selected: boolean;
  /** Why it can't go on the file as it stands, or null. */
  readonly blocker: string | null;
}

export interface NoteSlot {
  readonly label: string;
  readonly kind: NoteWeight | 'open-major' | 'open-minor';
}

export interface NotesPage {
  readonly allowance: string;
  readonly slots: readonly NoteSlot[];
  readonly groups: readonly { readonly heading: string; readonly notes: readonly NoteCard[] }[];
}

const COUNT = ['no', 'one', 'two', 'three', 'four'] as const;
const count = (n: number, what: string) => `${COUNT[n] ?? String(n)} ${what}${n === 1 ? '' : 's'}`;

const GROUPS: readonly { readonly weight: NoteWeight; readonly heading: string }[] = [
  { weight: 'major', heading: 'Major notes' },
  { weight: 'minor', heading: 'Minor notes' },
  { weight: 'flaw', heading: 'Flaws' },
];

/** The notes once this one is toggled: on (dropping its opposite) or off. */
export function toggledNotes(draft: CreationDraft, id: string, ctx: GameContext): string[] {
  if (draft.talentIds.includes(id)) return draft.talentIds.filter((n) => n !== id);
  const opposite = ctx.content.talents.get(id)?.opposite;
  return [...draft.talentIds.filter((n) => n !== opposite), id];
}

function slotsFor(draft: CreationDraft, ctx: GameContext): NoteSlot[] {
  const notes = notesOf(draft.talentIds, ctx);
  const allowance = STANDING_INFO[draft.standing].notes;
  const left = notesLeft(
    notes.map((n) => n.weight),
    allowance,
  );
  const openMajor = Math.max(0, left.major);
  const openMinor = Math.max(0, left.minor - openMajor);
  const order: readonly NoteWeight[] = ['major', 'minor', 'flaw'];
  return [
    ...order.flatMap((w) =>
      notes.filter((n) => n.weight === w).map((n) => ({ label: n.name, kind: w })),
    ),
    ...Array.from({ length: openMajor }, () => ({
      label: 'A major note',
      kind: 'open-major' as const,
    })),
    ...Array.from({ length: openMinor }, () => ({
      label: 'A minor note',
      kind: 'open-minor' as const,
    })),
  ];
}

export function notesPage(draft: CreationDraft, ctx: GameContext): NotesPage {
  const info = STANDING_INFO[draft.standing];
  const card = (id: string): NoteCard | null => {
    const note = ctx.content.talents.get(id);
    if (!note) return null;
    const selected = draft.talentIds.includes(id);
    const after = notesOf(toggledNotes(draft, id, ctx), ctx).map((n) => n.weight);
    return {
      id,
      name: note.name,
      description: note.description,
      weight: note.weight,
      effects: [...statEffects(note.statBonuses), ...describeSpec(note.modifiers)],
      selected,
      blocker: selected ? null : notesProblem(after, info.notes),
    };
  };
  return {
    allowance: `${info.label}: your file carries ${count(info.notes.major, 'major note')} and ${count(info.notes.minor, 'minor note')}. Every flaw on it makes room for one more minor note, and a major slot left empty takes a minor one.`,
    slots: slotsFor(draft, ctx),
    groups: GROUPS.map(({ weight, heading }) => ({
      heading,
      notes: ctx.content.talents.all
        .filter((t) => t.weight === weight)
        .flatMap((t) => card(t.id) ?? []),
    })),
  };
}

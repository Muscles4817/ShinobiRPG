import type { JournalChip, JournalTone } from '@/systems/journal';
import type { TechniqueEffect } from '@/systems/techniques';
import { formatDate, slotName } from '@/systems/time';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import type { Discipline } from './common';

export interface JutsuCard {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly discipline: Discipline;
  readonly element: string | null;
  readonly effect: TechniqueEffect;
  readonly chakraCost: number;
  readonly power: number;
  readonly status: 'known' | 'studying' | 'unknown';
  readonly progressPct: number;
}

/** Every technique in the setting: known ones first, then those being studied. */
export function jutsuDeck(state: GameState, ctx: GameContext): readonly JutsuCard[] {
  const order = { known: 0, studying: 1, unknown: 2 } as const;
  return ctx.content.techniques.all
    .map((t): JutsuCard => {
      const progress = state.techniques.progress[t.id] ?? 0;
      const known = state.techniques.known.includes(t.id);
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        discipline: t.discipline,
        element: t.element ?? null,
        effect: t.effect,
        chakraCost: t.chakraCost,
        power: t.power,
        status: known ? 'known' : progress > 0 ? 'studying' : 'unknown',
        progressPct: known ? 100 : Math.round((progress / t.difficulty) * 100),
      };
    })
    .sort((a, b) => order[a.status] - order[b.status]);
}

export interface RecordLine {
  readonly id: number;
  readonly when: string;
  readonly heading: string | null;
  readonly text: string;
  readonly tone: JournalTone;
  readonly chips: readonly JournalChip[];
}

export interface RecordDay {
  readonly date: string;
  readonly lines: readonly RecordLine[];
}

/** The record, oldest day first and oldest entry first within a day (a feed reads down). */
export function recordView(state: GameState): readonly RecordDay[] {
  const days = new Map<number, RecordLine[]>();
  for (const e of state.journal.entries) {
    const lines = days.get(e.day) ?? [];
    lines.push({
      id: e.id,
      when: slotName({ day: e.day, slot: e.slot }),
      heading: e.heading ?? null,
      text: e.text,
      tone: e.tone,
      chips: e.chips ?? [],
    });
    days.set(e.day, lines);
  }
  return [...days].map(([day, lines]) => ({ date: formatDate({ day, slot: 0 }), lines }));
}

import { chakraCost } from '@/systems/combat';
import type { JournalChip, JournalTone } from '@/systems/journal';
import type { StatGrade } from '@/systems/stats';
import type { Verb } from '@/systems/techniques';
import { formatDate, slotName } from '@/systems/time';

import { playerCombatant } from '../combatants';
import type { GameContext } from '../context';
import type { GameState } from '../state';
import type { Discipline } from './common';

export interface JutsuEffect {
  readonly verb: Verb;
  readonly power: number;
}

export interface JutsuCard {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly discipline: Discipline;
  readonly element: string | null;
  /** What it does, in order, with each effect's strength. */
  readonly effects: readonly JutsuEffect[];
  readonly chakraCost: number;
  readonly rank: StatGrade;
  /** Known, but a rank above your grade: costlier and liable to misfire until it steadies. */
  readonly unstable: boolean;
  readonly status: 'known' | 'studying' | 'unknown';
  readonly progressPct: number;
}

/** Every technique in the setting: known ones first, then those being studied. */
export function jutsuDeck(state: GameState, ctx: GameContext): readonly JutsuCard[] {
  const order = { known: 0, studying: 1, unknown: 2 } as const;
  // The cost a fight would charge you today: chakra control (and anything weighing on it) counts.
  const you = { attributes: playerCombatant(state, ctx).attributes };
  return ctx.content.techniques.all
    .map((t): JutsuCard => {
      const progress = state.techniques.progress[t.id] ?? 0;
      const known = state.techniques.known.includes(t.id);
      const unstable = state.techniques.unstable.includes(t.id);
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        discipline: t.discipline,
        element: t.element ?? null,
        effects: t.effects.map((e) => ({ verb: e.verb, power: e.power })),
        chakraCost: chakraCost(you, {
          chakraCost: t.chakraCost,
          ...(unstable ? { unstable } : {}),
        }),
        rank: t.rank,
        unstable,
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

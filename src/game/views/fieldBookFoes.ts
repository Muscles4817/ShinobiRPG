import type { EnemyDef } from '@/content';
import { knownWell, type FoeRecord } from '@/systems/collections';

import type { GameContext } from '../context';
import { scoutOpponents, traitNotes } from '../scouting';
import type { GameState } from '../state';
import type { FieldEntry } from './fieldBookEntries';

/**
 * The foes page: every foe you have fought (solid, with what each fight taught you: how it
 * stands against you now, its tricks and their counters once beaten, what it leans on once known
 * well), then foes a bought client's report named that you have yet to meet (dashed).
 */

function foeLines(state: GameState, ctx: GameContext, foe: EnemyDef): string[] {
  const record = state.fieldBook.foes[foe.id];
  const read = scoutOpponents(state, ctx, [foe.id])[foe.id];
  const tricks = (record?.beaten ?? 0) > 0 ? traitNotes(foe.traits ?? []) : [];
  const leansOn = knownWell(record)
    ? foe.techniqueIds.flatMap((id) => ctx.content.techniques.get(id)?.name ?? [])
    : [];
  return [
    foe.description,
    ...(read ? [`${read.threatLabel} now.`] : []),
    ...tricks.map((t) => `${t.label}. ${t.counter}`),
    ...(leansOn.length > 0 ? [`Leans on ${leansOn.join(', ')}.`] : []),
  ];
}

function stampsOf(foe: EnemyDef, record: FoeRecord | undefined): string[] {
  if ((record?.beaten ?? 0) === 0) return [foe.kind, 'Not yet beaten'];
  return knownWell(record) ? [foe.kind, 'Known well'] : [foe.kind];
}

function fought(state: GameState, ctx: GameContext, foe: EnemyDef): FieldEntry {
  const record = state.fieldBook.foes[foe.id];
  const beaten = record?.beaten ?? 0;
  return {
    id: foe.id,
    name: foe.name,
    icon: 'sword',
    found: true,
    lines: foeLines(state, ctx, foe),
    stamps: stampsOf(foe, record),
    chips: [
      { label: `Fought ${record?.fought ?? 0}`, tone: 'info' },
      ...(beaten > 0 ? [{ label: `Beaten ${beaten}`, tone: 'gain' as const }] : []),
    ],
  };
}

/** Foes a bought report named that you have not fought yet, once each. */
function namedInReports(state: GameState, ctx: GameContext): EnemyDef[] {
  return state.board.intel
    .flatMap((missionId) => ctx.content.missions.get(missionId)?.stages ?? [])
    .flatMap((stage) =>
      stage.kind === 'combat' || stage.kind === 'encounter' ? stage.enemyIds : [],
    )
    .filter((id, i, all) => all.indexOf(id) === i && state.fieldBook.foes[id] === undefined)
    .flatMap((id) => ctx.content.enemies.get(id) ?? []);
}

export function foeEntries(state: GameState, ctx: GameContext): FieldEntry[] {
  const met = Object.keys(state.fieldBook.foes).flatMap((id) => ctx.content.enemies.get(id) ?? []);
  const named = namedInReports(state, ctx).map((foe): FieldEntry => ({
    id: foe.id,
    name: foe.name,
    icon: 'sword',
    found: false,
    lines: ['Named in a client’s report. You have yet to meet it.'],
    stamps: [foe.kind],
    chips: [],
  }));
  return [...met.map((foe) => fought(state, ctx, foe)), ...named];
}

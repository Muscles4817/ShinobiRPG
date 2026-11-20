import { splitNarration, type InspectedFighter } from '@/systems/combat';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import type { FightRecord } from './state';

/**
 * The fight record as a file to download and read elsewhere (by a person, or fed to Claude):
 * one JSON document with a short guide to itself, every fighter as they began and ended, the
 * decision log with each choice's reasons, every line of the story both as written and parsed
 * into its parts, and everyone as they stood after each step.
 */

const FORMAT = 'shinobi-fight-record';
const FORMAT_VERSION = 1;

const GUIDE = [
  'A record of one fight in Shinobi RPG, kept as it was fought.',
  'fighters: everyone who stood at the start or the end, with the engine’s whole record of them at each (stats as attributes, techniques, plan, conditions, pools).',
  'decisions: every choice each fighter made, in order, with the rule that chose it and its reasons (versus bouts are traced; other fights may have none).',
  'story: every line in order. "raw" is the line as the engine wrote it, with its ⟦tags⟧; "event" is the same line parsed: who acted, amounts of harm or healing, reactions, pools and statuses after it.',
  'steps: the fight screen after each step (each choice, or the opening): health, chakra, statuses, intents and distances.',
  'field: the rest of the fight’s state at the start and the end (distances, reads, the field, the ground).',
];

interface FighterPair {
  readonly id: string;
  readonly name: string;
  readonly side: string;
  readonly atStart: unknown;
  readonly atEnd: unknown;
}

function fightersOf(record: FightRecord): FighterPair[] {
  const start = record.start?.fighters ?? [];
  const end = record.end?.fighters ?? [];
  const ids = [...new Set([...start, ...end].map((f) => f.id))];
  const find = (list: readonly InspectedFighter[], id: string) => list.find((f) => f.id === id);
  return ids.flatMap((id) => {
    const first = find(start, id) ?? find(end, id);
    if (!first) return [];
    const { name, side } = first;
    return [
      {
        id,
        name,
        side,
        atStart: find(start, id)?.detail ?? null,
        atEnd: find(end, id)?.detail ?? null,
      },
    ];
  });
}

/** The fight record as a document, or null when no fight has been recorded. */
export function fightRecordDocument(state: GameState, ctx: GameContext): unknown {
  const record = state.fightRecord;
  if (!record) return null;
  return {
    format: FORMAT,
    version: FORMAT_VERSION,
    guide: GUIDE,
    pack: ctx.content.packId,
    engine: record.engineId,
    began: record.began,
    finished: !record.open,
    result: record.result,
    fighters: fightersOf(record),
    decisions: (record.end ?? record.start)?.decisions ?? [],
    field: { atStart: record.start?.field ?? null, atEnd: record.end?.field ?? null },
    story: record.lines.map((raw, n) => ({ n, raw, event: splitNarration(raw) })),
    steps: record.steps,
  };
}

/** The record as a file: its name (the fighters and the day) and its text. */
export function fightRecordFile(
  state: GameState,
  ctx: GameContext,
): { readonly name: string; readonly text: string } | null {
  const document = fightRecordDocument(state, ctx);
  const record = state.fightRecord;
  if (!document || !record) return null;
  // Named for those who stood as it began: clones and summons come later.
  const names = (record.start?.fighters ?? [])
    .map((f) => f.name)
    .slice(0, 4)
    .join('-vs-');
  const slug =
    names
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'fight';
  return { name: `fight-${slug}.json`, text: JSON.stringify(document, null, 2) };
}

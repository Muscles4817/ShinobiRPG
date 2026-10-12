import { CONTENT_PACKS } from '@/content';
import type { Stats } from '@/systems/stats';
import { unstableFor } from '@/systems/techniques';

/** The technique-rank step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

function asStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

/**
 * v20 → v21: techniques have ranks. Everything already known stays known, but a technique
 * ranked above the character's grade in its discipline becomes unstable until they grow into it.
 */
export function v20ToV21(state: RawState): RawState {
  const pack = CONTENT_PACKS.find((p) => p.id === state.packId);
  const techniques = asRecord(state.techniques);
  // Trust boundary: a v19 character's stats are a full stat line (v16 added the last, reserves).
  const stats = asRecord(asRecord(state.character).stats) as unknown as Stats;
  const known = asStrings(techniques.known);
  const unstable = pack
    ? unstableFor(known, stats, (id) => pack.techniques.find((t) => t.id === id))
    : [];
  return { ...state, techniques: { ...techniques, unstable } };
}

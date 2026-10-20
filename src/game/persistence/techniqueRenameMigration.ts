import { CONTENT_PACKS } from '@/content';
import { renameInBook, type TechniqueBook, type TechniqueRenames } from '@/systems/techniques';

/** The technique-merge step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

function asStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function asNumbers(value: unknown): Record<string, number> {
  return Object.fromEntries(
    Object.entries(asRecord(value)).filter(
      (entry): entry is [string, number] => typeof entry[1] === 'number',
    ),
  );
}

function bookOf(value: unknown): TechniqueBook {
  const raw = asRecord(value);
  return {
    known: asStrings(raw.known),
    progress: asNumbers(raw.progress),
    unstable: asStrings(raw.unstable),
    repertoire: Array.isArray(raw.repertoire) ? asStrings(raw.repertoire) : null,
    chains: Array.isArray(raw.chains) ? raw.chains.map(asStrings) : null,
  };
}

function renamedScrolls(value: unknown, renames: TechniqueRenames): RawState {
  return Object.fromEntries(
    Object.entries(asRecord(value)).map(([id, v]) => [renames[id] ?? id, v]),
  );
}

/**
 * v38 → v39: the save's pack merged some techniques into others (`renamedTechniques`), so what
 * was known, studied or owned as a scroll under an old id moves to the id it became. A later
 * merge needs a step of its own: this one has already run on saves past v39.
 */
export function v38ToV39(state: RawState): RawState {
  const pack = CONTENT_PACKS.find((p) => p.id === state.packId);
  const renames = pack?.renamedTechniques ?? {};
  if (Object.keys(renames).length === 0) return state;
  const inventory = asRecord(state.inventory);
  return {
    ...state,
    techniques: renameInBook(bookOf(state.techniques), renames),
    inventory: { ...inventory, scrolls: renamedScrolls(inventory.scrolls, renames) },
  };
}

/**
 * Save migrations, keyed by the version being migrated *from*. Each step takes the raw
 * state object of one version and returns the next version's shape. Never edit a step
 * once released; add a new one instead.
 */
type RawState = Record<string, unknown>;
export type Migration = (state: RawState) => RawState;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? (value as unknown[]) : [];
}

/**
 * v1 → v2: content packs, locations, housing and result cards arrive.
 * Every v1 save was played in the original setting, in Tōrōgakure.
 */
function v1ToV2(state: RawState): RawState {
  const character = asRecord(state.character);
  const time = asRecord(state.time);
  const day = typeof time.day === 'number' ? time.day : 1;
  const journal = asRecord(state.journal);
  const mission = state.mission === null ? null : asRecord(state.mission);
  return {
    ...state,
    packId: 'original',
    locationId: 'torogakure',
    character: { ...character, startingStats: character.stats },
    housing: { placeId: 'home', rentPerWeek: 30, paidThroughDay: day + 6 },
    reports: [],
    journal: {
      ...journal,
      entries: asArray(journal.entries).map((e) => ({ slot: 0, ...asRecord(e) })),
    },
    mission: mission && {
      ...mission,
      notes: asArray(mission.notes).map((text) => ({ kind: 'story', text: String(text) })),
    },
  };
}

export const MIGRATIONS: Readonly<Record<number, Migration>> = { 1: v1ToV2 };

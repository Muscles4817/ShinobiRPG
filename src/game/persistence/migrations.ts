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

const DISCIPLINE_IDS = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'];

/** New disciplines start at the base value for characters made before they existed. */
function withNewDisciplines(stats: unknown): RawState {
  return { kenjutsu: 5, fuuinjutsu: 5, ...asRecord(stats) };
}

/**
 * v2 → v3: the full character profile (clan, grades, nature, traits, talent, nindō,
 * appearance) and two new disciplines. Old characters become clanless, with their old
 * gift as their A-grade specialty.
 */
function v2ToV3(state: RawState): RawState {
  const character = asRecord(state.character);
  const { aptitudeId, ...rest } = character;
  const specialty = typeof aptitudeId === 'string' ? aptitudeId : 'taijutsu';
  const grades = Object.fromEntries(DISCIPLINE_IDS.map((d) => [d, d === specialty ? 'A' : 'C']));
  return {
    ...state,
    character: {
      ...rest,
      familyName: '',
      pronouns: 'they',
      appearance: {
        hairStyle: 'spiky',
        hairColour: '#4a2f1d',
        eyeColour: '#2a1d14',
        skinTone: '#e2b48c',
        outfitColour: '#e8823a',
        headband: 'forehead',
      },
      clanId: 'none',
      grades,
      nature: 'fire',
      traitIds: [],
      talentId: null,
      nindoId: null,
      breakIn: { approachId: 'none', succeeded: true },
      stats: withNewDisciplines(character.stats),
      startingStats: withNewDisciplines(character.startingStats),
    },
  };
}

/**
 * v3 → v4: people and bonds. Existing characters have no classmates yet; teams are read
 * out the next time they are free, exactly as for a new character.
 */
function v3ToV4(state: RawState): RawState {
  return { ...state, people: { generated: [], bonds: {}, team: null, conversation: null } };
}

/** v4 → v5: weekly sensei lessons and sparring. Nobody has had a lesson yet. */
function v4ToV5(state: RawState): RawState {
  const people = asRecord(state.people);
  const team =
    typeof people.team === 'object' && people.team !== null
      ? { ...asRecord(people.team), lastLessonDay: null }
      : null;
  return { ...state, people: { ...people, team, sparringWith: null } };
}

/** v5 → v6: per-save settings, starting with the fight style (the classic engine). */
function v5ToV6(state: RawState): RawState {
  return { ...state, settings: { combatStyle: 'duel-v1' } };
}

/** v6 → v7: the rotating jobs board, seeded from the save's dice so it differs per save. */
function v6ToV7(state: RawState): RawState {
  const seed = typeof state.rngState === 'number' ? state.rngState : 1;
  return { ...state, board: { seed, refreshedDay: 0, postings: [], lastTaken: {} } };
}

/** v7 → v8: inventory (gear and pantry) and today's home-cooked meal. */
function v7ToV8(state: RawState): RawState {
  const character = asRecord(state.character);
  return {
    ...state,
    character: { ...character, meal: null },
    inventory: { gear: [], equipped: {}, pantry: {} },
  };
}

/** v8 → v9: fight plans remembered between fights; nothing remembered yet. */
function v8ToV9(state: RawState): RawState {
  return { ...state, settings: { ...asRecord(state.settings), combatPlans: {} } };
}

/** v9 → v10: village life; no spirit followed yet. */
function v9ToV10(state: RawState): RawState {
  return { ...state, village: { lastSightDay: null } };
}

/** v10 → v11: izakaya rounds; none bought yet. */
function v10ToV11(state: RawState): RawState {
  return { ...state, village: { ...asRecord(state.village), lastRoundDay: null } };
}

export const MIGRATIONS: Readonly<Record<number, Migration>> = {
  1: v1ToV2,
  2: v2ToV3,
  3: v3ToV4,
  4: v4ToV5,
  5: v5ToV6,
  6: v6ToV7,
  7: v7ToV8,
  8: v8ToV9,
  9: v9ToV10,
  10: v10ToV11,
};

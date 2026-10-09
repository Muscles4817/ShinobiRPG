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

export const MIGRATIONS: Readonly<Record<number, Migration>> = {
  1: v1ToV2,
  2: v2ToV3,
  3: v3ToV4,
};

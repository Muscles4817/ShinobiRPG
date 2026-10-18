/** The companions' step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/**
 * v49 → v50: companions arrive. Nobody has one yet, and nobody is befriending a stray; a clan
 * child of an older save meets no pup (they grew up before companions were kept).
 */
export function v49ToV50(state: RawState): RawState {
  return { ...state, companions: { owned: {}, befriending: null, strayed: null, medicine: 0 } };
}

/** Days of growing an animal of an older save is given: more than any kind needs to be grown. */
const GROWN_UP_DAYS = 1000;

function grownUp(companion: unknown): unknown {
  if (typeof companion !== 'object' || companion === null) return companion;
  // A companion record of the previous shape (a trust boundary: the save is untyped).
  const old = companion as Record<string, unknown>;
  return { ...old, grownDays: GROWN_UP_DAYS, lastTrainedDay: null, lastCaredDay: old.lastFedDay };
}

/**
 * v50 → v51: companions grow up. Every companion already kept is grown (its body catches up to
 * its kind's on the next morning, so nothing it has is lost), has not been trained today and was
 * last cared for when it was last fed. Wild tracking gets its own record, and nothing rescued is
 * waiting at the clinic yet.
 */
export function v50ToV51(state: RawState): RawState {
  // The companions slice of the previous shape (a trust boundary: the save is untyped).
  const companions = (state.companions ?? {}) as Record<string, unknown>;
  const owned = (companions.owned ?? {}) as Record<string, unknown>;
  return {
    ...state,
    companions: {
      ...companions,
      owned: Object.fromEntries(Object.entries(owned).map(([id, c]) => [id, grownUp(c)])),
      strayed: grownUp(companions.strayed ?? null),
      tracking: null,
      waiting: null,
    },
  };
}

function withLearned(companion: unknown): unknown {
  if (typeof companion !== 'object' || companion === null) return companion;
  return { ...companion, learned: [] };
}

/**
 * v51 → v52: what the bond opens. No companion has been taught anything by a handler yet, and
 * nobody has read any handling lore.
 */
export function v51ToV52(state: RawState): RawState {
  // The companions slice of the previous shape (a trust boundary: the save is untyped).
  const companions = (state.companions ?? {}) as Record<string, unknown>;
  const owned = (companions.owned ?? {}) as Record<string, unknown>;
  return {
    ...state,
    companions: {
      ...companions,
      owned: Object.fromEntries(Object.entries(owned).map(([id, c]) => [id, withLearned(c)])),
      strayed: withLearned(companions.strayed ?? null),
      waiting: withLearned(companions.waiting ?? null),
      lore: [],
    },
  };
}

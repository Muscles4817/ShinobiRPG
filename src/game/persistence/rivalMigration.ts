/** The rival's step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/** v44 → v45: a rival from the year. An older save has none yet; one is chosen as play goes on. */
export function v44ToV45(state: RawState): RawState {
  return { ...state, rival: state.rival ?? null };
}

/**
 * v45 → v46: races, provocations and stakes. A rival already chosen has run no races, been
 * needled into nothing, and any challenge standing was to a spar.
 */
export function v45ToV46(state: RawState): RawState {
  // An older save, read as it was written: a trust boundary.
  const rival = state.rival as RawState | null | undefined;
  if (!rival) return { ...state, rival: null };
  const challenge = rival.challenge as RawState | null | undefined;
  return {
    ...state,
    rival: {
      ...rival,
      races: rival.races ?? { you: 0, them: 0 },
      lastProvocationDay: rival.lastProvocationDay ?? rival.lastChallengeDay ?? 0,
      rattled: rival.rattled ?? false,
      sparStakes: rival.sparStakes ?? null,
      race: rival.race ?? null,
      challenge: challenge ? { contest: 'spar', ...challenge } : null,
    },
  };
}

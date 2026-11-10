/** Your puppets' step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/** v70 → v71: puppets of your own arrive. Nobody owns one yet, and nobody has any craft. */
export function v70ToV71(state: RawState): RawState {
  return { ...state, puppetry: { puppets: [], craft: 0 } };
}

/** v71 → v72: puppets are built at the bench. Each keeps its id, and you have no stock yet. */
export function v71ToV72(state: RawState): RawState {
  const old = (state.puppetry ?? {}) as { puppets?: unknown; craft?: unknown };
  // A v71 save's puppets are exactly `{ frameId, name, condition }` (written by `withPuppet`).
  const puppets = (Array.isArray(old.puppets) ? old.puppets : []) as {
    frameId: string;
    name: string;
    condition: number;
  }[];
  return {
    ...state,
    puppetry: {
      puppets: puppets.map(({ frameId, name, condition }) => ({ id: frameId, name, condition })),
      craft: typeof old.craft === 'number' ? old.craft : 0,
      stock: {},
      build: null,
      nextId: 1,
    },
  };
}

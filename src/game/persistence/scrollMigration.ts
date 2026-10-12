type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/** v22 → v23: technique scrolls can be owned; nobody has any yet. */
export function v22ToV23(state: RawState): RawState {
  const inventory = asRecord(state.inventory);
  return { ...state, inventory: { ...inventory, scrolls: asRecord(inventory.scrolls) } };
}

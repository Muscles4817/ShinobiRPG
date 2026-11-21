/** The purse's step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/** How a v72 save wrote ryo changing hands on a chip: "−12 ryo", "+240 ryo", "−30 ryo passage". */
const OLD_RYO_LABEL = /^([+−-])(\d+) ryo( passage)?$/;

interface RawChip {
  readonly label?: unknown;
  readonly ryo?: unknown;
}

function withAmount(chip: RawChip): RawChip {
  if (typeof chip.label !== 'string' || chip.ryo !== undefined) return chip;
  const found = OLD_RYO_LABEL.exec(chip.label);
  if (!found) return chip;
  const amount = Number(found[2]);
  return { ...chip, ryo: found[1] === '+' ? amount : -amount };
}

/**
 * v72 → v73: a chip for ryo carries the amount it moved, and the day's purse adds that up. The
 * record's older chips said it only in words; this reads them once, here, so nothing else does.
 */
export function v72ToV73(state: RawState): RawState {
  const journal = (state.journal ?? {}) as { entries?: unknown };
  if (!Array.isArray(journal.entries)) return state;
  const entries = (journal.entries as { chips?: unknown }[]).map((entry) =>
    Array.isArray(entry.chips)
      ? { ...entry, chips: (entry.chips as RawChip[]).map(withAmount) }
      : entry,
  );
  return { ...state, journal: { ...journal, entries } };
}

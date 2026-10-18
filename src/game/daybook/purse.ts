import type { JournalEntry } from '@/systems/journal';

import type { PurseLine } from './state';

/**
 * Where the day's ryo went, read back from the record: every entry that moved ryo carries a
 * chip for it ("−12 ryo", "+240 ryo"). Lines with the same name are added up, and anything the
 * entries don't account for is set down as "Odds and ends", so the lines always add up to the change.
 */

const RYO_CHIP = /^([+−-])(\d+) ryo$/;
const OTHER = 'Odds and ends';

function ryoIn(entry: JournalEntry): number {
  return (entry.chips ?? []).reduce((sum, c) => {
    const found = RYO_CHIP.exec(c.label);
    if (!found) return sum;
    const amount = Number(found[2]);
    return sum + (found[1] === '+' ? amount : -amount);
  }, 0);
}

function labelOf(entry: JournalEntry, amount: number): string {
  return entry.heading ?? (amount > 0 ? 'Earned' : 'Spent');
}

/** The day's ryo, line by line: `entries` are the day's, `change` what the purse moved by. */
export function purseLines(entries: readonly JournalEntry[], change: number): PurseLine[] {
  const totals = new Map<string, number>();
  for (const entry of entries) {
    const amount = ryoIn(entry);
    if (amount === 0) continue;
    const label = labelOf(entry, amount);
    totals.set(label, (totals.get(label) ?? 0) + amount);
  }
  const lines = [...totals].map(([label, amount]) => ({ label, amount }));
  const unexplained = change - lines.reduce((sum, l) => sum + l.amount, 0);
  return unexplained === 0 ? lines : [...lines, { label: OTHER, amount: unexplained }];
}

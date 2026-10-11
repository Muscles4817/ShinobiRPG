/**
 * The fight log as the screen shows it: round markers set apart, and each line's damage or
 * healing taken out of the sentence into a chip, since story text never shows numbers.
 */
import { splitNarration, type NarrationAmount } from '@/systems/combat';
import type { JournalChip } from '@/systems/journal';

/** Engines mark a new round with a line like "— Round 3 —". */
const ROUND_MARK = '—';

export type CombatLogLine =
  | { readonly kind: 'round'; readonly text: string }
  | { readonly kind: 'story'; readonly text: string; readonly chips: readonly JournalChip[] };

function chipFor({ kind, amount }: NarrationAmount): JournalChip {
  return kind === 'harm'
    ? { label: `−${amount}`, tone: 'harm' }
    : { label: `+${amount}`, tone: 'gain' };
}

export function combatLog(log: readonly string[]): CombatLogLine[] {
  return log.map((line): CombatLogLine => {
    if (line.startsWith(ROUND_MARK)) {
      return { kind: 'round', text: line.replaceAll(ROUND_MARK, '').trim() };
    }
    const { text, amounts } = splitNarration(line);
    return { kind: 'story', text, chips: amounts.map(chipFor) };
  });
}

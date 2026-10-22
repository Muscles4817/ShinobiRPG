/**
 * The fight log as the screen shows it: round markers set apart, and each line's damage or
 * healing taken out of the sentence into a chip, since story text never shows numbers. A
 * defence that reacted (Dodge, Guard, Counter, a substitution) gets a stamp of its own, so
 * the player sees it working whoever acted first in the exchange.
 */
import { splitNarration, type NarrationAmount, type NarrationReaction } from '@/systems/combat';
import type { JournalChip } from '@/systems/journal';

/** Engines mark a new round with a line like "— Round 3 —". */
const ROUND_MARK = '—';

export type CombatLogLine =
  | { readonly kind: 'round'; readonly text: string }
  | { readonly kind: 'story'; readonly text: string; readonly chips: readonly JournalChip[] };

const REACTION_LABEL: Readonly<Record<NarrationReaction, string>> = {
  dodged: 'Dodged',
  'dodge-missed': 'Dodge missed',
  guarded: 'Guarded',
  'guard-broken': 'Guard broken',
  countered: 'Countered',
  swapped: 'Swapped out',
  shielded: 'Shielded',
};

function reactionChip(reaction: NarrationReaction): JournalChip {
  return { label: REACTION_LABEL[reaction], tone: 'info' };
}

function chipFor({ kind, amount }: NarrationAmount): JournalChip {
  return kind === 'harm'
    ? { label: `−${amount}`, tone: 'harm' }
    : { label: `+${amount}`, tone: 'gain' };
}

export function combatLog(log: readonly string[]): CombatLogLine[] {
  return log.map((line): CombatLogLine => {
    const { text, amounts, reactions } = splitNarration(line);
    if (line.startsWith(ROUND_MARK)) {
      // A divider may carry markers too (where everyone's chakra stands), kept out of sight.
      return { kind: 'round', text: text.replaceAll(ROUND_MARK, '').trim() };
    }
    return {
      kind: 'story',
      text,
      chips: [...reactions.map(reactionChip), ...amounts.map(chipFor)],
    };
  });
}

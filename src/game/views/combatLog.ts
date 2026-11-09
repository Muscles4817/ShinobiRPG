/**
 * The fight log as the screen shows it: round markers set apart, and each line's damage or
 * healing taken out of the sentence into a chip, since story text never shows numbers. A
 * defence that reacted (Dodge, Guard, Counter, a substitution) gets a stamp of its own, so
 * the player sees it working whoever acted first in the exchange, and so does a turn of the
 * player's that played something they never slotted, with why.
 */
import {
  splitNarration,
  type NarrationAmount,
  type NarrationOffPlan,
  type NarrationReaction,
} from '@/systems/combat';
import type { JournalChip } from '@/systems/journal';

/** Engines mark a new round with a line like "— Round 3 —". */
const ROUND_MARK = '—';

export type CombatLogLine =
  | { readonly kind: 'round'; readonly text: string }
  | { readonly kind: 'story'; readonly text: string; readonly chips: readonly JournalChip[] };

export const REACTION_LABEL: Readonly<Record<NarrationReaction, string>> = {
  dodged: 'Dodged',
  missed: 'Missed',
  'dodge-missed': 'Dodge missed',
  guarded: 'Guarded',
  'guard-broken': 'Guard broken',
  countered: 'Countered',
  swapped: 'Swapped out',
  shielded: 'Shielded',
};

export const OFF_PLAN_LABEL: Readonly<Record<NarrationOffPlan, string>> = {
  improvised: 'Off plan: nothing slotted fit',
  looking: 'Off plan: no one in sight',
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
    const { text, amounts, reactions, offPlan } = splitNarration(line);
    if (line.startsWith(ROUND_MARK)) {
      // A divider may carry markers too (where everyone's chakra stands), kept out of sight.
      return { kind: 'round', text: text.replaceAll(ROUND_MARK, '').trim() };
    }
    return {
      kind: 'story',
      text,
      chips: [
        ...(offPlan ? [{ label: OFF_PLAN_LABEL[offPlan], tone: 'info' as const }] : []),
        ...reactions.map(reactionChip),
        ...amounts.map(chipFor),
      ],
    };
  });
}

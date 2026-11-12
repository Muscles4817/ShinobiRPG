/**
 * The fight log as the screen shows it: round markers set apart, and each line's damage or
 * healing taken out of the sentence into a chip, since story text never shows numbers. A
 * defence that reacted (Dodge, Guard, Counter, a substitution) gets a stamp of its own, so
 * the player sees it working whoever acted first in the exchange, and so does a turn of the
 * player's that played something they never slotted, with why. A miss, a hold that didn't take
 * and a failed step carry their cause as a stamp too.
 */
import {
  splitNarration,
  type NarrationAmount,
  type NarrationCause,
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

/** Why it went as it did (`rules/causes.ts`), as a stamp beside the reaction's: words, never odds. */
export const CAUSE_LABEL: Readonly<Record<NarrationCause, string>> = {
  'saw-through': 'Saw through it',
  foresaw: 'Foreseen',
  evading: 'Evading',
  'dodge-ready': 'Dodge ready',
  familiar: 'Seen it before',
  wild: 'Wild',
  quicker: 'Too quick for it',
  'read-it': 'Read it coming',
  slipped: 'Got lucky',
  braced: 'Braced',
  resisted: 'Resisted',
  held: 'Held fast',
  'no-room': 'No room',
  outpaced: 'Outpaced',
  'cut-off': 'Cut off',
  'kept-pace': 'Kept pace',
  'held-off': 'Held off',
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
    const { text, amounts, reactions, offPlan, cause } = splitNarration(line);
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
        ...(cause ? [{ label: CAUSE_LABEL[cause], tone: 'info' as const }] : []),
        ...amounts.map(chipFor),
      ],
    };
  });
}

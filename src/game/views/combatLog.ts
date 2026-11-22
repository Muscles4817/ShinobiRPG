/**
 * The fight's story as the screen shows it: dividers between exchanges and rounds set apart, and
 * each line's damage or healing as a chip beside it, since story text never shows numbers. A
 * defence that reacted (Dodge, Guard, Counter, a substitution) gets a stamp of its own, so the
 * player sees it working whoever acted first in the exchange, and so does a turn of the player's
 * that played something they never slotted, with why. A miss, a hold that didn't take and a
 * failed step carry their cause as a stamp too. Everything is read from the told events' fields.
 */
import {
  toldIn,
  type CombatEvent,
  type NarrationAmount,
  type NarrationCause,
  type NarrationOffPlan,
  type NarrationReaction,
  type ToldEvent,
} from '@/systems/combat';
import type { JournalChip } from '@/systems/journal';

/** Dividers read "— Second exchange —": the dashes are the screen's to draw. */
const DIVIDER_DASH = '—';

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

/** Why it went as it did (`storyContract.ts`), as a stamp beside the reaction's: words, never odds. */
export const CAUSE_LABEL: Readonly<Record<NarrationCause, string>> = {
  'saw-through': 'Saw through it',
  foresaw: 'Foreseen',
  evading: 'Evading',
  'dodge-ready': 'Dodge ready',
  familiar: 'Seen it before',
  wild: 'Wild',
  quicker: 'Too quick for it',
  'read-it': 'Read it coming',
  'ready-for-it': 'Ready for it',
  blinded: 'Couldn’t see to aim',
  'small-target': 'Too small to hit',
  slipped: 'Got lucky',
  braced: 'Braced',
  resisted: 'Resisted',
  held: 'Held fast',
  'no-room': 'No room',
  outpaced: 'Outpaced',
  'cut-off': 'Cut off',
  'kept-pace': 'Kept pace',
  'held-off': 'Held off',
  crowded: 'No room for the seals',
  teleport: 'Teleported, no turn spent',
};

function chipFor({ kind, amount }: NarrationAmount): JournalChip {
  return kind === 'harm'
    ? { label: `−${amount}`, tone: 'harm' }
    : { label: `+${amount}`, tone: 'gain' };
}

/** The stamps and chips beside a line: off plan, the defences, the cause, then the amounts. */
function chipsOf(told: ToldEvent): JournalChip[] {
  return [
    ...(told.offPlan ? [{ label: OFF_PLAN_LABEL[told.offPlan], tone: 'info' as const }] : []),
    ...(told.reactions ?? []).map((r): JournalChip => ({
      label: REACTION_LABEL[r.reaction],
      tone: 'info',
    })),
    ...(told.cause ? [{ label: CAUSE_LABEL[told.cause.cause], tone: 'info' as const }] : []),
    ...(told.amounts ?? []).map(chipFor),
  ];
}

/** One told line as the screen shows it. */
export function shownLine(told: ToldEvent): CombatLogLine {
  if (told.divider) {
    return { kind: 'round', text: told.text.replaceAll(DIVIDER_DASH, '').trim() };
  }
  return { kind: 'story', text: told.text, chips: chipsOf(told) };
}

/** The story's lines as the screen shows them (its other events move the bars, not the log). */
export function combatLog(story: readonly CombatEvent[]): CombatLogLine[] {
  return toldIn(story).map(shownLine);
}

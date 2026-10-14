import type { EffectLine } from '@/systems/modifiers';
import { ARCHETYPE_IDS, archetypeOffered, type ArchetypeId, type Gift } from '@/systems/profile';
import { STAT_IDS, STAT_INFO, statTier } from '@/systems/stats';

import type { GameContext } from '../context';
import { profileOf, type CreationDraft } from '../creation';
import { filledFile } from '../creationDraft';
import { graduationStats, studentOf } from '../student';

/**
 * The quick picks on the training record, each with what it would give this student: the stats
 * it brings to D or better, its gifts and its flaw. Picking one is then a choice, not a guess.
 */

/** Stats named on a quick pick's card, strongest first. */
const SHOWN_STATS = 4;

const GIFT_WORDS: Readonly<Record<Gift, string>> = {
  gifted: 'Gifted in',
  prodigy: 'A prodigy in',
  flawed: 'Weak in',
};

export interface QuickPickOption {
  readonly id: ArchetypeId;
  readonly offered: boolean;
  /** What it gives this student; empty when it isn't offered. */
  readonly effects: readonly EffectLine[];
}

function preview(draft: CreationDraft, id: ArchetypeId, ctx: GameContext): EffectLine[] {
  const pick = { archetype: id, specialty: draft.quickPick?.specialty ?? 'taijutsu' } as const;
  const file = filledFile(draft, pick, ctx);
  const stats = graduationStats(profileOf({ ...draft, file }), ctx);
  const strong = STAT_IDS.filter((s) => statTier(stats[s]).grade !== 'E')
    .sort((a, b) => stats[b] - stats[a])
    .slice(0, SHOWN_STATS)
    .map((s): EffectLine => ({
      label: `${STAT_INFO[s].label} ${statTier(stats[s]).grade}`,
      tone: 'gain',
    }));
  const gifts = STAT_IDS.flatMap((s): EffectLine[] => {
    const gift = file.gifts[s];
    if (!gift) return [];
    const label = `${GIFT_WORDS[gift]} ${STAT_INFO[s].label.toLowerCase()}`;
    return [{ label, tone: gift === 'flawed' ? 'cost' : 'gain' }];
  });
  return [...strong, ...gifts];
}

export function quickPickOptions(draft: CreationDraft, ctx: GameContext): QuickPickOption[] {
  const known =
    ctx.content.clans.get(draft.clanId) && ctx.content.upbringings.get(draft.upbringingId);
  const student = known ? studentOf(draft, ctx) : null;
  return ARCHETYPE_IDS.map((id) => {
    const offered = student !== null && archetypeOffered(id, student);
    return { id, offered, effects: offered ? preview(draft, id, ctx) : [] };
  });
}

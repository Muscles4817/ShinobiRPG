import { fillSlots } from '@/core';
import { RANK_LABELS } from '@/systems/standing';
import { STAT_INFO, statTier } from '@/systems/stats';
import { DISCIPLINES } from '@/systems/techniques';

import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import { senseiOf } from '../exam/entry';
import { chuninVest } from '../exam/vest';
import type { Ceremony } from '../exam/state';
import { unlocksFor, type Unlock } from '../exam/unlocks';
import { personSlots } from '../people/pronouns';
import { farewellDue } from '../sensei/farewell';
import type { GameState } from '../state';

/** The promotion ceremony: the setting's words, the new title, what you're handed and what opens. */

export interface PromotionScene {
  /** "Chūnin". */
  readonly rank: string;
  /** The full title you will carry: "Chūnin Kaito Mori". */
  readonly title: string;
  readonly heading: string;
  readonly speech: string;
  readonly gift: string;
  /** The gear handed over, if any (the flak vest at chūnin). */
  readonly gear: string | null;
  /** What a nomination read back from your record, as chips; empty for other routes. */
  readonly record: readonly string[];
  /** "What a chūnin may do": the heading over what the rank opens. */
  readonly means: string;
  readonly unlocks: readonly Unlock[];
  /** Your sensei's parting words, at the end of the genin years; null otherwise. */
  readonly farewell: string | null;
  readonly accept: GameAction;
}

function fill(text: string, state: GameState, ctx: GameContext): string {
  return text
    .replaceAll('{you}', state.character.name)
    .replaceAll('{leader}', ctx.content.text.leaderTitle);
}

/**
 * What is said to you: the rank's own speech after the exam or a nomination, or, raised another
 * way, why you are being raised (the job, the arc's patron, your sensei's letter).
 */
function speechFor(ceremony: Ceremony, state: GameState, ctx: GameContext): string {
  const { text } = ctx.content;
  switch (ceremony.route) {
    case 'exam':
    case 'nomination':
      return text.promotions[ceremony.rank].speech;
    case 'field':
      return text.promotionRoutes.field.replaceAll(
        '{job}',
        ctx.content.missions.require(ceremony.missionId).title,
      );
    case 'arc':
      return (
        ctx.content.arcs.require(ceremony.arcId).recommends?.words ??
        text.promotions[ceremony.rank].speech
      );
    case 'sensei': {
      const sensei = senseiOf(state, ctx);
      const said = text.promotionRoutes.sensei;
      return fillSlots(said, sensei ? personSlots('sensei', sensei) : { sensei: '' });
    }
  }
}

/** The record a jōnin's nomination reads back: senior jobs, the best art, the village's regard. */
function nominationRecord(state: GameState): string[] {
  const { stats } = state.character;
  const best = DISCIPLINES.reduce((a, b) => (stats[b] > stats[a] ? b : a));
  const { seniorMissionsCompleted, reputation } = state.standing;
  return [
    `${seniorMissionsCompleted} B- and A-rank jobs`,
    `${STAT_INFO[best].label} at ${statTier(stats[best]).grade}`,
    `${reputation} reputation`,
  ];
}

export function promotionScene(state: GameState, ctx: GameContext): PromotionScene | null {
  const ceremony = state.exams.ceremony;
  if (!ceremony) return null;
  const words = ctx.content.text.promotions[ceremony.rank];
  const rank = RANK_LABELS[ceremony.rank];
  const { name, familyName } = state.character;
  return {
    rank,
    title: `${rank} ${name}${familyName ? ` ${familyName}` : ''}`,
    heading: fill(words.title, state, ctx),
    speech: fill(speechFor(ceremony, state, ctx), state, ctx),
    gift: fill(words.gift, state, ctx),
    gear: ceremony.rank === 'chunin' ? (chuninVest(ctx)?.name ?? null) : null,
    record: ceremony.route === 'nomination' ? nominationRecord(state) : [],
    means: `What a ${rank.toLowerCase()} may do`,
    unlocks: unlocksFor(state, ctx, ceremony.rank),
    farewell: farewellDue(state, ctx)?.words ?? null,
    accept: { type: 'acceptPromotion' },
  };
}

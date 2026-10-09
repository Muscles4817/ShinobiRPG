import type { Rng } from '@/core';
import type { ConversationDef, PersonDef } from '@/content';
import { stageOf } from '@/systems/bonds';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { bondOf } from './cast';

/**
 * Choosing what someone says. Their own lines come first, then small talk they haven't
 * used on you yet; once everything has been said, anything fitting your stage may repeat.
 */
export function pickConversation(
  state: GameState,
  ctx: GameContext,
  person: PersonDef,
  rng: Rng,
): ConversationDef {
  const bond = bondOf(state, person.id);
  const stage = stageOf(bond.points);
  const eligible = ctx.content.conversations.all.filter(
    (c) => (c.personId === undefined || c.personId === person.id) && c.minStage <= stage,
  );
  const unheard = eligible.filter((c) => !bond.heard.includes(c.id));
  const own = unheard.filter((c) => c.personId === person.id);
  if (own.length > 0) return rng.pick(own);
  return rng.pick(unheard.length > 0 ? unheard : eligible);
}

/** Replaces `{you}` and `{them}` in authored lines. */
export function fillNames(text: string, names: { you: string; them: string }): string {
  return text.replaceAll('{you}', names.you).replaceAll('{them}', names.them);
}

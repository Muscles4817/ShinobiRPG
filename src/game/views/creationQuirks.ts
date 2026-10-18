import { listed, capitalise } from '@/core';
import type { GameContext } from '../context';
import type { CreationDraft } from '../creation';

/**
 * The habits page of the academy file: every quirk, free and as many as fit, each saying whose
 * traits warm to it and whose don't (`people/warmth.ts`), in words.
 */

export interface QuirkCard {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly warms: string | null;
  readonly cools: string | null;
  readonly selected: boolean;
}

/** "Calm and lazy". */
export function traitNames(ids: readonly string[], ctx: GameContext): string | null {
  const names = ids.flatMap((id) => ctx.content.traits.get(id)?.name.toLowerCase() ?? []);
  if (names.length === 0) return null;
  return capitalise(listed(names));
}

export function quirkCards(draft: CreationDraft, ctx: GameContext): QuirkCard[] {
  return ctx.content.quirks.all.map((q) => {
    const warms = traitNames(q.warms, ctx);
    const cools = traitNames(q.cools, ctx);
    return {
      id: q.id,
      name: q.name,
      description: q.description,
      warms: warms && `${warms} people warm to you faster.`,
      cools: cools && `${cools} people, more slowly.`,
      selected: draft.quirkIds.includes(q.id),
    };
  });
}

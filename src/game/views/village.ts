import type { GameContext } from '../context';
import type { GameState } from '../state';
import { festivalNotice, hasSight, rumoursToday, sightTonight } from '../village';
import { choice, type Choice } from './common';

/** The village's mood today: a festival, the gossip, and what walks the streets at night. */

export interface FestivalBanner {
  readonly name: string;
  readonly description: string;
  /** "Today", "Tomorrow" or "In 3 days". */
  readonly when: string;
  readonly today: boolean;
  /** What the day changes, as chips. */
  readonly perks: readonly string[];
}

export type NightSight =
  | {
      readonly kind: 'seen';
      readonly title: string;
      readonly text: string;
      readonly follow: Choice;
    }
  | { readonly kind: 'unseen'; readonly text: string };

export interface VillageView {
  readonly festival: FestivalBanner | null;
  readonly rumours: readonly string[];
  readonly night: NightSight | null;
}

function whenLabel(daysAway: number): string {
  if (daysAway === 0) return 'Today';
  return daysAway === 1 ? 'Tomorrow' : `In ${daysAway} days`;
}

function banner(state: GameState, ctx: GameContext): FestivalBanner | null {
  const notice = festivalNotice(state, ctx);
  if (!notice) return null;
  const { festival, daysAway } = notice;
  const discount = Math.round((1 - festival.marketPrices) * 100);
  return {
    name: festival.name,
    description: festival.description,
    when: whenLabel(daysAway),
    today: daysAway === 0,
    perks: [
      ...(discount > 0 ? [`Market −${discount}%`] : []),
      ...(festival.bondBonus > 0 ? [`Bonds +${festival.bondBonus} per talk`] : []),
    ],
  };
}

function night(state: GameState, ctx: GameContext): NightSight | null {
  const sight = sightTonight(state, ctx);
  if (!sight) return null;
  if (!hasSight(state, ctx)) return { kind: 'unseen', text: sight.unseen };
  return {
    kind: 'seen',
    title: sight.title,
    text: sight.text,
    follow: choice(state, ctx, { type: 'followSight' }),
  };
}

export function villageView(state: GameState, ctx: GameContext): VillageView {
  return {
    festival: banner(state, ctx),
    rumours: rumoursToday(state, ctx).map((r) => r.text),
    night: night(state, ctx),
  };
}

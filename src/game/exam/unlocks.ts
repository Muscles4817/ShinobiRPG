import type { PromotedRank } from '@/content';
import { listed } from '@/core';
import { lowestRankFor } from '@/systems/missions';

import type { GameContext } from '../context';
import { jobOf } from '../crew';
import { gearRankBlocker } from '../gear';
import { currentLocation } from '../ops';
import { everyone } from '../people/cast';
import { readPrice } from '../people/price';
import { teachingOf } from '../people/teachers';
import { inSealedArchive, libraryScrollAccess } from '../permits';
import { libraryAccess } from '../shelves';
import type { GameState } from '../state';
import { chuninVest } from './vest';

/**
 * What a promotion opens, worked out from the data by comparing what you may do at your rank
 * now with what you may do at the new one: the library's stacks, jobs on the board, gear the
 * shops will sell you, and the shinobi who will now train you. Each is told as a sentence of
 * what the rank means, naming a couple of examples rather than reading out the list, and
 * nothing the ceremony already hands you (the vest) is named again.
 */

/** At most this many of a kind are named; the rest are "and more besides". */
const NAMED = 2;

export interface Unlock {
  readonly kind: 'library' | 'jobs' | 'gear' | 'teachers';
  /** "The mission hall will hand you B-rank work now, such as Smugglers at the Weir." */
  readonly text: string;
  /** What the sentence names (places, jobs, gear, people), for checks that none comes twice. */
  readonly names: readonly string[];
}

/** "B-rank" or "B- and A-rank", from the ranks of what opens. */
function ranksOf(ranks: readonly string[]): string {
  const unique = [...new Set(ranks)];
  return `${listed(unique.map((r, i) => (i === unique.length - 1 ? r : `${r}-`)))}-rank`;
}

/** A couple of examples: "X", "X and Y", or "such as X and Y" when there are more. */
function examples(names: readonly string[]): { readonly told: string; readonly named: string[] } {
  const named = names.slice(0, NAMED);
  const told = listed(named);
  return { told: names.length > NAMED ? `such as ${told}` : told, named };
}

function atRank(state: GameState, rank: PromotedRank): GameState {
  return { ...state, standing: { ...state.standing, rank } };
}

/** Whether `at` may read any of these library scrolls that `before` may not. */
function opens(
  ctx: GameContext,
  before: GameState,
  at: GameState,
  ids: readonly string[],
): boolean {
  return ids
    .map((id) => ctx.content.techniques.require(id))
    .some(
      (def) => libraryScrollAccess(before, def) !== null && libraryScrollAccess(at, def) === null,
    );
}

function libraries(state: GameState, ctx: GameContext, raised: GameState): Unlock[] {
  const items = currentLocation(state, ctx).places.flatMap((p) => {
    if (p.kind !== 'library') return [];
    const stacks = libraryAccess(state) !== null && libraryAccess(raised) === null;
    const sealed = opens(
      ctx,
      state,
      raised,
      p.techniqueIds.filter((id) => inSealedArchive(ctx.content.techniques.require(id))),
    );
    const rooms = [
      ...(stacks ? ['its restricted stacks'] : []),
      ...(sealed ? ['its sealed archive'] : []),
    ];
    if (rooms.length === 0) return [];
    const text = `${p.name} lets you into ${listed(rooms)}.`;
    return [{ kind: 'library' as const, text, names: [p.name] }];
  });
  return items;
}

function jobs(state: GameState, ctx: GameContext, rank: PromotedRank): Unlock[] {
  const offered = new Set(
    currentLocation(state, ctx).places.flatMap((p) => (p.kind === 'missions' ? p.missionIds : [])),
  );
  // A long story's jobs are posted only as the story reaches them, so none is named here.
  const inArcs = new Set(ctx.content.arcs.all.flatMap((a) => a.acts.flatMap((act) => act.jobs)));
  const opened = ctx.content.missions.all.filter(
    (m) =>
      offered.has(m.id) &&
      !m.examOnly &&
      !inArcs.has(m.id) &&
      lowestRankFor(jobOf(ctx, m)) === rank,
  );
  if (opened.length === 0) return [];
  const { told, named } = examples(opened.map((m) => m.title));
  const work = ranksOf(opened.map((m) => m.rank));
  const text = `The mission hall will hand you ${work} work now, ${told}.`;
  return [{ kind: 'jobs', text, names: named }];
}

function gear(state: GameState, ctx: GameContext, raised: GameState): Unlock[] {
  const sold = new Set(
    currentLocation(state, ctx).places.flatMap((p) => (p.kind === 'gear' ? p.gearIds : [])),
  );
  // The vest is handed over at the ceremony, so it isn't news that the shops sell it.
  const given = raised.standing.rank === 'chunin' ? chuninVest(ctx)?.id : undefined;
  const opened = ctx.content.gear.all.filter(
    (g) =>
      sold.has(g.id) && g.id !== given && gearRankBlocker(state, g) && !gearRankBlocker(raised, g),
  );
  if (opened.length === 0) return [];
  const { told, named } = examples(opened.map((g) => `the ${g.name}`));
  const kit = ranksOf(opened.map((g) => g.rank));
  const text = `The shops will sell you ${kit} gear now, ${told}.`;
  return [{ kind: 'gear', text, names: named.map((n) => n.replace(/^the /, '')) }];
}

/** Whether someone would train you, on their terms, as your standing is in `at`. */
function trainsYou(at: GameState, ctx: GameContext, personId: string): boolean {
  const person = everyone(at, ctx).find((p) => p.id === personId);
  const teaching = person && teachingOf(at, person);
  if (!person || !teaching?.price) return false;
  return readPrice(at, ctx, person, teaching.price).every((part) => part.met);
}

function teachers(state: GameState, ctx: GameContext, raised: GameState): Unlock[] {
  const willing = everyone(state, ctx)
    .filter((p) => !trainsYou(state, ctx, p.id) && trainsYou(raised, ctx, p.id))
    .map((p) => p.name);
  if (willing.length === 0) return [];
  const named = willing.slice(0, NAMED);
  const more = willing.length > NAMED ? ', and others besides' : '';
  const text = `${listed(named)} will train you now${more}.`;
  return [{ kind: 'teachers', text, names: named }];
}

/** What being raised to `rank` opens for you, a sentence for each kind of thing. */
export function unlocksFor(state: GameState, ctx: GameContext, rank: PromotedRank): Unlock[] {
  const raised = atRank(state, rank);
  return [
    ...libraries(state, ctx, raised),
    ...jobs(state, ctx, rank),
    ...gear(state, ctx, raised),
    ...teachers(state, ctx, raised),
  ];
}

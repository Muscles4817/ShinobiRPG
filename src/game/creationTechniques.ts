import { STANDING_INFO, gradesFor, topDisciplines } from '@/systems/profile';
import type { Stats } from '@/systems/stats';
import { EMPTY_BOOK, learnabilityFor, learnBlocker, type TechniqueDef } from '@/systems/techniques';

import type { GameContext } from './context';
import type { CreationDraft } from './creation';
import { placeHere } from './ops';
import { graduationStats } from './student';
import { profileOf } from './studentProfile';

/**
 * What a graduate was taught beyond the basics, chosen on the file. Everyone leaves the academy
 * with its basics and their clan's starting arts; on top of those they pick a few of the
 * techniques the academy rack (and, for a clan child, the clan) teaches at their grades, more
 * the better they stood in the class (`StandingInfo.techniques`). A technique they could only
 * learn unsteadily, or that needs a nature they haven't found, isn't on offer. A draft that never
 * chose (`techniqueIds` unset) is taught what the academy used to hand everyone: its starter in
 * each of their best arts.
 */

const NO_PICKS: readonly string[] = [];

/** What every graduate of this clan knows: the academy's techniques and basics, and the clan's. */
export function creationBasics(draft: CreationDraft, ctx: GameContext): string[] {
  const { content } = ctx;
  const clan = content.clans.get(draft.clanId);
  return [
    ...new Set([
      ...content.academyTechniques,
      ...content.academyBasics,
      ...(clan?.startingTechniqueIds ?? NO_PICKS),
    ]),
  ];
}

/** How many techniques the file may choose beyond the basics. */
export function techniquePicks(draft: CreationDraft): number {
  return STANDING_INFO[draft.standing].techniques;
}

function rackIds(ctx: GameContext): readonly string[] {
  const academy = placeHere({ locationId: ctx.content.startLocationId }, ctx, 'academy');
  return academy?.techniqueIds ?? NO_PICKS;
}

function offered(def: TechniqueDef, stats: Stats, clanId: string): boolean {
  const learner = { stats, clanId, nature: null };
  return (
    learnBlocker(EMPTY_BOOK, def, learner) === null && learnabilityFor(def, stats) === 'normal'
  );
}

/** The techniques this draft may choose from, at the grades its file gives it. */
export function techniqueOffer(draft: CreationDraft, ctx: GameContext): TechniqueDef[] {
  const { content } = ctx;
  if (!content.clans.get(draft.clanId)) return [];
  const stats = graduationStats(profileOf(draft), ctx);
  const basics = new Set(creationBasics(draft, ctx));
  const clanArts = content.techniques.all.filter((t) => t.clan === draft.clanId).map((t) => t.id);
  const ids = [...new Set([...rackIds(ctx), ...clanArts])].filter((id) => !basics.has(id));
  return ids
    .flatMap((id) => content.techniques.get(id) ?? [])
    .filter((def) => offered(def, stats, draft.clanId));
}

/**
 * What the academy suggests for a graduate who didn't choose: its starter in each of their best
 * arts, then the rest of the offer from their strongest art down, up to what the standing allows.
 */
export function defaultPicks(draft: CreationDraft, ctx: GameContext): string[] {
  const stats = graduationStats(profileOf(draft), ctx);
  const offer = techniqueOffer(draft, ctx);
  const offered = new Set(offer.map((t) => t.id));
  const starters = topDisciplines(gradesFor(stats))
    .map((d) => ctx.content.disciplineStarters[d])
    .filter((id) => offered.has(id));
  // Strongest art first; within an art, the rack's order (sorting is stable). A combination
  // half plays only beside its partner, so it is never suggested, only chosen.
  const ranked = offer
    .filter((t) => t.combo === undefined)
    .sort((a, b) => stats[b.discipline] - stats[a.discipline]);
  return [...new Set([...starters, ...ranked.map((t) => t.id)])].slice(0, techniquePicks(draft));
}

/** The techniques the draft is taught beyond the basics: its choice, or the academy's. */
export function chosenTechniques(draft: CreationDraft, ctx: GameContext): readonly string[] {
  return draft.techniqueIds ?? defaultPicks(draft, ctx);
}

/** What is wrong with the draft's chosen techniques, or nothing. */
export function techniqueProblems(draft: CreationDraft, ctx: GameContext): string[] {
  if (draft.techniqueIds === undefined) return [];
  const limit = techniquePicks(draft);
  const offer = new Set(techniqueOffer(draft, ctx).map((t) => t.id));
  const beyond = draft.techniqueIds.find((id) => !offer.has(id));
  if (beyond !== undefined) {
    const name = ctx.content.techniques.get(beyond)?.name ?? beyond;
    return [`Your file no longer carries ${name}. Choose another technique.`];
  }
  if (draft.techniqueIds.length > limit) return [`Choose at most ${String(limit)} techniques.`];
  const wanted = Math.min(limit, offer.size);
  if (draft.techniqueIds.length < wanted) return [`Choose ${String(wanted)} techniques.`];
  return [];
}

/** Picks or puts back a technique; picking past the limit puts back the earliest picked. */
export function toggledTechnique(draft: CreationDraft, id: string, ctx: GameContext): string[] {
  const chosen = chosenTechniques(draft, ctx);
  if (chosen.includes(id)) return chosen.filter((t) => t !== id);
  const next = [...chosen, id];
  return next.slice(Math.max(0, next.length - techniquePicks(draft)));
}

/**
 * Drops chosen techniques the draft's file no longer carries (a lower standing, a stat trained
 * down), so a later page never meets a choice the file can't back.
 */
export function prunedTechniques(draft: CreationDraft, ctx: GameContext): CreationDraft {
  if (draft.techniqueIds === undefined) return draft;
  const offer = new Set(techniqueOffer(draft, ctx).map((t) => t.id));
  const kept = draft.techniqueIds.filter((id) => offer.has(id)).slice(0, techniquePicks(draft));
  return kept.length === draft.techniqueIds.length ? draft : { ...draft, techniqueIds: kept };
}

/** What stops the techniques page being turned: its problems with the academy's picks filled in. */
export function taughtProblems(draft: CreationDraft, ctx: GameContext): string[] {
  return techniqueProblems({ ...draft, techniqueIds: chosenTechniques(draft, ctx) }, ctx);
}

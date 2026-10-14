import {
  archetypeOffered,
  BLANK_FILE,
  fileBalance,
  HIGH_STEPS,
  maxStepsFor,
  nextStepCost,
  quickFile,
  STANDING_INFO,
  stepsIn,
  type AcademyFile,
  type Bloom,
  type Gift,
  type Gifts,
  type QuickPick,
} from '@/systems/profile';
import type { StatId } from '@/systems/stats';

import type { GameContext } from './context';
import type { CreationDraft } from './creation';
import { earlyTraining, studentOf } from './student';

/**
 * Edits to a creation draft, as the academy file's pages make them. They keep a draft sensible:
 * a clan child is raised by the clan, and a file filled by a quick pick is filled again
 * whenever what it was filled from (standing, family, upbringing) changes. Editing the file by
 * hand makes it the player's own, and it stays as written.
 */

const CLANLESS = 'none';

/** The upbringing a family starts from: the first the pack offers for it. */
function defaultUpbringing(clanId: string, ctx: GameContext): string {
  const family = clanId === CLANLESS ? 'clanless' : 'clan';
  return ctx.content.upbringings.all.find((u) => u.family === family)?.id ?? '';
}

function upbringingFits(draft: CreationDraft, ctx: GameContext): boolean {
  const upbringing = ctx.content.upbringings.get(draft.upbringingId);
  const family = draft.clanId === CLANLESS ? 'clanless' : 'clan';
  return upbringing?.family === family;
}

/** The file a quick pick gives this draft, falling back to the steady student if theirs isn't offered. */
export function filledFile(draft: CreationDraft, pick: QuickPick, ctx: GameContext): AcademyFile {
  const student = studentOf(draft, ctx);
  const offered = archetypeOffered(pick.archetype, student);
  const file = quickFile(offered ? pick : { ...pick, archetype: 'steady' }, student);
  // What the special note fixes (an art that never takes, a well of reserves) takes no gift or flaw.
  const fixed = ctx.content.talents.get(draft.talentId)?.aptitude ?? {};
  const gifts = Object.fromEntries(Object.entries(file.gifts).filter(([id]) => !(id in fixed)));
  return { ...file, gifts };
}

/** Applies a change to the draft and keeps the rest of it in step. */
export function reviseDraft(
  draft: CreationDraft,
  patch: Partial<CreationDraft>,
  ctx: GameContext,
): CreationDraft {
  let next = { ...draft, ...patch };
  if (!upbringingFits(next, ctx)) {
    next = { ...next, upbringingId: defaultUpbringing(next.clanId, ctx) };
  }
  const handWritten = patch.file !== undefined && patch.quickPick === undefined;
  if (handWritten) return { ...next, quickPick: null };
  // A family the pack doesn't know can't be filled for; the draft's problems will say so.
  const known = ctx.content.clans.get(next.clanId) && upbringingFits(next, ctx);
  return next.quickPick && known ? { ...next, file: filledFile(next, next.quickPick, ctx) } : next;
}

function withFile(draft: CreationDraft, file: AcademyFile, ctx: GameContext): CreationDraft {
  return reviseDraft(draft, { file }, ctx);
}

/** Whether the file can take one more step of training in this stat. */
export function canRaise(draft: CreationDraft, stat: StatId, ctx: GameContext): boolean {
  const { file } = draft;
  const steps = stepsIn(file.development, stat);
  const cost = nextStepCost(steps);
  const upbringing = ctx.content.upbringings.get(draft.upbringingId);
  const clan = ctx.content.clans.get(draft.clanId);
  if (cost === null || !upbringing || !clan) return false;
  const early = earlyTraining(upbringing, clan);
  const allowance = STANDING_INFO[draft.standing].development;
  const room = steps < Math.min(HIGH_STEPS, maxStepsFor(file.development, stat, allowance));
  return room && cost <= fileBalance(file, draft.standing, early).points;
}

export function raiseStat(draft: CreationDraft, stat: StatId, ctx: GameContext): CreationDraft {
  if (!canRaise(draft, stat, ctx)) return draft;
  const steps = stepsIn(draft.file.development, stat);
  const development = { ...draft.file.development, [stat]: steps + 1 };
  return withFile(draft, { ...draft.file, development }, ctx);
}

export function lowerStat(draft: CreationDraft, stat: StatId, ctx: GameContext): CreationDraft {
  const steps = stepsIn(draft.file.development, stat);
  if (steps === 0) return draft;
  const development = { ...draft.file.development, [stat]: steps - 1 };
  return withFile(draft, { ...draft.file, development }, ctx);
}

/** Marks a stat gifted, a prodigy's, flawed, or nothing known (null). */
export function markGift(
  draft: CreationDraft,
  stat: StatId,
  gift: Gift | null,
  ctx: GameContext,
): CreationDraft {
  const others = Object.entries(draft.file.gifts).filter(([id]) => id !== stat);
  const gifts: Gifts = Object.fromEntries(gift === null ? others : [...others, [stat, gift]]);
  return withFile(draft, { ...draft.file, gifts }, ctx);
}

export function setBloom(draft: CreationDraft, bloom: Bloom, ctx: GameContext): CreationDraft {
  return withFile(draft, { ...draft.file, bloom }, ctx);
}

/** Fills the file as this kind of student; it follows later changes until edited by hand. */
export function chooseQuickPick(
  draft: CreationDraft,
  pick: QuickPick,
  ctx: GameContext,
): CreationDraft {
  return reviseDraft(draft, { quickPick: pick, file: BLANK_FILE }, ctx);
}

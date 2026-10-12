import { gearSlot, type GearDef, type PromotedRank } from '@/content';
import { addGear, equip } from '@/systems/inventory';
import { promote, RANK_LABELS } from '@/systems/standing';
import { statTier, STAT_GRADES, type StatGrade } from '@/systems/stats';
import { DISCIPLINES } from '@/systems/techniques';

import type { GameContext } from '../context';
import { busyReason, chip, log } from '../ops';
import type { GameState } from '../state';
import { examHere } from './current';
import { unlocksFor } from './unlocks';

/**
 * Promotions. A chūnin exam ends with its verdict; a promoted genin's ceremony follows (the rank,
 * the title, the flak vest, the unlocks). Jōnin are never examined: once a chūnin's record of
 * B- and A-rank jobs, grade in their specialty and standing with the village meet the marks, the
 * nomination arrives on its own, as a smaller ceremony.
 */

/** A jōnin's record: B-rank and harder jobs done… */
export const JONIN_SENIOR_MISSIONS = 5;
/** …their best art at this grade… */
export const JONIN_SPECIALTY_GRADE: StatGrade = 'B';
/** …and this much reputation with the village. */
export const JONIN_REPUTATION = 80;

/** The vest a new chūnin is handed: the pack's plainest flak armour. */
export function chuninVest(ctx: GameContext): GearDef | null {
  const vests = ctx.content.gear.all.filter(
    (g) => g.kind === 'armour' && g.level === 'flak' && g.unique !== true,
  );
  return [...vests].sort((a, b) => a.cost - b.cost)[0] ?? null;
}

/** The run is over and its verdict heard: leave the exam (into your ceremony, if promoted). */
export function leaveExam(state: GameState, ctx: GameContext): GameState {
  const here = examHere(state, ctx);
  const verdict = here?.run.verdict;
  if (!here || !verdict) return state;
  const text = verdict.promoted ? here.def.verdict.promoted : here.def.verdict.passedOver;
  const left: GameState = {
    ...state,
    exams: {
      ...state.exams,
      run: null,
      ceremony: verdict.promoted ? { rank: here.def.rank } : state.exams.ceremony,
    },
  };
  return log(left, {
    heading: here.def.name,
    text,
    tone: verdict.promoted ? 'success' : 'info',
    chips: [
      chip(`${verdict.roundsWon} bouts won`, 'gain'),
      chip(`Conduct ${verdict.conduct >= 0 ? '+' : ''}${verdict.conduct}`, verdict.conduct >= 0 ? 'gain' : 'cost'),
    ],
  });
}

function bestArtGrade(state: GameState): StatGrade {
  const best = Math.max(...DISCIPLINES.map((d) => state.character.stats[d]));
  return statTier(best).grade;
}

/** What still stands between a chūnin and a jōnin's nomination, or null when it is earned. */
export function joninGap(state: GameState): string | null {
  const { standing } = state;
  if (standing.rank !== 'chunin') return 'Only chūnin are nominated.';
  if (standing.seniorMissionsCompleted < JONIN_SENIOR_MISSIONS) {
    return `${JONIN_SENIOR_MISSIONS} B- or A-rank jobs done (you have ${standing.seniorMissionsCompleted})`;
  }
  if (STAT_GRADES.indexOf(bestArtGrade(state)) < STAT_GRADES.indexOf(JONIN_SPECIALTY_GRADE)) {
    return `your specialty at grade ${JONIN_SPECIALTY_GRADE}`;
  }
  if (standing.reputation < JONIN_REPUTATION) {
    return `${JONIN_REPUTATION} reputation (you have ${standing.reputation})`;
  }
  return null;
}

/**
 * Checked after every action: a nomination arrives once a chūnin's record earns it and they are
 * free to hear it (not mid-mission, mid-fight or mid-talk).
 */
export function notePromotions(state: GameState): GameState {
  if (state.exams.ceremony || busyReason(state) || joninGap(state) !== null) return state;
  return { ...state, exams: { ...state.exams, ceremony: { rank: 'jonin' } } };
}

function withVest(state: GameState, ctx: GameContext, rank: PromotedRank): GameState {
  const vest = rank === 'chunin' ? chuninVest(ctx) : null;
  if (!vest) return state;
  const slot = gearSlot(vest);
  const owned = addGear(state.inventory, vest.id);
  const inventory = state.inventory.equipped[slot] ? owned : equip(owned, slot, vest.id);
  return { ...state, inventory };
}

/** You step forward: the new rank, its gift, and what it opens, written in your record. */
export function acceptPromotion(state: GameState, ctx: GameContext): GameState {
  const ceremony = state.exams.ceremony;
  if (!ceremony) return state;
  const unlocks = unlocksFor(state, ctx, ceremony.rank);
  const vest = ceremony.rank === 'chunin' ? chuninVest(ctx) : null;
  const raised: GameState = {
    ...withVest(state, ctx, ceremony.rank),
    standing: promote(state.standing, ceremony.rank),
    exams: { ...state.exams, ceremony: null },
  };
  return log(raised, {
    heading: `Promoted to ${RANK_LABELS[ceremony.rank]}`,
    text: unlocks.length > 0 ? `It opens: ${unlocks.map((u) => u.heading.toLowerCase()).join(', ')}.` : 'A new rank.',
    tone: 'success',
    chips: [chip(RANK_LABELS[ceremony.rank], 'gain'), ...(vest ? [chip(vest.name, 'gain')] : [])],
  });
}

import {
  BLOOMS,
  BLOOM_POINTS,
  FLAW_REFUND,
  fileBalance,
  fileProblems,
  gradesFor,
  STANDING_INFO,
  stepsIn,
  topDisciplines,
  type Bloom,
  type FileBalance,
  type Gift,
  type Grade,
} from '@/systems/profile';
import {
  fightingPower,
  STAT_IDS,
  STAT_INFO,
  STAT_KIND,
  statTier,
  type StatGrade,
  type StatGroup,
  type StatId,
  type StatKind,
} from '@/systems/stats';
import { DISCIPLINES, type Discipline } from '@/systems/techniques';

import type { GameContext } from '../context';
import type { CreationDraft } from '../creation';
import { canRaise } from '../creationDraft';
import { profileOf } from '../creation';
import { earlyTraining, graduationStats } from '../student';
import { quickPickOptions, type QuickPickOption } from './quickPicks';

/**
 * The academy file page: every stat as it will graduate, what training it has had, any gift or
 * flaw, and what is left to spend. The page edits the draft through `creationDraft.ts`; this
 * only says what it would come to.
 */

export interface FileStatLine {
  readonly id: StatId;
  readonly label: string;
  readonly kind: StatKind;
  readonly value: number;
  readonly grade: StatGrade;
  readonly steps: number;
  readonly canRaise: boolean;
  readonly canLower: boolean;
  readonly gift: Gift | null;
  /** What tapping the gift stamp turns it into next. */
  readonly nextGift: Gift | null;
  /** The upbringing insists some training went here. */
  readonly focus: boolean;
}

export interface BloomOption {
  readonly id: Bloom;
  readonly name: string;
  readonly description: string;
  readonly selected: boolean;
}

export interface FileView {
  readonly groups: readonly {
    readonly group: StatGroup;
    readonly stats: readonly FileStatLine[];
  }[];
  readonly balance: FileBalance;
  readonly problems: readonly string[];
  /** Fighting grade at graduation, as the Shinobi screen will show it. */
  readonly fighting: { readonly grade: StatGrade; readonly power: number };
  /** The quick picks this student may take, each with what it would give them. */
  readonly archetypes: readonly QuickPickOption[];
  readonly blooms: readonly BloomOption[];
  /** The report card it reads as, and which arts bring their starter technique. */
  readonly reportCard: readonly {
    readonly discipline: Discipline;
    readonly grade: Grade;
    readonly starts: boolean;
  }[];
  /** What the upbringing asks of the training, in words; null when nothing. */
  readonly focusNote: string | null;
  readonly prodigyAllowed: boolean;
  /** Development points a flaw gives back. */
  readonly flawRefund: number;
}

const BLOOM_TEXT: Readonly<Record<Bloom, { name: string; description: string }>> = {
  'on-time': { name: 'On time', description: 'Your file as it is.' },
  early: {
    name: 'Early bloomer',
    description: `A gift fewer, ${BLOOM_POINTS} more points of early training.`,
  },
  late: {
    name: 'Late bloomer',
    description: `${BLOOM_POINTS} fewer points of early training, a gift more.`,
  },
};

/** The gift stamp's cycle: nothing known, gifted, a prodigy's (if allowed), flawed, nothing. */
function nextGift(gift: Gift | null, prodigy: boolean): Gift | null {
  if (gift === null) return 'gifted';
  if (gift === 'gifted') return prodigy ? 'prodigy' : 'flawed';
  return gift === 'prodigy' ? 'flawed' : null;
}

function focusNote(draft: CreationDraft, ctx: GameContext): string | null {
  const upbringing = ctx.content.upbringings.get(draft.upbringingId);
  const clan = ctx.content.clans.get(draft.clanId);
  const focus = upbringing && clan ? earlyTraining(upbringing, clan).focus : undefined;
  if (!upbringing || !focus) return null;
  const arts = focus.stats.map((id) => STAT_INFO[id].label).join(' or ');
  return `${upbringing.name}: at least ${focus.points} points of your training went into ${arts}.`;
}

export function fileView(draft: CreationDraft, ctx: GameContext): FileView {
  const stats = graduationStats(profileOf(draft), ctx);
  const upbringing = ctx.content.upbringings.get(draft.upbringingId);
  const clan = ctx.content.clans.get(draft.clanId);
  const early = upbringing && clan ? earlyTraining(upbringing, clan) : { points: 0 };
  const focused = new Set(early.focus?.stats ?? []);
  const prodigy = STANDING_INFO[draft.standing].gifts.prodigy;
  const line = (id: StatId): FileStatLine => {
    const gift = draft.file.gifts[id] ?? null;
    return {
      id,
      label: STAT_INFO[id].label,
      kind: STAT_KIND[id],
      value: stats[id],
      grade: statTier(stats[id]).grade,
      steps: stepsIn(draft.file.development, id),
      canRaise: canRaise(draft, id, ctx),
      canLower: stepsIn(draft.file.development, id) > 0,
      gift,
      nextGift: nextGift(gift, prodigy),
      focus: focused.has(id),
    };
  };
  const groups: StatGroup[] = ['body', 'mind', 'discipline'];
  const card = gradesFor(stats);
  return {
    groups: groups.map((group) => ({
      group,
      stats: STAT_IDS.filter((id) => STAT_INFO[id].group === group).map(line),
    })),
    balance: fileBalance(draft.file, draft.standing, early),
    problems: fileProblems(draft.file, draft.standing, early),
    fighting: {
      grade: statTier(fightingPower(stats)).grade,
      power: Math.floor(fightingPower(stats) * 10) / 10,
    },
    archetypes: quickPickOptions(draft, ctx),
    blooms: BLOOMS.map((id) => ({ id, ...BLOOM_TEXT[id], selected: draft.file.bloom === id })),
    reportCard: DISCIPLINES.map((d) => ({
      discipline: d,
      grade: card[d],
      starts: topDisciplines(card).includes(d),
    })),
    focusNote: focusNote(draft, ctx),
    prodigyAllowed: prodigy,
    flawRefund: FLAW_REFUND,
  };
}

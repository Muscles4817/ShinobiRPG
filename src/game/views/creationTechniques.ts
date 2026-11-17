import { statTier, type StatGrade, type Stats } from '@/systems/stats';
import { DISCIPLINES, type Discipline, type TechniqueDef } from '@/systems/techniques';
import { maxChakra, MAX_HEALTH } from '@/systems/vitals';

import { attributesOf } from '../combatants';
import type { GameContext } from '../context';
import type { CreationDraft } from '../creation';
import {
  chosenTechniques,
  creationBasics,
  heldBackTechniques,
  techniqueOffer,
  techniquePicks,
  type HeldBack,
} from '../creationTechniques';
import { graduationStats } from '../student';
import { profileOf } from '../studentProfile';
import { sheetFor, type Reader, type TechniqueSheet } from './techniqueSheet';

/**
 * The academy file's page of what you were taught: the techniques chosen so far in their seal
 * slots, the basics every graduate leaves with, then what your grades let you choose from, art by
 * art under your grade in it, each with its sheet (what it does in a fight, read for the student
 * on the file), and in a folded line what the rack holds back and why.
 */

export interface TaughtCard {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly discipline: Discipline;
  readonly rank: StatGrade;
  /** One of the clan's own arts. */
  readonly fromClan: boolean;
  readonly selected: boolean;
  /** Why it can't be chosen now (the file is full), or null. */
  readonly blocker: string | null;
  readonly sheet: TechniqueSheet;
}

export interface TaughtGroup {
  readonly discipline: Discipline;
  /** The file's grade in the art, as a technique's rank is read against it. */
  readonly grade: StatGrade;
  readonly cards: readonly TaughtCard[];
  /** What the rack keeps back in this art, and why, in a line; null when nothing. */
  readonly heldBack: string | null;
}

export interface TechniquesPage {
  /** How many may be chosen beyond the basics. */
  readonly picks: number;
  /** What is chosen, in the order chosen; the rest of the slots are open. */
  readonly chosen: readonly TaughtCard[];
  readonly full: boolean;
  readonly allowance: string;
  readonly basics: readonly TaughtCard[];
  readonly groups: readonly TaughtGroup[];
}

const COUNT = ['no', 'one', 'two', 'three', 'four'] as const;
const word = (n: number): string => COUNT[n] ?? String(n);
/** Easiest first on the rack. */
const RANK_ORDER: readonly StatGrade[] = ['E', 'D', 'C', 'B', 'A', 'S'];

const ART_NAME: Readonly<Record<Discipline, string>> = {
  taijutsu: 'taijutsu',
  ninjutsu: 'ninjutsu',
  genjutsu: 'genjutsu',
  kenjutsu: 'kenjutsu',
  fuuinjutsu: 'fūinjutsu',
};

function allowanceLine(picks: number, offered: number): string {
  if (offered === 0) return 'Your grades don’t carry anything past the basics yet.';
  const n = Math.min(picks, offered);
  return `Your standing lets you choose ${word(n)} technique${n === 1 ? '' : 's'} beyond the basics.`;
}

/** The student on the file as a fighter, to read each sheet for them. */
function fileReader(stats: Stats): Reader {
  const chakra = maxChakra(stats);
  return {
    id: 'player',
    name: 'you',
    called: 'you',
    grammar: 'you',
    attributes: attributesOf(stats),
    health: MAX_HEALTH,
    maxHealth: MAX_HEALTH,
    chakra,
    maxChakra: chakra,
    techniques: [],
  };
}

const HELD_WORDS: Readonly<Record<HeldBack, (n: number, art: string) => string>> = {
  grade: (n, art) => `${word(n)} wait${n === 1 ? 's' : ''} for a higher ${art} grade`,
  nature: (n) => `${word(n)} need${n === 1 ? 's' : ''} a chakra nature you haven’t found yet`,
  body: (n) => `${word(n)} ask${n === 1 ? 's' : ''} more of your body than it has yet`,
};

function heldBackLine(held: readonly HeldBack[], discipline: Discipline): string | null {
  if (held.length === 0) return null;
  const parts = (['grade', 'nature', 'body'] as const).flatMap((why) => {
    const n = held.filter((h) => h === why).length;
    return n === 0 ? [] : [HELD_WORDS[why](n, ART_NAME[discipline])];
  });
  return `On the rack still: ${parts.join('; ')}.`;
}

interface CardMaker {
  readonly ctx: GameContext;
  readonly you: Reader;
  readonly chosen: ReadonlySet<string>;
  readonly full: boolean;
}

function cardOf(def: TechniqueDef, maker: CardMaker): TaughtCard {
  const selected = maker.chosen.has(def.id);
  return {
    id: def.id,
    name: def.name,
    description: def.description,
    discipline: def.discipline,
    rank: def.rank,
    fromClan: def.clan !== undefined,
    selected,
    blocker: maker.full && !selected ? 'Your file is full. Put one back to choose this.' : null,
    sheet: sheetFor({ ctx: maker.ctx, def, you: maker.you, unstable: false }),
  };
}

/** The page for a draft as it stands. */
export function techniquesPage(draft: CreationDraft, ctx: GameContext): TechniquesPage {
  const stats = graduationStats(profileOf(draft), ctx);
  const picks = techniquePicks(draft);
  const chosenIds = chosenTechniques(draft, ctx);
  const full = chosenIds.length >= picks;
  const maker = { ctx, you: fileReader(stats), chosen: new Set(chosenIds), full };
  const offer = techniqueOffer(draft, ctx);
  const card = (id: string) => {
    const def = ctx.content.techniques.get(id);
    return def ? [cardOf(def, maker)] : [];
  };
  const held = heldBackTechniques(draft, ctx);
  const groups = DISCIPLINES.map((discipline) => ({
    discipline,
    grade: statTier(stats[discipline]).grade,
    cards: offer
      .filter((t) => t.discipline === discipline)
      .sort((a, b) => RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank))
      .map((t) => cardOf(t, maker)),
    heldBack: heldBackLine(
      held.filter((h) => h.def.discipline === discipline).map((h) => h.why),
      discipline,
    ),
  })).filter((g) => g.cards.length > 0 || g.heldBack !== null);
  return {
    picks,
    chosen: chosenIds.flatMap(card),
    full,
    allowance: allowanceLine(picks, offer.length),
    basics: creationBasics(draft, ctx).flatMap(card),
    groups,
  };
}

import { statTier, type StatGrade, type Stats } from '@/systems/stats';
import {
  DISCIPLINES,
  gradeToAttempt,
  type Discipline,
  type TechniqueDef,
} from '@/systems/techniques';
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
  /** Half of a combination: it plays only beside someone who knows the other half. */
  readonly combo: boolean;
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

/** How many held-back techniques a line names before it counts the rest. */
const NAMED = 2;

function heldWords(def: TechniqueDef, why: HeldBack): string {
  switch (why) {
    case 'grade':
      return `${def.name} waits for ${ART_NAME[def.discipline]} ${gradeToAttempt(def.rank)}`;
    case 'nature':
      return `${def.name} needs a chakra nature you haven’t found yet`;
    case 'body':
      return `${def.name} asks more of your body than it has yet`;
  }
}

/** The nearest few the rack holds back, named with what they wait for, and how many more. */
function heldBackLine(held: readonly { def: TechniqueDef; why: HeldBack }[]): string | null {
  if (held.length === 0) return null;
  const nearest = [...held].sort(
    (a, b) => RANK_ORDER.indexOf(a.def.rank) - RANK_ORDER.indexOf(b.def.rank),
  );
  const named = nearest.slice(0, NAMED).map((h) => heldWords(h.def, h.why));
  const rest = held.length - named.length;
  const more = rest > 0 ? `; and ${word(rest)} more` : '';
  return `Still on the rack: ${named.join('; ')}${more}.`;
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
    combo: def.combo !== undefined,
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
    heldBack: heldBackLine(held.filter((h) => h.def.discipline === discipline)),
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

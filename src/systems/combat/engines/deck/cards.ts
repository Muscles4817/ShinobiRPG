import type { Rng } from '@/core';

import type { CombatTechnique, RangeBand } from '../../contract';
import {
  alive,
  chakraCost,
  healAmount,
  holdTurns,
  resistChance,
  strikeDamage,
  techniqueDamage,
} from '../../rules/body';
import { matchup, matchupLine } from '../../rules/elements';
import { attackKindOf } from '../../rules/kit';
import { inReach, RANGE_BANDS, reachOf, STRIKE_REACH, THROW_REACH } from '../../rules/range';
import { confuse, kitDamage, landHit, slips, UNSEEN_REASON } from './kit';
import { patch, type Card, type CardKind, type DeckFighter } from './state';

/**
 * The cards: a starter set of basics plus one card per technique you know. Playing a card
 * spends action points (and chakra, for jutsu); range decides what you can reach.
 */

const BASICS: readonly [CardKind, number][] = [
  ['strike', 3],
  ['kunai', 2],
  ['guard', 3],
];
/** Most techniques that go in the deck; the rest wait for a later rank. */
export const MAX_TECHNIQUE_CARDS = 8;
const KUNAI_SCALE = 0.6;

export const CARD_LABEL: Readonly<Record<Exclude<CardKind, 'jutsu'>, string>> = {
  strike: 'Strike',
  kunai: 'Kunai',
  guard: 'Guard',
};

export function buildDeck(techniques: readonly CombatTechnique[]): Card[] {
  const basics = BASICS.flatMap(([kind, count]) => Array.from({ length: count }, () => kind));
  const cards: Omit<Card, 'uid'>[] = [
    ...basics.map((kind) => ({ kind })),
    ...techniques
      .slice(0, MAX_TECHNIQUE_CARDS)
      .map((t) => ({ kind: 'jutsu' as const, technique: t })),
  ];
  return cards.map((c, i) => ({ ...c, uid: `c${i}` }));
}

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    const a = out[i];
    const b = out[j];
    if (a === undefined || b === undefined) continue;
    out[i] = b;
    out[j] = a;
  }
  return out;
}

/** Action points a technique costs: cheap jutsu 1, mid 2, big 3. */
export function techniquePoints(t: CombatTechnique): number {
  return t.chakraCost <= 5 ? 1 : t.chakraCost <= 11 ? 2 : 3;
}

export function cardPoints(card: Card): number {
  return card.technique ? techniquePoints(card.technique) : 1;
}

export function cardReach(card: Card): readonly RangeBand[] {
  if (card.technique) return reachOf(card.technique);
  if (card.kind === 'strike') return STRIKE_REACH;
  if (card.kind === 'kunai') return THROW_REACH;
  return RANGE_BANDS;
}

export function isTargeted(card: Card): boolean {
  if (card.technique) return card.technique.effect !== 'heal';
  return card.kind === 'strike' || card.kind === 'kunai';
}

/** Why a card can't be played now, or null. */
export function cardBlocker(card: Card, user: DeckFighter, ctx: PlayContext): string | null {
  if (isTargeted(card) && !ctx.canSee) return UNSEEN_REASON;
  if (cardPoints(card) > ctx.points) return 'Not enough actions';
  if (!inReach(cardReach(card), ctx.range)) return `Out of reach at ${ctx.range} range`;
  if (!card.technique) return null;
  if (user.sealed > 0) return 'Your chakra is sealed';
  return chakraCost(user, card.technique) > user.chakra ? 'Not enough chakra' : null;
}

export interface PlayContext {
  readonly points: number;
  readonly range: RangeBand;
  /** Whether any living foe can be targeted (not hidden). */
  readonly canSee: boolean;
}

export interface Played {
  readonly fighters: DeckFighter[];
  readonly lines: string[];
}

/** Block a Guard card gives: sturdier fighters brace better. */
export function guardBlock(user: DeckFighter): number {
  return Math.round(5 + user.attributes.stamina * 0.5);
}

/** Who plays which card on whom. */
export interface Play {
  readonly user: DeckFighter;
  readonly target: DeckFighter | undefined;
  readonly card: Card;
}

interface Aimed extends Play {
  readonly target: DeckFighter;
}

function basicPlay(fighters: DeckFighter[], { user, target, card }: Aimed, rng: Rng): Played {
  const thrown = card.kind === 'kunai';
  if (slips(target, rng)) {
    const what = thrown ? 'kunai' : 'blow';
    return { fighters, lines: [`${target.name} slips aside from ${user.name}'s ${what}.`] };
  }
  const verb = thrown ? `throws a kunai at ${target.name}` : `strikes ${target.name}`;
  const scale = thrown ? KUNAI_SCALE : 1;
  const base = Math.max(1, Math.round(strikeDamage(user, target, rng.next()) * scale));
  const blow = { attacker: user, target, kind: attackKindOf(null, thrown) };
  const damage = kitDamage(fighters, blow, base);
  const landed = landHit(fighters, blow, damage, rng);
  return {
    fighters: landed.fighters,
    lines: [`${user.name} ${verb} for ${damage}.`, ...landed.lines],
  };
}

function jutsuPlay(fighters: DeckFighter[], { user, target, card }: Aimed, rng: Rng): Played {
  const t = card.technique;
  if (!t) return { fighters, lines: [] };
  const opener = `${user.name} uses ${t.name}!`;
  if (slips(target, rng)) return { fighters, lines: [opener, `${target.name} slips aside.`] };
  if (rng.chance(resistChance(user, target, t))) {
    return { fighters, lines: [opener, `${target.name} sees it coming.`] };
  }
  const blow = { attacker: user, target, kind: attackKindOf(t) };
  if (t.effect === 'stun' || t.effect === 'seal') {
    const held = holdPlay(fighters, { user, target, card }, t);
    const dazzled = confuse(held.fighters, blow, rng);
    return { fighters: dazzled.fighters, lines: [opener, ...held.lines, ...dazzled.lines] };
  }
  const damage = kitDamage(fighters, blow, techniqueDamage(user, target, t, rng.next()));
  const element = matchupLine(matchup(t.element, target.nature), target.name);
  const landed = landHit(fighters, blow, damage, rng);
  return {
    fighters: landed.fighters,
    lines: [
      opener,
      `${target.name} takes ${damage}.`,
      ...(element ? [element] : []),
      ...landed.lines,
    ],
  };
}

function holdPlay(fighters: DeckFighter[], { target }: Aimed, t: CombatTechnique): Played {
  if (t.effect === 'stun') {
    return {
      fighters: patch(fighters, target.id, { stunned: target.stunned + holdTurns(t) }),
      lines: [`${target.name} is dazed and will lose their turn!`],
    };
  }
  return {
    fighters: patch(fighters, target.id, { sealed: target.sealed + holdTurns(t) + 1 }),
    lines: [`Seals lock ${target.name}'s chakra!`],
  };
}

/** Resolves a technique or attack card from `user` onto `target` (ignored for self cards). */
export function playOn(fighters: DeckFighter[], play: Play, rng: Rng): Played {
  const { user, target, card } = play;
  const t = card.technique;
  if (t) {
    const paid = patch(fighters, user.id, {
      chakra: Math.max(0, user.chakra - chakraCost(user, t)),
    });
    const payer = paid.find((f) => f.id === user.id) ?? user;
    if (t.effect === 'heal') {
      const health = Math.min(payer.maxHealth, payer.health + healAmount(payer, t));
      return {
        fighters: patch(paid, payer.id, { health }),
        lines: [`${payer.name} uses ${t.name} and recovers ${health - payer.health}.`],
      };
    }
    return target && alive(target)
      ? jutsuPlay(paid, { user: payer, target, card }, rng)
      : { fighters: paid, lines: [] };
  }
  if (card.kind === 'guard') {
    const block = user.block + guardBlock(user);
    return {
      fighters: patch(fighters, user.id, { block }),
      lines: [`${user.name} braces (${block} block).`],
    };
  }
  return target && alive(target)
    ? basicPlay(fighters, { user, target, card }, rng)
    : { fighters, lines: [] };
}

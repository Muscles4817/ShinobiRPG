import { statTier, type StatGrade } from '@/systems/stats';

import type { CombatTechnique } from '../../contract';
import { shapeOf } from '../../gearContract';
import { isBodyMove, maxBreath } from '../../rules/breath';
import { familiarScale, repeatWeight } from '../../rules/familiarity';
import { hasVerb, techniquePower } from '../../rules/verbs';
import { beats, seenDefence, walksInto } from './adapt';
import { cardId, fitsBand, playable, type Card } from './cards';
import { breathOf, effortOf } from './effort';
import { beatsWeight, readsInTheMoment } from './judgement';
import { styleOf } from './reads';
import { opponentsOf, type Turn } from './senses';
import type { PlanFighter, Round } from './state';

/**
 * A trained fighter's style: the body moves their plain strike plays from. Nobody past the
 * academy throws the same punch all fight; when the plan reaches for a strike, a fighter with a
 * repertoire throws the move that suits the moment, and how well they pick is their feel for
 * it (taijutsu and wits together): a novice throws what hits hardest, a better feel reads the
 * defence they've seen and picks what gets past it (and holds back a blow that walks into a
 * Counter), and a fine one changes up before a foe who reads the fight has the move read. It is a
 * choice, never a roll: changing up for its own sake would only throw weaker moves. Untrained
 * bodies have no repertoire, and their strike stays a plain blow; so does one with a weapon in
 * hand.
 */

/** How many moves a repertoire holds, by taijutsu grade. */
export const REPERTOIRE_SIZE: Readonly<Record<StatGrade, number>> = {
  E: 2,
  D: 3,
  C: 4,
  B: 5,
  A: 6,
  S: 6,
};

/** The feel (taijutsu with wits) that reads a seen defence into the pick… */
const READS_DEFENCES: readonly StatGrade[] = ['D', 'C', 'B', 'A', 'S'];
/** …and that changes up before a move is read. */
const CHANGES_UP: readonly StatGrade[] = ['C', 'B', 'A', 'S'];

/** A walk into a seen Counter is held back this much. */
const WALKS_INTO_WEIGHT = 0.3;
/** Below this share of their breath, a fighter saves it: only cheap moves, or a plain blow. */
const WINDED_SHARE = 1 / 3;
/** What counts as a cheap move to a winded fighter. */
const CHEAP_BREATH = 3;

/** A move a plain strike can become: a body move that strikes, with nothing set aside for it. */
export function fitsRepertoire(t: CombatTechnique): boolean {
  if (!isBodyMove(t) || hasVerb(t, 'move') || hasVerb(t, 'counter')) return false;
  return !t.oncePerFight && !t.combo && !t.afterCost && t.swarmCost === undefined;
}

/** How many moves a repertoire holds at this taijutsu. */
export function repertoireSize(taijutsu: number): number {
  return REPERTOIRE_SIZE[statTier(taijutsu).grade];
}

function sizeFor(f: Pick<PlanFighter, 'attributes'>): number {
  return repertoireSize(f.attributes.taijutsu);
}

/**
 * The best repertoire for a kit: the strongest move of each kind first (a blow, a flurry, a
 * break), so it has answers to different defences, then the strongest of the rest.
 */
export function defaultRepertoire(f: Pick<PlanFighter, 'attributes' | 'techniques'>): string[] {
  const moves = f.techniques
    .filter(fitsRepertoire)
    .sort((a, b) => techniquePower(b) - techniquePower(a));
  const firsts = moves.filter(
    (t, i) => moves.findIndex((m) => styleOf(jutsu(m)) === styleOf(jutsu(t))) === i,
  );
  const ordered = [...firsts, ...moves.filter((t) => !firsts.includes(t))];
  return ordered.slice(0, sizeFor(f)).map((t) => t.id);
}

/** The moves a fighter's strike plays from: their own choice of what they know, or the best. */
export function repertoireOf(f: PlanFighter): CombatTechnique[] {
  const ids = f.repertoire ?? defaultRepertoire(f);
  const known = f.techniques.filter((t) => fitsRepertoire(t) && ids.includes(t.id));
  return known.slice(0, sizeFor(f));
}

function jutsu(technique: CombatTechnique): Card {
  return { kind: 'jutsu', technique };
}

function armed(f: PlanFighter): boolean {
  const held = f.gear?.held;
  return held !== undefined && shapeOf(held) !== 'knuckles';
}

/** The moves a strike plays from as this fighter stands: none with a weapon in hand. */
export function styleMoves(f: PlanFighter): CombatTechnique[] {
  return armed(f) ? [] : repertoireOf(f);
}

/** What a card is weighed as on instinct: a strike that plays a style, as the best of its moves. */
export function standIn(f: PlanFighter, card: Card): Card {
  if (card.kind !== 'strike') return card;
  const [best] = styleMoves(f).sort((a, b) => techniquePower(b) - techniquePower(a));
  return best ? jutsu(best) : card;
}

function feelOf(f: PlanFighter): StatGrade {
  return statTier((f.attributes.taijutsu + f.attributes.intellect) / 2).grade;
}

/** A plain blow's weight beside techniques' power, as a plan weighs it (`stepping.ts`). */
const STRIKE_POWER = 8;

/**
 * How fitting a card is now: how hard it hits (as plans rank their attacks: the worth guess
 * instinct uses overrates a daze), past a seen defence or into one, for a feel that reads them.
 */
function fitness(round: Round, self: PlanFighter, foe: PlanFighter, card: Card): number {
  const power = card.kind === 'jutsu' ? techniquePower(card.technique) : STRIKE_POWER;
  const reads = READS_DEFENCES.includes(feelOf(self));
  const seen = reads ? seenDefence(round.reads, foe, round.range) : undefined;
  const lean = !seen
    ? 1
    : beats(card, seen)
      ? beatsWeight(self)
      : walksInto(card, seen)
        ? WALKS_INTO_WEIGHT
        : 1;
  return power * lean;
}

/**
 * How fresh a card is: against a foe who reads the fight, a move thrown turns running, or leaned
 * on all fight, weighs less, so the style changes up before it is read (`rules/familiarity.ts`:
 * only such a foe reads a move more easily for seeing it again). Against anyone else the best
 * move is as good the fifth time as the first.
 */
function freshness(self: PlanFighter, foe: PlanFighter, card: Card): number {
  if (!CHANGES_UP.includes(feelOf(self)) || !readsInTheMoment(foe)) return 1;
  const id = card.kind === 'jutsu' ? card.technique.id : undefined;
  const running = self.streak?.card === cardId(card) ? self.streak.turns : 0;
  const leaned = id === undefined ? 1 : familiarScale(self.uses?.[id] ?? 0);
  return repeatWeight(running) / leaned;
}

/**
 * What a planned strike becomes: the move that suits the moment best, or the plain strike when
 * they have none to hand. Winded, they save their breath for a cheap move or a plain blow.
 */
export function styled(round: Round, turn: Turn, card: Card): Card {
  const { actor } = turn;
  if (card.kind !== 'strike') return card;
  const foe = turn.target ?? opponentsOf(round.fighters, actor)[0];
  const winded = breathOf(actor) < maxBreath(actor.attributes) * WINDED_SHARE;
  const moves = styleMoves(actor)
    .filter((t) => !winded || effortOf(actor, t).amount <= CHEAP_BREATH)
    .map(jutsu)
    .filter((c) => fitsBand(c, round.range) && playable(actor, c));
  if (!foe || moves.length === 0) return card;
  const score = (c: Card) => fitness(round, actor, foe, c) * freshness(actor, foe, c);
  const best = moves.reduce((a, b) => (score(b) > score(a) ? b : a));
  return score(best) >= score(card) ? best : card;
}

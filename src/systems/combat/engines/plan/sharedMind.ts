import { alive } from '../../rules/body';
import { tell } from '../../rules/telling';
import { isSource, raiseCost, raisedHealth } from '../../rules/minds';
import { mindmates } from './oneMind';
import { paying, say, type PlanFighter, type Round } from './state';

/**
 * Bodies of one mind in a planned fight (`mindContract.ts`, `rules/minds.ts`). They think with
 * the sharpest of them (their judgement is one), aim at one mark, and watch each other's backs:
 * while another of the mind stands in sight, nothing strikes one of them unseen. A mind's source
 * stands off the field, hidden, and takes no turns: find it with a Search or a sense, and its
 * fall takes every body it drives down with it; beat every body, and it has nothing left to fight
 * with. At the end of each exchange a body of the mind with the `raises` perk brings one fallen
 * body back up, for chakra, unless a seal was on it as it fell; raising gives a hidden raiser
 * away a little, as a glimpse does.
 */

type Fighters = readonly PlanFighter[];

function bodiesOf(fighters: Fighters, source: PlanFighter): PlanFighter[] {
  return mindmates(fighters, source).filter((o) => !isSource(o));
}

function sourceOf(fighters: Fighters, body: PlanFighter): PlanFighter | undefined {
  return mindmates(fighters, body).find(isSource);
}

/**
 * Still in the fight: up, and not a source with no body left, nor a body whose source is down.
 * Who is out this way is put down at the end of the exchange (`mindsAfter`).
 */
export function stillFighting(fighters: Fighters, f: PlanFighter): boolean {
  if (!alive(f)) return false;
  if (isSource(f)) return bodiesOf(fighters, f).some(alive);
  const source = sourceOf(fighters, f);
  return !source || alive(source);
}

/** A source keeps off the field: it takes no turns. */
export function keepsOffField(f: PlanFighter): boolean {
  return isSource(f);
}

/** Watched: another of their mind stands in sight, so nothing reaches them unseen. */
export function watched(fighters: Fighters, target: PlanFighter): boolean {
  return mindmates(fighters, target).some((m) => alive(m) && !m.hidden);
}

/** The mark a body of a mind aims at, left to its judgement: its side's, if it is among the foes. */
export function mindsMark(
  self: PlanFighter,
  foes: Fighters,
  round: Pick<Round, 'fighters' | 'mark' | 'foeMark'>,
): PlanFighter | undefined {
  if (mindmates(round.fighters, self).length === 0) return undefined;
  const mark = self.side === 'enemy' ? round.foeMark : round.mark;
  return foes.find((f) => f.id === mark);
}

const RAISED_LINE = '{b} stir{b.s} where {b.they} fell and stand{b.s} up again.';
const SEALED_LINE = 'The seal on {b} holds, and {b.they} stay{b.s} down.';
const BODIES_DROP_LINE = 'With {s} down, {b} drop{b.s} where {b.they} stand{b.s}.';
const SOURCE_YIELDS_LINE = 'With nothing left to fight with, {s} give{s.s} up the fight.';

function raised(round: Round, raiser: PlanFighter, body: PlanFighter): Round {
  const { fellAt: _fell, ...up } = body;
  const fighters = round.fighters.map((f) => {
    if (f.id === body.id) return { ...up, health: raisedHealth(body), stunned: 0 };
    if (f.id !== raiser.id) return f;
    const glimpsed = f.hidden ? { exposure: (f.exposure ?? 0) + 1 } : {};
    return { ...f, ...paying(f, raiseCost(f)), ...glimpsed };
  });
  return say({ ...round, fighters }, tell(RAISED_LINE, { b: body }));
}

function canRaise(f: PlanFighter): boolean {
  return alive(f) && f.perks.includes('raises') && f.chakra >= raiseCost(f);
}

/** Each raiser of a mind brings one fallen body of it back up, unless a seal holds it down. */
function raisings(round: Round): Round {
  return round.fighters.filter(canRaise).reduce((now, r) => {
    const raiser = now.fighters.find((f) => f.id === r.id);
    if (!raiser || !canRaise(raiser)) return now;
    const down = mindmates(now.fighters, raiser).filter(
      (b) => !alive(b) && !isSource(b) && b.fellAt === now.number,
    );
    const free = down.find((b) => b.sealed === 0);
    if (free) return raised(now, raiser, free);
    const [sealed] = down;
    return sealed ? say(now, tell(SEALED_LINE, { b: sealed })) : now;
  }, round);
}

/** Puts down whoever is out of the fight with their mind: bodies of a fallen source, a lone source. */
function putDown(round: Round): Round {
  return round.fighters.reduce((now, f) => {
    if (!alive(f) || stillFighting(now.fighters, f)) return now;
    const source = isSource(f) ? f : sourceOf(now.fighters, f);
    const line = isSource(f)
      ? tell(SOURCE_YIELDS_LINE, { s: f })
      : tell(BODIES_DROP_LINE, { s: source ?? f, b: f });
    const fighters = now.fighters.map((o) =>
      o.id === f.id ? { ...o, health: 0, fellAt: now.number } : o,
    );
    return say({ ...now, fighters }, line);
  }, round);
}

/** At the end of an exchange: fallen bodies raised, and whoever their mind left out put down. */
export function mindsAfter(round: Round): Round {
  return putDown(raisings(round));
}

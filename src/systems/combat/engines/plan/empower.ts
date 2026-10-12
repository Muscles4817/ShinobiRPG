import { alive } from '../../rules/body';
import { harmLine } from '../../rules/narration';
import {
  attributesAfterEmpower,
  driveOf,
  empower,
  empowerEnds,
  healthAfterPrice,
  type EffectUse,
} from '../../rules/verbs';
import { fighterIn, say, type PlanFighter, type Round } from './state';

/**
 * Empower in a planned fight: the user's stats rise at once (every rule reads them raised), the
 * body pays its price as each exchange ends, and the stats fall back when it runs out. An
 * empower already in force isn't stacked.
 */

export function empowerSelf(round: Round, actor: PlanFighter, use: EffectUse<'empower'>): Round {
  if (actor.empowered) return say(round, `${actor.name} is already pushing past their limits.`);
  const change = empower(actor, use, { drive: driveOf(actor, use), exchange: round.number });
  const fighters = round.fighters.map((f) => (f.id === actor.id ? { ...f, ...change } : f));
  return say({ ...round, fighters }, `Chakra surges through ${actor.name}'s body.`);
}

function ended(f: PlanFighter): PlanFighter {
  const { empowered: _over, ...rest } = f;
  return { ...rest, attributes: attributesAfterEmpower(f) };
}

/** One fighter's empower as the exchange ends: the price paid, and the end if it has come. */
function tick(round: Round, id: string, exchange: number): Round {
  const f = fighterIn(round, id);
  if (!f?.empowered || !alive(f)) return round;
  const health = healthAfterPrice(f);
  const paid = { ...f, health };
  const over = empowerEnds(f, exchange);
  const next = over ? ended(paid) : paid;
  const fighters = round.fighters.map((g) => (g.id === id ? next : g));
  const price = f.health - health;
  const lines = [
    ...(price > 0 ? [harmLine(`The strain tells on ${f.name}'s body.`, price)] : []),
    ...(over ? [`${f.name}'s surge of strength fades.`] : []),
  ];
  return say({ ...round, fighters }, ...lines);
}

/** As an exchange ends: every empower in force takes its price, and those run out end. */
export function afterEmpowers(round: Round, exchange: number): Round {
  return round.fighters.reduce((r, f) => tick(r, f.id, exchange), round);
}

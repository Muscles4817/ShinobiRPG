import { stepWords } from '@/systems/techniques';

import { alive } from '../../rules/body';
import { harmLine } from '../../rules/narration';
import {
  attributesAfterEmpower,
  canOpen,
  CHAKRA_SURGE_PER_STEP,
  driveOf,
  empower,
  empowerEnds,
  givesOut,
  healthAfterPrice,
  openStep,
  type EffectUse,
} from '../../rules/verbs';
import { fighterIn, say, type PlanFighter, type Round } from './state';
import { tell } from '../../rules/telling';

/**
 * Empower in a planned fight: the user's stats rise at once (every rule reads them raised), the
 * body pays its price as each exchange ends, and the stats fall back when it runs out. An
 * empower already in force isn't stacked, but a ladder climbs: opening a deeper gate replaces
 * the one below, releasing a surge of chakra for each step climbed, and holds until the body
 * gives out (`rules/verbs/ladders.ts`), when it slams shut and leaves its user reeling.
 */

/** Exchanges a fighter loses when an open ladder gives out. */
const GIVE_OUT_TURNS = 1;

export function empowerSelf(round: Round, actor: PlanFighter, use: EffectUse<'empower'>): Round {
  const { opens } = use.effect;
  const climbs = opens !== undefined && canOpen(actor, use.technique);
  if (actor.empowered && !climbs) {
    return say(round, tell('{a} {a.is} already pushing past {a.their} limits.', { a: actor }));
  }
  const change = empower(actor, use, { drive: driveOf(actor, use), exchange: round.number });
  const climbed = opens ? opens.step - openStep(actor, opens.ladder) : 0;
  const chakra = Math.min(actor.maxChakra, actor.chakra + climbed * CHAKRA_SURGE_PER_STEP);
  const fighters = round.fighters.map((f) => (f.id === actor.id ? { ...f, ...change, chakra } : f));
  const told = opens
    ? tell('{a} force{a.s} open {gate}; chakra roars through {a.their} body.', {
        a: actor,
        gate: stepWords(opens),
      })
    : tell('Chakra surges through {a.poss} body.', { a: actor });
  return say({ ...round, fighters }, told);
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
  const spent = f.empowered.opened !== undefined && givesOut(health, f.maxHealth);
  const over = empowerEnds(f, exchange) || spent;
  const next = spent
    ? { ...ended(paid), stunned: paid.stunned + GIVE_OUT_TURNS }
    : over
      ? ended(paid)
      : paid;
  const fighters = round.fighters.map((g) => (g.id === id ? next : g));
  const price = f.health - health;
  const lines = [
    ...(price > 0 ? [harmLine(tell('The strain tells on {a.poss} body.', { a: f }), price)] : []),
    ...(spent ? [tell('{a.poss} body gives out, and the gates slam shut.', { a: f })] : []),
    ...(over && !spent ? [tell('{a.poss} surge of strength fades.', { a: f })] : []),
  ];
  return say({ ...round, fighters }, ...lines);
}

/** As an exchange ends: every empower in force takes its price, and those run out end. */
export function afterEmpowers(round: Round, exchange: number): Round {
  return round.fighters.reduce((r, f) => tick(r, f.id, exchange), round);
}

import type { Rng } from '@/core';

import type { CombatTechnique } from '../../contract';
import { alive } from '../../rules/body';
import {
  areaLoss,
  burnsOff,
  fearedLoss,
  SETTLE_EXCHANGES,
  settleDrain,
  spentFrom,
  swarmAffords,
  swarmSearch,
} from '../../rules/swarms';
import { tell } from '../../rules/telling';
import { ABSORB_SHARE, areaSize, effectsOf } from '../../rules/verbs';
import type { Hive } from './hive';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';

/**
 * A hive in a planned fight (`rules/swarms.ts`): swarm techniques spend insects, a swarm
 * technique that reaches a foe leaves insects settled on them, drawing their chakra into the
 * host each exchange and keeping them from hiding until they drop off or fire burns them off,
 * and a host loses insects to areas that catch them and to elements their strain fears. A
 * hive also helps its host find the hidden. Insects don't breed mid-fight.
 */

/** Whether a fighter has the insects a technique asks of their hive. */
export function hasInsectsFor(fighter: Hive, t: CombatTechnique): boolean {
  return swarmAffords(fighter.swarm, t.swarmCost);
}

/** What a technique spends from its user's hive, as a change to them. */
export function swarmSpent(fighter: Hive, t: CombatTechnique): Pick<Hive, 'swarm'> {
  return fighter.swarm && t.swarmCost ? { swarm: spentFrom(fighter.swarm, t.swarmCost) } : {};
}

function withHive(round: Round, id: string, change: (f: PlanFighter) => PlanFighter): Round {
  return { ...round, fighters: round.fighters.map((f) => (f.id === id ? change(f) : f)) };
}

function unsettled(f: PlanFighter): PlanFighter {
  const { settled: _gone, ...rest } = f;
  return rest;
}

function power(t: CombatTechnique): number {
  return Math.max(0, ...t.effects.map((e) => e.power));
}

/** A swarm technique reached these foes: its user's insects settle on those still standing. */
export function settleOn(
  round: Round,
  actorId: string,
  foes: readonly PlanFighter[],
  t: CombatTechnique,
): Round {
  const host = fighterIn(round, actorId);
  if (!host?.swarm || !t.swarmCost) return round;
  const settled = {
    hostId: host.id,
    perExchange: settleDrain(host.swarm, power(t)),
    exchanges: SETTLE_EXCHANGES,
  };
  return foes.reduce((now, foe) => {
    const target = fighterIn(now, foe.id);
    if (!target || !alive(target)) return now;
    const covered = withHive(now, foe.id, (f) => ({ ...f, settled, hidden: false }));
    return say(covered, tell('Insects settle on {t}.', { t: target }));
  }, round);
}

/** Fire (or what else the strain fears) burns settled insects off whoever it hits. */
function burntOff(round: Round, target: PlanFighter, t: CombatTechnique): Round {
  const host = target.settled ? fighterIn(round, target.settled.hostId) : undefined;
  if (!host?.swarm || !burnsOff(host.swarm, t.element)) return round;
  const cleared = withHive(round, target.id, unsettled);
  return say(cleared, tell('The insects on {t} burn away.', { t: target }));
}

function lostFrom(target: PlanFighter, t: CombatTechnique, dealt: number): number {
  const swarm = target.swarm;
  if (!swarm) return 0;
  const [area] = effectsOf(t, 'area');
  const caught = area ? areaLoss(swarm, areaSize(area), t.element) : 0;
  return Math.min(swarm.count, caught + fearedLoss(swarm, dealt, t.element));
}

/** A technique hit someone: insects on them may burn off, and their own hive may suffer. */
export function swarmStruck(
  round: Round,
  targetId: string,
  t: CombatTechnique,
  dealt: number,
): Round {
  const target = fighterIn(round, targetId);
  if (!target) return round;
  const burnt = burntOff(round, target, t);
  const lost = lostFrom(target, t, dealt);
  if (lost <= 0 || !target.swarm) return burnt;
  const swarm = { ...target.swarm, count: target.swarm.count - lost };
  const thinned = withHive(burnt, target.id, (f) => ({ ...f, swarm }));
  return say(thinned, tell('Insects die in {t.poss} hive.', { t: target }));
}

/** Settled insects draw a fighter's chakra, feeding their host's. */
function drawn(round: Round, carrier: PlanFighter): Round {
  const settled = carrier.settled;
  if (!settled) return round;
  const taken = Math.min(carrier.chakra, settled.perExchange);
  const host = fighterIn(round, settled.hostId);
  const fed = host && alive(host) ? Math.round(taken * ABSORB_SHARE) : 0;
  const left = settled.exchanges - 1;
  const after = withHive(round, carrier.id, (f) =>
    left > 0
      ? { ...f, chakra: f.chakra - taken, settled: { ...settled, exchanges: left }, hidden: false }
      : unsettled({ ...f, chakra: f.chakra - taken }),
  );
  const fedHost =
    host && fed > 0
      ? {
          ...after,
          fighters: patch(after.fighters, host.id, {
            chakra: Math.min(host.maxChakra, host.chakra + fed),
          }),
        }
      : after;
  const line = left > 0 ? 'The insects on {t} feed.' : 'The insects drop off {t}.';
  return say(fedHost, tell(line, { t: carrier }));
}

/** A host's hive finds hidden foes on its own, the keener the strain and the fuller the hive. */
function sensed(round: Round, host: PlanFighter, rng: Rng): Round {
  const chance = swarmSearch(host.swarm);
  if (chance <= 0 || !alive(host)) return round;
  const found = round.fighters.filter(
    (f) => f.side !== host.side && f.hidden && alive(f) && rng.chance(chance),
  );
  return found.reduce(
    (now, foe) =>
      say(
        withHive(now, foe.id, (f) => ({ ...f, hidden: false })),
        tell('{a.poss} insects find {t}.', { a: host, t: foe }),
      ),
    round,
  );
}

/** At the end of an exchange: settled insects feed and wear off, and hives hunt the hidden. */
export function swarmsAfter(round: Round, rng: Rng): Round {
  const fed = round.fighters.reduce((now, f) => {
    const carrier = fighterIn(now, f.id);
    return carrier?.settled && alive(carrier) ? drawn(now, carrier) : now;
  }, round);
  return fed.fighters.reduce((now, f) => (f.swarm ? sensed(now, f, rng) : now), fed);
}

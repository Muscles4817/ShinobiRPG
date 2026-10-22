import type { Rng } from '@/core';

import type { CombatTechnique } from '../../contract';
import { alive } from '../../rules/body';
import {
  areaLoss,
  blindSlipScale,
  glowSlipScale,
  settleVenom,
  swarmPowerScale,
  swarmSlipScale,
  burnsOff,
  fearedLoss,
  SETTLE_EXCHANGES,
  settleDrain,
  spentFrom,
  swarmAffords,
  swarmSearch,
} from '../../rules/swarms';
import { harmLine } from '../../rules/narration';
import { tell } from '../../rules/telling';
import { ABSORB_SHARE, areaSize, effectsOf } from '../../rules/verbs';
import type { Hive } from './hive';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';

/**
 * A hive in a planned fight (`rules/swarms.ts`): swarm techniques spend insects, a swarm
 * technique that reaches a foe leaves insects settled on them (on a puppet, they climb its threads
 * to its master), drawing their chakra into the
 * host each exchange and keeping them from hiding until they drop off or fire burns them off,
 * and a host loses insects to areas that catch them and to elements their strain fears. A
 * hive also helps its host find the hidden. Insects don't breed mid-fight.
 */

/** The host whose insects sit on a fighter, if any still stands in the fight. */
function settledHost(round: Round, fighter: Hive): PlanFighter | undefined {
  return fighter.settled ? fighterIn(round, fighter.settled.hostId) : undefined;
}

/** A swarm attack's slip scale (speed, camouflage); 1 for anything else. */
export function swarmSlips(attacker: Hive, t: CombatTechnique): number {
  return attacker.swarm && t.swarmCost ? swarmSlipScale(attacker.swarm.strain) : 1;
}

/** A swarm attack's power scale (bite, size); 1 for anything else. */
export function swarmPower(attacker: Hive, t: CombatTechnique): number {
  return attacker.swarm && t.swarmCost ? swarmPowerScale(attacker.swarm.strain) : 1;
}

/**
 * How settled insects change any attack's slip: a target marked by glowing insects is easier to
 * hit; an attacker blinded by scales aims worse.
 */
export function settledSlips(round: Round, attacker: Hive, target: Hive): number {
  const glow = settledHost(round, target)?.swarm;
  const blind = settledHost(round, attacker)?.swarm;
  return (glow ? glowSlipScale(glow.strain) : 1) * (blind ? blindSlipScale(blind.strain) : 1);
}

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
    const struck = fighterIn(now, foe.id);
    if (!struck || !alive(struck)) return now;
    // On a puppet, they crawl up its threads to whoever works them.
    const master = threadedTo(now, struck);
    const target = master ?? struck;
    const covered = withHive(now, target.id, (f) => ({ ...f, settled, hidden: false }));
    const line = master ? UP_THE_THREADS : 'Insects settle on {t}.';
    return say(covered, tell(line, { t: target, p: struck }));
  }, round);
}

const UP_THE_THREADS = 'Insects swarm up {p.poss} threads and settle on {t}.';

/** The master a puppet hangs from, while they stand. */
function threadedTo(round: Round, puppet: PlanFighter): PlanFighter | undefined {
  const master = puppet.puppet && puppet.summoner ? fighterIn(round, puppet.summoner) : undefined;
  return master && alive(master) ? master : undefined;
}

/** Fire (or what else the strain fears) burns settled insects off whoever it hits. */
function burntOff(round: Round, target: PlanFighter, t: CombatTechnique): Round {
  const host = target.settled ? fighterIn(round, target.settled.hostId) : undefined;
  if (!host?.swarm || !burnsOff(host.swarm, t.element)) return round;
  const cleared = withHive(round, target.id, unsettled);
  return say(cleared, tell('The insects on {t} burn away.', { t: target }));
}

function lostFrom(target: Hive, t: CombatTechnique, dealt: number): number {
  const swarm = target.swarm;
  if (!swarm) return 0;
  const [area] = effectsOf(t, 'area');
  const caught = area ? areaLoss(swarm, areaSize(area), t.element) : 0;
  return Math.min(swarm.count, caught + fearedLoss(swarm, dealt, t.element));
}

/**
 * Share of a host's whole hive a technique would kill if it hit them for `dealt` (an area that
 * catches them, an element their strain fears), for a fighter reckoning what an attack is worth.
 */
export function hiveToll(target: Hive, t: CombatTechnique, dealt: number): number {
  const swarm = target.swarm;
  return swarm && swarm.cap > 0 ? lostFrom(target, t, dealt) / swarm.cap : 0;
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
  return envenomed(say(fedHost, tell(line, { t: carrier })), carrier, host);
}

/** Venomous insects poison whoever they sit on. */
function envenomed(round: Round, carrier: PlanFighter, host: PlanFighter | undefined): Round {
  const venom = host?.swarm ? settleVenom(host.swarm) : 0;
  const now = fighterIn(round, carrier.id);
  if (venom <= 0 || !now) return round;
  const hurt = Math.min(now.health, venom);
  const after = {
    ...round,
    fighters: patch(round.fighters, now.id, { health: now.health - hurt }),
  };
  return say(after, harmLine(tell('The venom works on {t}.', { t: now }), hurt));
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

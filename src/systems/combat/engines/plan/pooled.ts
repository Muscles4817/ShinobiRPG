import type { PlanFighter, Round } from './state';

/**
 * Bodies with no chakra of their own (`CombatCall.pooled`: Pain's Paths, worked by Nagato): each
 * holds what its caller holds, and what it spends is its caller's. A body spends from what it held
 * at the last squaring; as each exchange ends, everything the caller's bodies spent comes off the
 * caller, and every body holds what the caller has left.
 */

/** What a pooled body starts with: its caller's chakra, and their whole tank. */
export function pooledFrom(caller: PlanFighter): Partial<PlanFighter> {
  return { chakra: caller.chakra, maxChakra: caller.maxChakra, pooledAt: caller.chakra };
}

function spentBy(body: PlanFighter): number {
  return body.pooledAt === undefined ? 0 : Math.max(0, body.pooledAt - body.chakra);
}

function squared(round: Round, callerId: string): Round {
  const bodies = round.fighters.filter((f) => f.summoner === callerId && f.pooledAt !== undefined);
  const caller = round.fighters.find((f) => f.id === callerId);
  if (!caller || bodies.length === 0) return round;
  const spent = bodies.reduce((sum, b) => sum + spentBy(b), 0);
  const chakra = Math.max(0, caller.chakra - spent);
  const spentSoFar = (caller.chakraSpent ?? 0) + spent;
  return {
    ...round,
    fighters: round.fighters.map((f) => {
      if (f.id === callerId) return { ...f, chakra, chakraSpent: spentSoFar };
      return bodies.includes(f) ? { ...f, chakra, pooledAt: chakra } : f;
    }),
  };
}

/** As an exchange ends: every caller pays for what their pooled bodies spent. */
export function pooledAfter(round: Round): Round {
  const callers = new Set(
    round.fighters.flatMap((f) => (f.pooledAt === undefined ? [] : [f.summoner ?? ''])),
  );
  return [...callers].reduce(squared, round);
}

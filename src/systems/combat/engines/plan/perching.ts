import { alive } from '../../rules/body';
import { tell } from '../../rules/telling';
import { fighterIn, paying, say, type PlanFighter, type Round } from './state';

/**
 * Sage toads perched on their summoner (Fukasaku and Shima on Jiraiya's shoulders). Called like
 * any summon, they land on their caller's shoulders rather than the field (`perchOn`), so nothing
 * strikes them apart from their caller. While they perch they draw natural energy in with their
 * caller: Sage Mode can be meditated into (it `needsCalls` them) and doesn't run out while they
 * stay (`empower.ts`), and their arts with him can be thrown (Goemon, their duet). They are paid
 * for every exchange like any summon (`perchesKept`); when their caller can't pay, or falls,
 * they go home, and the mode runs out after them.
 */

type Fighter = PlanFighter;

const PERCHES = 'A puff of smoke, and {s} perch{s.es} on {a.poss} shoulder, eyes half shut.';
const GONE = 'The sage toads vanish from {a.poss} shoulders in a puff of smoke.';
const UNPAID =
  'The sage toads can’t be kept any longer, and they drop from {a.poss} shoulders in a puff of smoke.';

/** A sage toad answering its caller: out, and perched on their shoulder. */
export function perchOn(round: Round, caller: Fighter, toad: Fighter): Round {
  const id = toad.callId ?? '';
  const fighters = round.fighters.map((f) =>
    f.id === caller.id
      ? { ...f, perched: [...(f.perched ?? []), id], summonsOut: [...(f.summonsOut ?? []), id] }
      : f,
  );
  return say({ ...round, fighters }, tell(PERCHES, { a: caller, s: toad }));
}

/** What a caller pays each exchange for the toads perched on them. */
export function perchUpkeep(caller: Fighter): number {
  return (caller.perched ?? []).reduce(
    (sum, id) => sum + (caller.calls?.find((c) => c.id === id)?.upkeep ?? 0),
    0,
  );
}

/** The toads perched on a caller go home: unpaid, or their caller down. */
function home(caller: Fighter): Fighter {
  const perched = caller.perched ?? [];
  const { perched: _gone, ...rest } = caller;
  const fates = Object.fromEntries(perched.map((id) => [id, 'sent-home' as const]));
  return {
    ...rest,
    summonsOut: (caller.summonsOut ?? []).filter((id) => !perched.includes(id)),
    summonFates: { ...caller.summonFates, ...fates },
  };
}

/** As an exchange ends: each caller pays for the toads perched on them, or they go home. */
export function perchesKept(round: Round): Round {
  return round.fighters.reduce((now, f) => {
    const caller = fighterIn(now, f.id);
    if (!caller || (caller.perched ?? []).length === 0) return now;
    const upkeep = perchUpkeep(caller);
    const keeps = alive(caller) && caller.chakra >= upkeep;
    const next = keeps ? { ...caller, ...paying(caller, upkeep) } : home(caller);
    const fighters = now.fighters.map((g) => (g.id === caller.id ? next : g));
    if (keeps) return { ...now, fighters };
    return say({ ...now, fighters }, tell(alive(caller) ? UNPAID : GONE, { a: caller }));
  }, round);
}

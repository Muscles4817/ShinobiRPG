import type { Assessment } from './assess';
import { OBJECTIVES, type HeldObjective as Held, type Objective } from './shape';
import type { Identity } from './identity';

/**
 * Objectives (`docs/design/combat-ai-plan.md` Part 6): what a fighter is trying to bring about
 * over the next few exchanges. Each objective the moment allows is scored from the fighter's
 * identity (what they lean towards), what the assessment says it would gain, and what it would
 * cost; the active one is kept unless another beats it by a margin their discipline sets, and
 * a few moments override that margin (a killer in reach, nobody to fight, a foe to finish).
 * The runner-up is kept as the fallback. In shadow: chosen and logged, never acted on yet.
 *
 * A first set, the ones today's engine can already act on; protect, deceive, deny, outlast and
 * disengage come when the evidence asks for them.
 */

/** Objectives that take over at once when their moment comes, whatever is held. */
const INTERRUPTS: ReadonlySet<Objective> = new Set(['survive', 'find', 'finish']);

/** The margin a challenger must win by: a disciplined fighter holds their line. */
const HOLD_MARGIN = { base: 0.05, perDiscipline: 0.3 } as const;
/** Pools below this share make recovering worth thinking about, when nothing else is paid for. */
const RUNNING_LOW = 0.3;
/** Pools below this share make recovering worth thinking about whatever is left. */
const RUN_DRY = 0.1;
/** What being pressed (outclassed, or a foe who could take much of them) adds to escalating. */
const PRESSED = 0.4;

type Scorer = (a: Assessment, id: Identity) => number | null;

const P = (id: Identity) => id.philosophy;

/** Each objective's worth now, or null when the moment doesn't allow it. */
const SCORES: Readonly<Record<Objective, Scorer>> = {
  'wear-down': (a, id) =>
    a.nothingInSight ? null : 0.3 + 0.5 * P(id).overwhelm + 0.3 * id.aggression,
  finish: (a, id) =>
    a.canEnd ? 1.2 : a.openFoe ? 0.7 + 0.3 * P(id).overwhelm + 0.2 * id.aggression : null,
  'set-up': (a, id) =>
    a.canSetUp ? 0.2 + 0.6 * P(id).outwit + 0.4 * id.deception + (a.outclassed ? 0.15 : 0) : null,
  survive: (a, id) => (a.killer ? 1.4 + 0.3 * (1 - id.risk) : null),
  'control-distance': (a, id) => (a.atHome ? null : 0.2 + 0.8 * id.rangePull),
  recover: (a, id) => {
    const low = Math.min(a.chakra, a.breath);
    if (low >= RUN_DRY && (low >= RUNNING_LOW || a.canFight)) return null;
    return (
      0.3 +
      (RUNNING_LOW - low) * 2 +
      0.3 * id.resources +
      0.3 * P(id).outlast -
      (a.danger > 0.5 ? 0.3 : 0)
    );
  },
  find: (a) => (a.nothingInSight ? 1.3 : null),
  escalate: (a, id) => {
    if (!a.canEscalate) return null;
    const pressed = a.outclassed || a.danger > 0.4 ? PRESSED : 0;
    // A ladder is how its climber fights; anything else is kept for when it's needed.
    const style = a.climbs ? 0.3 : 0;
    return 0.3 + 0.4 * P(id).overwhelm + 0.2 * id.risk - 0.3 * id.resources + pressed + style;
  },
};

/** Every objective the moment allows, best first, with its score. */
export function scored(a: Assessment, identity: Identity): { id: Objective; score: number }[] {
  return OBJECTIVES.flatMap((o) => {
    const score = SCORES[o](a, identity);
    return score === null ? [] : [{ id: o, score }];
  }).sort((x, y) => y.score - x.score);
}

/**
 * The objective to hold now: the best, unless the one held is still allowed and within the
 * margin (an interrupt takes over regardless). With nothing allowed, wearing down.
 */
export function choose(
  a: Assessment,
  identity: Identity,
  { held, now }: { held: Held | undefined; now: number },
): Held {
  const options = scored(a, identity);
  const [best, next] = options;
  if (!best) return { id: 'wear-down', since: held?.id === 'wear-down' ? held.since : now };
  const keeping = held ? options.find((o) => o.id === held.id) : undefined;
  const margin = HOLD_MARGIN.base + HOLD_MARGIN.perDiscipline * identity.discipline;
  const stays =
    held !== undefined &&
    keeping !== undefined &&
    !(INTERRUPTS.has(best.id) && best.id !== held.id) &&
    best.score - keeping.score < margin;
  if (stays) {
    const fallback = options.find((o) => o.id !== held.id)?.id;
    return { id: held.id, since: held.since, ...(fallback ? { fallback } : {}) };
  }
  return {
    id: best.id,
    since: held?.id === best.id ? held.since : now,
    ...(next ? { fallback: next.id } : {}),
  };
}

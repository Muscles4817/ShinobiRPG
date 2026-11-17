import { clamp } from '@/core';
import { statTier, STAT_GRADES } from '@/systems/stats';

import type { CombatSetup, CombatTechnique } from '../../contract';
import { alive } from '../../rules/body';
import { causeLine } from '../../rules/causes';
import { tell } from '../../rules/telling';
import { isPinned } from '../../rules/verbs';
import { rushStrike } from './arms';
import { isDazed } from './daze';
import { distanceBetween } from './distance';
import { effortOf } from './effort';
import { inSight, opponentsOf, type Turn } from './senses';
import { fighterIn, patch, paying, say, type PlanFighter, type Round } from './state';

/**
 * Close quarters, two rules on trial (`CombatExperiments.rushing`, `handSigns`; owner's decisions
 * in `docs/design/combat-ai-plan.md`, "Close quarters"):
 *
 * - **Rushing in.** A taijutsu fighter's step that reaches close carries a blow as they arrive,
 *   lighter than a set strike and met by the ready defence as any blow is. Getting in is no
 *   longer a turn handed to the foe; getting in on someone faster still is the hard case, since
 *   their turn comes first.
 * - **Hand signs up close.** A technique that needs hand signs (read from its art and rank: the
 *   body arts need none) is a contest when an able foe stands close and can see its caster: the
 *   caster's speed and chakra control against the crowder's speed and taijutsu, harder the more
 *   signs it takes. Lost, the seals come apart, the turn is gone and half the chakra with it. A
 *   dazed or held foe crowds no one.
 */

/** A fighter is a taijutsu fighter from this grade in it, or where it is their best art. */
const RUSHER_FROM = 'C';
/** How much each sign adds to the chance the seals come apart, between equals. */
const PER_SIGN = 0.15;
/** How much each point of rating between them moves it. */
const PER_POINT = 0.02;
const CROWDED_MIN = 0.05;
const CROWDED_MAX = 0.9;

const ARTS = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'] as const;

/** Hand signs a technique takes: none for the body arts, more the higher its rank. */
export function signsOf(t: Pick<CombatTechnique, 'discipline' | 'rank'>): number {
  if (t.discipline === 'taijutsu' || t.discipline === 'kenjutsu') return 0;
  const rank = STAT_GRADES.indexOf(t.rank ?? 'E');
  return rank <= 1 ? 1 : rank <= 3 ? 2 : 3;
}

function isRusher(f: PlanFighter): boolean {
  const a = f.attributes;
  const best = Math.max(...ARTS.map((art) => a[art]));
  const grade = STAT_GRADES.indexOf(statTier(a.taijutsu).grade);
  return grade >= STAT_GRADES.indexOf(RUSHER_FROM) || a.taijutsu >= best;
}

/** The rules a fight tries, on the fighters it applies to. */
export function withCloseQuarters(
  fighters: readonly PlanFighter[],
  setup: Pick<CombatSetup, 'experiments'>,
): PlanFighter[] {
  const { rushing, handSigns, standFirm } = setup.experiments ?? {};
  return fighters.map((f) => ({
    ...f,
    ...(rushing && isRusher(f) ? { rushes: true as const } : {}),
    ...(handSigns ? { crowdable: true as const } : {}),
    ...(standFirm ? { standsFirm: true as const } : {}),
  }));
}

/** After a step: a rusher who made it in close on their foe strikes as they arrive. */
export function rushedIn(before: Round, after: Round, turn: Turn): Round {
  const { actor, target } = turn;
  if (!actor.rushes || !target) return after;
  const was = distanceBetween(before, actor.id, target.id);
  const now = distanceBetween(after, actor.id, target.id);
  const foe = fighterIn(after, target.id);
  const self = fighterIn(after, actor.id);
  if (was === 'close' || now !== 'close' || !foe || !self || !alive(foe) || !alive(self))
    return after;
  return rushStrike(say(after, tell('{a} strike{a.s} as {a.they} land{a.s}.', { a: self })), {
    ...turn,
    actor: self,
    target: foe,
  });
}

/** The foe crowding a caster up close: standing, steady, free and seeing them; the quickest. */
function crowder(round: Round, caster: PlanFighter): PlanFighter | undefined {
  const close = opponentsOf(round.fighters, caster).filter(
    (f) =>
      alive(f) &&
      !isDazed(f) &&
      !isPinned(f) &&
      inSight(f, caster) &&
      distanceBetween(round, f.id, caster.id) === 'close',
  );
  return close.sort((a, b) => crowding(b) - crowding(a))[0];
}

const crowding = (f: PlanFighter) => f.attributes.speed + f.attributes.taijutsu / 2;
const sealing = (f: PlanFighter) => f.attributes.speed + f.attributes.chakraControl / 2;

/** The chance the seals come apart. */
export function crowdedChance(caster: PlanFighter, foe: PlanFighter, signs: number): number {
  const gap = crowding(foe) - sealing(caster);
  return clamp(signs * PER_SIGN + gap * PER_POINT, CROWDED_MIN, CROWDED_MAX);
}

const CAME_APART =
  '{b} {b.is} on {a.them} before the seals are done, and {a.poss} {what} comes apart.';

/**
 * Before a technique is cast: whether the seals come apart, and the round if they did (the turn
 * spent, half its chakra lost). Null when it goes ahead.
 */
export function sealsBroken(round: Round, turn: Turn, t: CombatTechnique): Round | null {
  const { actor, rng } = turn;
  const signs = signsOf(t);
  if (!actor.crowdable || signs === 0) return null;
  const foe = crowder(round, actor);
  if (!foe || !rng.chance(crowdedChance(actor, foe, signs))) return null;
  const { pool, amount } = effortOf(actor, t);
  const spent = pool === 'chakra' ? paying(actor, amount / 2) : {};
  const fighters = patch(round.fighters, actor.id, spent);
  const line = tell(CAME_APART, { a: actor, b: foe, what: t.name });
  return say({ ...round, fighters }, causeLine(line, 'crowded'));
}

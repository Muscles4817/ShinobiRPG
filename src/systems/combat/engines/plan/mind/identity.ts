import type { RangeBand } from '../../../contract';
import {
  COMBAT_PHILOSOPHIES,
  type CombatFighting,
  type CombatPhilosophy,
} from '../../../fightingContract';
import { isBodyMove } from '../../../rules/breath';
import { attackBands, hasTrait, homeBand } from '../../../rules/kit';
import { inReach, reachOf } from '../../../rules/range';
import { isTrump } from '../../../rules/trumps';
import { hasVerb, isHarmful, isHindering, isWounding } from '../../../rules/verbs';
import type { Verb } from '@/systems/techniques';

import type { PlanFighter } from '../state';

/**
 * A fighting identity (`docs/design/combat-ai-plan.md` Part 4): how a fighter wants to fight,
 * apart from how well it can. Each dimension is a weight from 0 to 1 for valuing plans, never
 * a chance of doing something, and none of them is competence (`competence.ts`). Derived from
 * the body and kit, then the combat traits; a setup may set any dimension outright
 * (`CombatantSetup.fighting`: authored characters, or a fight's purpose). Nothing in the fight
 * reads it yet.
 */

/** Which objectives a fighter reaches for first: a prior over objectives, not a script. */
const PHILOSOPHIES = COMBAT_PHILOSOPHIES;
type Philosophy = CombatPhilosophy;

export interface Identity {
  /** Weights over the philosophies, summing to 1. */
  readonly philosophy: Readonly<Record<Philosophy, number>>;
  /** The distance they fight from, and how much it is worth to them to be there. */
  readonly range: RangeBand;
  readonly rangePull: number;
  readonly aggression: number;
  readonly risk: number;
  readonly resources: number;
  readonly adaptability: number;
  readonly deception: number;
  readonly discipline: number;
}

/** Verbs of the indirect route: hiding, confusing, decoys, cover, traps. */
const TRICKS: readonly Verb[] = ['conceal', 'confuse', 'clone', 'field', 'trap'];

const MIDDLE = 0.5;
/** How far one trait moves a dimension. */
const NUDGE = 0.2;
/** A grade's worth of willpower as discipline, around the middle (willpower 20 is ordinary). */
const WILL_PER_POINT = 0.01;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function share(count: number, of: number): number {
  return of === 0 ? 0 : count / of;
}

/** What the kit is made of, as shares of its techniques. */
function kitShares(f: PlanFighter) {
  const all = f.techniques;
  const n = all.length;
  const tricks = all.filter((t) => TRICKS.some((v) => hasVerb(t, v))).length;
  return {
    wounding: share(all.filter(isWounding).length, n),
    holds: share(all.filter((t) => isHindering(t) && !isWounding(t)).length, n),
    tricks: share(tricks, n),
    chakra: share(all.filter((t) => !isBodyMove(t)).length, n),
    heals: all.some((t) => hasVerb(t, 'heal')),
    trump: all.some(isTrump),
    illusions: share(all.filter((t) => t.discipline === 'genjutsu').length, n),
  };
}

/** How much a fighter's attacks need their home distance: none from elsewhere is all. */
function pullOf(f: PlanFighter, home: RangeBand): number {
  const attacks = f.techniques.filter(isHarmful);
  const bands = attackBands(f).length;
  if (attacks.length === 0) return clamp01((3 - bands) / 2);
  const onlyHome = attacks.filter((t) => {
    const reach = reachOf(t);
    return inReach(reach, home) && reach.length === 1;
  }).length;
  return clamp01(Math.max(share(onlyHome, attacks.length), (3 - bands) / 2));
}

function traitNudges(f: PlanFighter) {
  const has = (t: Parameters<typeof hasTrait>[1]) => (hasTrait(f, t) ? NUDGE : 0);
  return {
    aggression: has('brawler') + has('swift') + has('pack') - 1.5 * has('coward'),
    risk:
      has('armoured') +
      (f.size === 'large' ? NUDGE / 2 : 0) +
      (f.size === 'huge' ? NUDGE : 0) -
      1.5 * has('coward'),
    deception: 1.5 * has('illusionist'),
  };
}

function philosophyOf(d: Omit<Identity, 'philosophy'>, heals: boolean) {
  const raw: Record<Philosophy, number> = {
    overwhelm: d.aggression,
    outlast: (1 - d.aggression + (1 - d.risk)) / 2,
    outwit: d.deception,
    protect: heals ? MIDDLE : 0.1,
  };
  const total = PHILOSOPHIES.reduce((sum, p) => sum + raw[p], 0);
  return Object.fromEntries(PHILOSOPHIES.map((p) => [p, raw[p] / total])) as Record<
    Philosophy,
    number
  >;
}

/** The identity their body, kit and traits suggest, with a setup's own settings over it. */
export function identityOf(f: PlanFighter, set: CombatFighting = f.fighting ?? {}): Identity {
  const kit = kitShares(f);
  const nudge = traitNudges(f);
  const range = homeBand(f);
  const derived = {
    range,
    rangePull: pullOf(f, range),
    aggression: clamp01(0.3 + 0.4 * kit.wounding + nudge.aggression),
    risk: clamp01(MIDDLE + nudge.risk - (kit.heals ? NUDGE / 2 : 0)),
    resources: clamp01(0.2 + 0.4 * kit.chakra + (kit.trump ? NUDGE : 0)),
    adaptability: MIDDLE,
    deception: clamp01(
      0.1 + 0.6 * kit.tricks + 0.3 * kit.illusions + 0.3 * kit.holds + nudge.deception,
    ),
    discipline: clamp01(MIDDLE + (f.attributes.willpower - 20) * WILL_PER_POINT),
  };
  const { philosophy: setPhilosophy, ...setRest } = set;
  const dims = { ...derived, ...setRest };
  const philosophy = setPhilosophy
    ? normalised({ ...philosophyOf(dims, kit.heals), ...setPhilosophy })
    : philosophyOf(dims, kit.heals);
  return { ...dims, philosophy };
}

function normalised(p: Record<Philosophy, number>): Record<Philosophy, number> {
  const total = PHILOSOPHIES.reduce((sum, k) => sum + Math.max(0, p[k]), 0);
  return Object.fromEntries(
    PHILOSOPHIES.map((k) => [k, total > 0 ? Math.max(0, p[k]) / total : 1 / PHILOSOPHIES.length]),
  ) as Record<Philosophy, number>;
}

/** Why an identity doesn't hold together, if it doesn't (Part 4's validation). */
export function identityProblems(f: PlanFighter, identity: Identity): string[] {
  const dims = [
    'rangePull',
    'aggression',
    'risk',
    'resources',
    'adaptability',
    'deception',
    'discipline',
  ] as const;
  const out = dims
    .filter((d) => !(identity[d] >= 0 && identity[d] <= 1))
    .map((d) => `${d} out of range`);
  const total = PHILOSOPHIES.reduce((sum, p) => sum + identity.philosophy[p], 0);
  if (Math.abs(total - 1) > 1e-6) out.push('philosophy does not sum to one');
  if (!attackBands(f).includes(identity.range)) out.push(`can't attack from ${identity.range}`);
  return out;
}

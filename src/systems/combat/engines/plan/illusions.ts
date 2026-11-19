import type { Rng } from '@/core';

import type { CombatTechnique } from '../../contract';
import { alive, chakraCost } from '../../rules/body';
import { tell } from '../../rules/telling';
import { isPinned } from '../../rules/verbs/lingering';
import type { HeldIllusion } from './illusionShape';
import { mindmates } from './oneMind';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';
import { struggleFree } from './struggle';

/**
 * Lasting illusions are kept up (`docs/design/combat-ai-plan.md` Part 13c). A confusion or a
 * binding woven with genjutsu holds only while its caster pays for it: at the end of each
 * exchange it costs them `UPKEEP_SHARE` of the technique, and once they can't pay, or fall, it
 * lets go. And an illusion caught by one body of a shared mind stops that body, not the others:
 * the rest see it happen, and one of them shakes it loose as the exchange ends.
 */

/** Each exchange an illusion holds costs its caster this share of the technique's cost. */
export const UPKEEP_SHARE = 0.25;

/** The illusion a caster's technique leaves on a target, with what keeping it up costs. */
export function heldBy(caster: PlanFighter, technique: CombatTechnique): HeldIllusion {
  const upkeep = Math.max(1, Math.round(chakraCost(caster, technique) * UPKEEP_SHARE));
  return { by: caster.id, upkeep };
}

/** Marks a target as held in an illusion a genjutsu technique just left on them. */
export function holdIllusion(
  round: Round,
  {
    caster,
    targetId,
    technique,
  }: { caster: PlanFighter; targetId: string; technique: CombatTechnique },
): Round {
  if (technique.discipline !== 'genjutsu') return round;
  const illusion = heldBy(caster, technique);
  return {
    ...round,
    fighters: round.fighters.map((f) => (f.id === targetId ? { ...f, illusion } : f)),
  };
}

/** Whether a fighter is still caught in what the illusion did to them. */
function stillCaught(f: PlanFighter): boolean {
  return f.confused > 0 || (isPinned(f) && f.grip?.discipline === 'genjutsu');
}

function released(round: Round, f: PlanFighter, line: string): Round {
  const binding = isPinned(f) && f.grip?.discipline === 'genjutsu';
  const { illusion: _was, ...free } = f;
  const freed: PlanFighter = { ...free, confused: 0, ...(binding ? { pinned: 0 } : {}) };
  return say({ ...round, fighters: round.fighters.map((o) => (o.id === f.id ? freed : o)) }, line);
}

function dropped(round: Round, f: PlanFighter): Round {
  const { illusion: _was, ...free } = f;
  return { ...round, fighters: round.fighters.map((o) => (o.id === f.id ? free : o)) };
}

/** A body of the same mind, standing and clear of illusion, who can shake this one loose. */
function freeMate(round: Round, f: PlanFighter): PlanFighter | undefined {
  return mindmates(round.fighters, f).find((m) => alive(m) && m.illusion === undefined);
}

function kept(round: Round, id: string): Round {
  const f = fighterIn(round, id);
  if (!f?.illusion) return round;
  if (!stillCaught(f) || !alive(f)) return dropped(round, f);
  const mate = freeMate(round, f);
  if (mate)
    return released(round, f, tell('{b} shake{b.s} {a} out of the illusion.', { a: f, b: mate }));
  const caster = fighterIn(round, f.illusion.by);
  const { upkeep } = f.illusion;
  if (!caster || !alive(caster) || caster.chakra < upkeep) {
    return released(round, f, tell('The illusion lets go of {a}.', { a: f }));
  }
  const paid = { chakra: caster.chakra - upkeep, chakraSpent: (caster.chakraSpent ?? 0) + upkeep };
  return { ...round, fighters: patch(round.fighters, caster.id, paid) };
}

/** As an exchange ends: every lasting illusion is paid for, shaken loose, or let go. */
export function illusionsAfter(round: Round): Round {
  return round.fighters
    .filter((f) => f.illusion !== undefined)
    .reduce((r, f) => kept(r, f.id), round);
}

/** Holds as the exchange ends: struggled against, then illusions kept up or let go. */
export function heldOn(round: Round, rng: Rng): Round {
  return illusionsAfter(struggleFree(round, rng));
}

import type { ShroudKind } from '@/systems/techniques';

import { alive } from '../../rules/body';
import type { HitType } from '../../rules/hits';
import {
  shroudedAttributes,
  shroudOf,
  shroudUpkeep,
  wornShroud,
  type Shroud,
} from '../../rules/shrouds';
import { tell } from '../../rules/telling';
import { driveOf, type EffectUse } from '../../rules/verbs';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';

/**
 * Cast armour in a planned fight (`rules/shrouds.ts` holds what each kind stops): raised on the
 * caster's turn, it turns every hit that meets it from then on, and is paid for in chakra as
 * each exchange ends. It falls when the chakra runs out, and a shell that wears away cracks
 * under enough hurt. One at a time: a second isn't stacked on the first.
 */

const RAISED: Readonly<Record<ShroudKind, string>> = {
  lightning: 'Lightning crackles over {a.poss} skin.',
  sand: 'Sand climbs {a.poss} body and sets into a shell.',
  earth: '{a.poss} skin greys and hardens like stone.',
  chakra: 'Chakra settles over {a} like a second skin.',
};

const FALLS: Readonly<Record<ShroudKind, string>> = {
  lightning: 'The lightning over {a} flickers out.',
  sand: '{a.poss} sand armour runs off {a.them} like water.',
  earth: 'The stone falls from {a.poss} skin.',
  chakra: 'The chakra over {a} thins and is gone.',
};

/** Names of what is in force, for the fight screen. */
export const SHROUD_STATUS: Readonly<Record<ShroudKind, string>> = {
  lightning: 'Lightning armour',
  sand: 'Sand armour',
  earth: 'Stone skin',
  chakra: 'Chakra shroud',
};

function without(f: PlanFighter): PlanFighter {
  if (!f.shroud) return f;
  const { shroud, ...rest } = f;
  return { ...rest, attributes: shroudedAttributes(f.attributes, shroud.kind, false) };
}

function withShroud(f: PlanFighter, shroud: Shroud): PlanFighter {
  return { ...f, shroud, attributes: shroudedAttributes(f.attributes, shroud.kind, true) };
}

/** Raises a cast armour on its caster, unless one already holds. */
export function raiseShroud(round: Round, actor: PlanFighter, use: EffectUse<'shroud'>): Round {
  if (actor.shroud) return say(round, tell('{a} {a.is} already armoured.', { a: actor }));
  const shroud = shroudOf(use.effect.kind, driveOf(actor, use));
  const fighters = round.fighters.map((f) => (f.id === actor.id ? withShroud(f, shroud) : f));
  return say({ ...round, fighters }, tell(RAISED[use.effect.kind], { a: actor }));
}

/** A hit of this kind got through to a shrouded fighter for `through`: the shell wears. */
export function wearShroud(round: Round, id: string, hit: HitType, through: number): Round {
  const f = fighterIn(round, id);
  if (!f?.shroud || through <= 0) return round;
  const worn = wornShroud(f.shroud, hit, through);
  if (worn === f.shroud) return round;
  if (worn) {
    const fighters = round.fighters.map((g) => (g.id === id ? { ...g, shroud: worn } : g));
    return { ...round, fighters };
  }
  const fighters = round.fighters.map((g) => (g.id === id ? without(g) : g));
  return say({ ...round, fighters }, tell('{a.poss} armour cracks and falls away.', { a: f }));
}

/** As an exchange ends: each shroud is paid for, and one its wearer can't pay for falls. */
export function shroudsAfter(round: Round): Round {
  return round.fighters.reduce((now, f) => {
    if (!f.shroud || !alive(f)) return now;
    const cost = shroudUpkeep(f.shroud.kind);
    if (f.chakra >= cost) {
      return { ...now, fighters: patch(now.fighters, f.id, { chakra: f.chakra - cost }) };
    }
    const fighters = now.fighters.map((g) => (g.id === f.id ? without(g) : g));
    return say({ ...now, fighters }, tell(FALLS[f.shroud.kind], { a: f }));
  }, round);
}

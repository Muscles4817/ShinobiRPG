import type { CombatTechnique } from '../../contract';
import type { Rng } from '@/core';

import { alive, hasPerk } from '../../rules/body';
import { needsAim, type Card } from './cards';
import {
  misleadChance,
  shadowBodies,
  shadowShare,
  SHADOW_BODIES_MAX,
} from '../../rules/shadowClones';
import { tell } from '../../rules/telling';
import { cloneCount, cloneKindFor, isWounding, type EffectUse } from '../../rules/verbs';
import { EMPTY_LOADOUT, fighterIn, patch, say, type PlanFighter, type Round } from './state';

/**
 * Shadow clones in a planned fight (`rules/shadowClones.ts`): the technique splits its maker's
 * chakra with the clones it makes, and each comes in as a fighter of its own on its maker's side,
 * in the front row, with the maker's body and kit (all but the technique that made it) and a plan
 * made as the exchange ends (`summonPlans.ts`). The first hit that lands pops one
 * (`wound.ts`); if its maker falls, every clone of theirs goes with them.
 */

/**
 * Whether a technique makes shadow clones that fight: solid clones of no element, from a
 * technique that is the making and nothing else. One that wounds as well (a clone body blow, a
 * clone sword dance) uses its clones in the attack, as decoys beside its maker (`clones.ts`).
 */
export function makesShadows(t: CombatTechnique): boolean {
  if (isWounding(t)) return false;
  return t.effects.some(
    (e) => e.verb === 'clone' && cloneKindFor({ technique: t, effect: e }) === 'shadow',
  );
}

/** The shadow clones of a maker still standing. */
export function shadowsOf(round: Pick<Round, 'fighters'>, makerId: string): PlanFighter[] {
  return round.fighters.filter((f) => f.shadowOf === makerId && alive(f));
}

/** A copy of its maker, holding its share of their chakra, with a mind and a plan of its own. */
function copyOf(maker: PlanFighter, index: number, chakra: number): PlanFighter {
  const {
    called: _called,
    grammar: _grammar,
    reactions: _reactions,
    streak: _streak,
    clones: _clones,
    calls: _calls,
    summonsOut: _out,
    summonFates: _fates,
    holding: _holding,
    fellAt: _fell,
    ...body
  } = maker;
  return {
    ...body,
    id: `${maker.id}~shadow~${index}`,
    name: `${maker.name}’s shadow clone`,
    isPlayer: false,
    shadowOf: maker.id,
    chakra,
    row: 'front',
    loadout: EMPTY_LOADOUT,
    techniques: maker.techniques.filter((t) => !makesShadows(t)),
    used: [],
    uses: {},
    committed: null,
    gathering: false,
  };
}

/** The maker's turn on a shadow clone technique: the split, the clones, and any crowd. */
export function makeShadows(round: Round, actor: PlanFighter, use: EffectUse<'clone'>): Round {
  const maker = fighterIn(round, actor.id) ?? actor;
  const standing = shadowsOf(round, maker.id).length;
  const bodies = Math.min(shadowBodies(use.effect.power), SHADOW_BODIES_MAX - standing);
  if (bodies <= 0) {
    return say(
      round,
      tell('{a} already {a.has} as many clones as {a.they} can hold.', { a: actor }),
    );
  }
  const share = shadowShare(maker.chakra, bodies);
  const made = round.fighters.filter((f) => f.shadowOf === maker.id).length;
  const clones = Array.from({ length: bodies }, (_, i) => copyOf(maker, made + i + 1, share));
  const crowd = Math.max(0, cloneCount(maker.maxChakra, use) - bodies);
  const decoys =
    crowd > 0
      ? {
          clones: {
            techniqueId: use.technique.id,
            count: crowd,
            skill: 0,
            strikes: false,
            kind: 'shadow' as const,
            made: crowd,
          },
        }
      : {};
  const fighters = [...patch(round.fighters, maker.id, { chakra: share, ...decoys }), ...clones];
  const line =
    bodies === 1
      ? '{a} split{a.s} {a.their} chakra, and a clone of {a.them} bursts out of the smoke to fight.'
      : '{a} split{a.s} {a.their} chakra, and clones of {a.them} burst out of the smoke to fight.';
  return say({ ...round, fighters }, tell(line, { a: actor }));
}

/**
 * Whom an attack aimed at a maker of shadow clones really goes for: the maker, or one of the
 * clones they can't tell apart from them (`misleadChance`).
 */
export function misled(
  round: Round,
  { actor, target, rng }: { actor: PlanFighter; target: PlanFighter | undefined; rng: Rng },
  card: Card,
): PlanFighter | undefined {
  if (!target || !needsAim(card)) return target;
  const clones = shadowsOf(round, target.id);
  const odds = misleadChance(clones.length, {
    eyes: actor.attributes.perception,
    skill: target.attributes.ninjutsu,
    insight: hasPerk(actor, 'insight'),
  });
  return odds > 0 && rng.chance(odds) ? rng.pick(clones) : target;
}

/** A clone hit: it pops at once, whatever the hit. */
export function popLine(clone: PlanFighter): string {
  return tell('{t} bursts in a puff of smoke.', { t: clone });
}

/** Its maker down: every clone of theirs goes with them. */
export function shadowsGone(round: Round, maker: PlanFighter): Round {
  const gone = shadowsOf(round, maker.id);
  if (gone.length === 0) return round;
  const fighters = gone.reduce((all, c) => patch(all, c.id, { health: 0 }), round.fighters);
  return say({ ...round, fighters }, tell('{a.poss} clones vanish with {a.them}.', { a: maker }));
}

/** As an exchange ends: popped clones leave the field. */
export function shadowsAfter(round: Round): Round {
  const fighters = round.fighters.filter((f) => f.shadowOf === undefined || alive(f));
  return fighters.length === round.fighters.length ? round : { ...round, fighters };
}

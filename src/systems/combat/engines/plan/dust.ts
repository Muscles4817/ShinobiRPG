import type { CombatGround } from '../../groundContract';
import type { CombatMeter, CombatTechnique } from '../../contract';
import { alive } from '../../rules/body';
import {
  BLIND_EXCHANGES,
  blindedSlipScale,
  dustAffords,
  dustBleed,
  dustGiftOf,
  dustGripScale,
  dustGuardScale,
  dustPowerScale,
  dustPace,
  dustUsed,
  scattered,
  type DustHit,
} from '../../rules/dust';
import { AFFLICT_EXCHANGES, afflicted } from '../../rules/verbs';
import { tell } from '../../rules/telling';
import type { Dusty } from './dustBody';
import { fighterIn, say, type PlanFighter, type Round } from './state';

/**
 * Commanded dust in a planned fight (`rules/dust.ts`): dust techniques draw it up (first) and
 * spend it, dust arrives at its own pace (`dustPace`) whoever commands it, heavy dust lands
 * harder but slower and grips its pins harder, a Guard with dust to
 * raise keeps more out, cutting dust leaves a bleed and blinding dust gets in a foe's eyes, and
 * a bane (an element it can't bear, a heavy blow on brittle dust) scatters some of it.
 */

function spendsDust(t: CombatTechnique): boolean {
  return (t.dustCost ?? 0) > 0 || (t.dustDraw ?? 0) > 0;
}

/** Whether a fighter has the dust a technique asks of them. */
export function hasDustFor(fighter: Dusty, t: CombatTechnique): boolean {
  return dustAffords(fighter.dust, t.dustCost);
}

/** What a technique draws and spends of its user's dust, as a change to them. */
export function dustSpent(
  fighter: Dusty,
  t: CombatTechnique,
  ground: CombatGround = 'arena',
): Pick<Dusty, 'dust'> {
  if (!fighter.dust || !spendsDust(t)) return {};
  return {
    dust: dustUsed(fighter.dust, {
      ground,
      ...(t.dustDraw ? { draw: t.dustDraw } : {}),
      ...(t.dustCost ? { cost: t.dustCost } : {}),
    }),
  };
}

/** How fast a dust attack arrives (its dust's pace, not its user's skill); none for anything else. */
export function dustArrival(attacker: Dusty, t: CombatTechnique): number | undefined {
  return attacker.dust && t.dustCost ? dustPace(attacker.dust.kind) : undefined;
}

/** A dust attack's power scale (its weight); 1 for anything else. */
export function dustPower(attacker: Dusty, t: CombatTechnique): number {
  return attacker.dust && t.dustCost ? dustPowerScale(attacker.dust.kind) : 1;
}

/** A dust pin's grip scale (its hold); 1 for anything else. */
export function dustGrip(actor: Dusty, t: CombatTechnique): number {
  return actor.dust && t.dustCost ? dustGripScale(actor.dust.kind) : 1;
}

/** What a Guard lets through, against one without dust. */
export function dustGuard(target: Dusty): number {
  return dustGuardScale(target.dust);
}

/** How a fighter's attacks are slipped with blinding dust in their eyes. */
export function blindedSlips(attacker: Dusty): number {
  return attacker.blinded ? blindedSlipScale(attacker.blinded.blinding) : 1;
}

function changed(round: Round, id: string, change: Partial<PlanFighter>): Round {
  return { ...round, fighters: round.fighters.map((f) => (f.id === id ? { ...f, ...change } : f)) };
}

function cut(round: Round, actor: PlanFighter, target: PlanFighter): Round {
  const perExchange = actor.dust ? dustBleed(actor.dust.kind) : 0;
  if (perExchange <= 0) return round;
  const fresh = { harm: 'bleed' as const, perExchange, exchanges: AFFLICT_EXCHANGES };
  const afflictions = afflicted(target.afflictions ?? [], fresh);
  return say(
    changed(round, target.id, { afflictions }),
    tell('The dust leaves {t} cut and bleeding.', { t: target }),
  );
}

function blind(round: Round, actor: PlanFighter, target: PlanFighter): Round {
  const blinding = actor.dust ? dustGiftOf(actor.dust.kind, 'blinding') : 0;
  if (blinding <= 0) return round;
  const blinded = { blinding, exchanges: BLIND_EXCHANGES };
  return say(
    changed(round, target.id, { blinded }),
    tell('Dust gets in {t.poss} eyes.', { t: target }),
  );
}

/** A dust attack landed on a foe: cutting dust leaves a bleed, blinding dust gets in their eyes. */
export function dustLanded(
  round: Round,
  actor: PlanFighter,
  targetId: string,
  t: CombatTechnique,
): Round {
  const target = fighterIn(round, targetId);
  if (!actor.dust || !t.dustCost || !target || !alive(target)) return round;
  const bled = cut(round, actor, target);
  return blind(bled, actor, fighterIn(bled, targetId) ?? target);
}

/** A hit on a dust user: a bane scatters some of their dust. */
export function dustStruck(round: Round, targetId: string, hit: DustHit): Round {
  const target = fighterIn(round, targetId);
  const lost = target?.dust ? scattered(target.dust, hit) : 0;
  if (!target?.dust || lost <= 0) return round;
  const dust = { ...target.dust, count: target.dust.count - lost };
  return say(changed(round, target.id, { dust }), tell('{t.poss} dust scatters.', { t: target }));
}

function clearedEyes(f: PlanFighter): PlanFighter {
  const { blinded: _gone, ...rest } = f;
  return rest;
}

/** At the end of an exchange, blinding dust works its way out of everyone's eyes. */
export function dustAfter(round: Round): Round {
  return round.fighters.reduce((now, f) => {
    const blinded = f.blinded;
    if (!blinded) return now;
    const left = blinded.exchanges - 1;
    const fighters = now.fighters.map((g) =>
      g.id !== f.id
        ? g
        : left > 0
          ? { ...g, blinded: { ...blinded, exchanges: left } }
          : clearedEyes(g),
    );
    const cleared = left > 0 ? now : say(now, tell('{t} blink{t.s} the dust away.', { t: f }));
    return { ...cleared, fighters };
  }, round);
}

/** The player's dust on the fight screen, beside their chakra. */
export function dustMeter(player: Dusty): CombatMeter | null {
  const dust = player.dust;
  return dust ? { id: 'dust', label: 'Dust', value: dust.count, max: dust.cap } : null;
}

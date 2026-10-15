import type { Rng } from '@/core';
import type { AfflictionKind } from '@/systems/techniques';

import { alive, holdTurns } from '../../rules/body';
import { cappedHit, techniqueDamage } from '../../rules/damage';
import { harmLine, reactionLine } from '../../rules/narration';
import { RANGE_LABEL } from '../../rules/range';
import {
  ABSORB_SHARE,
  afflicted,
  afflictionFrom,
  afflictionsTick,
  drainAmount,
  isPinned,
  poisonSap,
  riposteFrom,
  riposteTechnique,
  withSap,
  type Affliction,
  type EffectUse,
  type LingeringMemory,
} from '../../rules/verbs';
import { withAntidote } from '../../rules/provisions';
import { movedTo } from './groundPlay';
import { canHit } from './rows';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';
import { wound } from './wound';
import { knockLine } from './sceneVoice';
import { momentOf } from './voice';

/**
 * The verbs that leave something behind in a planned fight (`rules/verbs/lingering.ts`): a
 * throw or a pull changes the distance, a pin holds a foe where they stand, a drain draws
 * their chakra out, a burn, bleed or poison lingers for a few exchanges, and a riposte answers
 * the next blow before it lands. Pins and harms wear off at the end of each exchange.
 */

interface Aim {
  readonly actor: PlanFighter;
  readonly target: PlanFighter;
}

export function knock(round: Round, target: PlanFighter, use: EffectUse<'knock'>): Round {
  const { to } = use.effect;
  if (round.range === to) return round;
  const where = RANGE_LABEL[to].toLowerCase();
  const line = knockLine(momentOf(round, target.id), target.name, where, to === 'close');
  return movedTo(round, to, line);
}

export function pin(round: Round, target: PlanFighter, use: EffectUse<'pin'>): Round {
  // The target counts an exchange down as it ends, the one it was pinned in too: hold one more.
  const pinned = Math.max(target.pinned ?? 0, holdTurns(use.effect) + 1);
  return say(relinger(round, target.id, { pinned }), `${target.name} is pinned where they stand!`);
}

export function drain(round: Round, { actor, target }: Aim, use: EffectUse<'drain'>): Round {
  const taken = Math.min(target.chakra, drainAmount(actor, target, use));
  if (taken <= 0) return say(round, `${target.name} has no chakra left to draw.`);
  const drained = patch(round.fighters, target.id, { chakra: target.chakra - taken });
  if (!use.effect.absorb) {
    return say({ ...round, fighters: drained }, `${target.name}'s chakra drains away.`);
  }
  const user = fighterIn({ ...round, fighters: drained }, actor.id) ?? actor;
  const chakra = Math.min(user.maxChakra, user.chakra + Math.round(taken * ABSORB_SHARE));
  return say(
    { ...round, fighters: patch(drained, actor.id, { chakra }) },
    `${target.name}'s chakra flows into ${actor.name}.`,
  );
}

const STRUCK: Readonly<Record<AfflictionKind, (name: string) => string>> = {
  burn: (name) => `${name} is set alight!`,
  bleed: (name) => `${name} is bleeding!`,
  poison: (name) => `Poison seeps into ${name}.`,
};

const LINGERS: Readonly<Record<AfflictionKind, (name: string) => string>> = {
  burn: (name) => `${name}'s burns sear.`,
  bleed: (name) => `${name} bleeds.`,
  poison: (name) => `The poison gnaws at ${name}.`,
};

/** The harm just landed (always last) wears off sooner on a fighter with an antidote in them. */
function withAntidoteOn(target: PlanFighter, list: readonly Affliction[]): Affliction[] {
  const fresh = list.at(-1);
  return fresh ? [...list.slice(0, -1), withAntidote(target, fresh)] : [...list];
}

export function afflict(round: Round, { actor, target }: Aim, use: EffectUse<'afflict'>): Round {
  const fresh = afflictionFrom(actor, target, use);
  const afflictions = withAntidoteOn(target, afflicted(target.afflictions ?? [], fresh));
  const sapping = fresh.harm === 'poison' && !target.sapped;
  const sapped = sapping ? poisonSap(target.attributes) : undefined;
  const change = sapped
    ? { afflictions, sapped, attributes: withSap(target.attributes, sapped, -1) }
    : { afflictions };
  return say(relinger(round, target.id, change), STRUCK[fresh.harm](target.name));
}

export function readyRiposte(round: Round, actor: PlanFighter, use: EffectUse<'counter'>): Round {
  return say(
    relinger(round, actor.id, { riposte: riposteFrom(use, round.number) }),
    `${actor.name} settles into a stance, ready to answer.`,
  );
}

/** A blow about to land, as far as a riposte cares. */
export interface Incoming {
  readonly attacker: PlanFighter;
  readonly target: PlanFighter;
  readonly blow: { readonly physical: boolean; readonly followUp?: true };
  readonly rng: Rng;
}

/**
 * A fighter with their lingering state replaced: a field left out of `change` is kept, one set
 * to null is cleared (a spent riposte, a poison's sap given back).
 */
type LingeringChange = {
  readonly [K in keyof LingeringMemory]?: NonNullable<LingeringMemory[K]> | null;
} & { readonly attributes?: PlanFighter['attributes'] };

function relinger(round: Round, id: string, change: LingeringChange): Round {
  const fighters = round.fighters.map((f) => {
    if (f.id !== id) return f;
    const { pinned: _p, afflictions: _a, sapped: _s, riposte: _r, ...rest } = f;
    const pick = <K extends keyof LingeringMemory>(key: K) => {
      const value = (key in change ? change[key] : f[key]) ?? null;
      return value === null ? {} : { [key]: value };
    };
    return {
      ...rest,
      ...(change.attributes ? { attributes: change.attributes } : {}),
      ...pick('pinned'),
      ...pick('afflictions'),
      ...pick('sapped'),
      ...pick('riposte'),
    };
  });
  return { ...round, fighters };
}

function answers(round: Round, { attacker, target, blow }: Incoming): boolean {
  return (
    target.riposte !== undefined &&
    blow.physical &&
    !blow.followUp &&
    canHit({ kind: 'counter' }, attacker, round.fighters)
  );
}

/**
 * A readied riposte answers the first blow of a hand-to-hand or blade attack before it lands.
 * If it fells the attacker, their blow never comes.
 */
export function riposteFirst(round: Round, hit: Incoming): { round: Round; stopped: boolean } {
  const { attacker, target, rng } = hit;
  const ready = target.riposte;
  if (!ready || !answers(round, hit)) return { round, stopped: false };
  const use = {
    technique: riposteTechnique(ready),
    effect: { verb: 'damage', power: ready.power },
  } as const;
  const raw = techniqueDamage(target, attacker, use, rng.next());
  const damage = cappedHit(Math.max(1, raw), attacker.maxHealth);
  const line = harmLine(
    reactionLine(`${target.name} answers with ${ready.name}!`, 'countered'),
    damage,
  );
  const spent = relinger(round, target.id, { riposte: null });
  const after = wound(say(spent, line), attacker.id, damage);
  const standing = fighterIn(after, attacker.id);
  return { round: after, stopped: !standing || !alive(standing) };
}

/** Lingering harm on one fighter at the end of an exchange, and what wears off. */
function lingerOn(round: Round, f: PlanFighter, exchange: number): Round {
  const pinned = Math.max(0, (f.pinned ?? 0) - 1);
  const riposte = f.riposte && f.riposte.until >= exchange ? f.riposte : undefined;
  const { harm, left } = afflictionsTick(f.afflictions ?? []);
  const poisoned = left.some((a) => a.harm === 'poison');
  const restore = f.sapped && !poisoned ? f.sapped : undefined;
  const kept = relinger(round, f.id, {
    pinned: pinned > 0 ? pinned : null,
    riposte: riposte ?? null,
    afflictions: left.length > 0 ? left : null,
    ...(restore ? { sapped: null, attributes: withSap(f.attributes, restore, 1) } : {}),
  });
  const [worst] = f.afflictions ?? [];
  if (harm <= 0 || !worst || !alive(f)) return kept;
  return wound(say(kept, harmLine(LINGERS[worst.harm](f.name), harm)), f.id, harm);
}

/** At the end of an exchange: harms linger and wear down, pins loosen, ripostes lapse. */
export function lingerAfter(round: Round, exchange: number): Round {
  return round.fighters.reduce((now, f) => {
    const current = fighterIn(now, f.id);
    return current ? lingerOn(now, current, exchange) : now;
  }, round);
}

const HARM_STATUS: Readonly<Record<AfflictionKind, string>> = {
  burn: 'Burning',
  bleed: 'Bleeding',
  poison: 'Poisoned',
};

/** What the fight screen shows of these on a fighter. */
export function lingeringStatuses(f: PlanFighter): string[] {
  const harms = [...new Set((f.afflictions ?? []).map((a) => HARM_STATUS[a.harm]))];
  return [...(isPinned(f) ? ['Pinned'] : []), ...harms, ...(f.riposte ? ['Ready to answer'] : [])];
}

import type { Rng } from '@/core';
import type { Accuracy, AreaSize, Discipline, Element } from '@/systems/techniques';

import { alive, hasPerk } from '../../rules/body';
import { cappedHit, strikeDamage } from '../../rules/damage';
import { counterChance, guardScale } from '../../rules/defence';
import { confuseChance, confusionTurns, HIDDEN_DAMAGE } from '../../rules/conditions';
import { FORESIGHT_COUNTER, foreseen } from '../../rules/eyes';
import { canAttackFrom, kitDamageScale, packScale, type AttackKind } from '../../rules/kit';
import { harmLine, reactionLine } from '../../rules/narration';
import type { RangeBand } from '../../contract';
import { AREA_RULES, brokenScale, covered, substitutable } from '../../rules/verbs';
import { avoidOdds, blowSkill, type Incoming } from './avoid';
import type { Card } from './cards';
import { readyDefences } from './readiness';
import { defenceKind, noteDefence } from './reads';
import { throughClones } from './decoys';
import { substituted, type Swap } from './footwork';
import { riposteFirst } from './lingering';
import { wound } from './wound';
import { canHit } from './rows';
import { isDazed } from './daze';
import { counterLine, foresightSlipLine, hitLine, momentOf, slipLine } from './voice';
import { fighterIn, patch, say, type DefenceKind, type PlanFighter, type Round } from './state';
import { confusedLine } from './sceneVoice';

/** Foresight finds a Counter's moment more often. */
const FORESEES_OPENING = { scale: FORESIGHT_COUNTER, ceiling: 0.8 };
/**
 * A blow meets the avoid roll (`avoid.ts`: anyone slips some, a ready Dodge many more), unless
 * its technique already made it. Then the defence a fighter keeps ready at a distance
 * (`readiness.ts`) reacts on its own: a substitution escapes it, Guard softens it (guard),
 * Counter hits back up close (taijutsu); see `rules/defence.ts`. A dazed fighter can only
 * guard, and a break goes straight through a guard. Kits shape every hit: armour and spirits
 * shrug off some kinds of attack (less of a break), packs hit harder together, hidden attackers
 * harder still, illusionists' hits confuse, and cowards run. A
 * counter is a blow up close, so it can't reach an attacker standing behind their front row.
 * Before any of it, a clone may take the blow instead (`decoys.ts`).
 */

const COUNTER_SCALE = 0.6;

export interface Blow {
  readonly raw: number;
  /** What hit, for the narration ("strike", "Fireball"). */
  readonly what: string;
  /** Can be slipped at all once it is on its way (genjutsu is noticed or not, never slipped). */
  readonly dodgeable: boolean;
  /** Hand-to-hand and blades can be countered up close. */
  readonly physical: boolean;
  /** Blow, blade, jutsu or seal: what armour and spirits care about. */
  readonly kind: AttackKind;
  /** A break: goes through a guard, and through part of armour and a spirit's form. */
  readonly breaks?: boolean;
  /** The art behind a technique's hit (a substitution can't swap out of a genjutsu). */
  readonly discipline?: Discipline;
  /** The technique's element, which an elemental wall meets (`footwork.ts`). */
  readonly element?: Element;
  /** An area hit: bursts every clone and still reaches its target (`decoys.ts`). */
  readonly area?: boolean;
  /** How much ground an area hit covers: wider is harder to slip and beats a plain Guard. */
  readonly areaSize?: AreaSize;
  /** Share of a guard it goes through (knuckles, a sundering weapon: `rules/weapons.ts`). */
  readonly pierce?: number;
  /** How hard it is to slip (a technique's accuracy; steady when unset). */
  readonly accuracy?: Accuracy;
  /**
   * A later blow of a flurry: a Guard or a Counter has already met the first, so only a Dodge
   * (each blow on its own) stands in its way.
   */
  readonly followUp?: true;
  /** Its technique already made the avoid roll and reached the target (`jutsu.ts`). */
  readonly reached?: true;
}

export interface Hit {
  readonly attacker: PlanFighter;
  readonly target: PlanFighter;
  readonly blow: Blow;
  readonly rng: Rng;
}

/** A Guard meets a blow's first hit, unless it is an area too wide to raise your arms against. */
function guardMeets(blow: Blow): boolean {
  if (blow.followUp) return false;
  return blow.areaSize === undefined || AREA_RULES[blow.areaSize].guardHolds;
}

/**
 * Damage after the defender's kit, the attacker's pack and whether they strike from hiding (or
 * from a field that covers them).
 */
function kitted(round: Round, attacker: PlanFighter, defender: PlanFighter, blow: Blow): number {
  const unseen = attacker.hidden || covered(round.field, attacker, defender);
  const hidden = unseen ? HIDDEN_DAMAGE : 1;
  const pack = packScale(attacker, round.fighters);
  const kit = kitDamageScale(defender, blow.kind);
  return blow.raw * (blow.breaks ? brokenScale(kit) : kit) * pack * hidden;
}

function kitNote(defender: PlanFighter, kind: AttackKind): string[] {
  const scale = kitDamageScale(defender, kind);
  if (scale < 1) return [`Much of it glances off ${defender.name}.`];
  return scale > 1 ? [`The seal bites deep into ${defender.name}.`] : [];
}

function confuse(round: Round, { attacker, target, rng }: Hit): Round {
  const chance = confuseChance(attacker, target);
  const struck = fighterIn(round, target.id);
  if (chance <= 0 || !struck || !alive(struck) || !rng.chance(chance)) return round;
  return say(
    {
      ...round,
      fighters: patch(round.fighters, target.id, { confused: confusionTurns(attacker, target) }),
    },
    confusedLine(momentOf(round, target.id), target.name, attacker.name),
  );
}

function counter(round: Round, { attacker, target, rng }: Hit): Round {
  const struck = fighterIn(round, target.id);
  const chance = foreseen(counterChance(attacker, target), target, FORESEES_OPENING);
  if (!struck || !alive(struck) || !rng.chance(chance)) return round;
  const blow: Blow = {
    raw: strikeDamage(target, attacker, rng.next()) * COUNTER_SCALE,
    what: 'counter',
    dodgeable: false,
    physical: true,
    kind: 'blow',
  };
  const damage = cappedHit(
    Math.max(1, Math.round(kitted(round, struck, attacker, blow))),
    attacker.maxHealth,
  );
  return wound(
    say(
      round,
      harmLine(
        reactionLine(counterLine(momentOf(round, target.id), target.name), 'countered'),
        damage,
      ),
    ),
    attacker.id,
    damage,
  );
}

/** What a Guard lets through of this blow: a piercing weapon goes partly through it. */
function guardLets(attacker: PlanFighter, target: PlanFighter, blow: Blow): number {
  const kept = guardScale(attacker, target);
  return kept + (1 - kept) * (blow.pierce ?? 0);
}

type Ready = (kind: 'guard' | 'dodge' | 'counter') => boolean;

interface Evasion {
  /** The round with the blow slipped, or null when it still lands. */
  readonly slipped: Round | null;
  /** A ready Dodge tried for it. */
  readonly tried: boolean;
}

/** A plain blow (or a flurry's later blow) on its way. */
function blowIncoming({ attacker, target, blow }: Hit): Incoming {
  return {
    form: 'blow',
    attacker,
    target,
    skill: blowSkill(attacker, blow.kind),
    ...(blow.discipline ? { discipline: blow.discipline } : {}),
    ...(blow.accuracy ? { accuracy: blow.accuracy } : {}),
    ...(blow.areaSize ? { areaSize: blow.areaSize } : {}),
  };
}

/** The avoid roll against one blow (`avoid.ts`), unless its technique already made it. */
function evade(round: Round, hit: Hit, has: Ready): Evasion {
  const { attacker, target, blow, rng } = hit;
  const able = blow.dodgeable && !isDazed(target);
  // A Dodge that tried for the technique this blow comes with is told trying for the blow.
  const tried = able && has('dodge');
  const avoid = able && !blow.reached ? avoidOdds(round, blowIncoming(hit)) : 0;
  if (avoid <= 0 || !rng.chance(avoid)) return { slipped: null, tried };
  const moment = momentOf(round, target.id);
  const line = hasPerk(target, 'foresight')
    ? foresightSlipLine(moment, target.name, attacker.name, blow.what)
    : slipLine(moment, target.name, attacker.name, blow.what);
  // Anyone slips some blows; only a ready Dodge is shown reacting.
  return { slipped: say(round, tried ? reactionLine(line, 'dodged') : line), tried };
}

/** A Counter answers a hand-to-hand blow up close, if the attacker is in reach. */
function canCounterBack(round: Round, { attacker, target, blow }: Hit, has: Ready): boolean {
  return (
    has('counter') &&
    blow.physical &&
    !blow.followUp &&
    round.range === 'close' &&
    canAttackFrom(target, round.range) &&
    canHit({ kind: 'counter' }, attacker, round.fighters)
  );
}

/** The defence a blow brings into play, as onlookers see it; none when it can't answer it. */
function shown(ready: readonly Card[], blow: Blow, band: RangeBand): DefenceKind | null {
  const [kept] = ready;
  const kind = kept ? defenceKind(kept) : null;
  switch (kind) {
    case 'guard':
      return blow.followUp ? null : kind;
    case 'dodge':
      return blow.dodgeable ? kind : null;
    case 'counter':
      return blow.physical && band === 'close' ? kind : null;
    case 'swap':
      return substitutable(blow.discipline) ? kind : null;
    case null:
      return null;
  }
}

/** What a substitution sees coming: who, what, its art and its element. */
function swapOf({ attacker, target, blow }: Hit): Swap {
  return {
    target,
    attacker,
    what: blow.what,
    discipline: blow.discipline,
    ...(blow.element ? { element: blow.element } : {}),
  };
}

/** A ready substitution's answer: escaped, or the round the hit lands in (a wall may break). */
function throughSwap(round: Round, ready: readonly Card[], hit: Hit) {
  return substituted(round, ready, swapOf(hit)) ?? { round, escaped: false };
}

/** Lands a blow on the target, letting their clones, ready defence and kit react. */
export function react(start: Round, struck: Hit): Round {
  const answered = riposteFirst(start, struck);
  if (answered.stopped) return answered.round;
  const { what, area, raw, breaks } = struck.blow;
  const incoming = { ...struck, what, area: area === true, raw, breaks: breaks === true };
  const decoyed = throughClones(answered.round, incoming);
  if (decoyed.absorbed) return decoyed.round;
  // A hit that tore through a clone lands with what it has left.
  const kept = decoyed.carried ?? 1;
  const hit = { ...struck, blow: { ...struck.blow, raw: raw * kept } };
  const { attacker, target, blow } = hit;
  const ready = readyDefences(target, decoyed.round);
  // A defence that comes into play gives itself away to everyone facing its owner.
  const band = decoyed.round.range;
  const round = noteDefence(decoyed.round, target.id, band, shown(ready, blow, band));
  const has: Ready = (kind) => ready.some((c) => c.kind === kind);
  const evasion = evade(round, hit, has);
  if (evasion.slipped) return evasion.slipped;
  const swap = throughSwap(round, ready, hit);
  if (swap.escaped) return swap.round;
  const shielded = swap.round;
  const guarding = has('guard') && guardMeets(blow);
  const guarded = guarding && !blow.breaks;
  const smashed = guarding && blow.breaks === true;
  const damage = cappedHit(
    Math.max(
      1,
      Math.round(
        kitted(shielded, attacker, target, blow) *
          (guarded ? guardLets(attacker, target, blow) : 1),
      ),
    ),
    target.maxHealth,
  );
  const told = say(
    shielded,
    harmLine(
      hitLine(momentOf(shielded, attacker.id), {
        attacker: attacker.name,
        target: target.name,
        blow,
        guarded,
        smashed,
        dodgeTried: evasion.tried,
      }),
      damage,
    ),
    ...kitNote(target, blow.kind),
  );
  const landed = confuse(wound(told, target.id, damage), hit);
  return canCounterBack(shielded, hit, has) ? counter(landed, hit) : landed;
}

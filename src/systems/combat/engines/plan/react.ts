import type { Rng } from '@/core';
import type { Accuracy, AreaSize, Discipline, Element } from '@/systems/techniques';

import { alive, hasPerk } from '../../rules/body';
import { strikeDamage } from '../../rules/damage';
import { counterChance, guardScale } from '../../rules/defence';
import { counterSkill, cutSkill, heldGuard } from '../../rules/blades';
import { confuseChance, confusionTurns, HIDDEN_DAMAGE } from '../../rules/conditions';
import { FORESIGHT_COUNTER, foreseen } from '../../rules/eyes';
import { hitTypeOf, type HitType } from '../../rules/hits';
import { wearShroud } from './shrouds';
import { canAttackFrom, kitDamageScale, packScale, type AttackKind } from '../../rules/kit';
import { harmLine, reactionLine } from '../../rules/narration';
import { tell } from '../../rules/telling';
import type { RangeBand } from '../../contract';
import { AREA_RULES, brokenScale, covered, substitutable } from '../../rules/verbs';
import { avoidOdds, blowSkill, type Incoming } from './avoid';
import type { Card } from './cards';
import { readyDefences } from './readiness';
import { defenceKind, noteDefence } from './reads';
import { throughClones } from './decoys';
import { substituted, type Swap } from './footwork';
import { riposteFirst } from './lingering';
import { taken, wound } from './wound';
import { committedTo } from './commitment';
import { BRACE_LETS } from '../../rules/commitment';
import { canHit } from './rows';
import { isDazed } from './daze';
import { counterLine, hitLine, missLine, momentOf, type MissWhy } from './voice';
import { told, within, type Bank, type Moment } from './fresh';
import { fighterIn, patch, say, type DefenceKind, type PlanFighter, type Round } from './state';
import { confusedLine } from './sceneVoice';
import { dustGuard } from './dust';
import { shieldUp } from './shield';

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
  /** The hurt it does, when its weapon says (`rules/hits.ts`); else read from its kind. */
  readonly hit?: HitType;
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
  const kit = kitDamageScale(defender, blow.kind, hitTypeOf(blow));
  return blow.raw * (blow.breaks ? brokenScale(kit) : kit) * pack * hidden;
}

/** A hit their kit shrugs off, or a seal that bites deeper. */
const GLANCES: Bank = {
  id: 'glances',
  lines: [
    'Much of it glances off {t}.',
    'Little of it bites on {t}.',
    '{t} barely seem{t.s} to feel it.',
  ],
};

function kitNote(moment: Moment, defender: PlanFighter, blow: Blow): string[] {
  const scale = kitDamageScale(defender, blow.kind, hitTypeOf(blow));
  if (scale < 1) return [told(within(moment, 'kit'), GLANCES, { t: defender })];
  return scale > 1 ? [tell('The seal bites deep into {t}.', { t: defender })] : [];
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
    confusedLine(momentOf(round, target.id), target, attacker),
  );
}

/** The skill behind a blow a Counter answers: a cut's kenjutsu, else taijutsu. */
function skillBehind(attacker: PlanFighter, blow: Blow): number {
  const cut = blow.kind === 'weapon' || blow.discipline === 'kenjutsu';
  return cut ? cutSkill(attacker) : attacker.attributes.taijutsu;
}

function counter(round: Round, { attacker, target, blow: met, rng }: Hit): Round {
  const struck = fighterIn(round, target.id);
  const skills = { attack: skillBehind(attacker, met), answer: counterSkill(target) };
  const chance = foreseen(counterChance(skills), target, FORESEES_OPENING);
  if (!struck || !alive(struck) || !rng.chance(chance)) return round;
  const blow: Blow = {
    // A broad blade in the countered hand turns some of the answer aside.
    raw: strikeDamage(target, attacker, rng.next()) * COUNTER_SCALE * (1 - heldGuard(attacker)),
    what: 'counter',
    dodgeable: false,
    physical: true,
    kind: 'blow',
  };
  const damage = taken(attacker, Math.max(1, Math.round(kitted(round, struck, attacker, blow))));
  return wound(
    say(
      round,
      harmLine(reactionLine(counterLine(momentOf(round, target.id), target), 'countered'), damage),
    ),
    attacker.id,
    damage,
  );
}

/**
 * What a Guard lets through of this blow: a guarding weapon in hand (a greatsword, a staff)
 * catches more, and a piercing weapon goes partly through it.
 */
function guardLets(attacker: PlanFighter, target: PlanFighter, blow: Blow): number {
  const kept = guardScale(attacker, target) * dustGuard(target) * (1 - heldGuard(target));
  return kept + (1 - kept) * (blow.pierce ?? 0);
}

/** How a hit meets a guard: a ready Guard, a Brace, both, or neither. */
interface Guarding {
  readonly guarded: boolean;
  /** A break went through a ready Guard. */
  readonly smashed: boolean;
  /** Share of the hit that gets through. */
  readonly lets: number;
}

function guardOn({ attacker, target, blow }: Hit, guardReady: boolean): Guarding {
  const guarding = guardReady && guardMeets(blow);
  // A Brace stands firm against every physical blow, a flurry's later ones too; a break goes
  // through it as through a Guard.
  const braced = committedTo(target, 'brace') && blow.physical && !blow.breaks;
  const guarded = (guarding && !blow.breaks) || braced;
  const lets = guarded ? guardLets(attacker, target, blow) * (braced ? BRACE_LETS : 1) : 1;
  return { guarded, smashed: guarding && blow.breaks === true, lets };
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
    threat: blow.raw / Math.max(1, target.maxHealth),
    ...(blow.physical ? { paceSpeed: attacker.attributes.speed } : {}),
    skill: blowSkill(attacker, blow.kind, !blow.physical),
    ...(blow.discipline ? { discipline: blow.discipline } : {}),
    ...(blow.accuracy ? { accuracy: blow.accuracy } : {}),
    ...(blow.areaSize ? { areaSize: blow.areaSize } : {}),
  };
}

/** Why a blow missed, for its line: eyes that saw it, a ready Dodge, or a wild swing. */
function missWhy({ target, blow }: Hit, tried: boolean): MissWhy {
  if (hasPerk(target, 'foresight')) return 'foreseen';
  if (tried) return 'dodged';
  return blow.accuracy === 'wild' ? 'wide' : 'slipped';
}

/** The avoid roll against one blow (`avoid.ts`), unless its technique already made it. */
function evade(round: Round, hit: Hit, has: Ready): Evasion {
  const { attacker, target, blow, rng } = hit;
  const able = blow.dodgeable && !isDazed(target);
  // A Dodge (or an Evade) that tried for the technique this blow comes with is told trying for
  // the blow.
  const tried = able && (has('dodge') || committedTo(target, 'evade'));
  const avoid = able && !blow.reached ? avoidOdds(round, blowIncoming(hit)) : 0;
  if (avoid <= 0 || !rng.chance(avoid)) return { slipped: null, tried };
  const slip = { target, attacker, what: blow.what };
  const line = missLine(momentOf(round, target.id), missWhy(hit, tried), slip);
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

/** A guard smashed, and by whom, kept for the fight's summary only. */
function brokeGuard(round: Round, targetId: string, by: string): Round {
  const guardBrokenBy = { at: round.number, by };
  return { ...round, fighters: patch(round.fighters, targetId, { guardBrokenBy }) };
}

/** Lands a blow on the target, letting their clones, ready defence and kit react. */
export function react(start: Round, struck: Hit): Round {
  const answered = riposteFirst(start, struck);
  if (answered.stopped) return answered.round;
  const { what, area, raw, breaks } = struck.blow;
  const incoming = {
    ...struck,
    what,
    area: area === true,
    raw,
    breaks: breaks === true,
    physical: struck.blow.physical,
  };
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
  const { guarded, smashed, lets } = guardOn(hit, has('guard'));
  const met = Math.max(1, Math.round(kitted(swap.round, attacker, target, blow) * lets));
  // An automatic shield rises last, over whatever the ready defence did (`shield.ts`).
  const breaking = { what, hit: hitTypeOf(blow), breaks: blow.breaks === true };
  const shield = shieldUp(swap.round, { attacker, target, rng: hit.rng, ...breaking }, met);
  if (shield.force <= 0) return shield.round;
  const { round: shielded, force } = shield;
  const damage = taken(target, force);
  const told = say(
    shielded,
    harmLine(
      // Told by the blow's force; the chip says what it took.
      hitLine(momentOf(shielded, attacker.id), {
        attacker,
        target,
        blow,
        damage: force,
        maxHealth: target.maxHealth,
        guarded,
        smashed,
        dodgeTried: evasion.tried,
      }),
      damage,
    ),
    ...kitNote(momentOf(shielded, attacker.id), target, blow),
  );
  const marked = smashed ? brokeGuard(told, target.id, attacker.id) : told;
  const worn = wearShroud(wound(marked, target.id, damage), target.id, hitTypeOf(blow), damage);
  const landed = confuse(worn, hit);
  return canCounterBack(shielded, hit, has) ? counter(landed, hit) : landed;
}

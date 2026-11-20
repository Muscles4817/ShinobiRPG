import { counterOn, exposed, type Countered } from './counter';
import { threadsCutBy } from './puppets';
import type { Rng } from '@/core';
import type { Accuracy, AreaSize, Discipline, Element } from '@/systems/techniques';

import { alive, hasPerk } from '../../rules/body';
import { guardScale } from '../../rules/defence';
import { heldGuard } from '../../rules/blades';
import { confuseChance, confusionTurns, HIDDEN_DAMAGE } from '../../rules/conditions';
import { hitTypeOf, type HitType } from '../../rules/hits';
import { wearShroud } from './shrouds';
import { kitDamageScale, packScale, type AttackKind } from '../../rules/kit';
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
import { leapClear } from './leap';
import { weightOf } from './weight';
import { taken, wound } from './wound';
import { committedTo } from './commitment';
import { BRACE_LETS } from '../../rules/commitment';
import { isDazed } from './daze';
import { hitLine, missLine, momentOf, type MissWhy } from './voice';
import { kitNote } from './kitNote';
import { fighterIn, patch, say, type DefenceKind, type PlanFighter, type Round } from './state';
import { confusedLine } from './sceneVoice';
import { dustGuard } from './dust';
import { shieldUp } from './shield';
import { foundBlindSpot, throughBlindSpot } from './blindSpot';
import { distanceBetween } from './distance';
import { slipCause, slipCauseBeside, withCause } from './causes';
import type { Approach } from '../../rules/tags';

/**
 * A blow meets the avoid roll (`avoid.ts`: anyone slips some, a ready Dodge many more), unless
 * its technique already made it. Then the defence a fighter keeps ready at a distance
 * (`readiness.ts`) reacts on its own: a substitution escapes it, Guard softens it (guard); see
 * `rules/defence.ts`. A dazed fighter can only guard, and a break goes straight through a guard.
 * Kits shape every hit: armour and spirits shrug off some kinds of attack (less of a break),
 * packs hit harder together, hidden attackers harder still, illusionists' hits confuse, and
 * cowards run. Before any of it, a counter waiting for this kind of blow meets it (`counter.ts`)
 * and a clone may take the blow instead (`decoys.ts`).
 */

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
  /** How it came, for the story of a defence against it (`rules/tags/approach.ts`). */
  readonly came?: Approach;
  /** A technique's hit: a waiting counter met the technique as it was used (`jutsu.ts`). */
  readonly technique?: true;
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
  /**
   * A light blow: a rush's as its thrower lands (`rushing.ts`), a volley's shuriken (`arms.ts`).
   * A ready substitution isn't spent on it.
   */
  readonly light?: true;
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

type Ready = (kind: 'guard' | 'dodge') => boolean;

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
  const slip = { target, attacker, what: blow.what, ...(blow.came ? { came: blow.came } : {}) };
  const line = missLine(momentOf(round, target.id), missWhy(hit, tried), slip);
  const cause = slipCauseBeside(slipCause(round, blowIncoming(hit)), tried);
  // Anyone slips some blows; a ready Dodge is shown reacting, any other slip as a miss.
  const told = withCause(reactionLine(line, tried ? 'dodged' : 'missed'), cause);
  // A ready Dodge may leap clear of the blow (`leap.ts`); an Evade or a plain slip stays put.
  const said = say(round, told);
  const weight = weightOf(blowIncoming(hit));
  const leapt = tried && has('dodge') ? leapClear(said, target, { attacker, weight, rng }) : said;
  return { slipped: leapt, tried };
}

/** A Counter answers a hand-to-hand blow up close, if the attacker is in reach. */
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
    ...(blow.came ? { came: blow.came } : {}),
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

/** A plain blow (a technique's are met as it is used, `jutsu.ts`) meeting a waiting counter. */
function waitedFor(round: Round, { attacker, target, blow, rng }: Hit): Countered {
  if (blow.followUp || blow.technique) return { round, stopped: false };
  const thrown = !blow.physical;
  return counterOn(round, {
    attacker,
    target,
    what: blow.what,
    came: blow.came ?? 'blow',
    skill: blowSkill(attacker, blow.kind, thrown),
    opens: false,
    eyeContact: false,
    rng,
  });
}

/** Lands a blow on the target, letting their clones, ready defence and kit react. */
export function react(start: Round, struck: Hit): Round {
  const riposted = riposteFirst(start, struck);
  if (riposted.stopped) return riposted.round;
  // A counter waiting for this kind of attack meets it first (`counter.ts`).
  const answered = waitedFor(riposted.round, struck);
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
  // An attack through the blind spot meets no ready defence (`blindSpot.ts`).
  const blind = throughBlindSpot(decoyed.round, hit);
  // Caught waiting on a counter read wrong, they have no defence up (`counter.ts`).
  const open = blind || exposed(target);
  const ready = open ? [] : readyDefences(target, decoyed.round);
  // A defence that comes into play gives itself away to everyone facing its owner.
  const band = distanceBetween(decoyed.round, attacker.id, target.id);
  const seen = blind ? foundBlindSpot(decoyed.round, attacker, target) : decoyed.round;
  const round = noteDefence(seen, target.id, band, shown(ready, blow, band));
  const has: Ready = (kind) => ready.some((c) => c.kind === kind);
  const evasion = exposed(target) ? { slipped: null, tried: false } : evade(round, hit, has);
  if (evasion.slipped) return evasion.slipped;
  const swap = blow.light ? { round, escaped: false } : throughSwap(round, ready, hit);
  if (swap.escaped) return swap.round;
  const { guarded, smashed, lets } = guardOn(hit, has('guard'));
  const met = Math.max(1, Math.round(kitted(swap.round, attacker, target, blow) * lets));
  // An automatic shield rises last, over whatever the ready defence did (`shield.ts`).
  const breaking = { what, hit: hitTypeOf(blow), breaks: blow.breaks === true };
  const shield = shieldUp(swap.round, { attacker, target, rng: hit.rng, ...breaking }, met);
  if (shield.force <= 0) return shield.round;
  const { round: shielded, force } = shield;
  const damage = taken(target, force);
  const lines = [
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
    ...kitNote(momentOf(shielded, attacker.id), target, {
      kind: blow.kind,
      hit: hitTypeOf(blow),
      breaks: blow.breaks === true,
    }),
  ];
  const marked = smashed ? brokeGuard(shielded, target.id, attacker.id) : shielded;
  const cut = threadsCutBy(wound(marked, target.id, damage, ...lines), attacker, target);
  const worn = wearShroud(cut, target.id, hitTypeOf(blow), damage);
  const landed = confuse(worn, hit);
  return landed;
}

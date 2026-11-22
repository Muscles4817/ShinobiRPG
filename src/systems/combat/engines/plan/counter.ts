import type { Rng } from '@/core';

import { strikeDamage } from '../../rules/damage';
import { harmLine, reactionLine } from '../../rules/narration';
import {
  ANSWER_SCALE,
  counterOdds,
  counterOutcome,
  counterWaitsOf,
  OPENS_ANSWER,
  waitsFor,
  type CounterOutcome,
  type CounterWaits,
} from '../../rules/counters';
import type { Approach } from '../../rules/tags';
import { alive, hasPerk } from '../../rules/body';
import { FORESIGHT_COUNTER } from '../../rules/eyes';
import { OUTCOME_LINES } from './counterLines';
import { isDazed } from './daze';
import { distanceBetween } from './distance';
import { told } from './fresh';
import { noteDefence } from './reads';
import { canHit } from './rows';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';
import { momentOf } from './voice';
import { taken, wound } from './wound';

/**
 * A counter meeting an attack (`rules/counters.ts`): a fighter who spent their turn waiting for
 * this kind of attack reads it as it comes. Read cleanly, it is stopped and answered; late, only
 * turned aside; wrong, it gets in and finds them open, every ready defence down until their next
 * turn (`exposed`). A counter answers the first attack it waits for and is spent.
 */

/** One attack on its way to someone who may be waiting for it. */
export interface Coming {
  readonly attacker: PlanFighter;
  readonly target: PlanFighter;
  readonly what: string;
  readonly came: Approach;
  /** The skill behind it. */
  readonly skill: number;
  /** It commits its user (a charge, a Chidori): easier to read, and pays more for it. */
  readonly opens: boolean;
  /** It comes through eye contact: only that is looked away from. */
  readonly eyeContact: boolean;
  readonly rng: Rng;
}

export interface Countered {
  readonly round: Round;
  /** The attack never reached them. */
  readonly stopped: boolean;
}

/** What a fighter is waiting to counter now, if anything. */
export function waitingFor(f: Pick<PlanFighter, 'committed'>): CounterWaits | null {
  return counterWaitsOf(f.committed);
}

/** Whether this counter can meet this attack, as things stand. */
function meets(round: Round, waits: CounterWaits, c: Coming): boolean {
  if (!waitsFor(waits, c.came) || (waits === 'eyes' && !c.eyeContact)) return false;
  // Hands on a hold, or reeling, there is nothing to answer with.
  if (c.target.holding || isDazed(c.target)) return false;
  const band = distanceBetween(round, c.attacker.id, c.target.id);
  return waits === 'thrown' || band === 'close';
}

function line(round: Round, outcome: CounterOutcome, waits: CounterWaits, c: Coming): string {
  const lines = { id: `counter-${outcome}-${waits}`, lines: OUTCOME_LINES[outcome][waits] };
  return told(momentOf(round, c.target.id), lines, { t: c.target, a: c.attacker, what: c.what });
}

/** The answer to a clean read: the attacker takes it, harder for having committed. */
function answered(round: Round, waits: CounterWaits, c: Coming, said: string): Round {
  const scale = ANSWER_SCALE[waits] * (c.opens ? OPENS_ANSWER : 1);
  const attacker = fighterIn(round, c.attacker.id);
  if (scale <= 0 || !attacker || !alive(attacker)) return say(round, said);
  const raw = strikeDamage(c.target, attacker, c.rng.next()) * scale;
  const damage = taken(attacker, Math.max(1, Math.round(raw)));
  return wound(round, { who: attacker.id, damage, by: c.target.id }, harmLine(said, damage));
}

/** Plays a waiting counter against this attack, or leaves the round as it was. */
export function counterOn(round: Round, c: Coming): Countered {
  const waits = waitingFor(c.target);
  if (!waits || !meets(round, waits, c)) return { round, stopped: false };
  // Eyes that see it coming find the moment more often.
  const familiar = hasPerk(c.target, 'foresight') ? FORESIGHT_COUNTER : 1;
  const reading = { defender: c.target, attacker: c.attacker, skill: c.skill, opens: c.opens };
  const odds = counterOdds({ ...reading, familiar });
  const read = counterOutcome(odds, c.rng.next());
  // An answer that can't reach them (behind their front row) only turns the attack aside.
  const reaches = canHit({ kind: 'counter', waits }, c.attacker, round.fighters);
  const outcome = read === 'clean' && !reaches ? 'late' : read;
  // A counter answers the first attack it waits for; read wrong, they are open until their turn.
  const spent = patch(round.fighters, c.target.id, {
    committed: null,
    ...(outcome === 'missed' ? { exposed: true as const } : {}),
  });
  const band = distanceBetween(round, c.attacker.id, c.target.id);
  const seen = noteDefence({ ...round, fighters: spent }, c.target.id, band, 'counter');
  const said = line(seen, outcome, waits, c);
  // The counterer reacted, to the attacker's blow: said so, whose turn ever it is told in.
  const defending = { by: c.target.id, on: c.attacker.id };
  switch (outcome) {
    case 'clean': {
      const answer = reactionLine(said, defending, 'countered');
      return { round: answered(seen, waits, c, answer), stopped: true };
    }
    case 'late':
      return { round: say(seen, reactionLine(said, defending, 'guarded')), stopped: true };
    case 'missed':
      return { round: say(seen, said), stopped: false };
  }
}

/** Caught waiting on a counter read wrong: no defence comes up until their next turn. */
export function exposed(f: Pick<PlanFighter, 'exposed'>): boolean {
  return f.exposed === true;
}

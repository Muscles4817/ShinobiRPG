import { hashUnit } from '@/core';
import type { PersonDef } from '@/content';
import { fightingPower, STAT_IDS } from '@/systems/stats';

import type { GameContext } from '../context';
import { findPerson } from '../people/cast';
import { personAptitude, personStats } from '../people/progress';
import type { GameState } from '../state';
import { YOU_IN_ORDER, yearOrder } from '../views/classHonours';
import { gradeMarks } from './grades';
import { RIVAL_SHAPES, type Rival, type RivalShape, type Temperament } from './state';

/**
 * Who your rival is. The shape of the gap is rolled from the seed first (a prodigy far ahead,
 * someone neck and neck, a chaser behind you, or a fallen star ahead now but with less in
 * them), then the classmate on another team who fits it best is chosen from the year as the
 * honours read it. Their temperament comes from their traits.
 */

/** Chance of each shape, in `RIVAL_SHAPES` order. */
const SHAPE_ODDS = [0.25, 0.35, 0.2, 0.2] as const;
const START_HEAT = 40;

const TEMPERAMENT_OF: Readonly<Record<string, Temperament>> = {
  proud: 'proud',
  brash: 'proud',
  kind: 'kind',
  humble: 'kind',
  calm: 'cold',
  focused: 'cold',
  cunning: 'cold',
};

function rolledShape(seed: number): RivalShape {
  let left = hashUnit(seed, 'rival-shape');
  for (const [i, odds] of SHAPE_ODDS.entries()) {
    left -= odds;
    if (left < 0) return RIVAL_SHAPES[i] ?? 'neck';
  }
  return 'neck';
}

function talentOf(person: PersonDef, ctx: GameContext): number {
  const aptitude = personAptitude(person, ctx);
  return STAT_IDS.reduce((sum, id) => sum + aptitude[id], 0) / STAT_IDS.length;
}

interface Candidate {
  readonly person: PersonDef;
  /** Places ahead of you in the year (negative: behind). */
  readonly ahead: number;
  readonly talent: number;
}

/** How well a classmate fits a shape: lower is better. */
function misfit(shape: RivalShape, c: Candidate, yourTalent: number): number {
  switch (shape) {
    case 'prodigy':
      return c.ahead > 0 ? -c.ahead - (c.talent - yourTalent) * 4 : 100;
    case 'neck':
      return Math.abs(c.ahead - 0.5);
    case 'chaser':
      return c.ahead < 0 ? Math.abs(c.ahead + 1) : 100;
    case 'fallen':
      return c.ahead > 0 ? (c.talent - yourTalent) * 10 + c.ahead : 100;
  }
}

/** The shape a rival really has, once chosen: a misfit falls back to what they are. */
function actualShape(shape: RivalShape, c: Candidate, yourTalent: number): RivalShape {
  if (shape === 'chaser' && c.ahead > 0) return 'neck';
  if ((shape === 'prodigy' || shape === 'fallen') && c.ahead <= 0) return 'chaser';
  if (shape === 'fallen' && c.talent > yourTalent) return 'neck';
  return shape;
}

function temperamentOf(person: PersonDef, seed: number): Temperament {
  const found = person.traitIds.map((t) => TEMPERAMENT_OF[t]).find((t) => t !== undefined);
  if (found) return found;
  const roll = hashUnit(seed, person.id, 'temperament');
  return roll < 0.4 ? 'proud' : roll < 0.7 ? 'kind' : 'cold';
}

/** Your rival, chosen from your year; null when there is nobody to choose (no year yet). */
export function chooseRival(state: GameState, ctx: GameContext): Rival | null {
  const order = yearOrder(state, ctx);
  const you = order.indexOf(YOU_IN_ORDER);
  const teammates = state.people.team?.teammateIds ?? [];
  const yourTalent =
    STAT_IDS.reduce((sum, id) => sum + state.character.aptitude[id], 0) / STAT_IDS.length;
  const candidates = order.flatMap((id, place): Candidate[] => {
    const person =
      id === YOU_IN_ORDER || teammates.includes(id) ? null : findPerson(state, ctx, id);
    return person ? [{ person, ahead: you - place, talent: talentOf(person, ctx) }] : [];
  });
  const shape = rolledShape(state.board.seed);
  const best = [...candidates].sort(
    (a, b) => misfit(shape, a, yourTalent) - misfit(shape, b, yourTalent),
  )[0];
  if (!best) return null;
  return {
    personId: best.person.id,
    shape: actualShape(shape, best, yourTalent),
    temperament: temperamentOf(best.person, state.board.seed),
    heat: START_HEAT,
    spars: { you: 0, them: 0 },
    firsts: {},
    startGrades: gradeMarks(state.character.stats, personStats(best.person, state)),
    challenge: null,
    lastChallengeDay: state.time.day,
    beat: { kind: 'meeting' },
  };
}

/** Their standing in the year now, against yours (for the Rivalry tab). */
export function powerGap(state: GameState, ctx: GameContext, rival: Rival): number {
  const person = findPerson(state, ctx, rival.personId);
  if (!person) return 0;
  return fightingPower(personStats(person, state)) - fightingPower(state.character.stats);
}

import { daysOfRentLeft, isRentOverdue } from '@/systems/housing';
import { slotName, type TimeSlot } from '@/systems/time';
import { maxHealth } from '@/systems/vitals';

import type { GameContext } from '../context';
import { placeHere } from '../ops';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

export interface HomeView {
  readonly name: string;
  readonly lodging: string;
  readonly slot: TimeSlot;
  readonly rentPerWeek: number;
  readonly rentStatus: string;
  readonly overdue: boolean;
  readonly sleepQuality: string;
  readonly sleep: Choice;
  readonly nap: Choice;
  readonly payRent: Choice;
}

function rentStatus(state: GameState): string {
  const left = daysOfRentLeft(state.housing, state.time.day);
  if (left < 0) return `Overdue by ${-left} ${left === -1 ? 'day' : 'days'}`;
  if (left === 0) return 'Due tomorrow';
  return `Paid for ${left + 1} more days`;
}

export function homeView(state: GameState, ctx: GameContext): HomeView | null {
  const place = placeHere(state, ctx, 'home');
  if (!place) return null;
  const overdue = isRentOverdue(state.housing, state.time.day);
  return {
    name: place.name,
    lodging: place.lodging,
    slot: slotName(state.time),
    rentPerWeek: state.housing.rentPerWeek,
    rentStatus: rentStatus(state),
    overdue,
    sleepQuality: overdue ? 'Locked out · poor rest' : 'Good · half your health back overnight',
    sleep: choice(state, ctx, { type: 'sleep' }),
    nap: choice(state, ctx, { type: 'rest' }),
    payRent: choice(state, ctx, { type: 'payRent' }),
  };
}

export interface HospitalView {
  readonly name: string;
  readonly health: number;
  readonly maxHealth: number;
  readonly cost: number;
  readonly treat: Choice;
}

export function hospitalView(state: GameState, ctx: GameContext): HospitalView | null {
  const place = placeHere(state, ctx, 'hospital');
  if (!place) return null;
  return {
    name: place.name,
    health: Math.round(state.character.vitals.health),
    maxHealth: maxHealth(state.character.stats),
    cost: place.treatmentCost,
    treat: choice(state, ctx, { type: 'treat' }),
  };
}

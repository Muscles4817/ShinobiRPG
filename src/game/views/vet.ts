import type { PlaceDef, VetFields } from '@/content';
import { laidUp } from '@/systems/companions';

import { treatmentFee } from '../actions/vet';
import { yourCompanion } from '../companions/care';
import type { GameContext } from '../context';
import { placeHere } from '../ops';
import { findPerson, fullName } from '../people/cast';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/** The animal clinic's counter: the vet, a treatment for an injured companion, and medicine. */

export interface VetView {
  readonly name: string;
  readonly blurb: string;
  /** The vet, by name. */
  readonly vet: string;
  /** What a treatment costs you here; 0 at your own clan's kennels. */
  readonly fee: number;
  /** How your companion is, in a line, or null when you have none. */
  readonly patient: string | null;
  readonly treat: Choice;
  readonly medicineCost: number;
  readonly doses: number;
  readonly buyMedicine: Choice;
}

export function vetView(state: GameState, ctx: GameContext): VetView | null {
  const vet = placeHere(state, ctx, 'vet');
  if (!vet) return null;
  const keeper = findPerson(state, ctx, vet.keeperId);
  const yours = yourCompanion(state, ctx);
  const hurt = yours && laidUp(yours.companion, state.time.day);
  return {
    name: vet.name,
    blurb: vet.blurb,
    vet: keeper ? fullName(keeper) : vet.name,
    fee: treatmentFee(state, ctx) ?? vet.treatmentCost,
    patient: yours
      ? hurt
        ? `${yours.companion.name} is laid up and could use treating.`
        : `${yours.companion.name} is in good health.`
      : null,
    treat: choice(state, ctx, { type: 'treatCompanion' }),
    medicineCost: vet.medicineCost,
    doses: state.companions.medicine,
    buyMedicine: choice(state, ctx, { type: 'buyMedicine' }),
  };
}

/** The clinic's line on the village screen: your companion's need first. */
export function vetLine(state: GameState, ctx: GameContext, vet: PlaceDef & VetFields): string {
  const yours = yourCompanion(state, ctx);
  return yours && laidUp(yours.companion, state.time.day)
    ? `${yours.companion.name} needs seeing to`
    : vet.blurb;
}

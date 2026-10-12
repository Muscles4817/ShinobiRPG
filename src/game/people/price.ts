import type { PersonDef, PriceTemplate, SimplePrice } from '@/content';
import { stageName, stageOf } from '@/systems/bonds';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { bondOf } from './cast';

/**
 * A teacher's price, read against where you stand. Each part says what it asks (in engine
 * wording), whether you meet it, why not, and the teacher's own words for it. Ryo is the only
 * part paid each session; the rest are conditions you meet once.
 */

export interface PricePart {
  readonly kind: SimplePrice['kind'];
  /** What it asks, e.g. "Friends", "40 ryo a session". */
  readonly label: string;
  readonly met: boolean;
  /** Why it isn't met, said plainly; null when it is. */
  readonly unmet: string | null;
  /** The teacher's own words. */
  readonly line: string | null;
}

export function priceParts(price: PriceTemplate): readonly SimplePrice[] {
  return price.kind === 'all' ? price.parts : [price];
}

function stageLabel(stage: number): string {
  return stageName(stage).toLowerCase();
}

function bondPart(state: GameState, person: PersonDef, minStage: number) {
  const stage = stageOf(bondOf(state, person.id).points);
  const met = stage >= minStage;
  return {
    label: stageName(minStage),
    met,
    unmet: met
      ? null
      : `${person.name} only trains ${stageLabel(minStage)}s. You are ${stageLabel(stage)}s.`,
  };
}

function partOf(state: GameState, ctx: GameContext, person: PersonDef, part: SimplePrice) {
  switch (part.kind) {
    case 'bond':
      return bondPart(state, person, part.minStage);
    case 'ryo': {
      const met = state.wallet.ryo >= part.perSession;
      return {
        label: `${part.perSession} ryo a session`,
        met,
        unmet: met ? null : `${person.name} asks ${part.perSession} ryo a session.`,
      };
    }
    case 'mission': {
      const title = ctx.content.missions.require(part.missionId).title;
      const met = state.board.completed.includes(part.missionId);
      return {
        label: `Finish “${title}”`,
        met,
        unmet: met ? null : `${person.name} wants you to finish “${title}” first.`,
      };
    }
    case 'favour': {
      const met = state.people.favours.includes(part.favourId);
      return { label: part.ask, met, unmet: met ? null : part.ask };
    }
  }
}

function lineOf(part: SimplePrice): string | null {
  return part.kind === 'favour' ? null : (part.line ?? null);
}

/** Every part of a price, read against your standing now. */
export function readPrice(
  state: GameState,
  ctx: GameContext,
  person: PersonDef,
  price: PriceTemplate,
): PricePart[] {
  return priceParts(price).map((part) => ({
    kind: part.kind,
    ...partOf(state, ctx, person, part),
    line: lineOf(part),
  }));
}

/** Ryo a session costs. */
export function ryoPerSession(price: PriceTemplate | null): number {
  if (!price) return 0;
  return priceParts(price).reduce((sum, p) => sum + (p.kind === 'ryo' ? p.perSession : 0), 0);
}

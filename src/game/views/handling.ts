import type { CompanionKindDef, KindTechnique } from '@/content';
import { stageForPair, stageOf } from '@/systems/bonds';
import type { Companion } from '@/systems/companions';
import { STAT_INFO, statTier, type StatGrade } from '@/systems/stats';

import { trainableStats } from '../actions/companionTraining';
import { handlingFee } from '../actions/handling';
import { knowsTechnique, ROLE_STAGE } from '../companions/arts';
import { yourCompanion } from '../companions/care';
import type { GameContext } from '../context';
import { placeHere } from '../ops';
import { findPerson } from '../people/cast';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/**
 * What the bond opens, in words (its arts and the job roles it will take), the clinic's handler
 * (sessions and the arts they teach) and handling lore on a shop's shelf.
 */

/** How a handler's quality reads against your own handling. */
const BETTER = 'Better than you can do on your own.';
const QUALITY_WORDS: readonly (readonly [number, string])[] = [
  [2, 'A clan handler: twice what you can do on your own.'],
  [1.5, 'A kennel master: far better than you can do on your own.'],
];

const ROLE_WORDS: Readonly<Record<string, string>> = {
  tracker: 'a job’s tracking',
  sensor: 'a job’s sensing',
  medic: 'a job’s tending',
};

export interface CompanionArt {
  readonly name: string;
  readonly known: boolean;
  /** What opens it, when it isn't known yet. */
  readonly note: string | null;
}

function artNote(companion: Companion, technique: KindTechnique): string | null {
  if (knowsTechnique(companion, technique)) return null;
  const pair = stageForPair(technique.stage);
  if (stageOf(companion.bond) < technique.stage) {
    return technique.handler
      ? `Once you are ${pair}, a handler can teach it.`
      : `Opens once you are ${pair}.`;
  }
  return 'A handler can teach it now.';
}

/** Its kind's arts, known first, with what opens the rest. */
export function companionArts(
  companion: Companion,
  kind: CompanionKindDef,
  ctx: GameContext,
): CompanionArt[] {
  return (kind.techniques ?? []).map((t) => ({
    name: ctx.content.techniques.require(t.techniqueId).name,
    known: knowsTechnique(companion, t),
    note: artNote(companion, t),
  }));
}

/** The job roles its kind takes, and whether the bond has opened them yet. */
export function roleLine(companion: Companion, kind: CompanionKindDef): string | null {
  const roles = (kind.roles ?? []).map((r) => ROLE_WORDS[r] ?? r);
  if (roles.length === 0) return null;
  const what = roles.join(' and ');
  return stageOf(companion.bond) >= ROLE_STAGE
    ? `On a job with a crew it takes ${what} for you when its nose is the best.`
    : `Once you are ${stageForPair(ROLE_STAGE)}, it will take ${what} for you on a job.`;
}

export interface HandlerView {
  readonly name: string;
  readonly quality: string;
  /** A session's fee for you; 0 at your own clan's kennels. */
  readonly fee: number;
  readonly sessions: readonly (Choice & { readonly label: string; readonly grade: StatGrade })[];
  readonly teaches: readonly (Choice & { readonly name: string; readonly note: string | null })[];
}

export function handlerView(state: GameState, ctx: GameContext): HandlerView | null {
  const vet = placeHere(state, ctx, 'vet');
  const yours = yourCompanion(state, ctx);
  if (!vet?.handling || !yours) return null;
  const clinic = { ...vet, handling: vet.handling };
  const { companion, kind } = yours;
  const taught = (kind.techniques ?? []).filter(
    (t) => t.handler && (vet.handling?.teaches ?? []).includes(t.techniqueId),
  );
  return {
    name: findPerson(state, ctx, vet.keeperId)?.name ?? vet.name,
    quality: QUALITY_WORDS.find(([at]) => clinic.handling.quality >= at)?.[1] ?? BETTER,
    fee: handlingFee(state, clinic),
    sessions: trainableStats(companion).map((stat) => ({
      ...choice(state, ctx, { type: 'handlerSession', stat }),
      label: STAT_INFO[stat].label,
      grade: statTier(companion.stats[stat]).grade,
    })),
    teaches: taught
      .filter((t) => !companion.learned.includes(t.techniqueId))
      .map((t) => ({
        ...choice(state, ctx, { type: 'handlerTeach', techniqueId: t.techniqueId }),
        name: ctx.content.techniques.require(t.techniqueId).name,
        note: artNote(companion, t),
      })),
  };
}

export interface LoreOnShelf extends Choice {
  readonly name: string;
  readonly description: string;
  readonly cost: number;
  readonly owned: boolean;
}

/** Handling lore on a shop's shelf. */
export function loreOnShelf(
  state: GameState,
  ctx: GameContext,
  ids: readonly string[],
): LoreOnShelf[] {
  return ids.map((id) => {
    const lore = ctx.content.companionLore.require(id);
    return {
      ...choice(state, ctx, { type: 'buyLore', loreId: id }),
      name: lore.name,
      description: lore.description,
      cost: lore.cost,
      owned: state.companions.lore.includes(id),
    };
  });
}

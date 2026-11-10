import type { GameContext } from '../context';
import type { GameState } from '../state';
import { knowsPuppetry } from '../puppetry/yours';
import { choice, type Choice } from './common';

/**
 * Materials for building puppets on a shop's shelf (`materialIds`), by the lot, for anyone who
 * knows the art: what each is, how fine, and how many lots you already keep.
 */

export interface MaterialOnShelf extends Choice {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly grade: string;
  readonly cost: number;
  /** Lots you keep at home already. */
  readonly held: number;
}

export const MATERIAL_GRADES: Readonly<Record<1 | 2 | 3, string>> = {
  1: 'Common',
  2: 'Fine',
  3: 'Rare',
};

export function materialsOnShelf(
  state: GameState,
  ctx: GameContext,
  place: { readonly id: string; readonly materialIds?: readonly string[] },
): MaterialOnShelf[] {
  if (!knowsPuppetry(state, ctx)) return [];
  return (place.materialIds ?? []).map((id) => {
    const material = ctx.content.puppetMaterials.require(id);
    return {
      ...choice(state, ctx, { type: 'buyMaterial', placeId: place.id, materialId: id }),
      id,
      name: material.name,
      description: material.description,
      grade: MATERIAL_GRADES[material.quality],
      cost: material.price,
      held: state.puppetry.stock[id] ?? 0,
    };
  });
}

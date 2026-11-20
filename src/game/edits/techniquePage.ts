import type { StatGrade } from '@/systems/stats';
import type { Discipline, Element } from '@/systems/techniques';

import type { GameContext } from '../context';
import { techniqueSheet, type TechniqueSheet } from '../views/techniqueSheet';
import { sandboxOf } from '../versus/profile';
import { contenderOf } from '../versus/roster';
import { setupOf } from '../versus/sides';
import { fighterEditor } from './view';

/**
 * A technique's page in the fighter editor: what it is and its full sheet read in this fighter's
 * hands, as their versus profile reads it, so a technique can be judged before it is added and
 * not only by its name.
 */

export interface EditorTechniquePage {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly discipline: Discipline;
  readonly rank: StatGrade;
  readonly element: Element | null;
  readonly made: boolean;
  /** Already among what they fight with. */
  readonly held: boolean;
  /** Why they won't use it yet (their grades don't carry it); null when they will. */
  readonly unused: string | null;
  readonly sheet: TechniqueSheet;
  /** Whose hands the sheet reads it in. */
  readonly hands: string;
}

const UNUSED = 'Beyond their grades: unused until they grow into it.';

/** The page of a technique for a fighter, or null for a fighter or technique the world lacks. */
export function editorTechniquePage(
  ctx: GameContext,
  key: string,
  techniqueId: string,
): EditorTechniquePage | null {
  const editor = fighterEditor(ctx, key);
  const contender = contenderOf(ctx, key);
  const def = ctx.content.techniques.get(techniqueId);
  if (!editor || !contender || !def) return null;
  const listed = [...editor.techniques, ...editor.choices].find((t) => t.id === techniqueId);
  const sandbox = sandboxOf(ctx);
  const setup = setupOf(contender, sandbox, ctx, editor.fighter.title);
  return {
    id: def.id,
    name: def.name,
    description: def.description,
    discipline: def.discipline,
    rank: def.rank,
    element: def.element ?? null,
    made: listed?.made ?? false,
    held: editor.techniques.some((t) => t.id === techniqueId),
    unused: listed && !listed.ready ? UNUSED : null,
    sheet: techniqueSheet(sandbox, ctx, def, setup),
    hands: `In ${editor.fighter.name}’s hands`,
  };
}

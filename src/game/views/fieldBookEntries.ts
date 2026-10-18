import type { IconId } from '@/content';
import { masteryOf } from '@/systems/cooking';
import type { ChipTone } from '@/systems/journal';

import type { GameContext } from '../context';
import { findsWhere, fishWhere, isRare, whenWords, type WildWhere } from '../fieldBook/wild';
import type { GameState } from '../state';
import { hasSight } from '../village';
import { recipeHints } from './cookbook';

/**
 * The entries on each page of the field book. A filled entry says what you know of it; an empty
 * one gives a hint, never the answer (where and when for the wild pages, the sight as you'd
 * notice it without the eyes for it, where a recipe is taught). Once found, an entry keeps
 * just its first place: its numbers matter more than where it lives. Foes are in
 * `fieldBookFoes.ts`.
 */

export interface FieldEntry {
  readonly id: string;
  readonly name: string;
  readonly icon: IconId;
  readonly found: boolean;
  /** What it is, or where and when to look. No numbers. */
  readonly lines: readonly string[];
  /** Ink stamps: "Rare", "Known well", "Mastered". */
  readonly stamps: readonly string[];
  /** The numbers: "Best 87 cm", "Caught 3". */
  readonly chips: readonly { readonly label: string; readonly tone: ChipTone }[];
}

/** Places named in a hint before "and elsewhere". */
const PLACES_SHOWN = 2;

const MASTERY_STAMP = { new: null, practised: 'Practised', mastered: 'Mastered' } as const;

/**
 * Where to look, each place with its own hours and seasons ("The reeds at the river, any time
 * of year."): all of them for an empty slot, only the first once it is found.
 */
function whereLines(places: readonly WildWhere[], found: boolean): string[] {
  const lines = [...new Set(places.map((p) => `${p.where}, ${whenWords(p.find)}`))];
  const shown = lines.slice(0, found ? 1 : PLACES_SHOWN);
  return shown.map((line, i) =>
    i === shown.length - 1 && lines.length > shown.length ? `${line}, and elsewhere.` : `${line}.`,
  );
}

export function fishEntries(state: GameState, ctx: GameContext): FieldEntry[] {
  return [...fishWhere(ctx)].map(([id, places]) => {
    const caught = state.fieldBook.catches[id];
    const rare = isRare(places) ? ['Rare'] : [];
    return caught
      ? {
          id,
          name: ctx.content.ingredients.require(id).name,
          icon: 'fish',
          found: true,
          lines: whereLines(places, true),
          stamps: rare,
          chips: [
            { label: `Best ${caught.best} cm`, tone: 'gain' },
            { label: `Caught ${caught.count}`, tone: 'info' },
          ],
        }
      : {
          id,
          name: 'Not yet caught',
          icon: 'fish',
          found: false,
          lines: whereLines(places, false),
          stamps: rare,
          chips: [],
        };
  });
}

export function findEntries(state: GameState, ctx: GameContext): FieldEntry[] {
  return [...findsWhere(ctx)].map(([id, places]) => {
    const count = state.fieldBook.finds[id] ?? 0;
    const def = ctx.content.ingredients.require(id);
    const rare = isRare(places) ? ['Rare'] : [];
    return count > 0
      ? {
          id,
          name: def.name,
          icon: def.icon,
          found: true,
          lines: whereLines(places, true),
          stamps: rare,
          chips: [{ label: `Gathered ${count}`, tone: 'info' }],
        }
      : {
          id,
          name: 'Not yet found',
          icon: 'leaf',
          found: false,
          lines: whereLines(places, false),
          stamps: rare,
          chips: [],
        };
  });
}

export function recipeEntries(state: GameState, ctx: GameContext): FieldEntry[] {
  return ctx.content.recipes.all.map((r) => {
    const times = state.cooking.known[r.id];
    if (times === undefined) {
      const hints = recipeHints(ctx, r.id);
      return {
        id: r.id,
        name: 'Not yet learned',
        icon: r.icon,
        found: false,
        lines:
          hints.length > 0
            ? hints.slice(0, PLACES_SHOWN)
            : ['Worked out at home, with the right ingredients'],
        stamps: [],
        chips: [],
      };
    }
    const stamp = MASTERY_STAMP[masteryOf(times)];
    return {
      id: r.id,
      name: r.name,
      icon: r.icon,
      found: true,
      lines: [r.description],
      stamps: stamp ? [stamp] : [],
      chips: [{ label: `Cooked ${times}`, tone: 'info' }],
    };
  });
}

/** Every sight, or none for eyes that can never follow one (`sightsSealed` says why). */
export function sightEntries(state: GameState, ctx: GameContext): FieldEntry[] {
  if (!hasSight(state, ctx)) return [];
  return ctx.content.village.sights.map((s) =>
    state.fieldBook.sights.includes(s.id)
      ? {
          id: s.id,
          name: s.title,
          icon: 'lantern',
          found: true,
          lines: [s.outcome],
          stamps: [],
          chips: [],
        }
      : {
          id: s.id,
          name: 'Not yet followed',
          icon: 'lantern',
          found: false,
          lines: [s.unseen],
          stamps: [],
          chips: [],
        },
  );
}

/** Why the sights page is sealed to you, or null when your eyes can follow them. */
export function sightsSealed(state: GameState, ctx: GameContext): string | null {
  return hasSight(state, ctx)
    ? null
    : 'Sealed. Only an awakened bloodline’s eyes can follow what walks the village at night.';
}

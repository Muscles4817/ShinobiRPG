import type { PersonDef, Tone } from '@/content';
import { TALK_BASE } from '@/systems/bonds';

/**
 * Sitting down with someone at the bar. A drink counts as your time together today, like a
 * talk or a dinner, and how it goes is up to how you spend it: the kind of night is a tone,
 * and their traits decide whether it lands.
 */

/** A drink is worth a little more than a talk: you bought it, and it lasts the evening. */
export const DRINK_BONUS = 2;

export interface DrinkWay {
  readonly id: string;
  readonly tone: Tone;
  readonly label: string;
  /** What the night is like, on the choice. No numbers. */
  readonly line: string;
  /** For the record: how the night went, with `{name}` for who you sat with. */
  readonly liked: string;
  readonly plain: string;
  readonly disliked: string;
}

export const DRINK_WAYS = [
  {
    id: 'stories',
    tone: 'joke',
    label: 'Trade stories',
    line: 'Loud, and the cups keep coming.',
    liked: '{name} laughs until the keeper asks you both to keep it down, then laughs at that.',
    plain: 'You and {name} swap a few stories over a cup. A pleasant hour.',
    disliked: '{name} smiles politely at your stories and finishes their cup early.',
  },
  {
    id: 'quiet',
    tone: 'quiet',
    label: 'A quiet cup',
    line: 'A corner seat and not much said.',
    liked:
      '{name} lets out a long breath. Neither of you says much, and it is the best hour of the day.',
    plain: 'You share a quiet cup with {name} in the corner.',
    disliked: '{name} fidgets through the silence and keeps looking at the louder tables.',
  },
  {
    id: 'contest',
    tone: 'challenge',
    label: 'Cup for cup',
    line: 'Whoever puts their cup down first pays.',
    liked: '{name} slams down the last cup, grinning, and demands a rematch next time.',
    plain: 'You and {name} match each other cup for cup until the keeper cuts you both off.',
    disliked: '{name} pushes your cup back across the counter. They came here to unwind.',
  },
] as const satisfies readonly DrinkWay[];

export type DrinkWayId = (typeof DRINK_WAYS)[number]['id'];

export function drinkWay(id: DrinkWayId): DrinkWay {
  return DRINK_WAYS.find((w) => w.id === id) ?? DRINK_WAYS[0];
}

/** The record's line for the night, by how the tone landed (against a plain talk). */
export function drinkStory(way: DrinkWay, person: PersonDef, reaction: number): string {
  const text = reaction > TALK_BASE ? way.liked : reaction < TALK_BASE ? way.disliked : way.plain;
  return text.replaceAll('{name}', person.name);
}

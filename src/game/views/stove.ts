import {
  CUTS,
  FINISHES,
  HEATS,
  MAX_EXPERIMENT_INGREDIENTS,
  type Beat,
  type CookingMethod,
  type CookingSteps,
} from '@/systems/cooking';

/**
 * The stove's words: each beat's question and choices, each method's name, and what you know
 * of a dish's steps worded as a hint. The UI lays these out; the rules are in `game/stove.ts`.
 */

export interface StoveBeat {
  readonly beat: Beat;
  readonly question: string;
  readonly options: readonly { readonly id: string; readonly label: string }[];
}

export const STOVE_BEATS: readonly StoveBeat[] = [
  {
    beat: 'cut',
    question: 'How do you cut it?',
    options: CUTS.map((id) => ({
      id,
      label: { fine: 'Fine', chunky: 'Chunky', whole: 'Whole' }[id],
    })),
  },
  {
    beat: 'heat',
    question: 'What fire?',
    options: HEATS.map((id) => ({
      id,
      label: { gentle: 'Gentle', steady: 'Steady', fierce: 'Fierce' }[id],
    })),
  },
  {
    beat: 'finish',
    question: 'When does it come off?',
    options: FINISHES.map((id) => ({
      id,
      label: { early: 'Early', 'on-time': 'On time', late: 'Late' }[id],
    })),
  },
];

export const METHOD_WORDS: Readonly<Record<CookingMethod, string>> = {
  grill: 'Grilled',
  simmer: 'Simmered',
  steam: 'Steamed',
  fry: 'Fried',
  boil: 'Boiled',
  raw: 'Raw',
};

/** "You know: steady fire." from what mastery has shown you, or null when nothing yet. */
export function stepsHint(known: Partial<CookingSteps>): string | null {
  const parts = [
    known.cut && `cut ${known.cut}`,
    known.heat && `${known.heat} fire`,
    known.finish && `off ${known.finish === 'on-time' ? 'on time' : known.finish}`,
  ].filter((p): p is string => Boolean(p));
  return parts.length > 0 ? `You know it: ${parts.join(', ')}.` : null;
}

export const EXPERIMENT_LIMIT = MAX_EXPERIMENT_INGREDIENTS;

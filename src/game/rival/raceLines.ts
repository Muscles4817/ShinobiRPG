import type { LegResult } from './race';
import type { RaceMove } from './state';

/**
 * The race in words: what each move is, what a sharp eye reads in them before a leg, and how
 * the leg went. Names are filled in as `{name}`; no numbers, ever.
 */

export const MOVE_LABEL: Readonly<
  Record<RaceMove, { readonly label: string; readonly note: string }>
> = {
  steady: { label: 'Hold steady', note: 'Run as you are. Behind a push, you ride their wake.' },
  push: { label: 'Push', note: 'Gain ground now. It tells on every leg after.' },
  gamble: { label: 'Take the roofs', note: 'Even odds: a lot of ground, won or lost.' },
};

/** What a sharp eye sees in them before a leg: what they mean to do. */
export const TELL: Readonly<Record<RaceMove, string>> = {
  steady: '{name} settles into an even pace, watching you rather than the course.',
  push: '{name} is up on their toes, breathing fast. They mean to go hard.',
  gamble: '{name} keeps glancing up at the rooftops.',
};

export const NO_READ = 'You can’t tell what {name} means to do.';
export const STRAINED = '{name}’s breathing is ragged.';

function gambleLine(won: boolean | null, yours: boolean): string | null {
  if (won === null) return null;
  if (yours) {
    return won
      ? 'The shortcut holds: you drop off the last roof ahead of where you climbed.'
      : 'A tile gives under you, and you lose ground getting back down to the path.';
  }
  return won
    ? '{name} vanishes over the roofs and comes down ahead of you.'
    : '{name} tries the roofs and comes down the long way round.';
}

/** How the leg went, before where it leaves you. */
export function legLines(yourMove: RaceMove, theirMove: RaceMove, result: LegResult): string[] {
  const lines = [gambleLine(result.yourGamble, true), gambleLine(result.theirGamble, false)];
  if (yourMove === 'steady' && theirMove === 'push') {
    lines.push('You sit in {name}’s wake and let them do the work.');
  } else if (theirMove === 'steady' && yourMove === 'push') {
    lines.push('{name} tucks in behind you and lets you do the work.');
  } else if (yourMove === 'push' && theirMove === 'gamble') {
    lines.push('You put your head down and run while {name} is up on the roofs.');
  }
  return lines.filter((l) => l !== null);
}

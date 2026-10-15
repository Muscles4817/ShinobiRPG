import { ACTION_CUES, cueFor } from '../cues';
import type { GameAction } from '../actions/types';
import type { Report } from '../reports';
import type { GameState } from '../state';
import type { FightBeat } from '../views/fightReplay';

/**
 * Which sound a moment makes. The game decides it (so a headless test can check it); the
 * screen only plays it, and only when the player has sound on. Every everyday action that
 * animates (`ActionCue`) has a sound of the same name; the rest are taps, refusals, report
 * cards and a fight's beats.
 */

export const SOUNDS = [
  ...ACTION_CUES,
  /** Any button pressed. */
  'tap',
  /** An action the game turned down. */
  'refused',
  /** A page or sheet opening (a place, a person, the settings). */
  'page',
  'victory',
  'defeat',
  /** A rank, a grade or a job well done. */
  'fanfare',
  /** A quiet report: a lesson, home again, a job that went wrong. */
  'paper',
  /** A blow you or a friend landed. */
  'strike',
  /** A blow that landed on you. */
  'hurt',
  /** Health or chakra coming back mid-fight. */
  'mend',
  /** A move that touched nobody: a dodge, a step, a miss. */
  'swish',
  /** A new exchange or round begins. */
  'exchange',
] as const;
export type Sound = (typeof SOUNDS)[number];

/** The sound of an action that went through, or null when the tap was enough. */
export function soundAfter(action: GameAction, before: GameState, after: GameState): Sound | null {
  return cueFor(action, before, after);
}

/** The sound a report card makes as it comes up. */
export function reportSound(report: Report): Sound {
  switch (report.kind) {
    case 'fight':
      if (report.result === 'victory') return 'victory';
      return report.result === 'defeat' ? 'defeat' : 'paper';
    case 'defeat':
      return 'defeat';
    case 'mission-complete':
    case 'grade':
    case 'team-formed':
      return 'fanfare';
    case 'spar':
      return report.result === 'won' ? 'victory' : 'paper';
    case 'mission-failed':
    case 'lesson':
    case 'home-again':
    case 'nature':
      return 'paper';
  }
}

/** The sound of one beat of a fight on the watch screen, heard from your side (`youId`). */
export function beatSound(beat: FightBeat, youId: string | null): Sound | null {
  if (beat.kind === 'divider') return 'exchange';
  if (beat.chips.some((c) => c.tone === 'harm')) {
    return youId !== null && beat.targetId === youId ? 'hurt' : 'strike';
  }
  if (beat.chips.some((c) => c.tone === 'gain')) return 'mend';
  return beat.actorId === null ? null : 'swish';
}

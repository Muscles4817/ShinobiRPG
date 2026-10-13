import type { PersonDef, VoiceMoment } from '@/content';
import { hashUnit } from '@/core';
import type { MissionNote } from '@/systems/missions';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { crewPeople } from './personal';

/**
 * Someone along says something: a line for the moment from their traits (`content.voices`),
 * chosen by a hash of the seed, the day and how far the story has got, so it never draws on the
 * game's dice.
 */

function linesFor(ctx: GameContext, person: PersonDef, moment: VoiceMoment): readonly string[] {
  return ctx.content.voices
    .filter((v) => v.moment === moment && person.traitIds.includes(v.trait))
    .flatMap((v) => v.lines);
}

function roll(state: GameState, what: string): number {
  const told = state.mission?.notes.length ?? 0;
  return hashUnit(state.board.seed, state.time.day, told, what);
}

/** A line from this person for the moment, if their traits give them one. */
export function voiceOf(
  state: GameState,
  ctx: GameContext,
  person: PersonDef,
  moment: VoiceMoment,
): MissionNote | null {
  const lines = linesFor(ctx, person, moment);
  const line = lines[Math.floor(roll(state, person.id) * lines.length)];
  return line ? { kind: 'voice', speaker: person.name, text: line } : null;
}

/** A line from someone along (picked by the hash) for the moment; null alone or if none fits. */
export function crewVoice(
  state: GameState,
  ctx: GameContext,
  moment: VoiceMoment,
): MissionNote | null {
  const people = crewPeople(state, ctx).filter((p) => linesFor(ctx, p, moment).length > 0);
  const speaker = people[Math.floor(roll(state, moment) * people.length)];
  return speaker ? voiceOf(state, ctx, speaker, moment) : null;
}

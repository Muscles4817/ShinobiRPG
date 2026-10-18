import type { PersonDef, VoiceMoment } from '@/content';
import { hashUnit } from '@/core';
import { END_MARKS, withMark, type MissionNote, type MissionRun } from '@/systems/missions';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { crewPeople } from './personal';

/**
 * Someone along says something: a line for the moment from their traits (`content.voices`),
 * chosen by a hash of the seed, the day and how far the story has got, so it never draws on the
 * game's dice.
 */

/**
 * Their lines for the moment. Reacting to a tone, only the traits that care about it speak:
 * the kind one approves of kindness in a kind voice, not a proud one.
 */
function linesFor(
  ctx: GameContext,
  person: PersonDef,
  moment: VoiceMoment,
  tone?: string,
): readonly string[] {
  const caring = person.traitIds.filter((id) => {
    if (!tone) return true;
    const trait = ctx.content.traits.get(id);
    return trait ? [...trait.likes, ...trait.dislikes].some((t) => t === tone) : false;
  });
  return ctx.content.voices
    .filter((v) => v.moment === moment && caring.includes(v.trait))
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
  said: { readonly person: PersonDef; readonly moment: VoiceMoment; readonly tone?: string },
): MissionNote | null {
  const { person, moment } = said;
  const lines = linesFor(ctx, person, moment, said.tone);
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
  return speaker ? voiceOf(state, ctx, { person: speaker, moment }) : null;
}

/** Marked once the crew has said its piece after a fight, so it is said once a job. */
const SPOKE_AFTER_FIGHT = 'spoke-after-fight';

/**
 * The first quiet moment after a won fight: someone along says something about it (once a
 * job). The run with their line, or as it was.
 */
export function afterTheFight(state: GameState, ctx: GameContext, run: MissionRun): MissionRun {
  if (!run.marks.includes(END_MARKS.fought) || run.marks.includes(SPOKE_AFTER_FIGHT)) return run;
  const voice = crewVoice({ ...state, mission: run }, ctx, 'after-fight');
  const marks = withMark(run.marks, SPOKE_AFTER_FIGHT);
  return { ...run, marks, notes: voice ? [...run.notes, voice] : run.notes };
}

/** The mark a crew member carries for the rest of a job after a choice sat badly with them. */
export function stungBy(personId: string): string {
  return `stung:${personId}`;
}

import type { MissionDef } from '@/systems/missions';
import { fillSlots, hashUnit } from '@/core';
import { weekOf } from '@/systems/time';

import { boardFor, crewFor } from '../board';
import type { GameContext } from '../context';
import { chip, log } from '../ops';
import { personSlots } from '../people/pronouns';
import type { GameState } from '../state';
import { mentorOf } from './plan';
import { withRegard } from './state';

/**
 * The job your sensei picks off the board for the team each week: one of the postings at
 * home they would lead, drawn by hash for the week. Its notice says so, and doing it before the week
 * is out earns regard.
 */

export const PICK_REGARD = 4;
const PICK_DONE =
  '{name} picked that job for the team. {name.they} look{name.s} pleased it’s done.';

export function senseiPick(state: GameState, ctx: GameContext): MissionDef | null {
  const sensei = mentorOf(state, ctx);
  const week = weekOf(state.time.day);
  if (!sensei || state.mentor.pickKept === week) return null;
  const home = ctx.content.locations.require(ctx.content.startLocationId);
  const atHome = new Set(home.places.flatMap((p) => (p.kind === 'missions' ? p.missionIds : [])));
  const led = boardFor(state, ctx)
    .postings.filter((p) => atHome.has(p.missionId))
    .flatMap((p) => ctx.content.missions.get(p.missionId) ?? [])
    .filter((def) => crewFor(state, ctx, def)?.leaderId === sensei.id);
  const key = (def: MissionDef) => hashUnit(state.board.seed, week, 'pick', def.id);
  return [...led].sort((a, b) => key(a) - key(b))[0] ?? null;
}

/** As a job starts: whether it is the one your sensei picked. */
export function pickTaken(state: GameState, ctx: GameContext, def: MissionDef): GameState {
  if (senseiPick(state, ctx)?.id !== def.id) return state;
  return { ...state, mentor: { ...state.mentor, pickTaken: def.id } };
}

/** After a job is done: if it was your sensei's pick, they say so. */
export function pickDone(state: GameState, ctx: GameContext, def: MissionDef): GameState {
  const sensei = mentorOf(state, ctx);
  if (!sensei || state.mentor.pickTaken !== def.id) return state;
  const mentor = withRegard(
    { ...state.mentor, pickTaken: null, pickKept: weekOf(state.time.day) },
    PICK_REGARD,
  );
  return log(
    { ...state, mentor },
    {
      text: fillSlots(PICK_DONE, personSlots('name', sensei)),
      tone: 'success',
      chips: [chip(`${sensei.name}’s regard rises`, 'gain')],
    },
  );
}

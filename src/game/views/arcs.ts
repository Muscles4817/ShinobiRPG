import { actReached, arcJobOpen, type ActPass, type ArcDef } from '@/systems/missions';

import { availability } from '../board';
import type { GameContext } from '../context';
import type { GameState } from '../state';

/**
 * Long stories on the board: each arc under way, as the act it stands at (what is going on,
 * how it is passed, and its jobs, done or not, with any leads of the act before still open).
 * An arc shows once one of its jobs is open to you.
 */

export interface ArcView {
  readonly id: string;
  readonly title: string;
  /** "Act 2 of 4: Following the glass". */
  readonly act: string;
  readonly text: string;
  /** "Based in Port Shiomachi": where the act's jobs are posted, when not the village. */
  readonly base: string | null;
  /** How the act moves on, when not by doing every job: "Any one lead moves the story on". */
  readonly pass: string | null;
  readonly jobs: readonly { readonly title: string; readonly done: boolean }[];
}

function viewOf(state: GameState, ctx: GameContext, arc: ArcDef): ArcView | null {
  const reached = actReached(arc, state.board.completed);
  const act = arc.acts[reached];
  if (!act) return null;
  const open = act.jobs.some(
    (id) => availability(state, ctx, ctx.content.missions.require(id)).kind === 'arc',
  );
  if (!open) return null;
  return {
    id: arc.id,
    title: arc.title,
    act: `Act ${reached + 1} of ${arc.acts.length}: ${act.title}`,
    text: act.text,
    base: act.baseLocationId
      ? `Based in ${ctx.content.locations.require(act.baseLocationId).name}`
      : null,
    pass: PASS_LINES[act.pass ?? 'all'],
    jobs: [...act.jobs, ...leadsStillOpen(state, arc, reached)].map((id) => ({
      title: ctx.content.missions.require(id).title,
      done: state.board.completed.includes(id),
    })),
  };
}

const PASS_LINES: Readonly<Record<ActPass, string | null>> = {
  all: null,
  any: 'Any one of these moves the story on. The rest stay open until you take the next step.',
  one: 'Choose one road. Finishing one closes the others.',
};

/** Leads of earlier acts you may still follow before the story moves on. */
function leadsStillOpen(state: GameState, arc: ArcDef, reached: number): string[] {
  const done = state.board.completed;
  return arc.acts
    .slice(0, reached)
    .flatMap((a) => a.jobs)
    .filter((id) => arcJobOpen([arc], id, done));
}

export function arcsView(state: GameState, ctx: GameContext): ArcView[] {
  return ctx.content.arcs.all.flatMap((arc) => {
    const view = viewOf(state, ctx, arc);
    return view ? [view] : [];
  });
}

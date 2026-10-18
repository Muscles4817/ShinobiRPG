import {
  actReached,
  arcJobOpen,
  arcPlace,
  type ActPass,
  type ArcAct,
  type ArcDef,
} from '@/systems/missions';

import { availability } from '../board';
import type { GameContext } from '../context';
import type { GameState } from '../state';

/**
 * Long stories on the board: each arc under way, as the act it stands at (what is going on,
 * the rule it moves on by, and its jobs, done or not), with the leads of the act before kept
 * while any is still open, and what taking a job will close. An arc shows once one of its jobs
 * is open to you.
 */

export interface ArcJob {
  readonly id: string;
  readonly title: string;
  readonly done: boolean;
}

/** How an act moves on, when not by doing every job: an ink stamp and a sentence. */
export interface ArcRule {
  readonly stamp: string;
  readonly label: string;
  readonly text: string;
}

export interface ArcView {
  readonly id: string;
  readonly title: string;
  /** "Act 2 of 4: Following the glass". */
  readonly act: string;
  readonly text: string;
  /** "Based in Port Shiomachi": where the act's jobs are posted, when not the village. */
  readonly base: string | null;
  readonly rule: ArcRule | null;
  readonly jobs: readonly ArcJob[];
  /** Leads of the act before, done or not, while any is still open. */
  readonly leads: readonly ArcJob[];
  /** "These close once you finish The Night of the Ghost." */
  readonly leadsNote: string | null;
}

const RULES: Readonly<Record<ActPass, ArcRule | null>> = {
  all: null,
  any: {
    stamp: '手',
    label: 'Any lead will do',
    text: 'Any one of these moves the story on. The rest stay open until you take the next step.',
  },
  one: {
    stamp: '一',
    label: 'One road only',
    text: 'Choose one road. Finishing one closes the others.',
  },
};

const titleOf = (ctx: GameContext, id: string): string => ctx.content.missions.require(id).title;

/** "A", "A and B", "A, B and C". */
function listed(words: readonly string[]): string {
  if (words.length <= 1) return words[0] ?? '';
  return `${words.slice(0, -1).join(', ')} and ${words.at(-1) ?? ''}`;
}

/** "Based in the Fire Temple": a place's name mid-sentence. */
function basedIn(name: string): string {
  return `Based in ${name.replace(/^The /, 'the ')}`;
}

function jobOf(state: GameState, ctx: GameContext, id: string): ArcJob {
  return { id, title: titleOf(ctx, id), done: state.board.completed.includes(id) };
}

/** The act of leads just before the one reached, while any of its leads is still open. */
function openLeadAct(arc: ArcDef, reached: number, done: readonly string[]): ArcAct | null {
  const before = arc.acts[reached - 1];
  if (before?.pass !== 'any') return null;
  return before.jobs.some((id) => arcJobOpen([arc], id, done)) ? before : null;
}

function viewOf(state: GameState, ctx: GameContext, arc: ArcDef): ArcView | null {
  const done = state.board.completed;
  const reached = actReached(arc, done);
  const act = arc.acts[reached];
  if (!act) return null;
  const open = act.jobs.some(
    (id) => availability(state, ctx, ctx.content.missions.require(id)).kind === 'arc',
  );
  if (!open) return null;
  const leadAct = openLeadAct(arc, reached, done);
  return {
    id: arc.id,
    title: arc.title,
    act: `Act ${reached + 1} of ${arc.acts.length}: ${act.title}`,
    text: act.text,
    base: act.baseLocationId
      ? basedIn(ctx.content.locations.require(act.baseLocationId).name)
      : null,
    rule: RULES[act.pass ?? 'all'],
    jobs: act.jobs.map((id) => jobOf(state, ctx, id)),
    leads: leadAct ? leadAct.jobs.map((id) => jobOf(state, ctx, id)) : [],
    leadsNote: leadAct
      ? `These close once you finish ${listed(act.jobs.map((id) => titleOf(ctx, id)))}.`
      : null,
  };
}

export function arcsView(state: GameState, ctx: GameContext): ArcView[] {
  return ctx.content.arcs.all.flatMap((arc) => {
    const view = viewOf(state, ctx, arc);
    return view ? [view] : [];
  });
}

/**
 * What taking an arc's job will close, said on its notice where you commit to it: the other
 * roads of a fork, or the leads you haven't followed. Null when it closes nothing.
 */
export function arcNote(state: GameState, ctx: GameContext, missionId: string): string | null {
  const place = arcPlace(ctx.content.arcs.all, missionId);
  if (!place) return null;
  const { arc, act } = place;
  const done = state.board.completed;
  const here = arc.acts[act];
  if (!here || actReached(arc, done) !== act) return null;
  const notDone = (ids: readonly string[]) =>
    ids.filter((id) => id !== missionId && !done.includes(id)).map((id) => titleOf(ctx, id));
  if (here.pass === 'one') {
    const others = notDone(here.jobs);
    return others.length ? `One road only. Finishing this closes ${listed(others)}.` : null;
  }
  const leads = openLeadAct(arc, act, done);
  const left = leads ? notDone(leads.jobs) : [];
  return left.length
    ? `Finishing this closes the leads you haven’t followed: ${listed(left)}.`
    : null;
}

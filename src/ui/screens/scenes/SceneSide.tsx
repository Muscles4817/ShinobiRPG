import { missionScene, personSheet, sceneBeside, type GameContext, type GameState } from '@/game';

import { BetweenYou, Remembered, WhatTheyreLike } from '../../components/PersonSections';
import { YouSummary } from '../../layout/YouSummary';
import { JobSoFar, RouteStrip } from './JobSoFar';
import { Threads } from './StoryLines';

/**
 * The panel the desktop layout keeps beside a story scene, by what the scene is about
 * (`sceneBeside`): an encounter's job as it stands, the person you are facing (what is between
 * you, what they are like, what you share: worth having in view when you pick a reply's tone), or
 * yourself in the scenes that are about you.
 */

interface SideProps {
  readonly ctx: GameContext;
  readonly state: GameState;
}

function JobSide({ ctx, state }: SideProps) {
  const job = missionScene(state, ctx);
  return (
    <aside className="scene-side" aria-label="The job">
      {job && (
        <div className="scene-side-head">
          <span className="label">{job.kicker}</span>
          <b>{job.title}</b>
        </div>
      )}
      {job && <RouteStrip route={job.route} />}
      {job && <Threads threads={job.threads} />}
      <JobSoFar ctx={ctx} state={state} />
    </aside>
  );
}

function PersonSide({ ctx, state, personId }: SideProps & { readonly personId: string }) {
  const p = personSheet(state, ctx, personId);
  if (!p) return null;
  return (
    <aside
      className="scene-side person-side person-sheet paper-sheet"
      aria-label={`About ${p.fullName}`}
    >
      <div className="scene-side-head">
        <span className="label">{p.title}</span>
        <b>{p.fullName}</b>
      </div>
      <BetweenYou p={p} />
      <WhatTheyreLike p={p} />
      <Remembered p={p} />
    </aside>
  );
}

export function SceneSide({ ctx, state }: SideProps) {
  const beside = sceneBeside(state);
  if (!beside) return null;
  switch (beside.kind) {
    case 'job':
      return <JobSide ctx={ctx} state={state} />;
    case 'person':
      return <PersonSide ctx={ctx} state={state} personId={beside.personId} />;
    case 'you':
      return (
        <aside className="scene-side" aria-label="You">
          <YouSummary ctx={ctx} state={state} />
        </aside>
      );
  }
}

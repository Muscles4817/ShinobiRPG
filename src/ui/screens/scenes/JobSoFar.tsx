import { missionSoFar, type RouteMark } from '@/game';

import { DebriefCrewList, DebriefRoad } from '../../components/Debrief';
import type { ScreenProps } from '../types';

/**
 * A job as it stands, as the mission scene shows it and the desktop layout keeps beside a job's
 * encounters: the route's stops, who is along and the ledger so far.
 */

/** The job's route as a row of stamps: behind you, where you are, and ahead. */
export function RouteStrip({ route }: { readonly route: readonly RouteMark[] }) {
  return (
    <ol className="route" aria-label="The job so far">
      {route.map((m, i) => (
        <li
          key={i}
          className={`route-${m.state}`}
          title={m.label}
          aria-label={`${m.label}, ${m.state}`}
        >
          {m.glyph}
          <span className="route-label">{m.label}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * On the desktop layout, the job as it stands beside the story: who is along and what the
 * ledger holds so far, as the debrief will read them.
 */
export function JobSoFar({ ctx, state }: Pick<ScreenProps, 'ctx' | 'state'>) {
  const soFar = missionSoFar(state, ctx);
  if (!soFar) return null;
  return (
    <>
      <DebriefCrewList crew={soFar.crew} title="Who’s with you" />
      <DebriefRoad lines={soFar.road} title="The road so far" />
    </>
  );
}

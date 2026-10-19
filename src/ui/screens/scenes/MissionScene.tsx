import { useEffect, useRef } from 'react';

import { headerView, missionScene, missionSoFar, type RouteMark, type SceneLine } from '@/game';

import { Backdrop } from '../../art/Backdrop';
import { DebriefCrewList, DebriefRoad } from '../../components/Debrief';
import { Vitals } from '../../components/Vitals';
import { Pane } from '../../layout/Pane';
import { useWideScreen } from '../../layout/useWideScreen';
import type { ScreenProps } from '../types';
import { StoryLines, Threads } from './StoryLines';

/** The job's route as a row of stamps: behind you, where you are, and ahead. */
function RouteStrip({ route }: { readonly route: readonly RouteMark[] }) {
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

/** The story split at the last thing you chose: what came before folds away. */
function beats(lines: readonly SceneLine[]): { earlier: SceneLine[]; now: SceneLine[] } {
  const last = lines.findLastIndex((l) => l.kind === 'choice');
  return last <= 0
    ? { earlier: [], now: [...lines] }
    : { earlier: lines.slice(0, last), now: lines.slice(last) };
}

/**
 * On the desktop layout, the job as it stands beside the story: who is along and what the
 * ledger holds so far, as the debrief will read them.
 */
function SoFar({ ctx, state }: Pick<ScreenProps, 'ctx' | 'state'>) {
  const soFar = missionSoFar(state, ctx);
  if (!soFar) return null;
  return (
    <>
      <DebriefCrewList crew={soFar.crew} title="Who’s with you" />
      <DebriefRoad lines={soFar.road} title="The road so far" />
    </>
  );
}

/**
 * A job in the field: the route ahead, the threads it keeps, the latest beat of the story (the
 * rest folded away), the situation now on a card near the thumb, and your choices. On a wide
 * screen the road, the story and the job as it stands sit side by side.
 */
export function MissionScene({ ctx, state, perform }: ScreenProps) {
  const scene = missionScene(state, ctx);
  const header = headerView(state, ctx);
  const wide = useWideScreen();
  const end = useRef<HTMLDivElement>(null);
  const lineCount = scene?.lines.length ?? 0;
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [lineCount]);
  if (!scene) return null;
  const { earlier, now } = beats(scene.lines);
  return (
    <>
      <Pane name="road">
        <header
          className="scene-head vignette sky"
          data-slot={header.slot}
          data-land={header.backdrop}
        >
          <Backdrop id={header.backdrop} />
          <div className="vignette-text">
            <p className="label">{scene.kicker}</p>
            <h1>{scene.title}</h1>
          </div>
          {!wide && <RouteStrip route={scene.route} />}
          {!wide && <Vitals meters={header.meters} />}
        </header>
        {wide && <RouteStrip route={scene.route} />}
        {wide && <Vitals meters={header.meters} />}
      </Pane>
      <Pane name="job">
        <Threads threads={scene.threads} />
        {wide && <SoFar ctx={ctx} state={state} />}
      </Pane>
      <Pane name="story">
        <main className="page feed scene-feed">
          {earlier.length > 0 && (
            <details className="fold story-so-far">
              <summary>The story so far</summary>
              <StoryLines lines={earlier} />
            </details>
          )}
          <StoryLines lines={now} />
          {scene.prompt && (
            <section className="beat-card enter" aria-label="Now">
              <p className="story">{scene.prompt}</p>
            </section>
          )}
          <div ref={end} />
        </main>
        <nav className="choices" aria-label="Choices">
          {scene.choices.map((c) => (
            <button
              key={c.label}
              type="button"
              className={`choice${c.primary ? ' primary' : ''}${c.closed ? ' closed' : ''}`}
              disabled={c.closed !== undefined}
              onClick={() => {
                perform(c.action);
              }}
            >
              <b>{c.label}</b>
              {(c.closed ?? c.detail) && <small>{c.closed ?? c.detail}</small>}
            </button>
          ))}
        </nav>
      </Pane>
    </>
  );
}

import { useEffect, useRef } from 'react';

import { headerView, missionScene, type SceneLine } from '@/game';

import { Backdrop } from '../../art/Backdrop';
import { Vitals } from '../../components/Vitals';
import { Pane } from '../../layout/Pane';
import { KeyHint } from '../../layout/KeyHint';
import { useChoiceKeys } from '../../layout/useChoiceKeys';
import { useWideScreen } from '../../layout/useWideScreen';
import type { ScreenProps } from '../types';
import { JobSoFar, RouteStrip } from './JobSoFar';
import { StoryLines, Threads } from './StoryLines';

/** The story split at the last thing you chose: what came before folds away. */
function beats(lines: readonly SceneLine[]): { earlier: SceneLine[]; now: SceneLine[] } {
  const last = lines.findLastIndex((l) => l.kind === 'choice');
  return last <= 0
    ? { earlier: [], now: [...lines] }
    : { earlier: lines.slice(0, last), now: lines.slice(last) };
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
  useChoiceKeys(
    scene?.choices ?? [],
    (c) => {
      perform(c.action);
    },
    wide,
  );
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
        {wide && <JobSoFar ctx={ctx} state={state} />}
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
          {scene.choices.map((c, i) => (
            <button
              key={c.label}
              type="button"
              className={`choice${c.primary ? ' primary' : ''}${c.closed ? ' closed' : ''}`}
              disabled={c.closed !== undefined}
              aria-keyshortcuts={wide ? String(i + 1) : undefined}
              onClick={() => {
                perform(c.action);
              }}
            >
              {wide && <KeyHint index={i} />}
              <b>{c.label}</b>
              {(c.closed ?? c.detail) && <small>{c.closed ?? c.detail}</small>}
            </button>
          ))}
        </nav>
      </Pane>
    </>
  );
}

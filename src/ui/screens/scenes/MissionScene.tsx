import { useEffect, useRef } from 'react';

import { headerView, missionScene, type RouteMark, type SceneLine } from '@/game';

import { Backdrop } from '../../art/Backdrop';
import { Vitals } from '../../components/Vitals';
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
 * A job in the field: the route ahead, the threads it keeps, the latest beat of the story (the
 * rest folded away), the situation now on a card near the thumb, and your choices.
 */
export function MissionScene({ ctx, state, perform }: ScreenProps) {
  const scene = missionScene(state, ctx);
  const header = headerView(state, ctx);
  const end = useRef<HTMLDivElement>(null);
  const lineCount = scene?.lines.length ?? 0;
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [lineCount]);
  if (!scene) return null;
  const { earlier, now } = beats(scene.lines);
  return (
    <>
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
        <RouteStrip route={scene.route} />
        <Vitals meters={header.meters} />
      </header>
      <Threads threads={scene.threads} />
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
            className={c.primary ? 'choice primary' : 'choice'}
            onClick={() => {
              perform(c.action);
            }}
          >
            <b>{c.label}</b>
            {c.detail && <small>{c.detail}</small>}
          </button>
        ))}
      </nav>
    </>
  );
}

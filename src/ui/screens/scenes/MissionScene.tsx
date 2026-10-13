import { useEffect, useRef } from 'react';

import { headerView, missionScene } from '@/game';

import { Backdrop } from '../../art/Backdrop';
import { Vitals } from '../../components/Vitals';
import type { ScreenProps } from '../types';
import { StoryLines, Threads } from './StoryLines';

/** A mission plays as a story feed; the dock becomes your choices. */
export function MissionScene({ ctx, state, perform }: ScreenProps) {
  const scene = missionScene(state, ctx);
  const header = headerView(state, ctx);
  const end = useRef<HTMLDivElement>(null);
  const lineCount = scene?.lines.length ?? 0;
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [lineCount]);
  if (!scene) return null;
  return (
    <>
      <header
        className="scene-head vignette sky"
        data-slot={header.slot}
        data-land={header.backdrop}
      >
        <Backdrop id={header.backdrop} />
        <div className="vignette-text">
          <p className="label">
            {scene.rank}-rank mission for {scene.client}
          </p>
          <h1>{scene.title}</h1>
        </div>
        <Vitals meters={header.meters} />
      </header>
      <Threads threads={scene.threads} />
      <main className="page feed scene-feed">
        <StoryLines lines={scene.lines} />
        {scene.prompt && <p className="story prompt enter">{scene.prompt}</p>}
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

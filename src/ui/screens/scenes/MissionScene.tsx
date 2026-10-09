import { useEffect, useRef } from 'react';

import { headerView, missionScene } from '@/game';

import { Vitals } from '../../components/Vitals';
import type { ScreenProps } from '../types';

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
      <header className="scene-head">
        <p className="label">
          Mission · {scene.rank}-rank · {scene.client}
        </p>
        <h1>{scene.title}</h1>
        <Vitals meters={header.meters} />
      </header>
      <main className="page feed">
        {scene.lines.map((line, i) =>
          line.kind === 'roll' ? (
            <p key={i} className={`roll ${line.success ? 'pass' : 'fail'}`}>
              <i aria-hidden="true">{line.success ? '✓' : '✗'}</i>
              {line.text}
            </p>
          ) : line.kind === 'choice' ? (
            <p key={i} className="you">
              {line.text}
            </p>
          ) : (
            <p key={i} className={line.kind === 'outcome' ? 'story outcome' : 'story'}>
              {line.text}
            </p>
          ),
        )}
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

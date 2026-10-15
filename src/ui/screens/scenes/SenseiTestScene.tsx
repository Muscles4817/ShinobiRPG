import { senseiTestScene } from '@/game';

import type { ScreenProps } from '../types';

/** The first meeting with your sensei: their test, round by round, then one question. */
export function SenseiTestScene({ ctx, state, perform }: ScreenProps) {
  const scene = senseiTestScene(state, ctx);
  if (!scene) return null;
  return (
    <>
      <header className="scene-head">
        <h1>{scene.heading}</h1>
      </header>
      <main className="page feed">
        {scene.lines.map((line) => (
          <p key={line} className="story enter">
            {line}
          </p>
        ))}
      </main>
      <nav className="choices" aria-label="Choices">
        {scene.choices.map((c) => (
          <button
            key={c.label}
            type="button"
            className="choice"
            onClick={() => {
              perform(c.action);
            }}
          >
            <b>{c.label}</b>
          </button>
        ))}
      </nav>
    </>
  );
}

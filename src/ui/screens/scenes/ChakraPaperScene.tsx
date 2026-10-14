import { chakraPaperScene } from '@/game';

import type { ScreenProps } from '../types';

/** Your sensei holds out a slip of chakra paper; what it does is your nature. */
export function ChakraPaperScene({ ctx, state, perform }: ScreenProps) {
  const scene = chakraPaperScene(state, ctx);
  if (!scene) return null;
  return (
    <>
      <header className="scene-head">
        <h1>{scene.heading}</h1>
      </header>
      <main className="page feed chakra-paper">
        <p className="story enter">{scene.speech}</p>
        <div className="paper-slip enter" aria-hidden="true" />
      </main>
      <nav className="choices" aria-label="Choices">
        <button
          type="button"
          className="choice primary"
          onClick={() => {
            perform(scene.test);
          }}
        >
          <b>{scene.prompt}</b>
        </button>
      </nav>
    </>
  );
}

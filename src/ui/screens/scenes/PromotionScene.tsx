import { promotionScene } from '@/game';

import type { ScreenProps } from '../types';

/**
 * A promotion: the ceremony in the setting's words, your new title in ink, what you are handed,
 * and everything the new rank opens. A jōnin's nomination is the same scene, smaller.
 */
export function PromotionScene({ ctx, state, perform }: ScreenProps) {
  const scene = promotionScene(state, ctx);
  if (!scene) return null;
  return (
    <>
      <header className="scene-head">
        <h1>{scene.heading}</h1>
      </header>
      <main className={`page feed promotion ${scene.scale}`}>
        <p className="story enter">{scene.speech}</p>
        <div className="promotion-title enter" aria-label="Your new title">
          <span className="promotion-seal" aria-hidden="true">
            昇
          </span>
          <b>{scene.title}</b>
        </div>
        <p className="story">{scene.gift}</p>
        {scene.gear && (
          <p className="chips">
            <span className="chip gain">{scene.gear}</span>
          </p>
        )}
        {scene.unlocks.length > 0 && (
          <section className="promotion-opens" aria-label="What this opens">
            <h2>What this opens</h2>
            {scene.unlocks.map((u) => (
              <div key={u.heading}>
                <h3>{u.heading}</h3>
                <ul>
                  {u.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}
      </main>
      <nav className="choices" aria-label="Choices">
        <button
          type="button"
          className="choice primary"
          onClick={() => {
            perform(scene.accept);
          }}
        >
          <b>Accept the rank of {scene.rank}</b>
        </button>
      </nav>
    </>
  );
}

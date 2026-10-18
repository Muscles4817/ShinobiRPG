import { promotionScene } from '@/game';

import type { ScreenProps } from '../types';

/**
 * A promotion: the ceremony in the setting's words, your new title in ink, what you are handed,
 * and everything the new rank opens. A jōnin's nomination is the same scene, with your record
 * read back to you.
 */
export function PromotionScene({ ctx, state, perform }: ScreenProps) {
  const scene = promotionScene(state, ctx);
  if (!scene) return null;
  return (
    <>
      <header className="scene-head">
        <h1>{scene.heading}</h1>
      </header>
      <main className="page feed promotion">
        <p className="story enter">{scene.speech}</p>
        {scene.record.length > 0 && (
          <p className="chips" aria-label="Your record">
            {scene.record.map((line) => (
              <span key={line} className="chip gain">
                {line}
              </span>
            ))}
          </p>
        )}
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
        {scene.farewell && <p className="story">{scene.farewell}</p>}
        {scene.unlocks.length > 0 && (
          <section className="promotion-opens" aria-label="What this opens">
            <h2>{scene.means}</h2>
            {scene.unlocks.map((u) => (
              <p key={u.kind}>{u.text}</p>
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

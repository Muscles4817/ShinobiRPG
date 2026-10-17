import { rivalScene } from '@/game';

import { Portrait } from '../../art/Portrait';
import type { ScreenProps } from '../types';

/**
 * A moment with your rival that waits for your answer: meeting them, the words after a contest,
 * or something they did to needle you. Each answer says who on your team would like it.
 */
export function RivalScene({ ctx, state, perform }: ScreenProps) {
  const scene = rivalScene(state, ctx);
  if (!scene) return null;
  const { person } = scene;
  return (
    <>
      <header className="scene-head talk-head">
        <span className="person-photo rival">
          <Portrait appearance={person.appearance} size={56} />
        </span>
        <div>
          <p className="label">{scene.kicker}</p>
          <h1>{scene.title}</h1>
          <span className="rival-mark">競 Your rival</span>
        </div>
      </header>
      <main className="page feed">
        {scene.lines.map((line) => (
          <p key={line} className="story enter">
            {line}
          </p>
        ))}
      </main>
      <nav className="choices" aria-label="Replies">
        {scene.choices.map((c) => (
          <button
            key={c.label}
            type="button"
            className="choice"
            onClick={() => {
              perform(c.action);
            }}
          >
            <span className="rival-reply">
              <b>{c.label}</b>
              {c.heard && <small className="rival-heard">{c.heard}</small>}
            </span>
            <small>{c.tone}</small>
          </button>
        ))}
      </nav>
    </>
  );
}

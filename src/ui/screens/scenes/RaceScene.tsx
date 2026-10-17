import { raceView } from '@/game';

import { Portrait } from '../../art/Portrait';
import type { ScreenProps } from '../types';

/** A race with your rival, leg by leg: the course, how it's gone, what you read, your move. */
export function RaceScene({ ctx, state, perform }: ScreenProps) {
  const view = raceView(state, ctx);
  if (!view) return null;
  const { person } = view;
  return (
    <>
      <header className="scene-head talk-head">
        <span className="person-photo rival">
          <Portrait appearance={person.appearance} size={56} />
        </span>
        <div>
          <p className="label">{view.leg}</p>
          <h1>{view.name}</h1>
          <span className="rival-mark">競 A race with {person.name}</span>
          {view.purse && <span className="chip cost race-purse">{view.purse}</span>}
        </div>
      </header>
      <main className="page feed">
        {view.told.map((line) => (
          <p key={line} className="story race-told">
            {line}
          </p>
        ))}
        <p className="story enter">{view.course}</p>
        <p className="race-asks">{view.asks}</p>
        <section className="race-read" aria-label="What you read">
          {view.read.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </section>
      </main>
      <nav className="choices" aria-label="Your move">
        {view.moves.map((m) => (
          <button
            key={m.label}
            type="button"
            className="choice"
            onClick={() => {
              perform(m.action);
            }}
          >
            <b>{m.label}</b>
            <small>{m.note}</small>
          </button>
        ))}
      </nav>
    </>
  );
}

import { missionView } from '@/game';

import type { TabProps } from './types';

export function MissionPanel({ ctx, state, session }: TabProps) {
  const view = missionView(state, ctx);
  if (!view) return null;
  return (
    <section className="mission">
      <h2>{view.title}</h2>
      <p className="muted">Client: {view.client}</p>
      <ol className="story">
        {view.notes.map((note, i) => (
          <li key={i}>{note}</li>
        ))}
      </ol>
      <p className="prompt">{view.prompt}</p>
      <div className="choices">
        {view.choices.map((c) => (
          <button
            key={c.label}
            type="button"
            className="choice-button"
            onClick={() => {
              session.perform(c.action);
            }}
          >
            <strong>{c.label}</strong>
            {c.detail && <span className="muted">{c.detail}</span>}
          </button>
        ))}
      </div>
    </section>
  );
}

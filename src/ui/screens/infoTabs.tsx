import { characterView, journalView } from '@/game';

import type { TabProps } from './types';

export function ProfileTab({ ctx, state, session }: TabProps) {
  const view = characterView(state, ctx);
  return (
    <>
      <h2>{view.name}</h2>
      <p className="muted">
        {view.rank} of {view.village}
      </p>
      <dl className="facts">
        <dt>Gift</dt>
        <dd>{view.aptitude}</dd>
        <dt>Reputation</dt>
        <dd>{view.reputation}</dd>
        <dt>Missions</dt>
        <dd>
          {view.missionsCompleted} completed · {view.missionsFailed} failed
        </dd>
      </dl>
      {view.statGroups.map((g) => (
        <section key={g.group} className="card">
          <h3>{g.group}</h3>
          <dl className="facts">
            {g.stats.map((s) => (
              <div key={s.label} className="fact-row">
                <dt>{s.label}</dt>
                <dd>{s.value.toFixed(1)}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      <button
        type="button"
        className="danger"
        onClick={() => {
          if (window.confirm('Abandon this shinobi and start over? This cannot be undone.')) {
            session.abandon();
          }
        }}
      >
        Start a new life
      </button>
    </>
  );
}

export function JournalTab({ state }: TabProps) {
  return (
    <>
      <h2>Journal</h2>
      <ol className="journal">
        {journalView(state).map((e) => (
          <li key={e.id} className={`tone-${e.tone}`}>
            <span className="muted">Day {e.day}</span> {e.text}
          </li>
        ))}
      </ol>
    </>
  );
}

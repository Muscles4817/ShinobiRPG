import { useState } from 'react';

import { headerView, shinobiView } from '@/game';

import { Portrait } from '../art/Portrait';
import { FightStylePicker } from './FightStylePicker';
import type { ScreenProps } from './types';

const GROUP_TITLES = { discipline: 'Disciplines', body: 'Body', mind: 'Mind' } as const;

/** Asks twice before throwing a life away. */
function AbandonButton({ onAbandon }: { readonly onAbandon: () => void }) {
  const [armed, setArmed] = useState(false);
  return armed ? (
    <div className="row-buttons">
      <button type="button" className="btn danger" onClick={onAbandon}>
        Yes, start over
      </button>
      <button
        type="button"
        className="btn ghost"
        onClick={() => {
          setArmed(false);
        }}
      >
        Keep playing
      </button>
    </div>
  ) : (
    <button
      type="button"
      className="btn ghost danger-outline"
      onClick={() => {
        setArmed(true);
      }}
    >
      Start a new life
    </button>
  );
}

/** Your shinobi registration card, your identity, and your stats. */
export function ShinobiScreen({
  ctx,
  state,
  perform,
  onAbandon,
}: ScreenProps & { readonly onAbandon: () => void }) {
  const view = shinobiView(state, ctx);
  const header = headerView(state, ctx);
  const [disciplines, ...rest] = view.groups;
  return (
    <main className="page">
      <section className="idcard">
        <span className="stamp" aria-hidden="true">
          忍
        </span>
        <span className="photo">
          <Portrait appearance={view.appearance} size={70} />
        </span>
        <h1 className="id-name">{[view.name, view.familyName].filter(Boolean).join(' ')}</h1>
        <dl className="id-kv">
          <dt>Rank</dt>
          <dd>{view.rank}</dd>
          <dt>Village</dt>
          <dd>{view.village}</dd>
          <dt>Clan</dt>
          <dd>{view.clan}</dd>
          <dt>Nature</dt>
          <dd>{view.nature}</dd>
          <dt>Missions</dt>
          <dd>
            {view.missionsCompleted} done · {view.missionsFailed} failed
          </dd>
        </dl>
        <p className="id-no">
          Shinobi registry · No. {view.registryNo} · {view.pronouns} · issued {view.issued}
        </p>
      </section>
      <section className="identity">
        {view.kekkeiGenkai && (
          <p>
            <span className="label">Bloodline</span> {view.kekkeiGenkai.name}
            {view.kekkeiGenkai.dormant ? ' · dormant' : ' · active'}
          </p>
        )}
        {view.traits.length > 0 && (
          <p>
            <span className="label">Traits</span> {view.traits.join(', ')}
          </p>
        )}
        {view.talent && (
          <p>
            <span className="label">Talent</span> {view.talent}
          </p>
        )}
        {view.nindo && (
          <p>
            <span className="label">Dream</span> {view.nindo}
          </p>
        )}
        <p className="grades-line num">
          <span className="label">Grades</span>{' '}
          {view.grades.map((g) => (
            <span key={g.discipline} className={`grade-chip d-${g.discipline}`}>
              {g.label.slice(0, 3)} {g.grade}
            </span>
          ))}
        </p>
      </section>
      <section className="overall" aria-label="Fighting level">
        <span className="label">Fighting level</span>
        <b>{view.overall.label}</b>
        <span className="chip num">{view.overall.power}</span>
        {view.overall.next && (
          <small className="muted">
            {view.overall.next.label} at <span className="num">{view.overall.next.at}</span>
          </small>
        )}
      </section>
      {disciplines && (
        <section className="disc-tiles">
          {disciplines.stats.map((s) => (
            <div key={s.label} className={`disc d-${s.label.toLowerCase().replace('ū', 'uu')}`}>
              <small>{s.label}</small>
              <b className="num">{s.value.toFixed(1)}</b>
              <small>{s.growth > 0 ? `+${s.growth}` : '—'}</small>
              <small className="tier">{s.tier}</small>
            </div>
          ))}
        </section>
      )}
      <section className="stat-cols">
        {rest.map((g) => (
          <div key={g.group}>
            <h2 className="label">{GROUP_TITLES[g.group]}</h2>
            {g.stats.map((s) => (
              <div key={s.label} className="stat-row num">
                <span>{s.label}</span>
                <span>{s.value.toFixed(1)}</span>
                <span className="growth">{s.growth > 0 ? `+${s.growth}` : ''}</span>
                <small className="tier">{s.tier}</small>
              </div>
            ))}
          </div>
        ))}
      </section>
      <FightStylePicker ctx={ctx} state={state} perform={perform} />
      <p className="muted small">
        {header.date} · {header.location}
      </p>
      <AbandonButton onAbandon={onAbandon} />
    </main>
  );
}

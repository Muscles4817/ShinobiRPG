import { useState } from 'react';

import { headerView, shinobiView } from '@/game';

import { Portrait } from '../art/Portrait';
import { FightStylePicker } from './FightStylePicker';
import { StatSheet } from './StatSheet';
import type { ScreenProps } from './types';

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
        <p className="grades-line">
          <span className="label">Academy report</span>{' '}
          {view.grades.map((g) => (
            <span key={g.discipline} className={`grade-chip d-${g.discipline}`}>
              {g.label.slice(0, 3)} · {g.mark}
            </span>
          ))}
        </p>
      </section>
      <StatSheet view={view} />
      <FightStylePicker ctx={ctx} state={state} perform={perform} />
      <p className="muted small">
        {header.date} · {header.location}
      </p>
      <AbandonButton onAbandon={onAbandon} />
    </main>
  );
}

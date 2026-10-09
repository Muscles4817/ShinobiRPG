import { useState } from 'react';

import { headerView, jutsuDeck, shinobiView, type Discipline, type JutsuCard } from '@/game';

import { TechniqueCard } from '../components/TechniqueCard';
import type { ScreenProps } from './types';

function cardDetail(card: JutsuCard): string {
  if (card.status === 'studying') return `Studying · ${card.progressPct}%`;
  if (card.status === 'unknown') return 'Not learned';
  const effect =
    card.effect === 'damage' ? `power ${card.power}` : card.effect === 'stun' ? 'dazes' : 'heals';
  return `${card.chakraCost} chakra · ${effect}`;
}

/** Your techniques as a deck of the same cards you play in fights. */
export function JutsuScreen({ ctx, state }: ScreenProps) {
  const deck = jutsuDeck(state, ctx);
  const [filter, setFilter] = useState<Discipline | 'all'>('all');
  const [selectedId, setSelectedId] = useState(deck[0]?.id);
  const shown = deck.filter((c) => filter === 'all' || c.discipline === filter);
  const selected = deck.find((c) => c.id === selectedId);
  const known = deck.filter((c) => c.status === 'known').length;
  return (
    <>
      <header className="plain-head">
        <h1>Jutsu</h1>
        <p className="label">
          {known} known · {deck.length - known} to discover
        </p>
      </header>
      <main className="page">
        <div className="filters" role="group" aria-label="Filter techniques">
          {(['all', 'taijutsu', 'ninjutsu', 'genjutsu'] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={`filter d-${f}${f === filter ? ' on' : ''}`}
              onClick={() => {
                setFilter(f);
              }}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
        <div className="deck">
          {shown.map((c) => (
            <button
              key={c.id}
              type="button"
              className={c.id === selectedId ? 'deck-slot on' : 'deck-slot'}
              onClick={() => {
                setSelectedId(c.id);
              }}
            >
              <TechniqueCard
                name={c.status === 'unknown' ? '?' : c.name}
                detail={cardDetail(c)}
                discipline={c.discipline}
                ghost={c.status !== 'known'}
              />
            </button>
          ))}
        </div>
        {selected && (
          <section className="detail-card">
            <b>
              {selected.status === 'unknown' ? 'Undiscovered technique' : selected.name}{' '}
              <span className={`badge d-${selected.discipline}`}>{selected.discipline}</span>
              {selected.element && <span className="chip"> {selected.element}</span>}
            </b>
            {selected.status !== 'unknown' && <p className="story">{selected.description}</p>}
            <p className="muted small">{cardDetail(selected)}</p>
          </section>
        )}
      </main>
    </>
  );
}

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

/** Your shinobi registration card and stats. */
export function ShinobiScreen({
  ctx,
  state,
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
        <span className="photo" aria-hidden="true">
          <svg viewBox="0 0 70 86" width="70" height="86">
            <circle cx="35" cy="34" r="15" fill="#8a7650" />
            <path d="M8 86c2-20 14-28 27-28s25 8 27 28z" fill="#8a7650" />
            <rect x="18" y="24" width="34" height="7" rx="2" fill="#5a6fa8" />
          </svg>
        </span>
        <h1 className="id-name">{view.name}</h1>
        <dl className="id-kv">
          <dt>Rank</dt>
          <dd>{view.rank}</dd>
          <dt>Village</dt>
          <dd>{view.village}</dd>
          <dt>Gift</dt>
          <dd>{view.gift}</dd>
          <dt>Missions</dt>
          <dd>
            {view.missionsCompleted} done · {view.missionsFailed} failed
          </dd>
          <dt>Reputation</dt>
          <dd>{view.reputation}</dd>
        </dl>
        <p className="id-no">
          Shinobi registry · No. {view.registryNo} · issued {view.issued}
        </p>
      </section>
      {disciplines && (
        <section className="disc-tiles">
          {disciplines.stats.map((s) => (
            <div key={s.label} className={`disc d-${s.label.toLowerCase()}`}>
              <small>{s.label}</small>
              <b className="num">{s.value.toFixed(1)}</b>
              <small>{s.growth > 0 ? `+${s.growth} since graduation` : '—'}</small>
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
              </div>
            ))}
          </div>
        ))}
      </section>
      <p className="muted small">
        {header.date} · {header.location}
      </p>
      <AbandonButton onAbandon={onAbandon} />
    </main>
  );
}

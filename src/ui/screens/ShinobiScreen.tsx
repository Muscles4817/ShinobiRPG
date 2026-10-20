import { ContractCard } from '../components/ContractCard';
import { HiveCard } from '../components/HiveCard';
import { RiteCards } from '../components/RiteCard';
import { useState } from 'react';

import { headerView, shinobiView } from '@/game';

import { Portrait } from '../art/Portrait';
import { ConditionPanel } from './Condition';
import { Cookbook } from './Cookbook';
import { FightStylePicker } from './FightStylePicker';
import { StatSheet } from './StatSheet';
import { Pane } from '../layout/Pane';
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
  onMenu,
  onSettings,
}: ScreenProps & {
  readonly onAbandon: () => void;
  readonly onMenu: () => void;
  readonly onSettings: () => void;
}) {
  const view = shinobiView(state, ctx);
  const header = headerView(state, ctx);
  return (
    <main className="page">
      <Pane name="who">
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
              {view.missionsCompleted} done, {view.missionsFailed} failed
            </dd>
          </dl>
          <p className="id-no">
            Registry no. {view.registryNo}, issued {view.issued}. Pronouns: {view.pronouns}.
          </p>
        </section>
        <HiveCard ctx={ctx} state={state} perform={perform} />
        <RiteCards ctx={ctx} state={state} perform={perform} />
        <ContractCard ctx={ctx} state={state} perform={perform} />
        <section className="identity">
          {view.kekkeiGenkai && (
            <p>
              <span className="label">Bloodline</span> {view.kekkeiGenkai.name}
              {view.kekkeiGenkai.dormant ? ' (dormant)' : ' (active)'}
            </p>
          )}
          {view.traits.length > 0 && (
            <p>
              <span className="label">Traits</span> {view.traits.join(', ')}
            </p>
          )}
          <p>
            <span className="label">Class standing</span> {view.standing}
          </p>
          {view.upbringing && (
            <p>
              <span className="label">Raised</span> {view.upbringing}
            </p>
          )}
          {view.build && (
            <p>
              <span className="label">Build</span> {view.build}
            </p>
          )}
          {view.weapons && (
            <p>
              <span className="label">Weapons</span> {view.weapons}
            </p>
          )}
          {view.notes && (
            <p>
              <span className="label">Notes</span> {view.notes}
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
                <b>{g.label.slice(0, 3)}</b> {g.mark}
              </span>
            ))}
          </p>
        </section>
        <ConditionPanel condition={view.condition} />
      </Pane>
      <Pane name="arts">
        <StatSheet view={view} />
      </Pane>
      <Cookbook ctx={ctx} state={state} />
      <FightStylePicker ctx={ctx} state={state} perform={perform} />
      <button type="button" className="menu-option" onClick={onSettings}>
        <span className="menu-glyph" aria-hidden="true">
          設
        </span>
        <span className="menu-words">
          <b>Settings</b>
          <small>Sound and music, animations, and how the map is inked.</small>
        </span>
      </button>
      <p className="muted small">
        {header.location}, {header.date}
      </p>
      <button type="button" className="btn ghost wide" onClick={onMenu}>
        Main menu
      </button>
      <AbandonButton onAbandon={onAbandon} />
    </main>
  );
}

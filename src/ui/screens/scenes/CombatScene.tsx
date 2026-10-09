import { combatScene, type CombatOption, type Discipline } from '@/game';

import { TechniqueCard } from '../../components/TechniqueCard';
import type { ScreenProps } from '../types';

function cardDiscipline(o: CombatOption): Discipline | 'basic' {
  return o.kind === 'technique' && o.discipline ? o.discipline : 'basic';
}

/** Enemy above, the exchange in the middle, your hand of technique cards below. */
export function CombatScene({ ctx, state, perform }: ScreenProps) {
  const view = combatScene(state, ctx);
  if (!view) return null;
  const enemies = view.combatants.filter((c) => c.side === 'enemy');
  const [player, ...allies] = view.combatants.filter((c) => c.side === 'player');
  const hand = view.options.filter((o) => o.kind !== 'escape');
  const escape = view.options.find((o) => o.kind === 'escape');
  const act = (id: string) => {
    perform({ type: 'combatAct', optionId: id });
  };

  return (
    <>
      <header className="foes">
        {enemies.map((e) => (
          <div key={e.id} className={e.health > 0 ? 'foe' : 'foe down'}>
            <div className="foe-name">
              {e.tag && <span className="badge d-spirit">{e.tag}</span>}
              <b>{e.name}</b>
              {e.statuses.map((s) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))}
            </div>
            <span className="hp">
              <i style={{ width: `${(e.health / e.maxHealth) * 100}%` }} />
            </span>
            <span className="foe-foot num">
              <span>
                {e.health} / {e.maxHealth}
              </span>
              <span>Round {view.round}</span>
            </span>
          </div>
        ))}
      </header>
      <main className="page feed combat-log" aria-live="polite">
        {view.log.slice(-6).map((line, i) => (
          <p key={`${view.round}-${i}`} className={line.startsWith('—') ? 'divider' : 'story'}>
            {line}
          </p>
        ))}
      </main>
      {allies.length > 0 && (
        <section className="allies" aria-label="Your team">
          {allies.map((a) => (
            <div key={a.id} className={a.health > 0 ? 'ally' : 'ally down'}>
              <b>{a.name}</b>
              <span className="hp mine">
                <i style={{ width: `${(a.health / a.maxHealth) * 100}%` }} />
              </span>
              <small>{a.statuses.join(' · ') || a.tag}</small>
            </div>
          ))}
        </section>
      )}
      {player && (
        <div className="me">
          <b>{player.name}</b>
          <span className="hp mine">
            <i style={{ width: `${(player.health / player.maxHealth) * 100}%` }} />
          </span>
          <span className="num">
            {player.health}/{player.maxHealth}
          </span>
          <span>Chakra</span>
          <span className="hp chakra">
            <i style={{ width: `${(player.chakra / player.maxChakra) * 100}%` }} />
          </span>
          <span className="num">
            {player.chakra}/{player.maxChakra}
          </span>
        </div>
      )}
      <nav className="hand" aria-label="Your techniques">
        {hand.map((o) => (
          <button
            key={o.id}
            type="button"
            className="hand-slot"
            disabled={o.disabledReason !== undefined}
            title={o.disabledReason}
            onClick={() => {
              act(o.id);
            }}
          >
            <TechniqueCard
              name={o.label}
              detail={o.disabledReason ?? o.detail}
              discipline={cardDiscipline(o)}
            />
          </button>
        ))}
      </nav>
      {escape && (
        <button
          type="button"
          className="flee"
          disabled={escape.disabledReason !== undefined}
          onClick={() => {
            act(escape.id);
          }}
        >
          {escape.disabledReason ?? 'Try to flee'}
        </button>
      )}
    </>
  );
}

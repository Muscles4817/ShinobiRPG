import { combatView } from '@/game';

import { MeterBar } from '../components/MeterBar';
import type { TabProps } from './types';

/** Renders the engine-agnostic CombatView — works unchanged with any combat engine. */
export function CombatPanel({ ctx, state, session }: TabProps) {
  const view = combatView(state, ctx);
  if (!view) return null;
  return (
    <section className="combat">
      <h2>Combat · Round {view.round}</h2>
      <div className="combatants">
        {view.combatants.map((c) => (
          <div key={c.id} className={`combatant side-${c.side}`}>
            <strong>{c.name}</strong>
            {c.statuses.length > 0 && <span className="muted"> ({c.statuses.join(', ')})</span>}
            <MeterBar
              meter={{ label: 'Health', value: c.health, max: c.maxHealth }}
              variant="health"
            />
            {c.maxChakra > 0 && (
              <MeterBar
                meter={{ label: 'Chakra', value: c.chakra, max: c.maxChakra }}
                variant="chakra"
              />
            )}
          </div>
        ))}
      </div>
      <ol className="combat-log">
        {view.log.slice(-8).map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ol>
      <div className="choices">
        {view.options.map((o) => (
          <button
            key={o.id}
            type="button"
            className="choice-button"
            disabled={o.disabledReason !== undefined}
            title={o.disabledReason}
            onClick={() => {
              session.perform({ type: 'combatAct', optionId: o.id });
            }}
          >
            <strong>{o.label}</strong>
            <span className="muted">{o.disabledReason ?? o.detail}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

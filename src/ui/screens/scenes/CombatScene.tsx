import { useState } from 'react';

import { combatScene, combatScouting, type CombatOption } from '@/game';

import type { ScreenProps } from '../types';
import { ActionBar, Hand, PlanPicker } from './combat/Choices';
import { Foes } from './combat/Foes';
import { Pouch } from './combat/Pouch';
import { RangeStrip } from './combat/RangeStrip';

/**
 * One screen for every fight style: enemies above (tap one to target it), the exchange in the
 * middle, your side and resources below, and the engine's options laid out by kind.
 */
export function CombatScene({ ctx, state, perform }: ScreenProps) {
  const view = combatScene(state, ctx);
  const [chosen, setChosen] = useState<string | null>(null);
  if (!view) return null;
  const enemies = view.combatants.filter((c) => c.side === 'enemy');
  const living = enemies.filter((e) => e.health > 0 && e.targetable !== false);
  const targetId = living.find((e) => e.id === chosen)?.id ?? living[0]?.id ?? null;
  const [player, ...allies] = view.combatants.filter((c) => c.side === 'player');
  const of = (...kinds: CombatOption['kind'][]) =>
    view.options.filter((o) => kinds.includes(o.kind));
  const escape = view.options.find((o) => o.kind === 'escape');
  const pick = (o: CombatOption) => {
    perform({
      type: 'combatAct',
      optionId: o.id,
      ...(o.targeted && targetId ? { targetId } : {}),
    });
  };

  return (
    <>
      <Foes
        foes={enemies}
        round={view.round}
        targetId={targetId}
        onTarget={living.length > 1 ? setChosen : null}
        reads={combatScouting(state, ctx)}
      />
      {view.range && <RangeStrip range={view.range} />}
      <main className="page feed combat-log" aria-live="polite">
        {view.log.slice(-6).map((line, i) => (
          <p key={`${view.round}-${i}`} className={line.startsWith('—') ? 'divider' : 'story'}>
            {line}
          </p>
        ))}
      </main>
      {view.prompt && <p className="combat-prompt">{view.prompt}</p>}
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
          {view.meters?.map((m) => (
            <span key={m.id} className="meter-chip num">
              {m.label} {m.value}/{m.max}
            </span>
          ))}
          {player.statuses.length > 0 && (
            <span className="meter-chip">{player.statuses.join(' · ')}</span>
          )}
        </div>
      )}
      <div className="combat-controls">
        <PlanPicker options={of('plan')} onPick={pick} />
        <Hand options={of('basic', 'technique')} onPick={pick} />
        <Pouch options={of('item')} onPick={pick} />
        <ActionBar options={of('move', 'continue', 'end')} onPick={pick} />
        {escape && (
          <button
            type="button"
            className="flee"
            disabled={escape.disabledReason !== undefined}
            onClick={() => {
              pick(escape);
            }}
          >
            {escape.disabledReason ?? 'Try to flee'}
          </button>
        )}
      </div>
    </>
  );
}

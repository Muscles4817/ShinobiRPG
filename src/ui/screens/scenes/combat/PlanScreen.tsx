import { useState } from 'react';

import { combatLog, type CombatOption, type CombatView, type ScoutingRead } from '@/game';

import { Chips } from '../../../components/Chips';

import { FighterRead, FoeMoves } from './FighterRead';
import { Formation } from './Formation';
import { PlansByOwner, TeamOrders } from './TeamOrders';
import { useHealthPulses } from './useHealthPulses';

type Pick = (option: CombatOption) => void;

interface PlanScreenProps {
  readonly view: CombatView;
  readonly reads: Readonly<Record<string, ScoutingRead>>;
  readonly onPick: Pick;
}

/** Your chakra and any meters the engine keeps, beside the formation (cards spend chakra). */
function Reserves({ view }: { readonly view: CombatView }) {
  const you = view.combatants.find((c) => c.side === 'player');
  if (!you) return null;
  return (
    <div className="plan-reserves">
      <span>Chakra</span>
      <span className="hp chakra">
        <i style={{ width: `${(you.chakra / you.maxChakra) * 100}%` }} />
      </span>
      <span className="num">
        {you.chakra}/{you.maxChakra}
      </span>
    </div>
  );
}

/** How many lines of the story so far the plan screen keeps in view. */
const RECENT_LINES = 5;

/** How the fight has gone so far: the opening, or the round just played. */
function HowItWent({ view }: { readonly view: CombatView }) {
  const lines = combatLog(view.log.slice(-RECENT_LINES));
  if (lines.length === 0) return null;
  return (
    <details className="how-it-went" open>
      <summary>{view.round > 1 ? 'How the last round went' : 'How it starts'}</summary>
      {lines.map((line, i) =>
        line.kind === 'round' ? (
          <p key={i} className="divider">
            {line.text}
          </p>
        ) : (
          <p key={i} className="story log-line">
            {line.text} <Chips chips={line.chips} />
          </p>
        ),
      )}
    </details>
  );
}

/** Your team's orders and, once they trust you, their cards: folded away until wanted. */
function TeamPanel({ view, onPick }: { readonly view: CombatView; readonly onPick: Pick }) {
  const orders = view.options.filter((o) => o.kind === 'order');
  if (orders.length === 0) return null;
  return (
    <details className="team-panel">
      <summary>Your team</summary>
      <TeamOrders options={orders} onPick={onPick} />
    </details>
  );
}

/**
 * The card table between rounds: both sides as they stand, what the foes are about to do, and
 * your cards for each distance, opened at the one you are fighting at. Nothing here plays
 * until you begin.
 */
export function PlanScreen({ view, reads, onPick }: PlanScreenProps) {
  const foes = view.combatants.filter((c) => c.side === 'enemy');
  const [selected, setSelected] = useState<string | null>(null);
  const pulses = useHealthPulses(view.combatants);
  const shown =
    view.combatants.find((c) => c.id === selected) ?? foes.find((f) => f.health > 0) ?? foes[0];
  const names = Object.fromEntries(view.combatants.map((c) => [c.id, c.name]));
  const plans = view.options.filter((o) => o.kind === 'plan');
  const begin = view.options.find((o) => o.kind === 'continue');
  const flee = view.options.find((o) => o.kind === 'escape');
  return (
    <>
      <header className="scene-head plan-head">
        <h1>Plan round {view.round}</h1>
        {view.prompt && <p className="muted small">{view.prompt}</p>}
      </header>
      <main className="page plan-screen">
        <Formation
          fighters={view.combatants}
          range={view.range}
          reads={reads}
          pulses={pulses}
          selected={shown?.id ?? null}
          onSelect={setSelected}
        />
        <Reserves view={view} />
        <FighterRead fighter={shown} read={shown ? reads[shown.id] : undefined} />
        <HowItWent view={view} />
        <FoeMoves foes={foes} />
        <section className="your-cards" aria-label="Your cards">
          <h3 className="plan-heading">Your cards</h3>
          <PlansByOwner options={plans} names={names} here={view.range} onPick={onPick} />
        </section>
        <TeamPanel view={view} onPick={onPick} />
      </main>
      <nav className="choices plan-go" aria-label="Begin">
        {flee && (
          <button
            type="button"
            className="choice"
            disabled={flee.disabledReason !== undefined}
            title={flee.disabledReason}
            onClick={() => {
              onPick(flee);
            }}
          >
            Try to flee
            {flee.disabledReason && <small>{flee.disabledReason}</small>}
          </button>
        )}
        {begin && (
          <button
            type="button"
            className="choice primary"
            disabled={begin.disabledReason !== undefined}
            onClick={() => {
              onPick(begin);
            }}
          >
            {begin.label}
          </button>
        )}
      </nav>
    </>
  );
}

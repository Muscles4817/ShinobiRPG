import { Fragment, useState } from 'react';

import {
  combatLog,
  type CombatOption,
  type CombatView,
  type JutsuCard,
  type ScoutingRead,
} from '@/game';

import { Chips } from '../../../components/Chips';
import { JutsuDetail } from '../../../components/JutsuDetail';
import { Pane } from '../../../layout/Pane';
import { useHoverPreview } from '../../../layout/useHoverPreview';
import { useKeys } from '../../../layout/useKeys';
import { useWideScreen } from '../../../layout/useWideScreen';

import { FighterRead, FoeMoves } from './FighterRead';
import { Formation } from './Formation';
import { PlanPreviewContext, type PreviewFor } from './planPreview';
import { PlansByOwner, TeamOrders } from './TeamOrders';
import { useHealthPulses } from './useHealthPulses';

type Pick = (option: CombatOption) => void;

interface PlanScreenProps {
  readonly view: CombatView;
  readonly reads: Readonly<Record<string, ScoutingRead>>;
  readonly onPick: Pick;
  /** A technique a card plays, read in full for the preview beside the table. */
  readonly techniqueOf: (techniqueId: string) => JutsuCard | null;
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
      {(view.meters ?? []).map((m) => (
        <Fragment key={m.id}>
          <span>{m.label}</span>
          <span className="hp meter">
            <i style={{ width: `${m.max > 0 ? (m.value / m.max) * 100 : 0}%` }} />
          </span>
          <span className="num">
            {m.value}/{m.max}
          </span>
        </Fragment>
      ))}
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

/** Begin the round, or try to flee: under the table on a phone, under the field on desktop. */
function BeginBar({ view, onPick }: { readonly view: CombatView; readonly onPick: Pick }) {
  const begin = view.options.find((o) => o.kind === 'continue');
  const flee = view.options.find((o) => o.kind === 'escape');
  return (
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
  );
}

/**
 * The card table between rounds: both sides as they stand, what the foes are about to do, and
 * your cards for each distance, opened at the one you are fighting at. Nothing here plays
 * until you begin. On a wide screen your cards, the field and the read of a fighter sit side by
 * side, so the table is in view while you set it.
 */
export function PlanScreen({ view, reads, onPick, techniqueOf }: PlanScreenProps) {
  const foes = view.combatants.filter((c) => c.side === 'enemy');
  const [selected, setSelected] = useState<string | null>(null);
  const pulses = useHealthPulses(view.combatants);
  const wide = useWideScreen();
  const begin = view.options.find((o) => o.kind === 'continue' && !o.disabledReason);
  useKeys(
    {
      Enter: begin
        ? () => {
            onPick(begin);
          }
        : undefined,
    },
    wide,
  );
  const hover = useHoverPreview();
  // One of your cards pointed at is read in full where the fighter's read goes. A teammate's
  // card isn't: the sheet reads a technique in your hands.
  const cardHover = useHoverPreview();
  const previewFor: PreviewFor = (o) =>
    o.techniqueId && o.owner === undefined ? cardHover.handlersFor(o.techniqueId) : {};
  const technique = cardHover.previewId ? techniqueOf(cardHover.previewId) : null;
  const pickCard: Pick = (o) => {
    cardHover.clear();
    onPick(o);
  };
  const picked =
    view.combatants.find((c) => c.id === selected) ?? foes.find((f) => f.health > 0) ?? foes[0];
  // The read follows the pointer on a wide screen, and comes back to the one picked.
  const shown = view.combatants.find((c) => c.id === hover.previewId) ?? picked;
  const names = Object.fromEntries(view.combatants.map((c) => [c.id, c.name]));
  const plans = view.options.filter((o) => o.kind === 'plan');
  const formation = (
    <Formation
      fighters={view.combatants}
      range={view.range}
      reads={reads}
      pulses={pulses}
      selected={picked?.id ?? null}
      onSelect={setSelected}
      previewFor={hover.handlersFor}
    />
  );
  const fighterRead = <FighterRead fighter={shown} read={shown ? reads[shown.id] : undefined} />;
  const cards = (
    <section className="your-cards" aria-label="Your cards">
      <h3 className="plan-heading">Your cards</h3>
      <PlansByOwner options={plans} names={names} here={view.range} onPick={pickCard} />
    </section>
  );
  const head = (
    <header className="scene-head plan-head">
      <h1>Plan round {view.round}</h1>
      {view.prompt && <p className="muted small">{view.prompt}</p>}
    </header>
  );
  if (wide) {
    return (
      <>
        {head}
        <main className="page plan-screen">
          <Pane name="cards">
            <PlanPreviewContext.Provider value={previewFor}>
              {cards}
              <TeamPanel view={view} onPick={pickCard} />
            </PlanPreviewContext.Provider>
          </Pane>
          <Pane name="field">
            {formation}
            <Reserves view={view} />
            <HowItWent view={view} />
            <BeginBar view={view} onPick={onPick} />
            <p className="key-note">Enter begins.</p>
          </Pane>
          <Pane name="read">
            {technique ? (
              <JutsuDetail card={technique} />
            ) : (
              <>
                {fighterRead}
                <FoeMoves foes={foes} />
              </>
            )}
          </Pane>
        </main>
      </>
    );
  }
  return (
    <>
      {head}
      <main className="page plan-screen">
        {formation}
        <Reserves view={view} />
        {fighterRead}
        <HowItWent view={view} />
        <FoeMoves foes={foes} />
        {cards}
        <TeamPanel view={view} onPick={onPick} />
      </main>
      <BeginBar view={view} onPick={onPick} />
    </>
  );
}

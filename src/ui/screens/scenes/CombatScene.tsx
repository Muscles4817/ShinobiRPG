import { useMemo, useState } from 'react';

import {
  combatLog,
  combatScene,
  combatScouting,
  finishedFightScene,
  fightReplay,
  storyEnd,
  type CombatantView,
  type CombatOption,
  type CombatView,
  fightTechnique,
  fighterSight,
  SEEN_IN_FULL,
} from '@/game';

import { Chips } from '../../components/Chips';
import type { ScreenProps } from '../types';
import { ActionBar, Hand } from './combat/Choices';
import { Foes } from './combat/Foes';
import { Pouch } from './combat/Pouch';
import { HealthBar } from './combat/HealthBar';
import { PlanScreen } from './combat/PlanScreen';
import { WatchScreen } from './combat/WatchScreen';
import type { SightOf } from './combat/Gauges';
import { RangeStrip } from './combat/RangeStrip';
import { PlansByOwner, TeamOrders } from './combat/TeamOrders';
import { useHealthPulses, type HealthPulse } from './combat/useHealthPulses';
import { useWatching } from './combat/useWatching';

/** The last lines of the fight log on screen. */
const SHOWN_LINES = 6;

/** Which row one of yours stands in, shown once your side has a back row. */
function RowMark({ fighter, shown }: { readonly fighter: CombatantView; readonly shown: boolean }) {
  if (!shown || !fighter.row) return null;
  return (
    <span className="badge row-mark">{fighter.row === 'back' ? 'Back row' : 'Front row'}</span>
  );
}

interface AlliesProps {
  readonly allies: readonly CombatantView[];
  readonly inRows: boolean;
  readonly pulses: Readonly<Record<string, HealthPulse>>;
}

/** Your teammates, each with their row, health and condition. */
function Allies({ allies, inRows, pulses }: AlliesProps) {
  if (allies.length === 0) return null;
  return (
    <section className="allies" aria-label="Your team">
      {allies.map((a) => (
        <div key={a.id} className={a.health > 0 ? 'ally' : 'ally down'}>
          <b>
            {a.name} <RowMark fighter={a} shown={inRows} />
          </b>
          <HealthBar fighter={a} pulse={pulses[a.id]} mine />
          <small>{a.statuses.join(', ') || a.tag}</small>
        </div>
      ))}
    </section>
  );
}

/**
 * The fight as it plays: enemies above (tap one to target it), the exchange in the middle,
 * your side and resources below, and the engine's options laid out by kind.
 */
function FightScreen({ ctx, state, perform, view }: ScreenProps & { readonly view: CombatView }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const pulses = useHealthPulses(view.combatants);
  // Lines keep their place in the whole log as their key, so only new ones mount (and rise in).
  const told = combatLog(view.story);
  const firstShown = Math.max(0, told.length - SHOWN_LINES);
  const enemies = view.combatants.filter((c) => c.side === 'enemy');
  const living = enemies.filter((e) => e.health > 0 && e.targetable !== false);
  const targetId = living.find((e) => e.id === chosen)?.id ?? living[0]?.id ?? null;
  const ours = view.combatants.filter((c) => c.side === 'player');
  const [player, ...allies] = ours;
  const inRows = ours.some((c) => c.row === 'back');
  const names = Object.fromEntries(allies.map((a) => [a.id, a.name]));
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
        pulses={pulses}
      />
      {view.range && <RangeStrip range={view.range} />}
      <main className="page feed combat-log scene-feed" aria-live="polite">
        {told.slice(-SHOWN_LINES).map((line, i) =>
          line.kind === 'round' ? (
            <p key={firstShown + i} className="divider">
              {line.text}
            </p>
          ) : (
            <p key={firstShown + i} className="story log-line">
              {line.text} <Chips chips={line.chips} />
            </p>
          ),
        )}
      </main>
      {view.prompt && <p className="combat-prompt">{view.prompt}</p>}
      <Allies allies={allies} inRows={inRows} pulses={pulses} />
      {player && (
        <div className="me">
          <b>
            {player.name} <RowMark fighter={player} shown={inRows} />
          </b>
          <HealthBar fighter={player} pulse={pulses[player.id]} mine />
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
            <span className="meter-chip">{player.statuses.join(', ')}</span>
          )}
        </div>
      )}
      <div className="combat-controls">
        <TeamOrders options={of('order')} onPick={pick} />
        <PlansByOwner options={of('plan')} names={names} onPick={pick} />
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

/** A style played on a stage (Plan & Watch) offers no hand of cards to play turn by turn. */
function isStaged(view: CombatView): boolean {
  return !view.options.some((o) => o.kind === 'basic' || o.kind === 'technique');
}

type CombatSceneProps = ScreenProps & {
  /** See every fighter's bars in full (versus, where you set up both sides), not by your eyes. */
  readonly seeAll?: boolean;
  /** A step of the fight is being played off the page's thread: its lines aren't here yet. */
  readonly thinking: boolean;
};

const SEE_ALL: SightOf = () => SEEN_IN_FULL;

/**
 * One scene for every fight style. A staged fight is two screens: the card table between
 * rounds (the plan screen) and the stage that plays out what you chose (the watch screen),
 * which holds after a round until you go back to plan. What is staged follows the log
 * (`useWatching`), so a step still being played changes nothing until its lines arrive, and
 * while it is out (`thinking`) the stage offers no way on. Turn-by-turn styles keep one screen.
 */
export function CombatScene({ seeAll = false, thinking, state, ctx, perform }: CombatSceneProps) {
  // Read once per state, so the beats keep their identity (and the stage's timer runs on) while
  // the screen is drawn again for anything else.
  const { live, view } = useMemo(() => {
    const now = combatScene(state, ctx);
    return { live: now, view: now ?? finishedFightScene(state) };
  }, [state, ctx]);
  const length = view ? storyEnd(view) : 0;
  const staged = view !== null && isStaged(view);
  const { watch, playOn, watched, plan } = useWatching(length, staged);
  const beats = useMemo(() => (view ? fightReplay(view, watch.from) : []), [view, watch.from]);
  if (!view) return null;
  if (!staged) return <FightScreen ctx={ctx} state={state} perform={perform} view={view} />;
  const act = (o: CombatOption) => {
    // A press while a step is out would be dropped: it changes nothing here either.
    if (thinking) return;
    // Playing on (begin, the next exchange, the round, flight) stages what follows once it
    // arrives; changing your cards or orders just changes the table.
    if (o.kind === 'continue' || o.kind === 'escape') playOn(view.combatants);
    perform({ type: 'combatAct', optionId: o.id });
  };
  const reads = combatScouting(state, ctx);
  const sightOf = seeAll ? SEE_ALL : fighterSight(state, ctx);
  const planning = view.options.some((o) => o.kind === 'plan');
  if (planning && !watch.holding) {
    return (
      <PlanScreen
        view={view}
        reads={reads}
        onPick={act}
        waiting={thinking}
        techniqueOf={(id) => fightTechnique(state, ctx, id)}
        sightOf={sightOf}
      />
    );
  }
  return (
    <WatchScreen
      // New lines restage it, even when it was already up (a watched fight opens on it).
      key={`${watch.from}:${length}`}
      view={view}
      beats={beats}
      fresh={length > watch.seen}
      waiting={thinking}
      reads={reads}
      onPick={act}
      before={watch.before}
      sightOf={sightOf}
      onWatched={watched}
      onPlan={planning ? plan : null}
      onLeave={
        live
          ? null
          : () => {
              perform({ type: 'leaveFight' });
            }
      }
    />
  );
}

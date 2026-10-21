import {
  gaugeRead,
  SEEN_IN_FULL,
  type CombatantView,
  type CombatMeter,
  type CombatView,
  type FighterSight,
} from '@/game';

import { HealthBar } from './HealthBar';
import { shortName } from './Formation';
import type { HealthPulse } from './useHealthPulses';

/**
 * Every fighter's bars at once: health, chakra and whatever pools they carry (breath, a hive,
 * dust), and their conditions, each shown as far as you can see it (`fighterSight`): with its
 * numbers, as a word, or not at all. Meters on the fight that belong to no one (a field cast
 * over it) sit underneath.
 */

function share(value: number, max: number): string {
  return `${max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0}%`;
}

interface GaugeProps {
  readonly meter: CombatMeter;
  readonly kind: string;
  /** Read in a word rather than shown as a bar with its numbers. */
  readonly read?: boolean;
}

function Gauge({ meter, kind, read = false }: GaugeProps) {
  if (read) {
    return (
      <>
        <span>{meter.label}</span>
        <span className="gauge-read">{gaugeRead(meter.id, meter.value, meter.max)}</span>
      </>
    );
  }
  return (
    <>
      <span>{meter.label}</span>
      <span className={`hp ${kind}`}>
        <i style={{ width: share(meter.value, meter.max) }} />
      </span>
      <span className="num">
        {meter.value}/{meter.max}
      </span>
    </>
  );
}

interface FighterProps {
  readonly fighter: CombatantView;
  readonly pulse: HealthPulse | undefined;
  readonly sight: FighterSight;
}

function FighterGauges({ fighter: f, pulse, sight }: FighterProps) {
  const down = f.health <= 0;
  return (
    <article className={down ? `gauge-card ${f.side} down` : `gauge-card ${f.side}`}>
      <header>
        <span className={`token-seal small ${f.side}`} aria-hidden="true">
          {shortName(f.name).mark}
        </span>
        <b>{f.name}</b>
      </header>
      <div className="gauge-rows">
        <span>Health</span>
        <HealthBar fighter={f} pulse={pulse} mine={f.side === 'player'} />
        <span className="num">{sight.health === 'exact' && `${f.health}/${f.maxHealth}`}</span>
        {f.maxChakra > 0 && sight.chakra !== 'hidden' && (
          <Gauge
            meter={{ id: 'chakra', label: 'Chakra', value: f.chakra, max: f.maxChakra }}
            kind="chakra"
            read={sight.chakra === 'read'}
          />
        )}
        {(f.meters ?? []).map((m) => (
          <Gauge key={m.id} meter={m} kind={`meter ${m.id}`} read={sight.pools === 'read'} />
        ))}
      </div>
      {f.statuses.length > 0 && <small className="muted">{f.statuses.join(', ')}</small>}
    </article>
  );
}

/** The view's meters that are no fighter's own pool: a field over the fight. */
export function fightMeters(view: CombatView): readonly CombatMeter[] {
  const owned = new Set(view.combatants.flatMap((c) => (c.meters ?? []).map((m) => m.id)));
  return (view.meters ?? []).filter((m) => !owned.has(m.id));
}

/** How much of a fighter's bars you can see. */
export type SightOf = (fighter: CombatantView) => FighterSight;

const SEE_ALL: SightOf = () => SEEN_IN_FULL;

interface GaugesProps {
  readonly fighters: readonly CombatantView[];
  readonly pulses: Readonly<Record<string, HealthPulse>>;
  readonly shared: readonly CombatMeter[];
  readonly sightOf?: SightOf;
}

export function Gauges({ fighters, pulses, shared, sightOf = SEE_ALL }: GaugesProps) {
  return (
    <section className="gauges" aria-label="Every fighter’s bars">
      {fighters.map((f) => (
        <FighterGauges key={f.id} fighter={f} pulse={pulses[f.id]} sight={sightOf(f)} />
      ))}
      {shared.length > 0 && (
        <div className="gauge-rows gauge-shared">
          {shared.map((m) => (
            <Gauge key={m.id} meter={m} kind="meter" />
          ))}
        </div>
      )}
    </section>
  );
}

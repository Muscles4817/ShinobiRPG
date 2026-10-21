import type { CombatantView, CombatMeter, CombatView } from '@/game';

import { HealthBar } from './HealthBar';
import { shortName } from './Formation';
import type { HealthPulse } from './useHealthPulses';

/**
 * Every fighter's bars at once, for a fight you watch or set up from both sides (versus): health,
 * chakra and whatever pools they carry (breath, a hive, dust), each with its numbers, and their
 * conditions. Meters on the fight that belong to no one (a field cast over it) sit underneath.
 */

function share(value: number, max: number): string {
  return `${max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0}%`;
}

function Gauge({ meter, kind }: { readonly meter: CombatMeter; readonly kind: string }) {
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
}

function FighterGauges({ fighter: f, pulse }: FighterProps) {
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
        <span className="num">
          {f.health}/{f.maxHealth}
        </span>
        {f.maxChakra > 0 && (
          <Gauge
            meter={{ id: 'chakra', label: 'Chakra', value: f.chakra, max: f.maxChakra }}
            kind="chakra"
          />
        )}
        {(f.meters ?? []).map((m) => (
          <Gauge key={m.id} meter={m} kind={`meter ${m.id}`} />
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

interface GaugesProps {
  readonly fighters: readonly CombatantView[];
  readonly pulses: Readonly<Record<string, HealthPulse>>;
  readonly shared: readonly CombatMeter[];
}

export function Gauges({ fighters, pulses, shared }: GaugesProps) {
  return (
    <section className="gauges" aria-label="Every fighter’s bars">
      {fighters.map((f) => (
        <FighterGauges key={f.id} fighter={f} pulse={pulses[f.id]} />
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

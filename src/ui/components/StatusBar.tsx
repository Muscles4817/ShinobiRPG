import type { StatusView } from '@/game';

import { MeterBar } from './MeterBar';

const VARIANTS = ['health', 'chakra', 'energy', 'fullness'];

interface StatusBarProps {
  readonly status: StatusView;
  /** Hide the vitals meters (e.g. in combat, where the fight shows live values). */
  readonly compact?: boolean;
}

export function StatusBar({ status, compact = false }: StatusBarProps) {
  return (
    <header className="status">
      <div className="status-top">
        <div>
          <strong>{status.name}</strong> <span className="muted">· {status.rank}</span>
        </div>
        <div className="ryo">{status.ryo} ryo</div>
      </div>
      <div className="status-time muted">
        {status.date} · {status.timeOfDay}
        {status.warnings.map((w) => (
          <span key={w} className="warning-chip">
            {w}
          </span>
        ))}
      </div>
      {!compact && (
        <div className="meters">
          {status.meters.map((m, i) => (
            <MeterBar key={m.label} meter={m} variant={VARIANTS[i] ?? 'energy'} />
          ))}
        </div>
      )}
    </header>
  );
}

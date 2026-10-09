import type { Meter } from '@/game';

interface MeterBarProps {
  readonly meter: Meter;
  readonly variant: string;
}

export function MeterBar({ meter, variant }: MeterBarProps) {
  const pct = meter.max > 0 ? Math.round((meter.value / meter.max) * 100) : 0;
  return (
    <div className="meter" aria-label={`${meter.label} ${meter.value} of ${meter.max}`}>
      <div className="meter-label">
        <span>{meter.label}</span>
        <span>
          {meter.value}/{meter.max}
        </span>
      </div>
      <div className="meter-track">
        <div className={`meter-fill meter-${variant}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

interface BondMeterProps {
  readonly stageName: string;
  readonly progress: number;
}

/** The friendship stage and how far through it you are. */
export function BondMeter({ stageName, progress }: BondMeterProps) {
  return (
    <span className="bond-meter">
      <small>{stageName}</small>
      <span className="bond-bar" aria-hidden="true">
        <i style={{ width: `${Math.round(progress * 100)}%` }} />
      </span>
    </span>
  );
}

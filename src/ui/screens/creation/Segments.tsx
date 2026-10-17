/** A row of choices, one of them picked: hair, headband, face parts. */
export function Segments<T extends string>({
  label,
  values,
  value,
  onPick,
}: {
  label: string;
  values: readonly T[];
  value: T;
  onPick: (v: T) => void;
}) {
  return (
    <div className="swatch-row" role="group" aria-label={label}>
      <span className="label">{label}</span>
      <span className="segments">
        {values.map((v) => (
          <button
            key={v}
            type="button"
            className={v === value ? 'seg on' : 'seg'}
            aria-pressed={v === value}
            onClick={() => {
              onPick(v);
            }}
          >
            {v}
          </button>
        ))}
      </span>
    </div>
  );
}

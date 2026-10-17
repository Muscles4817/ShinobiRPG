import type { DayHook } from '@/game';

/** The day ahead as ema hung on a cord: the most pressing first, and lit. */
export function DayPlaques({
  label,
  hooks,
}: {
  readonly label: string;
  readonly hooks: readonly DayHook[];
}) {
  return (
    <section className="day-ahead" aria-label={label}>
      <h3>{label}</h3>
      <div className="day-cord">
        {hooks.map((h, i) => (
          <div key={h.text} className={i === 0 ? 'day-ema lit' : 'day-ema'}>
            <span className="day-ema-glyph" aria-hidden="true">
              {h.glyph}
            </span>
            <p>{h.text}</p>
            {h.stamp && <span className={h.warm ? 'day-stamp warm' : 'day-stamp'}>{h.stamp}</span>}
          </div>
        ))}
      </div>
    </section>
  );
}

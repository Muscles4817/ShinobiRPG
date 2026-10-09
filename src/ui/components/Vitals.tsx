import type { Meter } from '@/game';

const CLASSES: Readonly<Record<string, string>> = {
  Health: 'm-health',
  Chakra: 'm-chakra',
  Energy: 'm-energy',
  Fed: 'm-fed',
};

export function Vitals({ meters }: { readonly meters: readonly Meter[] }) {
  return (
    <div className="vitals">
      {meters.map((m) => (
        <div key={m.label} aria-label={`${m.label} ${m.value} of ${m.max}`}>
          <span className="vl">
            {m.label}
            <b className="num">{m.value}</b>
          </span>
          <span className="vm">
            <i
              className={CLASSES[m.label]}
              style={{ width: `${Math.round((m.value / m.max) * 100)}%` }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

/** Four segments: the slots of the day already used are lit. */
export function DayStrip({ slotIndex }: { readonly slotIndex: number }) {
  return (
    <span className="daystrip" aria-label={`Time slot ${slotIndex + 1} of 4`}>
      {[0, 1, 2, 3].map((i) => (
        <i key={i} className={i <= slotIndex ? 'on' : ''} />
      ))}
    </span>
  );
}

import type { Notice } from '@/game';

import type { PlaceProps } from '../types';

interface OppositionProps {
  readonly opposition: NonNullable<Notice['opposition']>;
  readonly perform: PlaceProps['perform'];
}

/**
 * Who a job pits you against. Without the client's report you only know how tough it looks;
 * with it, every foe and how to beat them, so you can stock the right tools first.
 */
export function Opposition({ opposition, perform }: OppositionProps) {
  const { foes, intel } = opposition;
  if (foes) {
    return (
      <ul className="notice-foes" aria-label="Who you’ll face">
        {foes.map((f) => (
          <li key={f.name}>
            <b>
              {f.name}
              {f.count > 1 && <span className="num"> ×{f.count}</span>}
            </b>
            {f.traits.length === 0 && <small>No tricks. Just a fight.</small>}
            {f.traits.map((t) => (
              <small key={t.trait}>
                <b>{t.label}.</b> {t.counter}
              </small>
            ))}
          </li>
        ))}
      </ul>
    );
  }
  if (!intel) return null;
  return (
    <div className="notice-intel">
      <small>You don’t know who you’ll face. The clerk has the client’s report.</small>
      <button
        type="button"
        className="btn ghost small"
        disabled={intel.blocker !== null}
        onClick={() => {
          perform(intel.action);
        }}
      >
        Buy the report <span className="num">· {intel.fee} ryo</span>
      </button>
      {intel.blocker && <small className="blocker">{intel.blocker}</small>}
    </div>
  );
}

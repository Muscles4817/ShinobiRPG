import { EDIT_STAT_MAX, EDIT_STAT_MIN, type EditorStat, type StatGroup, type StatId } from '@/game';

import { GradeBadge } from '../../components/Grade';

const STAT_GROUPS: readonly { readonly group: StatGroup; readonly label: string }[] = [
  { group: 'body', label: 'Body' },
  { group: 'mind', label: 'Mind' },
  { group: 'discipline', label: 'Arts' },
];

interface StatEditorProps {
  readonly stats: readonly EditorStat[];
  readonly onChange: (stat: StatId, value: number) => void;
}

/** A value shown without a long tail of decimals. */
function shown(value: number): string {
  return String(Math.round(value * 10) / 10);
}

function StatRow({
  stat,
  onChange,
}: { readonly stat: EditorStat } & Pick<StatEditorProps, 'onChange'>) {
  const step = (by: number) => {
    onChange(stat.id, Math.round(stat.value) + by);
  };
  return (
    <div className={stat.edited ? 'editor-stat edited' : 'editor-stat'}>
      <label htmlFor={`edit-${stat.id}`}>
        {stat.label}
        {stat.edited && <small>Written as {shown(stat.original)}</small>}
      </label>
      <GradeBadge grade={stat.grade} />
      <span className="editor-stepper">
        <button
          type="button"
          className="btn ghost small"
          aria-label={`Lower ${stat.label}`}
          disabled={stat.value <= EDIT_STAT_MIN}
          onClick={() => {
            step(-1);
          }}
        >
          −
        </button>
        <input
          id={`edit-${stat.id}`}
          type="number"
          inputMode="decimal"
          min={EDIT_STAT_MIN}
          max={EDIT_STAT_MAX}
          value={shown(stat.value)}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (e.target.value !== '' && Number.isFinite(value)) onChange(stat.id, value);
          }}
        />
        <button
          type="button"
          className="btn ghost small"
          aria-label={`Raise ${stat.label}`}
          disabled={stat.value >= EDIT_STAT_MAX}
          onClick={() => {
            step(1);
          }}
        >
          +
        </button>
      </span>
    </div>
  );
}

/** Every stat by group: its grade, a stepper, and the pack's value beside any that changed. */
export function StatEditor({ stats, onChange }: StatEditorProps) {
  return (
    <div className="editor-stats">
      {STAT_GROUPS.map(({ group, label }) => (
        <section key={group}>
          <h3>{label}</h3>
          {stats
            .filter((s) => s.group === group)
            .map((s) => (
              <StatRow key={s.id} stat={s} onChange={onChange} />
            ))}
        </section>
      ))}
    </div>
  );
}

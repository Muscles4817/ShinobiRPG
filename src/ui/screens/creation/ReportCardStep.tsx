import { gradesFromQuickPick, pointsSpent, type Discipline, type Grade } from '@/game';

import type { StepProps } from './types';

export type GradeMode = 'quick' | 'points';

interface ReportCardProps extends StepProps {
  readonly mode: GradeMode;
  readonly setMode: (mode: GradeMode) => void;
}

type Role = 'specialty' | 'strength' | 'weakness';
const ROLE_GRADE: Readonly<Record<Role, Grade>> = { specialty: 'A', strength: 'B', weakness: 'D' };
const ROLES: readonly Role[] = ['specialty', 'strength', 'weakness'];

/** Reads the current quick pick back out of the grades (falls back to a valid default). */
function currentPick(grades: Readonly<Record<Discipline, Grade>>, order: readonly Discipline[]) {
  const find = (g: Grade, fallback: Discipline) => order.find((d) => grades[d] === g) ?? fallback;
  return {
    specialty: find('A', 'taijutsu'),
    strength: find('B', 'ninjutsu'),
    weakness: find('D', 'genjutsu'),
  };
}

function QuickPick({ view, draft, update }: StepProps) {
  const order = view.disciplines.map((d) => d.id);
  const pick = currentPick(draft.grades, order);
  const choose = (role: Role, discipline: Discipline) => {
    // Picking a discipline already used by another role swaps the two.
    const next = { ...pick };
    const clash = ROLES.find((r) => r !== role && next[r] === discipline);
    if (clash) next[clash] = next[role];
    next[role] = discipline;
    update({ grades: gradesFromQuickPick(next) });
  };
  return (
    <div className="quick-pick">
      {ROLES.map((role) => (
        <div key={role} className="swatch-row" role="group" aria-label={role}>
          <span className="label">
            {role} · {ROLE_GRADE[role]}
          </span>
          <span className="segments">
            {view.disciplines.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`seg d-${d.id}${pick[role] === d.id ? ' on' : ''}`}
                aria-pressed={pick[role] === d.id}
                onClick={() => {
                  choose(role, d.id);
                }}
              >
                {d.name}
              </button>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

function PointBuy({ view, draft, update }: StepProps) {
  const spent = pointsSpent(draft.grades);
  return (
    <div className="point-buy">
      <p className={spent > view.pointBudget ? 'blocker' : 'muted small'}>
        Points spent {spent} of {view.pointBudget}. A costs 3, B costs 1, D gives 1 back.
      </p>
      {view.disciplines.map((d) => (
        <div key={d.id} className="swatch-row" role="group" aria-label={d.name}>
          <span className="label">{d.name}</span>
          <span className="segments">
            {view.grades.map((g) => (
              <button
                key={g.grade}
                type="button"
                className={draft.grades[d.id] === g.grade ? 'seg on' : 'seg'}
                aria-pressed={draft.grades[d.id] === g.grade}
                onClick={() => {
                  update({ grades: { ...draft.grades, [d.id]: g.grade } });
                }}
              >
                {g.grade}
              </button>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

/** The report card: grades per discipline, by quick pick or point buy. */
export function ReportCardStep(props: ReportCardProps) {
  const { view, draft, mode, setMode } = props;
  return (
    <div className="step">
      <div className="segments mode" role="group" aria-label="Grading">
        <button
          type="button"
          className={mode === 'quick' ? 'seg on' : 'seg'}
          onClick={() => {
            setMode('quick');
          }}
        >
          Quick pick
        </button>
        <button
          type="button"
          className={mode === 'points' ? 'seg on' : 'seg'}
          onClick={() => {
            setMode('points');
          }}
        >
          Point buy
        </button>
      </div>
      {mode === 'quick' ? <QuickPick {...props} /> : <PointBuy {...props} />}
      <table className="report-card">
        <tbody>
          {view.disciplines.map((d) => {
            const grade = draft.grades[d.id];
            const info = view.grades.find((g) => g.grade === grade);
            return (
              <tr key={d.id} className={`d-${d.id}`}>
                <th scope="row">{d.name}</th>
                <td className={`grade g-${grade}`}>{grade}</td>
                <td className="muted small">
                  {info?.label}
                  {info && info.statBonus !== 0
                    ? ` · ${info.statBonus > 0 ? '+' : ''}${info.statBonus}`
                    : ''}
                  {info && info.pacePct !== 0
                    ? ` · learns ${Math.abs(info.pacePct)}% ${info.pacePct > 0 ? 'faster' : 'slower'}`
                    : ''}
                  {grade === 'A' ? ` · starts with ${d.starter}` : ''}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

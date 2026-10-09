import {
  foodOptions,
  missionOptions,
  restOptions,
  techniqueOptions,
  trainingOptions,
  type ActionOption,
} from '@/game';

import { ActionCard } from '../components/ActionCard';
import type { TabProps } from './types';

function OptionList({
  options,
  session,
  buttonLabel,
}: {
  readonly options: readonly ActionOption[];
  readonly session: TabProps['session'];
  readonly buttonLabel: string;
}) {
  return (
    <div className="list">
      {options.map((o) => (
        <ActionCard key={o.key} option={o} onPerform={session.perform} buttonLabel={buttonLabel} />
      ))}
    </div>
  );
}

export function HomeTab({ ctx, state, session }: TabProps) {
  return (
    <>
      <h2>Rest</h2>
      <OptionList options={restOptions(state, ctx)} session={session} buttonLabel="Rest" />
      <h2>Food stalls</h2>
      <OptionList options={foodOptions(state, ctx)} session={session} buttonLabel="Eat" />
    </>
  );
}

export function TrainTab({ ctx, state, session }: TabProps) {
  return (
    <>
      <h2>Training</h2>
      <OptionList options={trainingOptions(state, ctx)} session={session} buttonLabel="Train" />
    </>
  );
}

export function MissionsTab({ ctx, state, session }: TabProps) {
  return (
    <>
      <h2>Mission desk</h2>
      <OptionList options={missionOptions(state, ctx)} session={session} buttonLabel="Accept" />
    </>
  );
}

export function JutsuTab({ ctx, state, session }: TabProps) {
  const entries = techniqueOptions(state, ctx);
  const known = entries.filter((e) => e.known);
  const unknown = entries.filter((e) => !e.known);
  return (
    <>
      <h2>Known techniques</h2>
      <div className="list">
        {known.map((t) => (
          <article key={t.key} className="card">
            <h3>{t.title}</h3>
            <p className="muted">{t.subtitle}</p>
            <p>{t.description}</p>
            <ul className="tags">
              {t.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <h2>Academy library</h2>
      <div className="list">
        {unknown.map((t) => (
          <ActionCard key={t.key} option={t} onPerform={session.perform} buttonLabel="Study">
            <progress value={t.progress} max={t.difficulty} aria-label="Study progress" />
          </ActionCard>
        ))}
      </div>
    </>
  );
}

import type { Discipline, EditorTechnique } from '@/game';

import { TechniqueCard } from '../../components/TechniqueCard';
import { TechniqueFinder } from './TechniqueFinder';

const ART_LABEL: Readonly<Record<Discipline, string>> = {
  taijutsu: 'Taijutsu',
  ninjutsu: 'Ninjutsu',
  genjutsu: 'Genjutsu',
  kenjutsu: 'Kenjutsu',
  fuuinjutsu: 'Fūinjutsu',
};

function detailOf(t: EditorTechnique): string {
  return t.ready ? ART_LABEL[t.discipline] : 'Beyond their grades: unused until they grow into it';
}

interface TechniqueEditorProps {
  readonly techniques: readonly EditorTechnique[];
  readonly choices: readonly EditorTechnique[];
  readonly onChange: (ids: readonly string[]) => void;
}

/** What they fight with, each removable (never the last), then what could be added. */
export function TechniqueEditor({ techniques, choices, onChange }: TechniqueEditorProps) {
  const ids = techniques.map((t) => t.id);
  return (
    <section className="editor-techniques">
      <h3>Fights with ({techniques.length})</h3>
      <ul>
        {techniques.map((t) => (
          <li key={t.id}>
            <TechniqueCard
              name={t.name}
              detail={detailOf(t)}
              discipline={t.discipline}
              rank={t.rank}
              ghost={!t.ready}
            />
            <button
              type="button"
              className="btn ghost small"
              aria-label={`Remove ${t.name}`}
              disabled={ids.length <= 1}
              onClick={() => {
                onChange(ids.filter((id) => id !== t.id));
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      {ids.length <= 1 && <p className="muted">Everyone keeps at least one technique.</p>}
      <h3>Add a technique</h3>
      <TechniqueFinder choices={choices}>
        {(shown) => (
          <ul>
            {shown.map((t) => (
              <li key={t.id}>
                <TechniqueCard
                  name={t.name}
                  detail={detailOf(t)}
                  discipline={t.discipline}
                  rank={t.rank}
                  ghost={!t.ready}
                />
                <button
                  type="button"
                  className="btn small"
                  aria-label={`Add ${t.name}`}
                  onClick={() => {
                    onChange([...ids, t.id]);
                  }}
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        )}
      </TechniqueFinder>
    </section>
  );
}

import { useState } from 'react';

import type { Discipline, EditorTechnique } from '@/game';

import { TechniqueCard } from '../../components/TechniqueCard';

/** How many choices are listed at once; a search narrows the rest. */
const CHOICES_SHOWN = 12;

const ART_LABEL: Readonly<Record<Discipline, string>> = {
  taijutsu: 'Taijutsu',
  ninjutsu: 'Ninjutsu',
  genjutsu: 'Genjutsu',
  kenjutsu: 'Kenjutsu',
  fuuinjutsu: 'Fūinjutsu',
};

const ARTS: readonly Discipline[] = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'];

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
  const [art, setArt] = useState<Discipline | 'all'>('all');
  const [query, setQuery] = useState('');
  const ids = techniques.map((t) => t.id);
  const needle = query.trim().toLowerCase();
  const found = choices.filter(
    (t) => (art === 'all' || t.discipline === art) && t.name.toLowerCase().includes(needle),
  );
  return (
    <section className="editor-techniques">
      <h3>Fights with</h3>
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
      <div className="editor-find">
        <select
          aria-label="Art"
          value={art}
          onChange={(e) => {
            const picked = ARTS.find((a) => a === e.target.value);
            setArt(picked ?? 'all');
          }}
        >
          <option value="all">Every art</option>
          {ARTS.map((a) => (
            <option key={a} value={a}>
              {ART_LABEL[a]}
            </option>
          ))}
        </select>
        <input
          type="search"
          aria-label="Search techniques"
          placeholder="Search by name"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />
      </div>
      <ul>
        {found.slice(0, CHOICES_SHOWN).map((t) => (
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
      {found.length > CHOICES_SHOWN && (
        <p className="muted">{found.length - CHOICES_SHOWN} more. Search to narrow them down.</p>
      )}
      {found.length === 0 && <p className="muted">Nothing fits. Try another art or name.</p>}
    </section>
  );
}

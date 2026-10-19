import { useState } from 'react';

import type { FighterEditor, StatId } from '@/game';

import { Portrait } from '../../art/Portrait';
import { GradeBadge } from '../../components/Grade';
import { StatEditor } from './StatEditor';
import { TechniqueEditor } from './TechniqueEditor';

interface FighterEditorSheetProps {
  readonly editor: FighterEditor;
  readonly onStat: (stat: StatId, value: number) => void;
  readonly onTechniques: (ids: readonly string[]) => void;
  readonly onReset: () => void;
  /** Back to the list, on a phone; left out where the list stays beside the sheet. */
  readonly onBack?: () => void;
}

/** Putting a fighter back as written loses the changes, so it asks first. */
function ResetFighter({ editor, onReset }: Pick<FighterEditorSheetProps, 'editor' | 'onReset'>) {
  const [asking, setAsking] = useState(false);
  if (!editor.edited) return <p className="muted">As the world writes them.</p>;
  if (!asking) {
    return (
      <button
        type="button"
        className="btn ghost"
        onClick={() => {
          setAsking(true);
        }}
      >
        Reset to the original
      </button>
    );
  }
  return (
    <div className="menu-confirm" role="group" aria-label="Reset this fighter?">
      <p>Put {editor.fighter.name} back as the world writes them?</p>
      <div className="row-buttons">
        <button
          type="button"
          className="btn danger"
          onClick={() => {
            onReset();
            setAsking(false);
          }}
        >
          Reset {editor.fighter.name}
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setAsking(false);
          }}
        >
          Keep the changes
        </button>
      </div>
    </div>
  );
}

/** One fighter on the editor's desk: who they are, their stats and what they fight with. */
export function FighterEditorSheet(props: FighterEditorSheetProps) {
  const { editor, onBack } = props;
  const { fighter } = editor;
  return (
    <article className="versus-profile editor-sheet" aria-label={`Editing ${fighter.name}`}>
      <header className="versus-profile-head">
        {fighter.look && <Portrait appearance={fighter.look} size={72} />}
        <div>
          <h2>{fighter.name}</h2>
          <p>{fighter.title}</p>
          <span className="versus-power">
            Fighting power <GradeBadge grade={fighter.grade} />
            {editor.edited && fighter.grade !== editor.originalGrade && (
              <small>written as {editor.originalGrade}</small>
            )}
          </span>
        </div>
      </header>
      <div className="versus-profile-actions">
        {onBack && (
          <button type="button" className="btn ghost" onClick={onBack}>
            Back to the list
          </button>
        )}
        <ResetFighter editor={editor} onReset={props.onReset} />
      </div>
      {editor.notes.map((note) => (
        <p key={note} className="versus-problem">
          {note}
        </p>
      ))}
      <StatEditor stats={editor.stats} onChange={props.onStat} />
      <TechniqueEditor
        techniques={editor.techniques}
        choices={editor.choices}
        onChange={props.onTechniques}
      />
    </article>
  );
}

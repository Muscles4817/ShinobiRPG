import { Portrait } from '../../art/Portrait';
import type { StepProps } from './types';

/** The last page: your whole file at a glance, then the instructor's lamp in the doorway. */
export function CaughtStep({ view, draft }: StepProps) {
  const clan = view.clans.find((c) => c.id === draft.clanId);
  const family = draft.clanId === 'none' ? draft.familyName : clan?.name;
  const name = (id: string, list: readonly { id: string; name: string }[]) =>
    list.find((o) => o.id === id)?.name ?? '—';
  return (
    <div className="step">
      <div className="file-summary">
        <Portrait appearance={draft.appearance} size={72} />
        <dl className="kv">
          <dt>Name</dt>
          <dd>{[draft.name, family].filter(Boolean).join(' ')}</dd>
          <dt>Family</dt>
          <dd>{clan?.name}</dd>
          <dt>Standing</dt>
          <dd>{name(draft.standing, view.standings)}</dd>
          <dt>Raised</dt>
          <dd>{name(draft.upbringingId, view.upbringings)}</dd>
          <dt>Build</dt>
          <dd>{name(draft.buildId, view.builds)}</dd>
          <dt>Nature</dt>
          <dd>{name(draft.nature, view.natures)}</dd>
          <dt>Traits</dt>
          <dd>{draft.traitIds.map((id) => name(id, view.traits)).join(', ')}</dd>
          <dt>Note</dt>
          <dd>{name(draft.talentId, view.talents)}</dd>
          <dt>Dream</dt>
          <dd>{name(draft.nindoId, view.nindos)}</dd>
        </dl>
      </div>
      <p className="story enter">{view.caught}</p>
    </div>
  );
}

import { OptionCard } from './OptionCard';
import type { StepProps } from './types';

/** Chakra assessment: pick a nature. The clan's own nature is marked. */
export function NatureStep({ view, draft, update }: StepProps) {
  const clanNature = view.clans.find((c) => c.id === draft.clanId)?.nature ?? null;
  return (
    <div className="step opt-list">
      {view.natures.map((n) => (
        <OptionCard
          key={n.id}
          name={n.name}
          description={n.description}
          effects={[
            { label: `${n.name} techniques learned 50% faster`, tone: 'gain' },
            ...(n.id === clanNature
              ? [{ label: 'Clan affinity: a further 20%', tone: 'gain' as const }]
              : []),
          ]}
          selected={draft.nature === n.id}
          onSelect={() => {
            update({ nature: n.id });
          }}
        />
      ))}
      <p className="muted small">Other natures are learned 15% slower.</p>
    </div>
  );
}

/** Instructor's notes: two traits, never a pair of opposites. */
export function TraitsStep({ view, draft, update }: StepProps) {
  const toggle = (id: string) => {
    if (draft.traitIds.includes(id)) {
      update({ traitIds: draft.traitIds.filter((t) => t !== id) });
      return;
    }
    // Picking a trait drops its opposite; otherwise it replaces the older of two picks.
    const opposite = view.traits.find((t) => t.id === id)?.opposite;
    const others = draft.traitIds.filter((t) => t !== opposite);
    update({ traitIds: [...others.slice(-1), id] });
  };
  return (
    <div className="step">
      <p className="muted small">
        Choose two. Opposites can’t be combined. {draft.traitIds.length}/2 chosen.
      </p>
      <div className="opt-list two">
        {view.traits.map((t) => (
          <OptionCard
            key={t.id}
            name={t.name}
            description={`“${t.description}”`}
            effects={t.effects}
            selected={draft.traitIds.includes(t.id)}
            onSelect={() => {
              toggle(t.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function TalentStep({ view, draft, update }: StepProps) {
  return (
    <div className="step opt-list">
      {view.talents.map((t) => (
        <OptionCard
          key={t.id}
          name={t.name}
          description={t.description}
          effects={t.effects}
          selected={draft.talentId === t.id}
          onSelect={() => {
            update({ talentId: t.id });
          }}
        />
      ))}
    </div>
  );
}

/** Your application essay: the dream you wrote down. */
export function NindoStep({ view, draft, update }: StepProps) {
  return (
    <div className="step opt-list">
      {view.nindos.map((n) => (
        <OptionCard
          key={n.id}
          name={n.name}
          description={`“${n.description}”`}
          selected={draft.nindoId === n.id}
          onSelect={() => {
            update({ nindoId: n.id });
          }}
        />
      ))}
      <p className="muted small">
        Your dream will shape the story events and paths that open to you later.
      </p>
    </div>
  );
}

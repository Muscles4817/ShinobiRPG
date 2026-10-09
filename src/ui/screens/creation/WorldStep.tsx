import type { PackChoice } from '@/game';

import { OptionCard } from './OptionCard';

interface WorldStepProps {
  readonly packs: readonly PackChoice[];
  readonly packId: string;
  readonly onPick: (id: string) => void;
}

export function WorldStep({ packs, packId, onPick }: WorldStepProps) {
  return (
    <div className="step opt-list">
      {packs.map((p) => (
        <OptionCard
          key={p.id}
          name={p.name}
          description={p.description}
          selected={p.id === packId}
          onSelect={() => {
            onPick(p.id);
          }}
        />
      ))}
    </div>
  );
}

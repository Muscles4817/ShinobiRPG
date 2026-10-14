import { fateStanding, type ClassStanding } from '@/game';

import { OptionCard } from './OptionCard';
import type { StepProps } from './types';

interface StandingStepProps extends StepProps {
  /** The new game's seed: fate reads the standing from it, as the file already says it. */
  readonly seed: number;
}

/**
 * Where you stood in your class, from dead last to the genius of the year, or left to fate (the
 * file you broke in to read already says). It sets your early training, your known gifts and how
 * much talent you have to find, so it is how hard the game will be.
 */
export function StandingStep({ view, draft, update, seed }: StandingStepProps) {
  const choose = (standing: ClassStanding, fated: boolean) => {
    update({ standing, fated });
  };
  const fated = view.standings.find((s) => s.id === fateStanding(seed));
  return (
    <div className="step opt-list">
      {view.standings.map((s) => (
        <OptionCard
          key={s.id}
          name={s.name}
          description={s.description}
          effects={s.effects}
          selected={draft.standing === s.id && draft.fated !== true}
          onSelect={() => {
            choose(s.id, false);
          }}
        />
      ))}
      <OptionCard
        name="Let fate decide"
        description="Turn to the page with your standing on it and read what the instructors wrote."
        selected={draft.fated === true}
        onSelect={() => {
          choose(fateStanding(seed), true);
        }}
      >
        {draft.fated === true && fated && (
          <span className="opt-desc">
            Your file says: <b>{fated.name}</b>. {fated.description}
          </span>
        )}
      </OptionCard>
      <p className="muted small">
        Lower standings make a harder game. Hard work is how the bottom of the class climbs.
      </p>
    </div>
  );
}

import type { ClanOption } from '@/game';

import { OptionCard } from './OptionCard';
import type { StepProps } from './types';

/** How you were raised: offered by whether you were born into a clan. */
export function UpbringingStep({ view, draft, update }: StepProps) {
  const family = draft.clanId === 'none' ? 'clanless' : 'clan';
  const offered = view.upbringings.filter((u) => u.family === family);
  const hive = view.clans.find((c) => c.id === draft.clanId)?.hive ?? null;
  return (
    <div className="step opt-list">
      {hive && <HiveShareChoice hive={hive} draft={draft} update={update} />}
      {offered.map((u) => (
        <OptionCard
          key={u.id}
          name={u.name}
          description={u.description}
          effects={u.effects}
          selected={draft.upbringingId === u.id}
          onSelect={() => {
            update({ upbringingId: u.id });
          }}
        />
      ))}
      <p className="muted small">
        Early training is spent on the next pages, with what your standing gives.
      </p>
    </div>
  );
}

/** Your frame: what strength and speed can become, and what carrying more costs. */
export function BuildStep({ view, draft, update }: StepProps) {
  return (
    <div className="step opt-list">
      {view.builds.map((b) => (
        <OptionCard
          key={b.id}
          name={b.name}
          description={b.description}
          effects={b.effects}
          selected={draft.buildId === b.id}
          onSelect={() => {
            update({ buildId: b.id });
          }}
        />
      ))}
      <p className="muted small">
        Speed is mostly born and strength is bounded by your frame. Grow stronger than your frame
        was built for and you will slow down.
      </p>
    </div>
  );
}

/** A child of a hive clan gives the hive part of their chakra at birth: how much. */
function HiveShareChoice({
  hive,
  draft,
  update,
}: {
  readonly hive: NonNullable<ClanOption['hive']>;
} & Omit<StepProps, 'view'>) {
  const chosen = draft.hiveShare ?? 'half';
  return (
    <section className="hive-choice">
      <h3>The hive</h3>
      <p className="muted small">
        You were born with {hive.strain.toLowerCase()} in you. What they took of your chakra, they
        keep for good.
      </p>
      {hive.shares.map((s) => (
        <OptionCard
          key={s.id}
          name={s.name}
          description={s.description}
          selected={chosen === s.id}
          onSelect={() => {
            update({ hiveShare: s.id });
          }}
        />
      ))}
    </section>
  );
}

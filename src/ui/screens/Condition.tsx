import type { ConditionView, InjuryLine } from '@/game';

import { Chips } from '../components/Chips';

/** One injury as a medic's slip: what and where, how long, and what it does. */
function InjurySlip({ injury }: { readonly injury: InjuryLine }) {
  return (
    <li className="injury-slip">
      <p className="injury-head">
        <b>{injury.name}</b> <span className="epithet">{injury.where}</span>
      </p>
      <p className="muted small">{injury.description}</p>
      <Chips
        chips={[
          { label: injury.left, tone: 'harm' },
          ...(injury.treated ? [{ label: 'Treated', tone: 'gain' }] : []),
          ...injury.effects,
        ]}
      />
    </li>
  );
}

/** Injuries listed as slips; nothing when there are none. */
export function InjuryList({ injuries }: { readonly injuries: readonly InjuryLine[] }) {
  if (injuries.length === 0) return null;
  return (
    <ul className="injury-list">
      {injuries.map((i) => (
        <InjurySlip key={i.id} injury={i} />
      ))}
    </ul>
  );
}

/** Your body's condition on the Shinobi screen: injuries and chakra exhaustion. */
export function ConditionPanel({ condition }: { readonly condition: ConditionView }) {
  const { injuries, exhaustion } = condition;
  return (
    <section className="condition" aria-label="Condition">
      <h2 className="label">Condition</h2>
      {injuries.length === 0 && !exhaustion && <p className="muted small">Unhurt and rested.</p>}
      <InjuryList injuries={injuries} />
      {exhaustion && (
        <div className="injury-slip">
          <p className="injury-head">
            <b>Chakra exhaustion</b>
          </p>
          <Chips chips={[{ label: exhaustion.left, tone: 'cost' }, ...exhaustion.effects]} />
        </div>
      )}
    </section>
  );
}

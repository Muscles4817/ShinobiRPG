import type { EncounterScene } from '@/game';

import { ThreatChip } from '../../../components/ThreatChip';

/**
 * What you know about the foes ahead, written up like a scout's slip: known facts in ink,
 * unknown ones with the recon that would reveal them.
 */
export function FieldNotes({ scene }: { readonly scene: EncounterScene }) {
  return (
    <section className="field-notes" aria-label="What you know">
      <h2 className="label">What you know</h2>
      <dl>
        {scene.facts.map((f) => (
          <div key={f.fact}>
            <dt>{f.label}</dt>
            {f.value === null ? <dd className="unknown">{f.hint}</dd> : <dd>{f.value}</dd>}
          </div>
        ))}
      </dl>
      {scene.foes && (
        <ul className="field-foes" aria-label="Who they are">
          {scene.foes.map((foe) => (
            <li key={foe.name}>
              <b>
                {foe.name}
                {foe.count > 1 && <span className="num"> ×{foe.count}</span>}
              </b>
              <ThreatChip threat={foe.threat} label={foe.threatLabel} />
              {foe.traits?.map((t) => (
                <small key={t.trait}>
                  <b>{t.label}.</b> {t.counter}
                </small>
              ))}
            </li>
          ))}
        </ul>
      )}
      {scene.foes && scene.handicap && <p className="handicap">{scene.handicap}</p>}
    </section>
  );
}

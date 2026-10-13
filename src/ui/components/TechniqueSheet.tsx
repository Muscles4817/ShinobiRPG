import type { TechniqueSheet as Sheet } from '@/game';

/**
 * A technique read in full: its reach as three bands, how hard it hits (a word, the power as a
 * chip), what it does in order, what it costs and needs, its school, and what it does in your
 * hands against an equal. The same sheet at the academy, the library and on the deck.
 */
export function TechniqueSheet({ sheet }: { readonly sheet: Sheet }) {
  return (
    <dl className="tsheet">
      <div>
        <dt>Reach</dt>
        <dd className="tsheet-reach">
          {sheet.reach.map((r) => (
            <span
              key={r.band}
              className={r.reaches ? 'on' : ''}
              aria-label={`${r.band}: ${r.reaches ? 'reaches' : 'out of reach'}`}
            >
              {r.band}
            </span>
          ))}
        </dd>
      </div>
      {sheet.strength && (
        <div>
          <dt>Hits</dt>
          <dd>
            {sheet.strength.word} <span className="chip">{sheet.strength.power}</span>
          </dd>
        </div>
      )}
      {sheet.lands && (
        <div>
          <dt>Lands</dt>
          <dd>{sheet.lands}</dd>
        </div>
      )}
      {sheet.strikes && (
        <div>
          <dt>Strikes</dt>
          <dd>{sheet.strikes}</dd>
        </div>
      )}
      <div>
        <dt>Does</dt>
        <dd>
          {sheet.effects.map((e, i) => (
            <span key={i} className="tsheet-effect">
              {i > 0 ? 'Then ' : ''}
              {i > 0 ? `${(e.text[0] ?? '').toLowerCase()}${e.text.slice(1)}` : e.text}
              {e.chip && <span className="chip">{e.chip}</span>}
            </span>
          ))}
        </dd>
      </div>
      <div>
        <dt>Costs</dt>
        <dd>
          <span className="chip cost">{sheet.chakra} chakra</span>
          {sheet.costs.map((c) => (
            <span key={c} className="chip cost">
              {c}
            </span>
          ))}
        </dd>
      </div>
      {sheet.needs.length > 0 && (
        <div>
          <dt>Needs</dt>
          <dd>{sheet.needs.join(', ')}</dd>
        </div>
      )}
      <div>
        <dt>School</dt>
        <dd>{sheet.school}</dd>
      </div>
      {sheet.inYourHands && (
        <div>
          <dt>In your hands</dt>
          <dd>{sheet.inYourHands}</dd>
        </div>
      )}
    </dl>
  );
}

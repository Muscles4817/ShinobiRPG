import type { Appearance, HairStyle, HeadbandPlace, Pronouns } from '@/game';

import { Portrait } from '../../art/Portrait';
import { OptionCard } from './OptionCard';
import type { StepProps } from './types';

interface SwatchRowProps {
  readonly label: string;
  readonly colours: readonly string[];
  readonly value: string;
  readonly onPick: (colour: string) => void;
}

function SwatchRow({ label, colours, value, onPick }: SwatchRowProps) {
  return (
    <div className="swatch-row" role="group" aria-label={label}>
      <span className="label">{label}</span>
      <span className="swatches">
        {colours.map((c) => (
          <button
            key={c}
            type="button"
            className={c === value ? 'swatch on' : 'swatch'}
            style={{ background: c }}
            aria-label={`${label} ${c}`}
            aria-pressed={c === value}
            onClick={() => {
              onPick(c);
            }}
          />
        ))}
      </span>
    </div>
  );
}

function Segments<T extends string>({
  label,
  values,
  value,
  onPick,
}: {
  label: string;
  values: readonly T[];
  value: T;
  onPick: (v: T) => void;
}) {
  return (
    <div className="swatch-row" role="group" aria-label={label}>
      <span className="label">{label}</span>
      <span className="segments">
        {values.map((v) => (
          <button
            key={v}
            type="button"
            className={v === value ? 'seg on' : 'seg'}
            aria-pressed={v === value}
            onClick={() => {
              onPick(v);
            }}
          >
            {v}
          </button>
        ))}
      </span>
    </div>
  );
}

/** Student record: name, pronouns, family and appearance. */
export function RecordStep({ view, draft, update }: StepProps) {
  const { palettes } = view;
  const look = (patch: Partial<Appearance>) => {
    update({ appearance: { ...draft.appearance, ...patch } });
  };
  const clanless = draft.clanId === 'none';
  return (
    <div className="step">
      <div className="record-head">
        <Portrait appearance={draft.appearance} size={88} />
        <div className="record-fields">
          <label className="field">
            <span className="label">Given name</span>
            <input
              id="name"
              value={draft.name}
              maxLength={20}
              placeholder="Your name"
              onChange={(e) => {
                update({ name: e.target.value });
              }}
            />
          </label>
          {clanless && (
            <label className="field">
              <span className="label">Family name</span>
              <input
                id="family"
                value={draft.familyName}
                maxLength={20}
                placeholder="Optional"
                onChange={(e) => {
                  update({ familyName: e.target.value });
                }}
              />
            </label>
          )}
          <Segments<Pronouns>
            label="Pronouns"
            values={palettes.pronouns as readonly Pronouns[]}
            value={draft.pronouns}
            onPick={(p) => {
              update({ pronouns: p });
            }}
          />
        </div>
      </div>
      <h2 className="file-h">Family</h2>
      <div className="opt-list">
        {view.clans.map((c) => (
          <OptionCard
            key={c.id}
            name={c.name}
            description={c.description}
            effects={c.effects}
            selected={c.id === draft.clanId}
            onSelect={() => {
              update({ clanId: c.id });
            }}
          >
            {c.kekkeiGenkai && (
              <span className="kg">
                <b>{c.kekkeiGenkai.name}</b> · {c.kekkeiGenkai.dormant ? 'dormant' : 'active'}.{' '}
                {c.kekkeiGenkai.description}
              </span>
            )}
            {c.techniques.length > 0 && (
              <span className="muted small">Starts with {c.techniques.join(', ')}</span>
            )}
            {c.lodging && <span className="muted small">Lives rent-free: {c.lodging}</span>}
          </OptionCard>
        ))}
      </div>
      <h2 className="file-h">Appearance</h2>
      <Segments<HairStyle>
        label="Hair"
        values={palettes.hairStyles as readonly HairStyle[]}
        value={draft.appearance.hairStyle}
        onPick={(v) => {
          look({ hairStyle: v });
        }}
      />
      <SwatchRow
        label="Hair colour"
        colours={palettes.hairColours}
        value={draft.appearance.hairColour}
        onPick={(c) => {
          look({ hairColour: c });
        }}
      />
      <SwatchRow
        label="Eyes"
        colours={palettes.eyeColours}
        value={draft.appearance.eyeColour}
        onPick={(c) => {
          look({ eyeColour: c });
        }}
      />
      <SwatchRow
        label="Skin"
        colours={palettes.skinTones}
        value={draft.appearance.skinTone}
        onPick={(c) => {
          look({ skinTone: c });
        }}
      />
      <SwatchRow
        label="Outfit"
        colours={palettes.outfitColours}
        value={draft.appearance.outfitColour}
        onPick={(c) => {
          look({ outfitColour: c });
        }}
      />
      <Segments<HeadbandPlace>
        label="Headband"
        values={palettes.headbandPlaces as readonly HeadbandPlace[]}
        value={draft.appearance.headband}
        onPick={(v) => {
          look({ headband: v });
        }}
      />
    </div>
  );
}

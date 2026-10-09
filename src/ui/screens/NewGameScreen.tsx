import { useMemo, useState } from 'react';

import { contextForPack, newGameView, packChoices } from '@/game';

import { Backdrop } from '../art/Backdrop';
import { Notice } from '../components/Notice';

interface NewGameScreenProps {
  readonly notice: string | null;
  readonly onStart: (packId: string, name: string, aptitudeId: string) => void;
}

const GIFT_GLYPH: Readonly<Record<string, string>> = {
  taijutsu: '体',
  ninjutsu: '忍',
  genjutsu: '幻',
};

export function NewGameScreen({ notice, onStart }: NewGameScreenProps) {
  const packs = useMemo(() => packChoices(), []);
  const [packId, setPackId] = useState(packs[0]?.id ?? '');
  const view = useMemo(() => {
    const ctx = contextForPack(packId);
    return ctx ? newGameView(ctx) : null;
  }, [packId]);
  const [name, setName] = useState('');
  const [aptitudeId, setAptitudeId] = useState('taijutsu');
  if (!view) return null;

  return (
    <div className="app new-game">
      <header className="ng-hero sky" data-slot="night">
        <Backdrop id={view.backdrop} />
      </header>
      <main className="ng-body">
        {notice && <Notice text={notice} />}
        <div>
          <p className="label gold">{view.epithet}</p>
          <h1 className="ng-title">{view.village}</h1>
        </div>
        <p className="story">{view.intro}</p>
        <form
          className="ng-form"
          onSubmit={(e) => {
            e.preventDefault();
            onStart(packId, name, aptitudeId);
          }}
        >
          {packs.length > 1 && (
            <fieldset className="field">
              <legend className="label">World</legend>
              <div className="worlds">
                {packs.map((p) => (
                  <label key={p.id} className={`choice-card${p.id === packId ? ' selected' : ''}`}>
                    <input
                      type="radio"
                      name="pack"
                      checked={p.id === packId}
                      onChange={() => {
                        setPackId(p.id);
                      }}
                    />
                    <b>{p.name}</b>
                    <span className="muted small">{p.description}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <label className="field">
            <span className="label">Your name</span>
            <input
              id="name"
              value={name}
              maxLength={24}
              placeholder="Nameless"
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </label>
          <fieldset className="field">
            <legend className="label">Your gift</legend>
            {view.aptitudes.map((a) => (
              <label
                key={a.id}
                className={`choice-card d-${a.id}${a.id === aptitudeId ? ' selected' : ''}`}
              >
                <input
                  type="radio"
                  name="gift"
                  checked={a.id === aptitudeId}
                  onChange={() => {
                    setAptitudeId(a.id);
                  }}
                />
                <b>
                  <span className="glyph">{GIFT_GLYPH[a.id] ?? '忍'}</span> {a.name}
                </b>
                <span className="chips">
                  {a.bonuses.map((b) => (
                    <span key={b} className="chip">
                      {b}
                    </span>
                  ))}
                </span>
                {a.technique && <span className="muted small">Starts with {a.technique}</span>}
              </label>
            ))}
          </fieldset>
          <button type="submit" className="btn wide">
            {view.graduate}
          </button>
        </form>
      </main>
    </div>
  );
}

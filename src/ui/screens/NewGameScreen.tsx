import { useMemo, useState } from 'react';

import { aptitudeChoices, WORLD, type GameContext } from '@/game';

import { Notice } from '../components/Notice';

interface NewGameScreenProps {
  readonly ctx: GameContext;
  readonly notice: string | null;
  readonly onStart: (name: string, aptitudeId: string) => void;
}

export function NewGameScreen({ ctx, notice, onStart }: NewGameScreenProps) {
  const aptitudes = useMemo(() => aptitudeChoices(ctx), [ctx]);
  const [name, setName] = useState('');
  const [aptitudeId, setAptitudeId] = useState(aptitudes[0]?.id ?? '');

  return (
    <main className="screen new-game">
      <h1>{WORLD.village}</h1>
      <p className="muted">{WORLD.villageEpithet}</p>
      {notice && <Notice text={notice} />}
      <p>{WORLD.intro}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onStart(name, aptitudeId);
        }}
      >
        <label className="field">
          <span>Your name</span>
          <input
            value={name}
            maxLength={24}
            placeholder="Nameless"
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </label>
        <fieldset className="field">
          <legend>Your gift</legend>
          {aptitudes.map((a) => (
            <label key={a.id} className={`choice ${a.id === aptitudeId ? 'selected' : ''}`}>
              <input
                type="radio"
                name="aptitude"
                value={a.id}
                checked={a.id === aptitudeId}
                onChange={() => {
                  setAptitudeId(a.id);
                }}
              />
              <strong>{a.name}</strong>
              <span className="muted">{a.description}</span>
            </label>
          ))}
        </fieldset>
        <button type="submit" className="primary">
          Receive your forehead protector
        </button>
      </form>
    </main>
  );
}

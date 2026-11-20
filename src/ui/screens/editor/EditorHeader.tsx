import { useState } from 'react';

/** The editor's header controls: the world being edited, and putting its fighters back. */

/** Undoing every change in a world loses them all, so it asks first. */
export function ResetWorld({
  name,
  onReset,
}: {
  readonly name: string;
  readonly onReset: () => void;
}) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button
        type="button"
        className="btn ghost small"
        onClick={() => {
          setAsking(true);
        }}
      >
        Reset every fighter
      </button>
    );
  }
  return (
    <div className="menu-confirm" role="group" aria-label="Reset every fighter?">
      <p>Put every fighter in {name} back as the world writes them?</p>
      <div className="row-buttons">
        <button
          type="button"
          className="btn danger"
          onClick={() => {
            onReset();
            setAsking(false);
          }}
        >
          Reset them all
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setAsking(false);
          }}
        >
          Keep the changes
        </button>
      </div>
    </div>
  );
}

/** The world whose fighters are edited, when there is more than one. */
export function WorldPicker({
  packs,
  packId,
  onPick,
}: {
  readonly packs: readonly { readonly id: string; readonly name: string }[];
  readonly packId: string;
  readonly onPick: (packId: string) => void;
}) {
  if (packs.length < 2) return null;
  return (
    <section className="versus-slot">
      <label htmlFor="editor-world">World</label>
      <select
        id="editor-world"
        value={packId}
        onChange={(e) => {
          onPick(e.target.value);
        }}
      >
        {packs.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </section>
  );
}

import { useState } from 'react';

import { copyText } from '../../components/copyText';
import type { GameSession } from '../../useGameSession';

export type SaveKeeping = Pick<GameSession, 'exportSave' | 'importSave' | 'keptCopy'>;

interface SaveDataProps {
  readonly saves: SaveKeeping;
  /** Loading a save replaces the game, so it is offered from the title screen only. */
  readonly canLoad: boolean;
}

const COPIED = 'Copied. Paste it into a note or a message to yourself to keep it safe.';
const COPY_BY_HAND = 'This device won’t copy for the game. Select the text below and copy it.';

/** A save handed out as text: copied if the device allows, else shown to copy by hand. */
function useCopyOut() {
  const [status, setStatus] = useState<string | null>(null);
  const [shown, setShown] = useState<string | null>(null);
  const copyOut = (text: string | null) => {
    if (!text) return;
    void copyText(text).then((copied) => {
      setStatus(copied ? COPIED : COPY_BY_HAND);
      setShown(copied ? null : text);
    });
  };
  return { status, shown, copyOut, setStatus };
}

function LoadSave({ onLoad }: { readonly onLoad: (raw: string) => void }) {
  const [pasted, setPasted] = useState('');
  return (
    <div className="save-load">
      <label htmlFor="save-paste">Paste a save here to play it</label>
      <textarea
        id="save-paste"
        rows={3}
        value={pasted}
        spellCheck={false}
        onChange={(event) => {
          setPasted(event.target.value);
        }}
      />
      <small>It takes the place of the game on this device, which is kept as the copy below.</small>
      <button
        type="button"
        className="btn ghost"
        disabled={pasted.trim() === ''}
        onClick={() => {
          onLoad(pasted);
          setPasted('');
        }}
      >
        Load this save
      </button>
    </div>
  );
}

/**
 * The save as something you can hold: copy it out, load one back in, and the copy the game
 * keeps of the last save that was replaced, updated from an older version or couldn't be read.
 */
export function SaveData({ saves, canLoad }: SaveDataProps) {
  const { status, shown, copyOut, setStatus } = useCopyOut();
  const current = saves.exportSave();
  const kept = saves.keptCopy();
  const load = (raw: string) => {
    setStatus(saves.importSave(raw) ?? 'Loaded. Continue from the title screen.');
  };
  return (
    <section className="settings save-data" aria-label="Save data">
      <h3 className="settings-heading">Save data</h3>
      <p className="save-note">
        Your game is saved on this device after every move. Copy it out to keep it somewhere else or
        to carry it to another device.
      </p>
      <button
        type="button"
        className="btn ghost"
        disabled={current === null}
        onClick={() => {
          copyOut(current);
        }}
      >
        Copy my save
      </button>
      {canLoad && <LoadSave onLoad={load} />}
      {kept !== null && (
        <div className="save-kept">
          <p className="save-note">
            A copy of an earlier save is kept here: the last one that was replaced, updated by a new
            version or couldn’t be read.
          </p>
          <div className="row-buttons">
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                copyOut(kept);
              }}
            >
              Copy the kept save
            </button>
            {canLoad && (
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  load(kept);
                }}
              >
                Bring it back
              </button>
            )}
          </div>
        </div>
      )}
      {status && (
        <p className="save-status" role="status">
          {status}
        </p>
      )}
      {shown !== null && (
        <textarea className="save-shown" aria-label="Save text" rows={4} readOnly value={shown} />
      )}
    </section>
  );
}

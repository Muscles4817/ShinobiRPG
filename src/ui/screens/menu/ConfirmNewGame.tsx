import type { SaveSummary } from '@/game';

/** Starting over replaces the save, so it asks first when there is one. */
export function ConfirmNewGame({
  save,
  onNewGame,
  onKeep,
}: {
  readonly save: SaveSummary;
  readonly onNewGame: () => void;
  readonly onKeep: () => void;
}) {
  return (
    <div className="menu-confirm" role="group" aria-label="Start over?">
      <p>A new game replaces {save.name}’s save.</p>
      <div className="row-buttons">
        <button type="button" className="btn danger" onClick={onNewGame}>
          Start over
        </button>
        <button type="button" className="btn ghost" onClick={onKeep}>
          Keep {save.name}
        </button>
      </div>
    </div>
  );
}

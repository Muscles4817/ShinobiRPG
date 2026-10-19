import type { SaveSummary } from '@/game';

import { Portrait } from '../../art/Portrait';

/** Your saved game on the desktop menu: your face, who you are, and where and when you stopped. */
export function SaveCard({ save }: { readonly save: SaveSummary }) {
  return (
    <div className="save-card">
      <Portrait appearance={save.appearance} size={64} framing="face" />
      <div className="save-card-words">
        <b>{save.name}</b>
        <span>
          {save.rank} in {save.place}
        </span>
        <span>
          Day {save.day}, {save.slot.toLowerCase()}
        </span>
      </div>
    </div>
  );
}

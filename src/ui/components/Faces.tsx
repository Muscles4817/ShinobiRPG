import type { PersonFace } from '@/game';

import { Portrait } from '../art/Portrait';

const MAX_FACES = 4;

/** A small stack of faces: who is at a place right now. Team members get a lantern ring. */
export function Faces({ faces }: { readonly faces: readonly PersonFace[] }) {
  if (faces.length === 0) return null;
  const shown = faces.slice(0, MAX_FACES);
  const extra = faces.length - shown.length;
  return (
    <span className="faces" aria-label={`${faces.length} here`}>
      {shown.map((f) => (
        <span key={f.id} className={f.relation ? 'face team' : 'face'}>
          <Portrait appearance={f.appearance} size={24} framing="face" />
        </span>
      ))}
      {extra > 0 && <span className="face more">+{extra}</span>}
    </span>
  );
}

interface AvatarProps {
  readonly face: PersonFace;
  readonly size: number;
}

/** One round face, ringed when they are on your team. */
export function Avatar({ face, size }: AvatarProps) {
  return (
    <span className={face.relation ? 'avatar team' : 'avatar'}>
      <Portrait appearance={face.appearance} size={size} framing="face" />
    </span>
  );
}

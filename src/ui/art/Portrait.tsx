import { memo, useId } from 'react';

import type { Look } from '@/game';

import { InkBust } from './portrait/InkBust';
import { Shadow } from './portrait/Shadow';

/**
 * Someone's portrait, drawn from their `Look`. Where there is room it is a bust in ink on paper
 * (`InkBust`); where a face would be the size of a thumb it is their lantern shadow (`Shadow`),
 * because a silhouette holds up small and a face doesn't. Used for the player and everyone
 * they meet.
 */

/** Narrower than this, a bust's lines turn to noise, so the shadow is drawn. */
const INK_FROM = 64;

interface PortraitProps {
  readonly appearance: Look;
  readonly size?: number;
  /** A bust shows the shoulders; a face is square, for avatars, and always a shadow. */
  readonly framing?: 'bust' | 'face';
}

function PortraitDrawing({ appearance, size = 80, framing = 'bust' }: PortraitProps) {
  const uid = `pt${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  if (framing === 'face' || size < INK_FROM)
    return <Shadow uid={uid} look={appearance} size={size} />;
  return <InkBust uid={uid} look={appearance} size={size} />;
}

/** A look is rebuilt by every view, so compare what it says, not which object it is. */
function sameDrawing(a: PortraitProps, b: PortraitProps): boolean {
  return (
    a.size === b.size &&
    a.framing === b.framing &&
    JSON.stringify(a.appearance) === JSON.stringify(b.appearance)
  );
}

export const Portrait = memo(PortraitDrawing, sameDrawing);

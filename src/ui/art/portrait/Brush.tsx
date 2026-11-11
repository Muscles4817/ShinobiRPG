import { brushPath, type BrushStroke, type Point } from './brush';
import { INK } from './ink';

interface BrushProps extends BrushStroke {
  readonly pts: readonly Point[];
  readonly colour?: string;
  readonly opacity?: number;
}

/** One brush line, inked unless given a colour. */
export function Brush({ pts, colour = INK, opacity, ...stroke }: BrushProps) {
  return <path d={brushPath(pts, stroke)} fill={colour} opacity={opacity} />;
}

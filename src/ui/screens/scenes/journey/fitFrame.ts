import type { MapFrame } from '@/game';

/**
 * The part of the map a journey shows, widened to the shape of the pane it fills: the road's
 * frame grows around its middle until it matches, and is kept on the map where it fits.
 */
export function fitFrame(
  frame: MapFrame,
  aspect: number,
  map: { readonly width: number; readonly height: number },
): MapFrame {
  if (!(aspect > 0)) return frame;
  const width = Math.max(frame.width, frame.height * aspect);
  const height = width / aspect;
  const place = (start: number, span: number, grown: number, size: number) => {
    const middle = start + span / 2 - grown / 2;
    return grown >= size ? (size - grown) / 2 : Math.min(Math.max(middle, 0), size - grown);
  };
  return {
    x: place(frame.x, frame.width, width, map.width),
    y: place(frame.y, frame.height, height, map.height),
    width,
    height,
  };
}

import type { ContentPack } from './types';

/**
 * Dust kinds: none is scattered by the same thing twice or held by the same ground twice
 * (grades and gift strengths are held to their range by type).
 */
export function validateDusts(pack: ContentPack): string[] {
  return pack.dusts.flatMap((d) => [
    ...(new Set(d.banes).size === d.banes.length ? [] : [`dust "${d.id}" names a bane twice`]),
    ...(new Set(d.drawnOn).size === d.drawnOn.length
      ? []
      : [`dust "${d.id}" names a ground twice`]),
  ]);
}

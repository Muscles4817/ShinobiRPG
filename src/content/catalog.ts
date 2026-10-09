import type { Identified } from './types';

/** Read-only, id-indexed collection of content definitions. */
export interface Catalog<T extends Identified> {
  readonly all: readonly T[];
  get(id: string): T | undefined;
  /** Like `get`, but throws for unknown ids. Use only for ids validated by `validateContent`. */
  require(id: string): T;
}

export function createCatalog<T extends Identified>(kind: string, items: readonly T[]): Catalog<T> {
  const byId = new Map(items.map((item) => [item.id, item]));
  return {
    all: items,
    get: (id) => byId.get(id),
    require: (id) => {
      const item = byId.get(id);
      if (!item) throw new Error(`Unknown ${kind} id "${id}"`);
      return item;
    },
  };
}

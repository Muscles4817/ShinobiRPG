/**
 * The field book's pages and what filling each one leaves you: a piece for the house (never
 * sold, never a friend's gift) and a keepsake for the shelf. The pages themselves are read from
 * the pack's wild places, recipes, night sights and foes.
 */

export const FIELD_BOOK_PAGES = ['fish', 'finds', 'recipes', 'sights', 'foes', 'places'] as const;
export type FieldBookPage = (typeof FIELD_BOOK_PAGES)[number];

export interface PageReward {
  /** A furnishing with no cost, handed over when the page is full. */
  readonly furnishingId?: string;
  readonly keepsake: { readonly name: string; readonly line: string };
}

export type FieldBookRewards = Readonly<Record<FieldBookPage, PageReward>>;

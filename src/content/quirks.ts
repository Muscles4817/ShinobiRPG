/** Habits people notice (`shared/quirks.ts`), and what each does to how people take to you. */

/**
 * A small habit people notice (`docs/design/creation-plan.md`). It changes nothing in a fight:
 * people with these traits warm to you faster, or more slowly, than they otherwise would.
 */
export interface QuirkDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** Traits whose people warm to you faster for it. */
  readonly warms: readonly string[];
  /** Traits whose people warm to you more slowly for it. */
  readonly cools: readonly string[];
}

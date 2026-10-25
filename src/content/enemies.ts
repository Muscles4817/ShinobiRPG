import type { BodySize, CombatForm, CombatGrammar, CombatTrait } from '@/systems/combat';
import type { Danger } from '@/systems/missions';
import type { StatDelta } from '@/systems/stats';
import type { Element } from '@/systems/techniques';

import type { CarriedKit } from './carried';
import type { RetinueEntry, RetinueTell } from './companions';
import type { FoeSummon } from './contracts';

/**
 * A foe, as a pack writes one: who they are in the story, how dangerous, their stat line and
 * body, what they fight with, and who fights beside them.
 */

/** How a fight's story speaks of a foe: a person's pronouns, or "it" for a creature. */
export type FoePronouns = Exclude<CombatGrammar, 'you'>;

export interface EnemyDef {
  readonly id: string;
  readonly name: string;
  /**
   * A foe with a name of their own (a rogue called Ren) is told by it; any other is "the
   * bandit thug" in a fight's story, from `noun` or the name in lower case.
   */
  readonly proper?: boolean;
  /** The common noun when the name in lower case won't do: "Reikon macaque". */
  readonly noun?: string;
  /** How the story speaks of them; creatures are "it", people he or she by their id. */
  readonly pronouns?: FoePronouns;
  readonly description: string;
  /** Short tag shown on the enemy's banner in a fight, e.g. "Spirit", "Beast". */
  readonly kind: string;
  /**
   * What the fight's story makes of them when "it" and the spirit trait don't say: a `swarm`
   * stings. Words only, like `blow`: what their plain strike is called when their form's word
   * (a beast's bite) is wrong, such as a boar's "tusk".
   */
  readonly form?: CombatForm;
  readonly blow?: string;
  /** Who may be sent against them (`Danger`); validated against their strength. */
  readonly danger: Danger;
  readonly baseStat: number;
  readonly statBonuses: StatDelta;
  /** A body bigger than a human's (`rules/size.ts`), for a person of a big clan; human when absent. */
  readonly size?: BodySize;
  /**
   * Health as a multiple of a human's 100: a giant beast more, a small creature less.
   * Humans leave it out (1).
   */
  readonly healthScale?: number;
  readonly maxChakra: number;
  readonly techniqueIds: readonly string[];
  /** Elemental nature, for matchups; most enemies have none. */
  readonly nature?: Element;
  /** How they fight: archer, brawler, illusionist… Every fight style honours these. */
  readonly traits?: readonly CombatTrait[];
  /** Ingredients a beaten foe leaves (a beast's meat), one of each, into your pack. */
  readonly drops?: readonly string[];
  /**
   * The gear they fight in and the tools in their pouch (`CarriedKit`, validated like an
   * arsenal's): a samurai's armour, a cutpurse's smoke bombs. Left out, armed as their kit.
   */
  readonly carries?: CarriedKit;
  /** Bodies that fight beside them (`docs/design/retinue-plan.md`): a hound at heel. */
  readonly retinue?: readonly RetinueEntry[];
  /** Summons they can call into the fight, from a contract of the pack. */
  readonly summons?: readonly FoeSummon[];
  /** A full hive of a pack strain in their body; `hidden` from a glance unless told otherwise. */
  readonly hive?: { readonly strainId: string; readonly tell?: RetinueTell };
  /**
   * A full store of a kind of dust; `open` (a gourd on the back) unless told otherwise. A
   * `shield` rises from it on its own against a hit: a gift of where their power came from (a
   * bound spirit, a beast), never of the dust (`rules/shield.ts`).
   */
  readonly dust?: {
    readonly dustId: string;
    readonly tell?: RetinueTell;
    readonly shield?: true;
    /** What their vessel holds, when not the kind's ordinary `carried`. */
    readonly vessel?: number;
  };
}

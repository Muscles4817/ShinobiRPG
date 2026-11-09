import type { CombatTrait } from '@/systems/combat';
import type { Stats } from '@/systems/stats';

/**
 * Puppets: bodies built, never bound (`docs/design/sunagakure-plan.md`). A puppeteer unseals one
 * from a scroll with its own technique (a `summon` effect naming the puppet) and works it on
 * chakra threads, paying for them every exchange; it fights in the front row and drops when its
 * maker falls. In a fight it is a call like a summon's, but nothing answers: there is no
 * contract, no clan and no blood. Only an arsenal carries one for now (`PersonArsenal.puppets`).
 */
export interface PuppetDef {
  /** The call id its technique names. */
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** The unsealing technique (a `summon` effect naming this id). */
  readonly techniqueId: string;
  /** How it moves and strikes in its maker's hands. */
  readonly stats: Stats;
  /** Health as a multiple of a human's 100 (wood and steel are tougher than flesh). */
  readonly healthScale: number;
  /** The chakra its maker loads into it for its own techniques. */
  readonly maxChakra: number;
  readonly traits?: readonly CombatTrait[];
  /** What it fights with: its hidden blades and mechanisms, techniques of the pack. */
  readonly techniqueIds: readonly string[];
  /** Chakra its maker pays every exchange to keep the threads on it. */
  readonly upkeep: number;
  /** Its maker fights from inside it (a shell): it takes the blows aimed at them while it stands. */
  readonly worn?: true;
  /** A dust it carries and commands (a `DustDef` id): a human puppet that kept its art. */
  readonly dust?: string;
}

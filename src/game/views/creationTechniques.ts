import type { StatGrade } from '@/systems/stats';
import { DISCIPLINES, type Discipline } from '@/systems/techniques';

import type { GameContext } from '../context';
import type { CreationDraft } from '../creation';
import {
  chosenTechniques,
  creationBasics,
  techniqueOffer,
  techniquePicks,
} from '../creationTechniques';

/**
 * The academy file's page of what you were taught: the basics every graduate leaves with, then
 * the techniques your grades let you choose from, by art, with how many your standing allows.
 */

export interface TaughtCard {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly discipline: Discipline;
  readonly rank: StatGrade;
  /** One of the clan's own arts. */
  readonly fromClan: boolean;
  readonly selected: boolean;
}

export interface TechniquesPage {
  /** How many may be chosen beyond the basics. */
  readonly picks: number;
  readonly chosen: number;
  readonly allowance: string;
  readonly basics: readonly TaughtCard[];
  readonly groups: readonly {
    readonly discipline: Discipline;
    readonly cards: readonly TaughtCard[];
  }[];
}

const COUNT = ['no', 'one', 'two', 'three', 'four'] as const;

function allowanceLine(picks: number, offered: number): string {
  if (offered === 0) return 'Your grades don’t carry anything past the basics yet.';
  const n = Math.min(picks, offered);
  const word = COUNT[n] ?? String(n);
  return `Your standing let you learn ${word} technique${n === 1 ? '' : 's'} beyond the basics. Pick what you trained.`;
}

/** The page for a draft as it stands. */
export function techniquesPage(draft: CreationDraft, ctx: GameContext): TechniquesPage {
  const chosen = new Set(chosenTechniques(draft, ctx));
  const card = (id: string): TaughtCard | null => {
    const def = ctx.content.techniques.get(id);
    if (!def) return null;
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      discipline: def.discipline,
      rank: def.rank,
      fromClan: def.clan !== undefined,
      selected: chosen.has(def.id),
    };
  };
  const offer = techniqueOffer(draft, ctx).flatMap((def) => card(def.id) ?? []);
  const picks = techniquePicks(draft);
  return {
    picks,
    chosen: offer.filter((c) => c.selected).length,
    allowance: allowanceLine(picks, offer.length),
    basics: creationBasics(draft, ctx).flatMap((id) => card(id) ?? []),
    groups: DISCIPLINES.map((discipline) => ({
      discipline,
      cards: offer.filter((c) => c.discipline === discipline),
    })).filter((g) => g.cards.length > 0),
  };
}

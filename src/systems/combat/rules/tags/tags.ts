import type { Delivery, Execution, Landing, TechniqueTags, Tell } from '@/systems/techniques';

import type { CombatTechnique } from '../../contract';
import { readDelivery } from './delivery';
import { readAnswers, readCatches, readLandings, readNeeds, readShape } from './landing';

/**
 * A technique's tags (`systems/techniques/tags.ts`): read from what it already has, then laid
 * under what was written by hand on it (`TechniqueDef.tags`: each axis given replaces the
 * reading). Ask `tagsOf`, never read `tags` off a technique directly. `readingOf` also says
 * whether the reading was sure of how the technique reaches, for the list of guesses to settle.
 */

type Tech = Pick<
  CombatTechnique,
  'discipline' | 'effects' | 'reach' | 'element' | 'moulded' | 'rank' | 'lethal' | 'tags'
> & { readonly description?: string };

/** Arts worked with the hands alone, never with signs. */
const SIGNLESS_DELIVERIES: ReadonlySet<Delivery> = new Set([
  'strike',
  'charge',
  'grapple',
  'weapon',
  'touch',
  'eye-contact',
  'self',
]);

const LOUD: ReadonlySet<Landing> = new Set(['blast', 'crushed']);

function tellOf(t: Tech, delivery: Delivery, lands: readonly Landing[]): Tell {
  const area = t.effects.find((e) => e.verb === 'area');
  const big = area?.verb === 'area' && (area.size === 'wide' || area.size === 'vast');
  if (big || lands.some((l) => LOUD.has(l)) || delivery === 'charge') return 'loud';
  if (t.discipline === 'genjutsu' || delivery === 'touch' || delivery === 'self') return 'quiet';
  return 'plain';
}

function executionOf(t: Tech, delivery: Delivery, lands: readonly Landing[]): Execution {
  const bodyArt = t.discipline === 'taijutsu' || t.discipline === 'kenjutsu';
  const handSigns = !bodyArt && !SIGNLESS_DELIVERIES.has(delivery);
  const channelled = t.effects.some((e) => e.verb === 'pin' && e.channelled === true);
  const held = lands.includes('mirrored') || lands.includes('dreaming');
  return {
    handSigns,
    tell: tellOf(t, delivery, lands),
    ...(channelled ? { channelled: true as const } : {}),
    ...(held && !channelled ? { held: true as const } : {}),
    ...(delivery === 'charge' ? { opensUser: true as const } : {}),
  };
}

export interface TagReading {
  readonly tags: TechniqueTags;
  /** Whether how it reaches was read from what it says, rather than guessed from its art. */
  readonly sure: boolean;
  /** Whether a person wrote any of its tags by hand. */
  readonly written: boolean;
}

/** A technique's tags, and how sure the reading was. */
export function readingOf(t: Tech): TagReading {
  const written = t.tags ?? {};
  const read = readDelivery(t);
  const delivery = written.delivery ?? [read.value];
  const lead = delivery[0] ?? read.value;
  const shape = written.shape ?? readShape(t, lead);
  const lands = written.lands ?? readLandings(t, lead);
  const tags: TechniqueTags = {
    delivery,
    shape,
    needs: written.needs ?? readNeeds(t, lead),
    lands,
    catches: written.catches ?? readCatches(lead, shape, lands),
    answeredBy: written.answeredBy ?? readAnswers(t, lead, lands),
    execution: { ...executionOf(t, lead, lands), ...written.execution },
  };
  return { tags, sure: read.sure || written.delivery !== undefined, written: t.tags !== undefined };
}

/** A technique's tags. */
export function tagsOf(t: Tech): TechniqueTags {
  return readingOf(t).tags;
}

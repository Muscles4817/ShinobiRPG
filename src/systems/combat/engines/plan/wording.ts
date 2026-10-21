import { listed } from '@/core';
import type { TechniqueEffect, Verb } from '@/systems/techniques';

import type { CombatItem, CombatItemEffect, CombatTechnique } from '../../contract';
import { effortOf } from './effort';
import { styleMoves } from './repertoire';
import { shapeOf, type CombatGear } from '../../gearContract';
import { COMMIT_BREATH } from '../../rules/commitment';
import { DISPEL_CHAKRA } from '../../rules/conditions';
import { isDefenceCard, type Card, type DefenceCard } from './cards';
import type { PlanFighter } from './state';

/** What the card table and the telegraphs call each card, and what it says it does. */

const TOOL_DOES: Readonly<Record<CombatItemEffect, string>> = {
  smoke: 'Vanish until you attack',
  flash: 'Reveal hidden foes',
  blast: 'Seal blast through armour',
  chakra: 'Restore chakra',
  heal: 'Restore health',
  clarity: 'Clear confusion',
};

/** A tool card's detail: how many are left and what it does. */
function toolDetail(item: CombatItem): string {
  return `${TOOL_DOES[item.effect]} (×${item.count} left)`;
}

const VERB_WORD: Readonly<Record<Verb, string>> = {
  damage: 'Attack',
  daze: 'Daze',
  seal: 'Seal',
  heal: 'Heal when hurt',
  area: 'Hit every foe',
  confuse: 'Confuse',
  conceal: 'Vanish until you attack',
  sense: 'Find the hidden, read every card',
  break: 'Smash through a guard',
  field: 'Blind foes in a field',
  move: 'Go straight to where you fight best',
  substitute: 'Always ready, swaps you out of a hit once a round',
  empower: 'Push past your limits, at a price',
  clone: 'Clones take hits for you',
  trap: 'Set a trap where you stand',
  knock: 'Throw them to another distance',
  pin: 'Pin them where they stand',
  drain: 'Drain their chakra',
  afflict: 'Leave a wound that lingers',
  counter: 'Answer the next blow at once',
  summon: 'Call a summon to fight beside you',
  shroud: 'Cast armour over yourself; it costs chakra while it holds',
};

/** One effect in words; a move that names its distance says so. */
function effectWords(effect: TechniqueEffect): string {
  if (effect.verb === 'move' && effect.to) return `Go straight to ${effect.to} range`;
  if (effect.verb === 'knock') {
    return effect.to === 'close' ? 'Drag them in close' : `Throw them to ${effect.to} range`;
  }
  return VERB_WORD[effect.verb];
}

/** What a technique does, in words: "Attack", or "Attack, then daze" for several effects. */
function techniqueWords(technique: CombatTechnique): string {
  const [first, ...rest] = technique.effects.map(effectWords);
  return [first, ...rest.map((w) => w.toLowerCase())].join(', then ');
}

interface Armed {
  readonly gear?: CombatGear;
}

interface Words {
  readonly label: string;
  readonly detail: string;
}

/**
 * The strike and kunai cards as the fighter's weapons make them: a blade's cut, knuckles'
 * heavy blow, senbon from a needle case.
 */
function armsWords(kind: 'strike' | 'throw', { gear }: Armed): Words {
  if (kind === 'throw') {
    return gear?.thrown && shapeOf(gear.thrown) === 'senbon'
      ? { label: 'Senbon', detail: 'Attack, may daze, no chakra' }
      : { label: 'Kunai', detail: 'Attack, no chakra' };
  }
  const held = gear?.held && shapeOf(gear.held);
  if (held === 'blade') return { label: 'Cut', detail: 'Cut with your blade, kenjutsu' };
  if (held === 'blunt') return { label: 'Strike', detail: 'Weapon blow, kenjutsu' };
  if (held === 'knuckles') return { label: 'Strike', detail: 'Heavy blow, partly through a guard' };
  return { label: 'Strike', detail: 'Attack, no chakra' };
}

export function cardLabel(card: Card, fighter: Armed): string {
  switch (card.kind) {
    case 'strike':
    case 'throw':
      return armsWords(card.kind, fighter).label;
    case 'step':
      return card.direction === 'in' ? 'Close in' : 'Back off';
    case 'guard':
      return 'Guard';
    case 'dodge':
      return 'Dodge';
    case 'counter':
      return 'Counter';
    case 'evade':
      return 'Evade';
    case 'brace':
      return 'Brace';
    case 'search':
      return 'Search';
    case 'gather':
      return 'Gather';
    case 'dispel':
      return 'Dispel';
    case 'jutsu':
      return card.technique.name;
    case 'item':
      return card.item.name;
  }
}

/** What each defence does, as its card says. */
const DEFENCE_DETAIL: Readonly<Record<DefenceCard['kind'], string>> = {
  guard: 'Always ready, takes the edge off every hit',
  dodge: 'Always ready, may slip any hit',
  counter: 'Always ready, hits back up close',
  evade: `Spend the turn keeping clear of everything, ${COMMIT_BREATH.evade} breath`,
  brace: `Spend the turn standing firm against blows and holds, ${COMMIT_BREATH.brace} breath`,
};

export function cardDetail(card: Card, fighter: PlanFighter): string {
  if (isDefenceCard(card)) return DEFENCE_DETAIL[card.kind];
  switch (card.kind) {
    case 'strike':
      return styleWords(fighter) ?? armsWords(card.kind, fighter).detail;
    case 'throw':
      return armsWords(card.kind, fighter).detail;
    case 'step':
      return card.direction === 'in' ? 'Try to get closer' : 'Try to open distance';
    case 'search':
      return 'Find hidden foes, perception';
    case 'gather':
      return 'Spend the turn drawing chakra and breath back, open until your next turn';
    case 'dispel':
      return `Break illusions, ${DISPEL_CHAKRA} chakra`;
    case 'jutsu':
      return `${techniqueWords(card.technique)}, ${effortWords(fighter, card.technique)}${card.technique.oncePerFight ? ', once per fight' : ''}${card.technique.unstable ? ', unstable' : ''}`;
    case 'item':
      return toolDetail(card.item);
  }
}

/** What a technique costs, in words: so much chakra, or so much breath for a body move. */
function effortWords(fighter: PlanFighter, technique: CombatTechnique): string {
  const { pool, amount } = effortOf(fighter, technique);
  return `${amount} ${pool}`;
}

/** A strike that plays from your style says which moves: the one that suits the moment. */
function styleWords(fighter: PlanFighter): string | null {
  const moves = styleMoves(fighter);
  if (moves.length === 0) return null;
  return `One of your moves as the moment suits: ${listed(moves.map((t) => t.name))}`;
}

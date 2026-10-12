import type { TechniqueEffect, Verb } from '@/systems/techniques';

import type { CombatItem, CombatItemEffect, CombatTechnique } from '../../contract';
import type { CombatGear } from '../../gearContract';
import { chakraCost } from '../../rules/body';
import { DISPEL_CHAKRA } from '../../rules/conditions';
import type { Card } from './cards';
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
  substitute: 'Reacts, swaps you out of a hit once a round',
  empower: 'Push past your limits, at a price',
  clone: 'Clones take hits for you',
  trap: 'Set a trap where you stand',
};

/** One effect in words; a move that names its distance says so. */
function effectWords(effect: TechniqueEffect): string {
  if (effect.verb === 'move' && effect.to) return `Go straight to ${effect.to} range`;
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
    return gear?.thrown?.shape === 'senbon'
      ? { label: 'Senbon', detail: 'Attack, may daze, no chakra' }
      : { label: 'Kunai', detail: 'Attack, no chakra' };
  }
  if (gear?.held?.shape === 'blade')
    return { label: 'Cut', detail: 'Cut with your blade, kenjutsu' };
  if (gear?.held?.shape === 'knuckles') {
    return { label: 'Strike', detail: 'Heavy blow, partly through a guard' };
  }
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
    case 'search':
      return 'Search';
    case 'dispel':
      return 'Dispel';
    case 'jutsu':
      return card.technique.name;
    case 'item':
      return card.item.name;
  }
}

export function cardDetail(card: Card, fighter: PlanFighter): string {
  switch (card.kind) {
    case 'strike':
    case 'throw':
      return armsWords(card.kind, fighter).detail;
    case 'step':
      return card.direction === 'in' ? 'Try to get closer' : 'Try to open distance';
    case 'guard':
      return 'Reacts, take less damage';
    case 'dodge':
      return 'Reacts, may avoid a hit';
    case 'counter':
      return 'Reacts, hit back up close';
    case 'search':
      return 'Find hidden foes, perception';
    case 'dispel':
      return `Break illusions, ${DISPEL_CHAKRA} chakra`;
    case 'jutsu':
      return `${techniqueWords(card.technique)}, ${chakraCost(fighter, card.technique)} chakra${card.technique.oncePerFight ? ', once per fight' : ''}${card.technique.unstable ? ', unstable' : ''}`;
    case 'item':
      return toolDetail(card.item);
  }
}

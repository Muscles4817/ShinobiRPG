import { glossaryEntry, type GlossaryEntry } from './fightGlossaryTypes';

/**
 * The fight glossary's entries for the cards of a plan: the defences kept ready, the actions
 * slotted, and the footwork and distance settings. No numbers: the sentences say what a rule does
 * in words, as the card table's own wording does.
 */

const defence = (name: string, rule: string, counter: string) =>
  glossaryEntry('defences', name, rule, counter);
const action = (name: string, rule: string, counter: string) =>
  glossaryEntry('actions', name, rule, counter);
const footwork = (name: string, rule: string, counter: string) =>
  glossaryEntry('footwork', name, rule, counter);

export const CARD_ENTRIES: readonly GlossaryEntry[] = [
  defence(
    'Guard',
    'Kept ready at a distance, it takes no slot and takes the edge off every physical hit, far more than an unready body.',
    'A break goes through it, and a wide area beats a plain Guard.',
  ),
  defence(
    'Dodge',
    'Kept ready at a distance, it takes no slot and may slip any hit, many more than an unready body.',
    'Areas are hard to get clear of, sure techniques are hard to slip, and a far faster body outpaces it.',
  ),
  defence(
    'Counter',
    'Kept ready at a distance, it takes no slot and hits back at blows up close.',
    'Attack from further off or with a technique; a foe who has seen it holds their blows back.',
  ),
  defence(
    'Substitution',
    'Kept ready at a distance, it swaps its user out of one hit a round; a spinning one turns aside every hit and hold it meets, for chakra each time.',
    'Hit again once the swap is spent; illusions and an empty tank get past a spin.',
  ),
  defence(
    'Evade',
    'An action: spend the turn keeping clear of everything until your next turn, paid in breath.',
    'A vast area cannot be outrun; otherwise let them spend their breath on it, since a fighter who only evades loses to an equal, slowly.',
  ),
  defence(
    'Brace',
    'An action: spend the turn standing firm until your next turn, guarding blows far harder and shrugging off pins, dazes and knocks more often, paid in breath.',
    'A break goes through it, and it guards only physical blows.',
  ),
  action(
    'Strike',
    'A blow or cut in your style, the move that suits the moment, paid in breath rather than chakra.',
    'A Guard softens it, a Dodge slips it, and a ready Counter hits back.',
  ),
  action(
    'Throw',
    'Kunai or other thrown steel, aimed by perception, reaching further than a blow.',
    'Armour stops small steel, and a quick body slips it.',
  ),
  action(
    'Technique',
    'One of your jutsu, paid in chakra (or breath for a body move), as its card reads.',
    'Each has its own answer: an element it yields to, a defence it cannot get past.',
  ),
  action(
    'Tool',
    'Something from your pouch, used up as it is played.',
    'Pack the pouch before the fight: what is spent is gone.',
  ),
  action(
    'Search',
    'Look for hidden foes with perception and wits, more surely with every glimpse of them.',
    'A hider slips back into hiding after a while, so strike once they are found.',
  ),
  action(
    'Dispel',
    'Break illusions with chakra control and willpower, for a little chakra.',
    'An illusionist far your better may hold on; then Search instead.',
  ),
  action(
    'Gather',
    'Spend the turn drawing back a share of chakra and breath, open until your next turn: you slip far less and only a Guard comes up.',
    'Hit someone gathering hard while they are open.',
  ),
  footwork(
    'Distance',
    'Each pair of fighters stands close, at mid range or far apart, and every card works at some distances and not others.',
    'Set cards for every distance, and say where you would rather fight.',
  ),
  footwork(
    'Close in',
    'A step towards the foe: it costs the turn and leaves no Guard or Counter that exchange.',
    'A foe holding off fires at whoever steps in on them.',
  ),
  footwork(
    'Back off',
    'A step away, clear of the nearer foes: it costs the turn and leaves no Guard or Counter that exchange.',
    'A foe as quick may keep pace.',
  ),
  footwork(
    'Fight at',
    'Where you would rather fight: you step towards it first, then play what is slotted for that distance.',
    'A foe who wants another distance will fight you for it.',
  ),
  footwork(
    'Hold off',
    'At mid or far range, kunai or a wounding technique kept ready for whoever steps in on you, in place of their step.',
    'Clones running ahead may draw the shot, and an entry technique charges through it as a step does.',
  ),
  footwork(
    'Rows',
    'Each side stands in a front and a back row: blows up close cannot reach the back row while the front stands.',
    'Throws, longer-reaching techniques and areas reach the back row.',
  ),
];

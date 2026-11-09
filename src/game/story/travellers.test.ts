import { CONTENT_PACKS } from '@/content';
import { travellerEventId, type TravellerDef } from '@/systems/missions';
import { act, newGame } from '@/test/gameFixtures';

import { knowsOf } from '../atlas';
import { createGameContext } from '../context';
import { stagePrompt } from '../views/storyChoices';
import { activeStage } from '../missionFlow';
import type { GameState } from '../state';
import { roadEventOn } from './roadEvents';
import { nextMeeting } from './travellers';

/** People of the road: met in order, remembering how it went, and leaving something behind. */

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
const TINKER: TravellerDef = {
  id: 'tinker',
  seen: 'A tinker by the road.',
  regions: ['coast-road'],
  rarity: 'common',
  meetings: [
    {
      text: 'The tinker asks for a hand with a cart.',
      options: [
        {
          label: 'Help',
          tone: 'kind',
          reply: 'You help.',
          remember: 'helped',
          gift: { kind: 'place' },
        },
        { label: 'Walk on', tone: 'quiet', reply: 'You walk on.' },
      ],
    },
    {
      text: 'The tinker is mending a pot.',
      options: [
        {
          label: 'Watch',
          tone: 'curious',
          reply: 'You watch.',
          gift: { kind: 'ingredient', ingredientId: 'wild-ginger' },
        },
      ],
    },
    {
      text: 'The tinker remembers your help.',
      needs: 'helped',
      options: [
        {
          label: 'Learn the dish',
          tone: 'earnest',
          reply: 'You learn it.',
          gift: { kind: 'recipe', recipeId: 'pepper-rice' },
        },
      ],
    },
  ],
};
// Nowhere famous and nothing shut, so there are places on the roads still to hear of.
const unknownWorld = original.locations.map(({ famous: _f, lockedReason: _l, ...l }) => l);
const ctx = createGameContext({
  ...original,
  locations: unknownWorld,
  roadEvents: [],
  travellers: [TINKER],
});
const TINKER_EVENT = travellerEventId(TINKER.id);

/** A jōnin on the coast road, the tinker come up, with what was met and gained `before`. */
function meetTheTinker(before?: GameState): GameState {
  const game = newGame({}, ctx);
  const jonin = { ...game, standing: { ...game.standing, rank: 'jonin' as const } };
  const going = act(jonin, { type: 'travel', locationId: 'port-shiomachi' }, ctx);
  const kept = before
    ? { atlas: before.atlas, inventory: before.inventory, cooking: before.cooking }
    : {};
  return { ...going, ...kept, mission: { ...going.mission!, roadEvent: TINKER_EVENT } };
}

const choose = (state: GameState, optionIndex: number) =>
  act(state, { type: 'missionDecide', optionIndex }, ctx);

const prompt = (state: GameState) => stagePrompt(state, ctx, activeStage(state, ctx)!).prompt;

describe('travellers', () => {
  it('meets you in order, each meeting once, its own words the prompt', () => {
    const first = meetTheTinker();
    expect(prompt(first)).toBe('The tinker asks for a hand with a cart.');
    const helped = choose(first, 0);
    expect(helped.atlas.travellers[TINKER.id]).toEqual({ met: 1, marks: ['helped'] });
    expect(nextMeeting(helped, ctx, TINKER.id)?.meeting.text).toBe('The tinker is mending a pot.');
  });

  it('passes over a meeting that needs what they don’t remember, then is met no more', () => {
    const walkedOn = choose(meetTheTinker(), 1);
    const second = {
      ...walkedOn,
      atlas: { ...walkedOn.atlas, travellers: { tinker: { met: 2, marks: [] } } },
    };
    expect(nextMeeting(second, ctx, TINKER.id)).toBeNull();
    const days = Array.from({ length: 30 }, (_, i) =>
      roadEventOn({ ...meetTheTinker(second), time: { day: i + 1, slot: 0 } }, ctx, {
        region: 'coast-road',
      }),
    );
    expect(days.some((e) => e !== null)).toBe(false);
  });

  it('remembers how it went, and leaves you a place, a find and a recipe', () => {
    const helped = choose(meetTheTinker(), 0);
    const before = meetTheTinker();
    const told = helped.atlas.known.find((id) => !knowsOf(before, ctx, id));
    expect(told).toBeDefined();
    const watched = choose(meetTheTinker(helped), 0);
    expect(watched.inventory.pantry['wild-ginger']).toBe(1);
    const taught = choose(meetTheTinker(watched), 0);
    expect(taught.cooking.known['pepper-rice']).toBeDefined();
    expect(nextMeeting(taught, ctx, TINKER.id)).toBeNull();
  });
});

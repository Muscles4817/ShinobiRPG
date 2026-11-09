import type { TravellerDef } from '@/systems/missions';

/**
 * The road's recurring cast (`docs/design/journeys-plan.md` 3.6), shared by every pack: people
 * who walk the same roads you do and are met on them now and then, meeting by meeting. What you
 * did last time is what they remember (`remember`), and the last meeting with each waits on it.
 */
export const TRAVELLERS: readonly TravellerDef[] = [
  {
    id: 'ozu-the-peddler',
    seen: 'A peddler sits on a milestone by the road with a pack beside them as tall as a child.',
    regions: ['hill-road', 'river-road', 'forest-track', 'coast-road'],
    meetings: [
      {
        text: 'A peddler sits on a milestone with a pack as tall as a child. “Needles, thread, a charm against foxes,” Ozu calls out. “Or the news, if your purse is light.”',
        options: [
          {
            label: 'Ask for the news',
            tone: 'curious',
            reply:
              'Ozu talks for as long as you let them, and somewhere in it is a place you never knew was there.',
            remember: 'asked-the-news',
            gift: { kind: 'place' },
          },
          {
            label: 'Buy a charm against foxes',
            tone: 'kind',
            reply:
              'It is a knot of red string on a bead. Ozu ties it to your pack and swears by it.',
            remember: 'bought-a-charm',
          },
          {
            label: 'Walk on',
            tone: 'quiet',
            reply: '“Another time,” Ozu calls after you, cheerful as anything.',
          },
        ],
      },
      {
        text: 'Ozu again, the pack lighter this time, eating cold rice under a pine. “You! The road is small, and so is the world.”',
        options: [
          {
            label: 'Sit down and share your lunch',
            tone: 'kind',
            reply:
              'You trade half your supper for half of Ozu’s, and a root of ginger that Ozu won’t take back.',
            remember: 'shared-a-meal',
            gift: { kind: 'ingredient', ingredientId: 'wild-ginger' },
          },
          {
            label: 'Ask where Ozu is bound',
            tone: 'curious',
            reply:
              'Ozu names every town from here to the coast and draws the roads in the dust with a stick.',
            gift: { kind: 'place' },
          },
        ],
      },
      {
        text: 'Ozu is waiting at a crossroads as if you had arranged it, with a folded paper held out. “For the one who shared a meal with an old peddler.”',
        needs: 'shared-a-meal',
        options: [
          {
            label: 'Take the folded paper',
            tone: 'earnest',
            reply:
              'It is a recipe in a careful hand, and at the bottom Ozu has drawn a fox, laughing.',
            gift: { kind: 'recipe', recipeId: 'pepper-rice' },
          },
        ],
      },
    ],
  },
  {
    id: 'haru-the-pilgrim',
    seen: 'A pilgrim in a wide straw hat stands where the road forks, reading the stones.',
    regions: ['mountain-pass', 'hill-road', 'forest-track'],
    meetings: [
      {
        text: 'A pilgrim in a wide straw hat stands where the road forks, reading the stones. “The mountain shrine,” Haru asks, “is it this way, or that?”',
        options: [
          {
            label: 'Walk with Haru as far as the shrine road',
            tone: 'kind',
            reply:
              'You walk together for an hour. Haru hardly says a word, and the road goes by quicker for it.',
            effects: [{ kind: 'energy', by: -5 }],
            remember: 'walked-together',
          },
          {
            label: 'Point the way',
            tone: 'earnest',
            reply: 'Haru bows low, and is still bowing when you look back from the bend.',
          },
        ],
      },
      {
        text: 'Haru again, coming down from the shrine. “Shut,” Haru says. “All that way, and shut. The monk said to come back in spring.”',
        options: [
          {
            label: 'Make Haru laugh about it',
            tone: 'joke',
            reply:
              'It takes three tries, but the third one works, and Haru laughs until the hat falls off.',
          },
          {
            label: 'Sit with Haru a while',
            tone: 'quiet',
            reply: 'You sit on the wall together and watch the clouds come over the pass.',
            remember: 'sat-together',
          },
        ],
      },
      {
        text: 'Haru is on the road with a bundle of dried fish and a long story about the monks. “They fed me,” Haru says, “and I watched how. You walked with me, so it is yours too.”',
        needs: 'walked-together',
        options: [
          {
            label: 'Listen and learn it',
            tone: 'curious',
            reply: 'Bones, water, the low fire and a long wait. Haru makes you say it back twice.',
            gift: { kind: 'recipe', recipeId: 'fish-bone-broth' },
          },
        ],
      },
    ],
  },
  {
    id: 'kaede-the-ronin',
    seen: 'A swordsman with no crest on their coat is cutting at the air beside the road.',
    regions: ['hill-road', 'river-road', 'mountain-pass'],
    meetings: [
      {
        text: 'A swordsman with no crest on their coat is cutting at the air beside the road, the same cut over and over. Kaede stops when you come near and waits to see what you will do.',
        options: [
          {
            label: 'Ask for a bout',
            tone: 'challenge',
            reply:
              'Kaede laughs and takes up a stick. You are on your back in the grass before you see the stick move.',
            effects: [{ kind: 'harm', health: 4 }],
            remember: 'asked-for-a-bout',
          },
          {
            label: 'Stop and watch the cut',
            tone: 'curious',
            reply:
              'You watch until you can see where the cut begins, which is somewhere in the feet.',
          },
          {
            label: 'Walk on',
            tone: 'quiet',
            reply: 'Kaede goes back to the cut before you have passed.',
          },
        ],
      },
      {
        text: 'Kaede is sitting on the riverbank with the sword across their knees, looking hungrier than a swordsman should.',
        options: [
          {
            label: 'Share your supper',
            tone: 'kind',
            reply: 'Kaede eats it all and thanks you gravely, as if you had saved a life.',
            remember: 'fed-the-ronin',
          },
          {
            label: 'Tease Kaede about the empty purse',
            tone: 'tease',
            reply: '“Swords are cheap to keep,” Kaede says. “It is the swordsman that costs.”',
          },
        ],
      },
      {
        text: 'Kaede is standing in the middle of the road with the stick from before, grinning. “Again.”',
        needs: 'asked-for-a-bout',
        options: [
          {
            label: 'Take up a stick',
            tone: 'challenge',
            reply:
              'You last longer this time. Afterwards Kaede tells you of a place on the roads where the old blades are buried.',
            effects: [{ kind: 'harm', health: 4 }],
            gift: { kind: 'place' },
          },
          {
            label: 'Bow and say another time',
            tone: 'earnest',
            reply: '“Another time, then,” Kaede says, and steps aside.',
          },
        ],
      },
    ],
  },
  {
    id: 'the-willow-troupe',
    seen: 'A painted cart is stuck in the mud with its wheels sunk to the axle.',
    regions: ['coast-road', 'river-road', 'dune-road'],
    meetings: [
      {
        text: 'A painted cart is stuck in the mud with its wheels sunk to the axle, and the Willow Troupe are arguing round it in their costumes.',
        options: [
          {
            label: 'Put your shoulder to the wheel',
            tone: 'earnest',
            reply:
              'It takes everyone pushing and the troupe’s demon king pulling the ox, but the cart comes free with a sucking sound.',
            effects: [{ kind: 'energy', by: -10 }],
            remember: 'freed-the-cart',
          },
          {
            label: 'Wish them luck and walk on',
            tone: 'quiet',
            reply: 'They wave you off with painted hands and go back to arguing.',
          },
        ],
      },
      {
        text: 'The Willow Troupe have set up their stage at a crossroads, and a crowd of farmers is watching a fox spirit marry a fisherman.',
        options: [
          {
            label: 'Stay for the play',
            tone: 'quiet',
            reply: 'The fox spirit steals the show, and the fisherman forgets his lines twice.',
          },
          {
            label: 'Heckle the fisherman',
            tone: 'tease',
            reply:
              'The crowd roars, the fisherman glares, and the fox spirit works your heckle into the next scene.',
          },
        ],
      },
      {
        text: 'The troupe’s cook waves you over to their fire. “You pushed our cart,” the cook says. “The least we can do is feed you, and the most is teach you.”',
        needs: 'freed-the-cart',
        options: [
          {
            label: 'Sit down at their fire',
            tone: 'kind',
            reply:
              'The pot is hot enough to make your eyes run, and the cook tells you every step while you eat.',
            gift: { kind: 'recipe', recipeId: 'spicy-hot-pot' },
          },
        ],
      },
    ],
  },
];

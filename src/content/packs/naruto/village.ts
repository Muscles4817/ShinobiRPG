import type { VillageLife } from '../../types';
import { ARC_RUMOURS } from './arcs/rumours';

/** Gossip, night sights and festivals of the Hidden Leaf. */
export const VILLAGE: VillageLife = {
  rumours: [
    ...ARC_RUMOURS,
    {
      id: 'tora-again',
      missionId: 'catch-tora',
      text: 'The Daimyō’s wife was seen at the mission desk in tears. Tora has escaped again.',
    },
    {
      id: 'flower-shop',
      missionId: 'yamanaka-weeding',
      text: 'The Yamanaka flower shop is short-handed and the back garden is a jungle.',
    },
    {
      id: 'farm-sickness',
      missionId: 'farm-medicine',
      text: 'Farmers at the outer fields are sick. The hospital is gathering medicine.',
    },
    {
      id: 'tanzaku-merchant',
      missionId: 'merchant-escort',
      text: 'A merchant bound for Tanzaku Town is asking around for a cheap escort.',
    },
    {
      id: 'missing-scrolls',
      missionId: 'stolen-scrolls',
      text: 'Iruka-sensei is counting the practice scrolls again. Some have gone missing.',
    },
    {
      id: 'granary-noises',
      missionId: 'haunted-granary',
      text: 'The night watch heard moaning from the east granary.',
    },
    {
      id: 'border-post',
      missionId: 'border-bandits',
      text: 'The border post sent a runner. Bandits have been testing the fence.',
    },
    {
      id: 'forest-missing-nin',
      missionId: 'missing-nin-forest',
      text: 'Hunters found a campfire in the forest that was put out with a water jutsu.',
    },
    {
      id: 'kakashi-late',
      personId: 'kakashi',
      text: 'Kakashi-sensei was three hours late to a meeting. He said a black cat crossed his path.',
    },
    {
      id: 'guy-laps',
      personId: 'guy',
      text: 'Might Guy did five hundred laps of the village on his hands this morning.',
    },
    {
      id: 'naruto-ramen',
      personId: 'naruto',
      text: 'Naruto ran up a tab at Ichiraku again. Teuchi pretends not to notice.',
    },
    {
      id: 'hinata-training',
      personId: 'hinata',
      text: 'Hinata trains alone by the river at dawn when she thinks nobody is looking.',
    },
    {
      id: 'hokage-paperwork',
      personId: 'hiruzen',
      text: 'The Hokage’s pipe has been going all night. Paperwork, they say.',
    },
    {
      id: 'sand-visitors',
      text: 'Visitors from the Sand have been seen near the gates.',
    },
    {
      id: 'chunin-exams',
      text: 'The jōnin are whispering about the next Chūnin Exams.',
    },
    {
      id: 'ichiraku-new',
      text: 'Ichiraku is trying a new broth. Opinions are strong.',
    },
  ],
  sights: [
    {
      id: 'chakra-trail',
      title: 'A chakra trail',
      text: 'A thread of chakra that isn’t the Leaf’s runs along the outer wall, then up and over it near the east gate.',
      outcome:
        'You follow it to the east gate and report it, and the night guard sends a runner before you have finished describing it.',
      unseen: 'The gate guards are doubled tonight, and nobody will say why.',
      reward: { perception: 1 },
    },
    {
      id: 'monument-figure',
      title: 'Someone on the monument',
      text: 'A figure sits on the Hokage Monument, chakra dimmed almost to nothing.',
      outcome:
        'You climb up and find a jōnin on watch, amused enough at being found to show you how she keeps her chakra so low.',
      unseen:
        'For a moment a shadow on the monument seems to move, but when you look again it is only stone.',
      reward: { chakraControl: 1 },
    },
    {
      id: 'training-ground-ghost',
      title: 'Echoes on the training ground',
      text: 'Chakra still hangs over Training Ground Three, where someone fought hard tonight.',
      outcome:
        'You walk the ground reading the traces like footprints, and by the time they fade you have a fair idea how the fighter moved.',
      unseen: 'Training Ground Three has fresh craters in it that weren’t there this morning.',
      reward: { taijutsu: 1 },
    },
    {
      id: 'genjutsu-veil',
      title: 'A veil over an alley',
      text: 'One alley is wrapped in a thin genjutsu that turns passers-by away.',
      outcome:
        'You see through it and stand at the mouth of the alley working out how it was woven, thread by thread, until it fades.',
      unseen:
        'You take the alley as a shortcut home and come out, without knowing how, where you went in.',
      reward: { genjutsu: 1 },
    },
  ],
  festivals: [
    {
      id: 'drowned-lanterns',
      name: 'Night of Drowned Lanterns',
      description:
        'The harbour ward floats paper lanterns out into the fog for everyone the sea and the Mist have taken. Nobody says whose.',
      season: 1,
      day: 14,
      marketPrices: 0.8,
      bondBonus: 3,
      locationId: 'kirigakure',
      stalls: [
        {
          name: 'Lantern-Night Hot Pots',
          blurb: 'Only on the Night of Drowned Lanterns',
          icon: 'lantern',
          foodIds: ['mist-hot-pot', 'kelp-tea'],
          hours: ['afternoon', 'evening', 'night'],
        },
      ],
    },
    {
      id: 'hanami',
      name: 'Cherry Blossom Viewing',
      description: 'The whole village picnics under the blossoms. The stalls cut their prices.',
      season: 0,
      day: 10,
      marketPrices: 0.7,
      bondBonus: 3,
      stalls: [
        {
          name: 'Blossom Dango Stand',
          blurb: 'Only during hanami',
          icon: 'dango',
          foodIds: ['hanami-dango'],
          hours: ['afternoon', 'evening', 'night'],
        },
      ],
    },
    {
      id: 'summer-fireworks',
      name: 'Summer Fireworks',
      description: 'Fireworks over the Hokage Monument and yukata everywhere.',
      season: 1,
      day: 20,
      marketPrices: 0.8,
      bondBonus: 3,
      stalls: [
        {
          name: 'Riverside Festival Stalls',
          blurb: 'Only on fireworks night',
          icon: 'bowl',
          foodIds: ['takoyaki', 'shaved-ice'],
          hours: ['afternoon', 'evening', 'night'],
        },
      ],
    },
    {
      id: 'founding-day',
      name: 'Founding Day',
      description: 'The Leaf celebrates the day the village was founded, with food for everyone.',
      season: 2,
      day: 10,
      marketPrices: 0.5,
      bondBonus: 4,
      stalls: [
        {
          name: 'Founding Day Yatai',
          blurb: 'Only on Founding Day',
          icon: 'bowl',
          foodIds: ['festival-yakisoba'],
          hours: ['afternoon', 'evening', 'night'],
        },
      ],
    },
    {
      id: 'new-year',
      name: 'New Year’s Eve',
      description: 'Shrine bells ring at midnight and everyone makes a wish.',
      season: 3,
      day: 28,
      marketPrices: 0.8,
      bondBonus: 3,
      stalls: [
        {
          name: 'New Year Soba Stand',
          blurb: 'Only on New Year’s Eve',
          icon: 'bowl',
          foodIds: ['toshikoshi-soba'],
          hours: ['afternoon', 'evening', 'night'],
        },
      ],
    },
  ],
};

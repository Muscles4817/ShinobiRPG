import type { VillageLife } from '../../types';

/** Gossip, night sights and festivals of the Hidden Leaf. */
export const VILLAGE: VillageLife = {
  rumours: [
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
      text: 'A thread of foreign chakra runs along the wall and over it.',
      outcome: 'You follow it to the gate and report it. The night guard looks impressed.',
      unseen: 'The gate guards seem restless tonight.',
      reward: { perception: 1 },
    },
    {
      id: 'monument-figure',
      title: 'Someone on the monument',
      text: 'A figure sits on the Hokage Monument, chakra dimmed almost to nothing.',
      outcome: 'You climb up. It’s a jōnin on watch, who teaches you how she hides her chakra.',
      unseen: 'You think you see something move on the monument. Probably nothing.',
      reward: { chakraControl: 1 },
    },
    {
      id: 'training-ground-ghost',
      title: 'Echoes on the training ground',
      text: 'Chakra still hangs over Training Ground Three, where someone fought hard tonight.',
      outcome: 'You read the traces like footprints and learn a little of how they moved.',
      unseen: 'Training Ground Three is scarred with fresh craters.',
      reward: { taijutsu: 1 },
    },
    {
      id: 'genjutsu-veil',
      title: 'A veil over an alley',
      text: 'One alley is wrapped in a thin genjutsu that turns passers-by away.',
      outcome: 'You see through it and work out how it was woven before it fades.',
      unseen: 'You take a shortcut home and somehow end up back where you started.',
      reward: { genjutsu: 1 },
    },
  ],
  festivals: [
    {
      id: 'hanami',
      name: 'Cherry Blossom Viewing',
      description: 'The whole village picnics under the blossoms. The stalls cut their prices.',
      season: 0,
      day: 10,
      marketPrices: 0.7,
      bondBonus: 3,
    },
    {
      id: 'summer-fireworks',
      name: 'Summer Fireworks',
      description: 'Fireworks over the Hokage Monument and yukata everywhere.',
      season: 1,
      day: 20,
      marketPrices: 0.8,
      bondBonus: 3,
    },
    {
      id: 'founding-day',
      name: 'Founding Day',
      description: 'The Leaf celebrates the day the village was founded, with food for everyone.',
      season: 2,
      day: 10,
      marketPrices: 0.5,
      bondBonus: 4,
    },
    {
      id: 'new-year',
      name: 'New Year’s Eve',
      description: 'Shrine bells ring at midnight and everyone makes a wish.',
      season: 3,
      day: 28,
      marketPrices: 0.8,
      bondBonus: 3,
    },
  ],
};

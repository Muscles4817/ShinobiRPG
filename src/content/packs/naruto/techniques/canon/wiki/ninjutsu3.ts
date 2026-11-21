import type { TechniqueDef } from '@/systems/techniques';

/**
 * Canon ninjutsu techniques for the versus fighters who use them, drafted from Narutopedia's facts (rank,
 * art, element, range and users; `prototypes/narutopedia/`). The effects are a first reading
 * of what the wiki says each does, for review; the descriptions are our own words.
 */
export const WIKI_NINJUTSU3: readonly TechniqueDef[] = [
  {
    id: 'exploding-flame-formation',
    name: 'Fire Style: Exploding Flame Formation',
    description:
      'A palm slaps the ground and a ring of tags erupts into a wall of fire around the target.',
    discipline: 'ninjutsu',
    element: 'fire',
    needs: { nature: 'fire' },
    reach: ['close', 'mid'],
    effects: [
      { verb: 'area', power: 20, size: 'wide' },
      { verb: 'afflict', power: 8, harm: 'burn' },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'flame-bullet',
    name: 'Fire Style: Flame Bullet',
    description:
      'Oil gathered in the mouth is spat out and set alight, a fireball that clings and burns.',
    discipline: 'ninjutsu',
    element: 'fire',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'damage', power: 14 },
      { verb: 'afflict', power: 6, harm: 'burn' },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'great-fire-destruction',
    name: 'Fire Style: Great Fire Destruction',
    description:
      'A torrent of flame pours from the mouth and spreads into a sea of fire that swallows the field.',
    discipline: 'ninjutsu',
    element: 'fire',
    needs: { nature: 'fire' },
    reach: ['close', 'mid', 'far'],
    accuracy: 'wild',
    effects: [
      { verb: 'area', power: 24, size: 'wide' },
      { verb: 'afflict', power: 8, harm: 'burn' },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'hiding-in-ash',
    name: 'Fire Style: Hiding in Ash and Dust',
    description:
      'Burning ash billows out and blankets the field, scorching anyone who breathes it in.',
    discipline: 'ninjutsu',
    element: 'fire',
    needs: { nature: 'fire' },
    reach: ['close', 'mid', 'far'],
    effects: [
      { verb: 'field', power: 14, field: 'smoke' },
      { verb: 'afflict', power: 6, harm: 'burn' },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'phoenix-flower-nail-crimson',
    name: 'Fire Style: Phoenix Sage Flower Nail Crimson',
    description:
      'A spray of shuriken flies wrapped in breathed fire, still burning after they bite.',
    discipline: 'ninjutsu',
    element: 'fire',
    needs: { nature: 'fire' },
    reach: ['close', 'mid'],
    effects: [
      { verb: 'damage', power: 18, hits: 3 },
      { verb: 'afflict', power: 6, harm: 'burn' },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'strange-mask-exploding-flame',
    name: 'Fire Style: Strange Mask Exploding Flame',
    description:
      'Two masked hearts breathe fire and wind together into a roaring blast that water alone cannot quench.',
    discipline: 'ninjutsu',
    element: 'fire',
    needs: { nature: 'fire' },
    reach: ['close', 'mid', 'far'],
    effects: [
      { verb: 'area', power: 20, size: 'wide' },
      { verb: 'afflict', power: 8, harm: 'burn' },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'ten-thousand-snakes',
    name: 'Formation of Ten Thousand Snakes',
    description:
      'A tide of snakes pours from the mouth and buries the target under fangs and hidden blades.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid', 'far'],
    effects: [
      { verb: 'area', power: 18, size: 'wide' },
      { verb: 'afflict', power: 6, harm: 'poison' },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'hair-needle-senbon',
    name: 'Hair Needle Senbon',
    description:
      'Hair hardens into needles and fires in a hail that turns the target into a pincushion.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    effects: [{ verb: 'damage', power: 14, hits: 4 }],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'heavenly-punishment',
    name: 'Heavenly Punishment',
    description:
      'Explosive tags wrapped round the chest go off as the user throws themselves at the enemy.',
    discipline: 'ninjutsu',
    reach: ['close'],
    effects: [{ verb: 'area', power: 20, size: 'small' }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
    oncePerFight: true,
  },
  {
    id: 'kakuan-bliss-hands',
    name: 'Hokage Style: Kakuan Entering Society with Bliss-Bringing Hands',
    description:
      'A palm marked with a wooden sign presses on the foe, and the wild chakra in them goes still.',
    discipline: 'ninjutsu',
    element: 'earth',
    needs: { nature: 'earth' },
    reach: ['close'],
    effects: [{ verb: 'seal', power: 17 }],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'ink-clone',
    name: 'Ink Clone Technique',
    description:
      'Ink drawn up with chakra stands as copies of the user, and spills back to ink when struck.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'clone', power: 8, kind: 'water', strikes: true }],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'ink-mist',
    name: 'Ink Mist Technique',
    description:
      'Chakra-laced ink billows off the body in a black cloud, and the user is gone inside it.',
    discipline: 'ninjutsu',
    effects: [
      { verb: 'field', power: 12, field: 'smoke' },
      { verb: 'conceal', power: 10 },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'iron-sand-world-method',
    name: 'Iron Sand: World Method',
    description:
      'Two black masses of iron sand slam together and burst into a forest of branching spikes.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid', 'far'],
    accuracy: 'wild',
    effects: [{ verb: 'area', power: 28, size: 'wide' }],
    chakraCost: 0,
    dustCost: 40,
    rank: 'S',
    difficulty: 175,
  },
  {
    id: 'jet-booster-jump',
    name: 'Jet Booster Jump',
    description:
      'Jet-like growths burst from the back and blast the body through the air in a sudden bound.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'move', power: 6, to: 'close' }],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'chidori-katana',
    name: 'Kusanagi: Chidori Katana',
    description:
      'Lightning chirps along the sword as a blade of its own, sliding through steel and leaving whoever it pierces numb and twitching.',
    discipline: 'ninjutsu',
    element: 'lightning',
    needs: { nature: 'lightning' },
    reach: ['close'],
    accuracy: 'sure',
    effects: [
      { verb: 'damage', power: 18 },
      { verb: 'daze', power: 8 },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'ash-stone-seal',
    name: 'Lava Style: Ash Stone Seal',
    description:
      'A thick cloud of ash spews from the mouth, wraps the foe and sets hard around them.',
    discipline: 'ninjutsu',
    element: 'fire',
    needs: { nature: 'fire' },
    reach: ['close', 'mid'],
    effects: [{ verb: 'pin', power: 14, channelled: true }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
];

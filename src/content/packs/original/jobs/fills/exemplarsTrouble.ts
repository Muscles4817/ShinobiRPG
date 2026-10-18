import type { MissionFill } from '../../../../missionTemplates';

/** The first fill of each D-rank template that ends with someone or something to face. */
export const EXEMPLARS_TROUBLE: readonly MissionFill[] = [
  {
    id: 'bathhouse-ghost',
    templateId: 'd-minor-haunting',
    values: {
      title: 'The Bathhouse Ghost',
      client: 'Bathhouse Keeper Ume',
      place: 'the old bathhouse on Tallow Lane',
      signs:
        'The baths steam even with the fires out. Wet footprints cross the tiles towards you and stop, and the water murmurs when you lean over it.',
      steeled:
        'You follow the footprints through the steam to the last bath, where the water is ice-cold.',
      shaken:
        'You find yourself out in the lane, dripping, without remembering the door. You go back in and follow the footprints to the coldest bath.',
      ghost:
        'An old man sits in the cold bath, scrubbing his arm raw with a brush, over and over. “Not clean yet,” he mutters. “Not clean yet.”',
      foe: 'storehouse-wraith',
      slipped:
        'You slip past him through the steam and find his old brush wedged behind the boiler. When you lift it out, he looks up at last.',
      ending:
        'Ume says the old man was her grandfather’s first customer, who came every day for fifty years. She hangs a lantern over the cold bath, and by morning the water is warm.',
    },
  },
  {
    id: 'melon-row-raider',
    templateId: 'd-pest-beast',
    values: {
      title: 'Something in the Melon Rows',
      client: 'Farmer Haruno',
      place: 'the melon fields below the east wall',
      damage:
        'Haruno walks you down rows of melons split open and scooped hollow. “Only the ripe ones,” he says. “Every night. It knows.”',
      spoor:
        'Fat round prints in the mud, melon rind trailing towards the bamboo, and a smell like a wet dog that has rolled in a midden.',
      beast:
        'In a hollow in the bamboo, a tanuki the size of a barrel lies on its back on a bed of rinds, belly up, snoring.',
      foe: 'feral-tanuki',
      terrain:
        'Dense bamboo all round, a rind-strewn hollow, and a drainage ditch it surely uses to bolt.',
      ending:
        'Haruno gives you the best melon he has left, and swears at the bamboo for a while in a satisfied sort of way.',
    },
  },
  {
    id: 'incense-thief',
    templateId: 'd-petty-thief',
    values: {
      title: 'The Incense Thief',
      client: 'Incense-maker Shūhei',
      stolen: 'a whole season’s temple incense',
      scene:
        'The drying racks are bare. Whoever took the sticks left the door locked behind them, and a single bootprint dusted with ash on the sill.',
      lead: 'The ash is kiln-ash, and only one place has fresh kiln-ash on its floor, the burnt-out pottery by the river, where somebody has been living.',
      thief:
        'In the old pottery a young man in a scratched-out headband is selling incense by the handful to a queue of nervous pilgrims.',
      foe: 'academy-dropout',
      parley:
        '“The temple charges a fortune for it,” he mutters, handing over the sacks. “I was only selling it cheap.” The pilgrims vanish.',
    },
  },
  {
    id: 'willow-bridge-toll',
    templateId: 'd-toll-gang',
    values: {
      title: 'Toll on the Willow Bridge',
      client: 'The Charcoal Burners',
      crossing: 'the willow bridge on the charcoal road',
      complaint:
        '“Three sacks out of every cart,” the burners’ headman says. “They call it a toll. We call it robbery. The Watch calls it out of their district.”',
      gang: 'A big man in a lacquered breastplate sits on a stool in the middle of the bridge, a crony at his side, with a tally board nailed to the rail.',
      foe: 'bandit-chief',
      crony: 'bandit-thug',
      terrain:
        'A narrow bridge, a stool in the middle, willows trailing in the water both sides, and a weak plank near the far end.',
      parley:
        'The big man looks at you, then at his crony, then pulls the tally board off the rail and throws it in the river.',
      ending:
        'The first cart across is piled with charcoal and children. The driver throws a sack off for you anyway, grinning.',
    },
  },
  {
    id: 'tallow-store-watch',
    templateId: 'd-night-watch',
    values: {
      title: 'Watch over the Tallow Store',
      client: 'Chandler Ibuki',
      post: 'the chandlers’ tallow store before the Festival of Lanterns',
      setup:
        'Every candle for the festival is stacked in Ibuki’s store, and someone tried the lock last night. You sit on a crate by the door as the sun goes down.',
      vigil:
        'The small hours drag. The warm smell of tallow is heavy as a blanket, and the street outside is perfectly quiet.',
      intruder:
        'A figure is filling a sack with candles by the light of a stolen one, humming to himself.',
      foe: 'bandit-thug',
      parley:
        '“All right, all right.” He empties the sack back onto the shelf, one candle at a time. “Just wanted some light at home.”',
      ending:
        'At dawn Ibuki counts every candle twice and finds them all there. He gives you a fat one of your own, smelling of plum blossom.',
    },
  },
];

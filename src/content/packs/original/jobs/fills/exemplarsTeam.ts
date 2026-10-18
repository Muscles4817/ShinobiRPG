import type { MissionFill } from '../../../../missionTemplates';

/** The first fill of each C-rank team template. */
export const EXEMPLARS_TEAM: readonly MissionFill[] = [
  {
    id: 'salt-caravan',
    templateId: 'c-team-caravan',
    values: {
      title: 'The Salt Caravan',
      client: 'The Shiomachi Salt Guild',
      caravan: 'six salt carts and their drovers',
      road: 'the coast road to Port Shiomachi',
      region: 'coast-road',
      departure:
        'The drovers are sullen and the oxen are worse. Your sensei walks at the back of the line. “Watch the carts, not me. I’m not the one they want.”',
      signs:
        'At the cliff bend the gulls have gone quiet, and there are fresh hoofprints that come down to the road and stop.',
      ambush:
        'Three figures rise from the salt grass on the cliff top: a broad man with a club, a skinny one with a bow, and their chief in a stolen guild coat.',
      foe: 'bandit-chief',
      second: 'bandit-thug',
      third: 'bandit-archer',
      ending:
        'The carts roll into Shiomachi at dusk, every sack accounted for. The guild master tosses each of you a twist of salt for luck and charges your sensei for the drinks.',
    },
  },
  {
    id: 'lost-on-the-ash-fells',
    templateId: 'c-team-rescue',
    values: {
      title: 'Lost on the Ash Fells',
      client: 'The Charcoal Burners’ Guild',
      lost: 'a party of four charcoal burners',
      wild: 'the ash fells above the old kilns',
      briefing:
        'They went up for a week’s burning and have been gone for three. Their wives wait at the guild door, and nobody will look at them.',
      trail:
        'The fells are grey on grey. Wind has smoothed the ash flat, and every hollow looks like the one before.',
      threat:
        'The burners are trapped in a collapsed kiln-pit, and a pair of feral tanuki, mad with hunger, dig at the rubble over their heads.',
      foe: 'feral-tanuki',
      second: 'feral-tanuki',
      survivors:
        'The burners are dazed and thin, and one has a leg that bends where no leg should.',
      ending:
        'At the guild door the youngest burner, grey with ash from head to foot, tells his wife he saw the lanterns of the village from the fells every night and knew someone would come.',
    },
  },
  {
    id: 'drowned-bell',
    templateId: 'c-team-haunting',
    values: {
      title: 'The Drowned Bell',
      client: 'The Abbot of Mizukane Temple',
      place: 'the flooded temple below the reservoir',
      dread:
        'When the dam went up, the old temple went under. Now its bell rings beneath the water every night, and the monks who hear it walk into the reservoir. “Stay close,” your sensei says. “Closer than that.”',
      pull: 'The bell tolls under the water, and with every stroke the shore seems a little further away and the water a little warmer.',
      ghosts:
        'On the drowned temple’s roof stand two monks in robes that drip without end, ringing the sunken bell between them with a beam.',
      foe: 'hungry-ghost',
      second: 'hungry-ghost',
      ending:
        'You float lanterns out over the drowned roof, one for every monk the water took. The bell rings once more, softly, and then never again.',
    },
  },
  {
    id: 'kayano-boars',
    templateId: 'c-team-hunt',
    values: {
      title: 'The Boars of Kayano',
      client: 'The Headman of Kayano',
      quarry: 'a sounder of tusked boars',
      village: 'the hill village of Kayano and its harvest',
      harm: 'Half the terraces are churned to mud, a fence is matchwood, and a farmer sits on his doorstep with his arm bound up. “They aren’t afraid of anything,” he says.',
      sign: 'The boars’ trail goes up through the cedar woods, deep and fresh, and there are tusk marks on the trees as high as your shoulder.',
      ground:
        'The sounder beds in a gully with one easy way in. You have the afternoon to turn it into a trap.',
      lair: 'The boars wake in their gully, steaming and snorting, and the biggest lowers its tusks and charges straight at you.',
      foe: 'ash-wood-boar',
      second: 'ash-wood-boar',
      terrain:
        'A steep gully, mud wallows on the floor, cedars on the slopes, and one narrow mouth leading back towards the village.',
      ending:
        'Kayano roasts the biggest boar in the square. The headman makes a speech in which your team grows taller and the boars grow larger with every telling.',
    },
  },
  {
    id: 'paper-mill-hoard',
    templateId: 'c-team-raid',
    values: {
      title: 'The Paper Mill Hoard',
      client: 'The River Magistrate',
      hideout: 'a shuttered paper mill upriver',
      loot: 'the lanterns stolen from the Festival of Lanterns stores',
      briefing:
        '“Every lantern for the festival,” your sensei says, “and the festival is in three days. The village can’t guide its dead home in the dark. So we get them back.”',
      count:
        'Smoke rises from the mill chimney and the waterwheel turns, but the shutters are nailed shut and nobody comes out.',
      plan: 'There are three ways in: the millrace, the loading door and the roof. Everyone on the team has a favourite.',
      guards:
        'Stacks of festival lanterns fill the drying floor. A woman with a black scarf counts them, and two of her crew watch the doors.',
      foe: 'bandit-chief',
      second: 'bandit-archer',
      third: 'academy-dropout',
      slipped:
        'You carry the lanterns out of the millrace in a chain, a bundle at a time, while the crew sleeps on.',
      ending:
        'The lanterns go up on the night of the festival, every one of them. The Magistrate’s clerk notes in the record that they were found by a genin team, which is more than he usually writes.',
    },
  },
  {
    id: 'cinder-ridge-sweep',
    templateId: 'c-team-border-sweep',
    values: {
      title: 'Sweep of the Cinder Ridge',
      client: 'The Border Watch',
      border: 'the cinder ridge on the northern line',
      orders:
        '“Walk the ridge, count the cairns, come home,” your sensei reads aloud. {leader.they} fold{leader.s} the orders away. “They never send genin to count cairns.”',
      march:
        'The ridge path is loose cinder, steep on both sides, and the wind off the heights cuts like a blade.',
      trace:
        'Behind the seventh cairn, someone has cleared a sleeping place and swept it, carefully, but not carefully enough.',
      stranger:
        'A man in a patched cloak sits in the hollow, sketching the village’s watch-towers onto a map. He turns, very slowly.',
      foe: 'academy-dropout',
      parley:
        '“They pay me by the drawing,” he says, and gives up the map. “I don’t even know who they are.”',
      ending:
        'Your sensei reads the map all the way home and says nothing. The next week, a jōnin team leaves by the north gate before dawn.',
    },
  },
];

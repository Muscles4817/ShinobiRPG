import type { MissionFill } from '../../../../missionTemplates';

/** D-rank work inside the walls: festival crowds, neighbours at odds and the clans’ small rites. */
export const D_TOWN: readonly MissionFill[] = [
  {
    id: 'night-of-sparks-stewards',
    templateId: 'd-festival-trouble',
    minMissionsCompleted: 0,
    values: {
      title: 'Stewards for the Night of Sparks',
      client: 'The Hibana Clan',
      festival: 'the Night of a Thousand Sparks on the river bank',
      setup:
        'The river bank is packed shoulder to shoulder, the Hibana are setting their great fire-wheels on rafts, and every child in the village has a sparkler.',
      crush:
        'A fire-wheel spins loose on its raft and sprays sparks over the bank, and the crowd surges back up the narrow steps all at once.',
      mischief:
        'Someone is setting off the Hibana’s fireworks early, one at a time, from somewhere in the crowd, and the clan’s fire-masters are livid.',
      mischiefStopped:
        'You catch a Hibana girl too young to be allowed on the rafts with a fuse in her teeth. She only wanted the clan to see that she could do it.',
      mischiefMissed:
        'By the time you catch the Hibana girl with the fuse in her teeth, a whole crate of rockets has gone up before its time.',
      ending:
        'At midnight the great fire-wheels light together and the river burns gold and red. The girl watches from your shoulders, and tells you every firework’s name.',
    },
  },
  {
    id: 'lantern-float-stewards',
    templateId: 'd-festival-trouble',
    minMissionsCompleted: 1,
    values: {
      title: 'The Lantern Float on the Canal',
      client: 'The Canal Wardens',
      festival: 'the lantern float on the Festival of Lanterns',
      setup:
        'Every family in the canal district crowds the water steps with a paper lantern for its dead, and the canal is already a river of small lights.',
      crush:
        'The old footbridge over the canal creaks under the crowd, and somebody shouts that it is going to give.',
      mischief:
        'Purses are vanishing on the water steps, lifted while their owners bend down to set their lanterns on the water.',
      mischiefStopped:
        'You catch a quick-fingered man in a mourning coat with a dozen purses sewn into its lining. He was not mourning anybody.',
      mischiefMissed:
        'The pickpocket is three bridges away before you spot him, and a dozen families have lost their festival money.',
      ending:
        'When the bells ring, every lantern is set on the water at once, and the whole canal moves softly out towards the river, carrying the dead home.',
    },
  },
  {
    id: 'braziers-for-the-long-night',
    templateId: 'd-festival-trouble',
    minMissionsCompleted: 3,
    values: {
      title: 'Braziers for the Long Night',
      client: 'The Tōkaku Lantern-Keepers',
      festival: 'the Long Night Vigil, when the braziers burn till dawn',
      setup:
        'Braziers burn on every corner and the soup carts steam. People huddle in blankets, waiting out the longest night with their dead.',
      crush:
        'A soup cart overturns in the square, scalding broth runs over the cobbles, and everyone backs away into everyone else.',
      mischief:
        'Brazier after brazier is going out along the river lane, doused with water, and the keepers say that is very bad luck on this night.',
      mischiefStopped:
        'You catch an old man with a bucket. His wife hated smoke, he says, and he only wanted her to find her way home without coughing.',
      mischiefMissed:
        'Half the lane is dark before you catch the old man with the bucket, and the keepers have to relight every brazier by hand.',
      ending:
        'At dawn the keepers leave one brazier unlit on the river lane, and set a lantern there instead. The old man sits beside it, smiling at nobody you can see.',
    },
  },
  {
    id: 'harvest-wrestling-order',
    templateId: 'd-festival-trouble',
    minMissionsCompleted: 5,
    values: {
      title: 'Order at the Harvest Wrestling',
      client: 'The Shrine Hill Priests',
      festival: 'the harvest wrestling on the shrine hill',
      setup:
        'A ring of rice straw sits under the old camphor tree, farmers’ sons strip to their loincloths, and the betting is louder than the prayers.',
      crush:
        'The favourite is thrown clean out of the ring and into the crowd, and the crowd tries to get out of his way and closer to see at the same time.',
      mischief:
        'The odds keep shifting in a way that makes no sense, and someone keeps slipping a word to the wrestlers between bouts.',
      mischiefStopped:
        'You catch a bookmaker passing a wrestler a twist of sleeping herb for his opponent’s water. Both of them are thrown out by the priests.',
      mischiefMissed:
        'The bookmaker is gone with the takings before you spot the sleeping herb in the champion’s water, and the champion is already asleep.',
      ending:
        'The final bout is won by a skinny miller’s son nobody bet on. The priests give him the harvest rice, and he gives half of it to the losing farmer.',
    },
  },
  {
    id: 'two-boats-one-mooring',
    templateId: 'd-quarrel',
    minMissionsCompleted: 1,
    values: {
      title: 'Two Boats, One Mooring',
      client: 'The Canal Wardens',
      parties: 'two boatwomen who both claim the best mooring on the canal',
      quarrel:
        'Big Ito says her mother moored there before the canal had a name. Little Ito, no relation, says she has the warden’s paper. They are trying to untie each other’s boats.',
      clue: 'The mooring post has two sets of rope grooves worn into it, one old and deep, one new and shallow, on opposite sides.',
      truth:
        'The post was moored on both sides for years, by both their mothers, who were friends. The paper only gives the right to the side nearest the bridge.',
      muddle:
        'You can prove nothing, so you have them share the mooring on alternate days, and both of them grumble about it on all of them.',
      ending:
        'They tie up on either side of the post and glare at each other across it. By the end of the week they are sharing a teapot over the gap.',
    },
  },
  {
    id: 'hammer-at-dawn',
    templateId: 'd-quarrel',
    minMissionsCompleted: 2,
    values: {
      title: 'The Hammer at Dawn',
      client: 'Ward Elder Kinu',
      parties: 'a Kurogane smith and the calligrapher who lives next door',
      quarrel:
        'The calligrapher says the forge hammering spoils his brush strokes every dawn. The smith swears his forge is cold until noon. They are shouting over a fence.',
      clue: 'The hammering really does come every dawn, but there is no smoke from the forge chimney, and the calligrapher’s shed has a new lock.',
      truth:
        'It is the calligrapher’s own son, hammering on a scrap of iron in the shed every dawn, because he wants to be a smith and is afraid to say so.',
      muddle:
        'You cannot find where the hammering comes from, so you ask the smith to start later. He does, and the hammering does not stop.',
      ending:
        'The smith takes the boy on as an apprentice. The calligrapher writes the boy’s name on the forge sign himself, in very beautiful strokes.',
    },
  },
  {
    id: 'the-persimmon-tree',
    templateId: 'd-quarrel',
    minMissionsCompleted: 0,
    values: {
      title: 'The Persimmon Tree',
      client: 'Headman Ōtomo of the East Farms',
      parties: 'two farm families who share a persimmon tree on their boundary',
      quarrel:
        'The Satos say the tree is on their side. The Uedas say the fruit falls on theirs. Both families are out with ladders and baskets, and a grandmother is up the tree.',
      clue: 'The shrine’s old land register might settle it, and the tree has two names carved into its bark, grown wide and faint with the years.',
      truth:
        'The register says the tree was planted by two sisters, one married into each family, on the day they parted. The carved names are theirs.',
      muddle:
        'The register is too water-stained to read, so you split the fruit down the middle, and both families count every persimmon.',
      ending:
        'The families pick the tree together that autumn, the first time in years. The grandmother stays up in the branches, eating, and refuses to come down.',
    },
  },
  {
    id: 'broth-wars',
    templateId: 'd-quarrel',
    minMissionsCompleted: 4,
    values: {
      title: 'Broth Wars',
      client: 'The Market Steward',
      parties: 'two noodle sellers on Market Street who accuse each other of stealing a broth',
      quarrel:
        'Each says the other’s broth tastes exactly like their own secret one. They are trading insults across the street, and their customers are taking sides.',
      clue: 'Both of them buy their dried fish from the same fishmonger, and both keep their recipe written on a slip that he could easily have read.',
      truth:
        'The fishmonger has been reading each one’s recipe and selling it to the other, with a new bag of fish to make it, for a little extra.',
      muddle:
        'You cannot prove a thing, and declare both broths equally good. Both noodle sellers are deeply insulted.',
      ending:
        'The two noodle sellers stop fighting long enough to throw the fishmonger out of the market. Then they go back to fighting, much more cheerfully.',
    },
  },
  {
    id: 'blessing-the-lantern-gate',
    templateId: 'd-small-rite',
    minMissionsCompleted: 2,
    values: {
      title: 'Blessing the Lantern Gate',
      client: 'Tōkaku Elder Hisame',
      rite: 'the renewal of the wards on the great lantern gate',
      setup:
        'The great gate is old wood and older seals, and the wards painted on it have flaked away in the rain. “The dead find the village by this gate,” Hisame says. “Nothing else must.”',
      binding:
        'You must repaint the warding seal on the gate’s crossbeam in one breath of chakra-laced ink, from a ladder, while the wind tugs at the brush.',
      bound:
        'The seal closes and the gate seems to settle on its posts. Every lantern hanging from it brightens at once.',
      frayed:
        'The brush skids and the seal is left open at one end. Hisame climbs up beside you, tuts, and closes it with her thumb.',
      pull: 'Through the gate, on the empty road, you see someone you know walking towards you, though you know they are dead.',
      ending:
        'That night the road beyond the gate is full of small lights coming home, and none of them stray. Hisame says the gate will hold for another generation.',
    },
  },
  {
    id: 'feeding-the-forge-spirit',
    templateId: 'd-small-rite',
    minMissionsCompleted: 3,
    values: {
      title: 'Feeding the Forge Spirit',
      client: 'Kurogane Elder Tanzō',
      rite: 'the yearly offering to the spirit of the clan’s oldest furnace',
      setup:
        'The oldest forge is never allowed to go out, and once a year it must be fed by hand. “It knows strangers,” Tanzō warns. “Be polite.”',
      binding:
        'The offering of salt, iron filings and sake must be passed into the flames through a sealed ring of tongs, without letting the fire touch the seal.',
      bound:
        'The flames take the offering and flare white, then settle low and steady, and the whole forge seems to purr.',
      frayed:
        'The fire licks the seal and it crackles. Tanzō snatches the tongs from you and finishes the offering, his eyebrows singed.',
      pull: 'Deep in the fire there are shapes like hands, beckoning you closer, and the heat feels like an embrace.',
      ending:
        'The furnace burns clean and bright, and the smiths come back to work. Tanzō gives you a nail forged in that fire, for luck.',
    },
  },
  {
    id: 'binding-the-new-ferry',
    templateId: 'd-small-rite',
    minMissionsCompleted: 4,
    values: {
      title: 'Binding the New Ferry',
      client: 'Rope-Mistress Ayaori of the Shimenawa',
      rite: 'the binding of a sacred rope round the prow of the new river ferry',
      setup:
        'The new ferry sits on rollers by the river, raw wood and fresh paint. “The river has drowned better boats than this one,” Ayaori says. “The rope tells it to let this one pass.”',
      binding:
        'The rope must be wound seven times round the prow, and on each turn a seal must be pressed into the hemp with chakra.',
      bound:
        'The last seal takes, and the whole boat seems to lift a little on its rollers, as if eager for the water.',
      frayed:
        'You lose count of the turns. Ayaori unwinds the rope and starts over, and tells you to count aloud like a child.',
      pull: 'The river murmurs to you, and for a moment you want to walk into it and see what it has kept all these years.',
      ending:
        'The ferry slides into the water with the whole riverside cheering, and the river carries it out and back as gently as a cradle.',
    },
  },
  {
    id: 'lanterns-on-the-grave-hill',
    templateId: 'd-small-rite',
    minMissionsCompleted: 6,
    values: {
      title: 'Lanterns on the Grave Hill',
      client: 'Tōkaku Priestess Shino',
      rite: 'the relighting of the ancestral lantern of a family with no one left to light it',
      setup:
        'The grave hill is a slope of mossy stones and lanterns. One lantern, at the very top, has been dark for a year. “The last of them died,” Shino says. “Now we are their family.”',
      binding:
        'The lantern’s old wick has gone to ash, and a new one must be woven and lit with a spark of your own chakra, not with fire.',
      bound:
        'The spark catches, and a steady light rises in the old lantern. The grave hill seems warmer.',
      frayed: 'The spark dies twice. Shino cups her hands round yours, and the third one catches.',
      pull: 'Voices rise from the stones around you, a whole family talking at once, asking who you are and why you have come.',
      ending:
        'The lantern burns at the top of the hill. Shino writes your name in the family’s register, under the last of them, as the one who lit it.',
    },
  },
];

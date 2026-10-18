import type { MissionFill } from '../../../../missionTemplates';

/** C-rank team jobs that go looking for trouble: hunts, raids on hideouts and border sweeps. */
export const C_TEAM_FIELD_FILLS: readonly MissionFill[] = [
  {
    id: 'the-macaque-troop',
    templateId: 'c-team-hunt',
    minMissionsCompleted: 2,
    values: {
      title: 'The Macaque Troop',
      client: 'The Headwoman of Chaya',
      quarry: 'a troop of bold mountain macaques',
      village: 'the tea village of Chaya on the shrine hill road',
      harm: 'Roofs are stripped of their tiles, storehouses are ransacked and a child has been bitten. The headwoman holds up a stolen sandal. “They threw this at me,” she says.',
      sign: 'The troop’s trail goes up through the bamboo, littered with stolen things: a comb, a spoon, a whole kettle.',
      ground:
        'The troop sleeps in a stand of pines above a clearing. You have till dusk to make the clearing a trap.',
      lair: 'The troop wakes shrieking, and two big males drop out of the pines and come for you with their teeth bared.',
      foe: 'reikon-macaque',
      second: 'reikon-macaque',
      terrain:
        'A clearing ringed with tall pines, branches close enough to leap between, and a bamboo thicket on the downhill side.',
      ending:
        'Chaya gets its tiles back, and its kettle. The headwoman pours the team tea from it, a little dented, and declares it tastes better than ever.',
    },
  },
  {
    id: 'bear-of-the-ash-fells',
    templateId: 'c-team-hunt',
    minMissionsCompleted: 5,
    values: {
      title: 'The Bear of the Ash Fells',
      client: 'The Charcoal Burners’ Guild',
      quarry: 'a giant ash-grey bear and the scavengers that follow it',
      village: 'the charcoal camps on the ash fells',
      harm: 'Two camps are wrecked, their kilns broken open and their food stores torn apart. A burner shows you a claw-mark across a door as long as your arm.',
      sign: 'The bear’s trail is plain in the ash, deep and wide, and a smaller set of tracks scampers round it like a dog round its master.',
      ground:
        'The bear dens in a burnt-out kiln at the top of the fells. You have the afternoon to prepare the ground before it comes out to feed.',
      lair: 'The bear heaves itself out of the kiln with a roar that shakes the ash from the trees, and a feral tanuki darts out between its legs.',
      foe: 'ash-fell-bear',
      second: 'feral-tanuki',
      terrain:
        'A burnt-out kiln on a bare slope, loose ash that slides underfoot, and a stand of charred trees on the ridge.',
      ending:
        'The burners light their kilns again, and the guild sends the bear’s pelt to the village shrine. Your sensei says it is a better rug than you deserve.',
    },
  },
  {
    id: 'boars-in-the-rice-country',
    templateId: 'c-team-hunt',
    minMissionsCompleted: 10,
    values: {
      title: 'Boars in the Rice Country',
      client: 'The Rice Farmers of Ōta',
      quarry: 'a pair of giant boars that have taken to the paddies',
      village: 'the rice country of Ōta along the river',
      harm: 'The paddies are churned to mud, the young rice is trampled and a farmer’s ox has been gored. The farmers stand in the ruins with their hoes, ready to try it themselves.',
      sign: 'The boars’ tracks run along the dykes between the paddies, deep and heavy, towards a reed-bed by the river.',
      ground:
        'The boars wallow in the reed-bed by day. You have the morning to dig the dykes into a trap.',
      lair: 'The boars burst out of the reeds, mud flying, and the bigger one lowers its tusks and charges.',
      foe: 'ash-wood-boar',
      second: 'ash-wood-boar',
      terrain:
        'A tangled reed-bed, narrow muddy dykes between flooded paddies, and the river beyond.',
      ending:
        'The farmers of Ōta replant their paddies, and the whole village eats boar stew that night. The farmers sing a planting song for the team.',
    },
  },
  {
    id: 'the-pirates-boathouse',
    templateId: 'c-team-raid',
    minMissionsCompleted: 5,
    values: {
      title: 'The Pirates’ Boathouse',
      client: 'The Shrine Hill Priests',
      hideout: 'an old boathouse on the reed islands downriver',
      loot: 'the shrine’s bronze bell, cut down from its tower in the night',
      briefing:
        '“The bell has called the dead home for three hundred years,” the priest says, “and they want to melt it down.” Your sensei looks at the river map. “Boathouse, reed islands, one way in by water.”',
      count:
        'Lantern light shows through the boathouse slats, and a skiff comes and goes on the dark water.',
      plan: 'There is the water gate, the reed bank behind and the rotten roof. Nobody on the team agrees which is best.',
      guards:
        'The bell hangs from the rafters on a block and tackle. Their leader is measuring it for a crucible, while a bowman and a pirate watch the water gate.',
      foe: 'bandit-chief',
      second: 'bandit-archer',
      third: 'river-pirate',
      slipped:
        'You lower the bell onto a raft in the dark and float it out through the water gate while the crew argue over the price of bronze.',
      ending:
        'The bell rings out from the shrine hill that night. The priests ring it once for every member of the team, and once more for the river.',
    },
  },
  {
    id: 'the-counterfeit-forge',
    templateId: 'c-team-raid',
    minMissionsCompleted: 10,
    values: {
      title: 'The Counterfeit Forge',
      client: 'Kurogane Elder Tanzō',
      hideout: 'an abandoned quarry in the hills, turned into a forge',
      loot: 'the Kurogane maker’s stamps, stolen to mark cheap blades as clan work',
      briefing:
        '“Every blade they stamp is a lie with our name on it,” Tanzō says. “And they’ll break in the first fight that matters.” Your sensei nods. “Then we break them first.”',
      count:
        'Smoke rises from the quarry floor, and the ring of hammers echoes off the stone, but the forge is hidden under a rock overhang.',
      plan: 'The quarry has a cart track, a sheer face and a drainage tunnel. Each of you has a favourite, and none of them is easy.',
      guards:
        'Rows of shoddy blades stand drying by the forge. Their leader stamps them with the clan’s mark, while a bowman and a dropout keep watch.',
      foe: 'bandit-chief',
      second: 'bandit-archer',
      third: 'academy-dropout',
      slipped:
        'You slip down the drainage tunnel, lift the stamps from the forge-side bench and are gone before the next hammer stroke falls.',
      ending:
        'Tanzō melts the counterfeit blades and forges a single good one from the steel. He gives it to the team, to hang in the Mission Hall.',
    },
  },
  {
    id: 'the-stolen-tablets',
    templateId: 'c-team-raid',
    minMissionsCompleted: 15,
    values: {
      title: 'The Stolen Ancestor Tablets',
      client: 'Tōkaku Elder Hisame',
      hideout: 'a smugglers’ cave on the coast road',
      loot: 'the ancestor tablets of the grave hill, held for ransom',
      briefing:
        '“Without their tablets, the dead cannot find their families,” Hisame says. “They will wander, and they will grow hungry.” Your sensei is already packing.',
      count:
        'The cave mouth is hidden behind a waterfall, and every so often a figure steps out onto the rocks to look up and down the coast.',
      plan: 'The cave can be reached through the waterfall, along a ledge from the sea, or down a crack in the clifftop.',
      guards:
        'The tablets are stacked in a corner of the cave, wrapped in fishing nets. The leader writes the ransom note by lamplight while a bowman and a thug keep guard.',
      foe: 'bandit-chief',
      second: 'bandit-archer',
      third: 'bandit-thug',
      slipped:
        'You carry the tablets out through the waterfall, one by one, wrapped in oilcloth, while the smugglers argue over the size of the ransom.',
      ending:
        'The tablets go back to the grave hill, every one, and that night the lanterns there burn brighter than they have in years.',
    },
  },
  {
    id: 'dune-line-sweep',
    templateId: 'c-team-border-sweep',
    minMissionsCompleted: 4,
    values: {
      title: 'Sweep of the Dune Line',
      client: 'The Border Watch',
      border: 'the dune line where the Land of Embers meets the sands of Sakyūgakure',
      orders:
        '“Walk the marker stones from the oasis to the salt flats,” your sensei reads. “Count them. Note any that have moved.” {leader.they} frown{leader.s}. “Stones don’t move. People do.”',
      march:
        'The sand burns through your sandals, the wind fills your eyes, and the dunes shift so that every marker seems further off than the last.',
      trace:
        'At the eleventh marker the sand has been brushed smooth, too smooth, and someone has buried a waterskin at its foot.',
      stranger:
        'A girl in a Sakyūgakure headband crouches in a hollow behind the marker, a map of the border posts on her knees and a look of pure panic on her face.',
      foe: 'academy-dropout',
      parley:
        '“I failed their exam,” she says, holding out the map. “I thought if I brought back something useful they’d let me try again.”',
      ending:
        'The Border Watch sends her home under escort with a polite letter. Your sensei writes a second letter, not polite, and does not say who it is for.',
    },
  },
  {
    id: 'coast-road-sweep',
    templateId: 'c-team-border-sweep',
    minMissionsCompleted: 8,
    values: {
      title: 'Sweep of the Coast Road',
      client: 'The Harbour Office',
      border: 'the coast road between the village and Port Shiomachi',
      orders:
        '“Walk the coast road, check every cove,” your sensei reads aloud. “Smuggling, they say.” {leader.they} look{leader.s} out at the sea. “It’s always smuggling, until it isn’t.”',
      march:
        'The coast road climbs and dips along the cliffs, and at every cove the team must scramble down to the beach and back up again.',
      trace:
        'In a cove below the cliffs, fresh keel marks score the sand, and a crate of lantern oil sits half buried above the tide line.',
      stranger:
        'A big man in a fisherman’s coat is digging up the crate, a sea chart in his belt and a short sword at his hip.',
      foe: 'bandit-chief',
      parley:
        '“I’m just the digger,” he says, handing you the chart. “The ship comes tomorrow night. I don’t want to be here when it does.”',
      ending:
        'Your sensei studies the chart all the way home. The next night, the Harbour Office waits in the cove with every guard in Shiomachi.',
    },
  },
  {
    id: 'reikon-saddle-sweep',
    templateId: 'c-team-border-sweep',
    minMissionsCompleted: 13,
    values: {
      title: 'Sweep of the Reikon Saddle',
      client: 'The Border Watch',
      border: 'the high saddle between Mount Reikon and its northern neighbour',
      orders:
        '“The saddle,” your sensei reads, and {leader.their} face goes still. “Nobody crosses there. It is all spirits and rockfalls.” {leader.they} fold{leader.s} the paper. “So somebody has.”',
      march:
        'The saddle path is a knife-edge of rock and ice, the wind roars through it, and every step must be tested before you trust it.',
      trace:
        'In the lee of a rock someone has built a tiny fire and covered it with stones, but the stones are still warm.',
      stranger:
        'A ragged man huddles in a crevice, a bundle of stolen temple charms in his lap, muttering to the spirits to leave him alone.',
      foe: 'bandit-chief',
      parley:
        '“Take them,” he says, pushing the charms at you. “Take them back. The dead won’t stop following me since I took them.”',
      ending:
        'The temple takes back its charms, and the abbot says he will pray for the thief. Your sensei doesn’t answer, and looks back over {leader.their} shoulder all the way home.',
    },
  },
];

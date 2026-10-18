import type { MissionFill } from '../../../../missionTemplates';

/**
 * Jobs that send you after the shared bestiary's foes, set in the farm villages, salt pans and
 * mountain hamlets the board's clients come from: wolves, marsh beasts and shore crabs, the
 * middle of the bandit ladder, smugglers, pirates, a shrine nobody tends and a rōnin.
 */
export const BESTIARY_FILLS: readonly MissionFill[] = [
  {
    id: 'the-wolves-of-kurozawa',
    templateId: 'c-team-hunt',
    minMissionsCompleted: 4,
    values: {
      title: 'The Wolves of Kurozawa',
      client: 'The Headman of Kurozawa',
      quarry: 'a wolf pack that has learned to take sheep from inside the fold',
      village: 'the hill hamlet of Kurozawa, where the road gives out',
      harm: 'Three folds are broken open and the snow behind them is trampled pink. The shepherds have stopped sleeping.',
      sign: 'The tracks go up the gully in a line, each wolf stepping in the one before, until a bigger set breaks off to watch the village.',
      ground:
        'The pack lies up in a rocky hollow by day. You have till the light goes to choose where they come at you.',
      lair: 'An old grey wolf stands up on the rocks, and the others come out of the snow around it without a sound.',
      foe: 'wolf-pack-leader',
      second: 'grey-wolf',
      terrain:
        'A hollow of tumbled rocks with one way in, deep snow on the slopes, and a frozen stream at the bottom.',
      ending:
        'Kurozawa sleeps again. The headman gives the team a fleece each, and says the old wolf was clever enough to have been a person.',
    },
  },
  {
    id: 'the-thing-in-the-paddy-ditch',
    templateId: 'c-team-hunt',
    minMissionsCompleted: 3,
    values: {
      title: 'The Thing in the Paddy Ditch',
      client: 'The Farmers of Numata',
      quarry: 'a giant salamander, and the vipers the flooded fields have brought out',
      village: 'the marsh village of Numata, all dykes and reeds',
      harm: 'A water buffalo was pulled into the main ditch and never came out. The children are kept indoors.',
      sign: 'A broad, flat body has slid through the mud of the dyke wall, and the reeds are flattened in a track as wide as a door.',
      ground:
        'It lies in the deep pool where the ditches meet. You have the afternoon to drain a channel and pick your footing.',
      lair: 'The pool heaves, and a head as flat and wide as a stool comes up out of the mud with its mouth already open.',
      foe: 'giant-salamander',
      second: 'marsh-viper',
      terrain:
        'A pool where three ditches meet, slick dyke walls, and a footbridge of two planks across the widest one.',
      ending:
        'Numata lets its children out. The farmers argue for an hour over whether to eat the salamander, and decide it is older than the village and should be buried.',
    },
  },
  {
    id: 'crabs-on-the-salt-pans',
    templateId: 'c-team-hunt',
    minMissionsCompleted: 3,
    values: {
      title: 'Crabs on the Salt Pans',
      client: 'The Salt-Makers of Hamaura',
      quarry: 'great shore crabs that come up out of the sea at night',
      village: 'the salt pans of Hamaura on the coast road',
      harm: 'The pans are broken, the salt is trodden into the sand and a salt-maker’s leg is in splints.',
      sign: 'Sideways tracks as wide as a cart’s come up the beach from the rocks, and go back down before dawn.',
      ground:
        'They come up with the night tide. You have the evening to choose which pans to give them.',
      lair: 'A shell like a cart wheel rises out of the surf, and a long-mouthed head comes up the rocks behind it.',
      foe: 'shore-crab',
      second: 'moray-eel',
      terrain:
        'Shallow pans of brine walled with clay, wet sand that gives underfoot, and black rocks where the sea comes in.',
      ending:
        'Hamaura makes salt again. The salt-makers send the team home with a jar of the first white crust off the mended pans.',
    },
  },
  {
    id: 'the-toll-on-the-pass-road',
    templateId: 'c-team-caravan',
    minMissionsCompleted: 5,
    values: {
      title: 'The Toll on the Pass Road',
      client: 'The Lacquer-Makers of Urushiba',
      caravan:
        'three packhorses loaded with lacquerware and a lacquer-master who will not leave them',
      road: 'the pass road over to the lacquer town of Urushiba',
      region: 'mountain-pass',
      departure:
        'The lacquer-master checks every strap twice. “The gang on the pass take a toll,” they say, “and then they take the horses.” Your sensei says this time they won’t.',
      signs:
        'There is a rope across the road at the top, slack in the dust, tied off to a tree, and the snow by it has been swept.',
      ambush:
        'They come out of the trees, a lieutenant in a padded coat with a real sword and a knife-man already running, and the third wears a scratched forehead protector.',
      foe: 'bandit-lieutenant',
      second: 'bandit-knifeman',
      third: 'bandit-deserter',
      ending:
        'Urushiba gets every bowl. The lacquer-master gives the team a red cup each and says the toll is paid, in full, forever.',
    },
  },
  {
    id: 'the-smugglers-cove',
    templateId: 'c-team-raid',
    minMissionsCompleted: 6,
    values: {
      title: 'The Smugglers’ Cove',
      client: 'The Customs House at Sunagawa',
      hideout: 'a sea cave below the cliffs south of Sunagawa',
      loot: 'a season’s seized tax-salt, stolen back from the customs house',
      briefing:
        'Your sensei unrolls a fisher’s sketch that shows one way in by the shingle at low tide, and one way out by a ladder nobody has found.',
      count:
        'You lie on the cliff top in the wind and watch the cave mouth for lamps, and for the dog everyone in the village has heard bark.',
      plan: 'The tide will cover the shingle within the hour. You need a way in now.',
      guards:
        'A boss in a good coat sits on a salt sack with a big dog at their feet, and two more keep watch at the mouth with their hands in their sleeves.',
      foe: 'smuggler-boss',
      second: 'smuggler',
      third: 'bandit-cutpurse',
      slipped:
        'You come up the ladder nobody found, behind the salt, and carry it out sack by sack while the dog sleeps.',
      ending:
        'The customs house gets its salt back. The collector doesn’t say a word of thanks, but sends a barrel of pickled plums to the village by the next boat.',
    },
  },
  {
    id: 'the-tide-callers-crew',
    templateId: 'c-team-raid',
    minMissionsCompleted: 9,
    values: {
      title: 'The Tide-Caller’s Crew',
      client: 'The Fishing Crews of Ōmisaki',
      hideout: 'a wreck run aground on the reef off Ōmisaki point',
      loot: 'the village’s nets and its one good boat',
      briefing:
        'The pirates come in with a fog on clear nights, your sensei says, and the fishers swear the fog follows one of them like a dog.',
      count:
        'From the point you count the shapes on the wreck’s deck by their pipes. One sits by the mast, one carries a long barbed pole, and one never moves at all.',
      plan: 'The fog is already coming in off the sea. The team must choose a way across the reef before it arrives.',
      guards:
        'The tide-caller sits cross-legged on the deck with their hands in the water, and the fog pours off them; the harpooner stands at the rail, and a boarder with a cutlass walks the deck.',
      foe: 'pirate-tide-caller',
      second: 'harpoon-thrower',
      third: 'pirate-boarder',
      slipped:
        'You go out along the reef inside the pirates’ own fog and cut the boat free while they argue about the weather.',
      ending:
        'Ōmisaki puts out to sea again. The fishers paint an eye on the bow of the good boat, so it will see the next fog coming.',
    },
  },
  {
    id: 'the-crossroads-shrine',
    templateId: 'c-team-haunting',
    minMissionsCompleted: 5,
    values: {
      title: 'The Crossroads Shrine',
      client: 'The Innkeeper at Yotsuji',
      place: 'a roadside shrine at the Yotsuji crossroads that nobody has swept in years',
      dread:
        'Travellers who stop at the shrine walk on in the wrong direction and are found days later, starving, sure they were nearly there. Your sensei says not to look at the lights.',
      pull: 'All four roads look like the road home, and the lights in the trees want you to choose one.',
      ghosts:
        'The shrine’s god sits on its own broken roof, thin and grey, with blue fox-fires circling it like moths. It wants rice, and from the look of it, it has wanted rice for years.',
      foe: 'shrine-spirit',
      second: 'fox-fire',
      ending:
        'The team sweeps the shrine and leaves rice and a lantern on the step. In the morning, every traveller at the inn finds the road they meant to take.',
    },
  },
  {
    id: 'the-ronin-at-the-ferry',
    templateId: 'b-rogue-hunt',
    minMissionsCompleted: 10,
    values: {
      title: 'The Rōnin at the Ferry',
      client: 'The Lord of Asaba’s Steward',
      quarry: 'a masterless swordsman who cut down three of the lord’s men at the Asaba ferry',
      dossier:
        'The steward’s file names the rōnin’s old lord, dead two years, and lists the three men killed. It does not say why they were sent to the ferry.',
      trail:
        'The trail goes downriver from ferry to ferry, and every ferryman you ask has been paid not to remember.',
      trap: 'At the last landing a boat is drawn up with its rope cut half through, and the planks of the jetty are loose in the middle.',
      cornered:
        'The rōnin is sitting on an upturned boat sharpening a sword that needs no sharpening. “The steward sent ninja,” they say. “He must be frightened.”',
      foe: 'ronin',
      parley:
        'The rōnin lays the sword on the sand. “Those three came to kill me for what I know about the steward’s accounts. Take me in. Then read them.”',
      ending:
        'You bring the rōnin in, and the steward’s accounts with them. The lord’s office thanks you twice, once in public and once, much more quietly, in private.',
    },
  },
];

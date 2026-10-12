import type { MissionFill } from '../../../../missionTemplates';

/** B-rank work a chūnin takes alone: rings to break, spirits to bind and rogues to run down. */
export const CHUNIN_B_FILLS: readonly MissionFill[] = [
  {
    id: 'lanterns-sold-abroad',
    templateId: 'b-smuggling-ring',
    minMissionsCompleted: 8,
    values: {
      title: 'Lanterns Sold Abroad',
      client: 'The Tōkaku Lantern-Keepers',
      contraband: 'grave-hill lanterns with the dead still bound inside them',
      route: 'down the river on rice barges, past the weir by night',
      papers:
        'The barge manifests list nothing but rice. But the weir-keeper’s tally of barges is longer than the rice-merchants’ tally, by one barge every new moon.',
      papersRead:
        'The extra barge always belongs to the same rice-merchant, Daikoku, and always moors for an hour at the old tannery steps.',
      papersBlind:
        'The tallies are a mess of blots and crossings-out. When you leave the weir-house, the weir-keeper is already sending a boy off at a run.',
      cover:
        'The barge crews are a family of cousins and in-laws, and they trust nobody who has not been born on a barge.',
      den: 'In the tannery cellar, lanterns stand in rows, each one flickering with a trapped and frightened light. A rogue in a burnt headband guards them, and a hired chief minds the steps.',
      foe: 'ember-missing-nin',
      second: 'bandit-chief',
      ending:
        'The keepers carry every lantern back to the grave hill and let the dead out, one by one. Daikoku’s ledger names a collector in the capital who pays very well for captive spirits.',
    },
  },
  {
    id: 'steel-over-the-dunes',
    templateId: 'b-smuggling-ring',
    minMissionsCompleted: 12,
    reward: { ryo: 560, reputation: 11 },
    values: {
      title: 'Steel over the Dunes',
      client: 'Kurogane Elder Tanzō',
      contraband: 'Kurogane clan steel, ingots stamped as scrap iron',
      route: 'across the dune border on the glass traders’ camels',
      papers:
        'The forge’s scrap tallies are perfect, which is the problem. No forge in the world makes exactly the same weight of scrap every week.',
      papersRead:
        'The scrap is signed out by a forge clerk named Kanemori, and every load goes to a glass trader’s yard by the dune gate.',
      papersBlind:
        'The tallies show nothing you can prove. The next morning, a Kurogane swordsman you do not know is waiting outside your door.',
      cover:
        'The glass traders’ yard is full of foreigners who speak the slow speech of the dunes and look hard at every face they do not know.',
      den: 'In the yard’s back shed ingots of clan steel are packed into camel bags. A swordsman with the clan’s footwork stands guard, and a bowman watches from the roof.',
      foe: 'kurogane-renegade',
      second: 'bandit-archer',
      ending:
        'The steel goes back to the clan forge, and the clerk Kanemori is taken before the clan elders. His ledger points to a buyer in Sakyūgakure who is building an army.',
    },
  },
  {
    id: 'dream-incense-ring',
    templateId: 'b-smuggling-ring',
    minMissionsCompleted: 18,
    reward: { ryo: 580, reputation: 11 },
    values: {
      title: 'The Dream-Incense Ring',
      client: 'The Village Magistrate',
      contraband: 'dream-incense that lets the grieving see their dead',
      route: 'through the tea-houses of the canal district',
      papers:
        'The tea-houses’ accounts show a sudden fashion for an expensive temple incense, bought by the same fixer, though no temple sells it.',
      papersRead:
        'The fixer is a tea-merchant named Ōgi, who visits each tea-house on the night of the new moon, and the incense is stored in his warehouse on the canal.',
      papersBlind:
        'The accounts are clean, and the tea-house mistresses are too frightened to talk. On your way home, someone follows you through the canal district.',
      cover:
        'The tea-houses are full of grieving widows and wide-eyed widowers, and they will not trust anyone who does not share their grief.',
      den: 'In the canal warehouse, incense burns in a dozen braziers, and people lie on mats seeing their dead. A rogue in a black coat guards the door, and a chief counts the takings.',
      foe: 'ember-missing-nin',
      second: 'bandit-chief',
      ending:
        'The incense is burned in the shrine with prayers for everyone it fooled. Ōgi’s ledger points to a priest in Port Shiomachi who should have known better.',
    },
  },
  {
    id: 'shade-on-the-pilgrim-path',
    templateId: 'b-spirit-binding',
    minMissionsCompleted: 7,
    values: {
      title: 'The Shade on the Pilgrim Path',
      client: 'The Mountain Temple',
      spirit: 'the lost pilgrim of the Reikon path',
      legend:
        '“She went up to light a lantern for her son,” the abbot says. “She died on the path in a storm, and the lantern went out. Now she leads pilgrims off the path, to show them where her son is.”',
      preparation:
        'The binding must be laid in a ring round the place she died, and sealed with her own lantern, which the temple has kept for forty years.',
      readied:
        'The ring of sealed rope glows softly in the dark, and her old lantern sits at its heart, ready to be lit.',
      rushed:
        'The ring is uneven and the seals are smudged. You go up the path knowing the binding will not hold for long.',
      manifest:
        'A woman in a pilgrim’s robe rises out of the mist, holding out her dark lantern, and the mountain’s cold comes with her.',
      foe: 'reikon-shade',
      ambush:
        'You strike while she stands at the cliff edge, staring down into the valley, looking for her son among the trees.',
      ending:
        'The binding closes round her and you light her lantern. She looks into its light and is still. The temple keeps the lantern lit on the path from that day.',
    },
  },
  {
    id: 'bell-founders-fire',
    templateId: 'b-spirit-binding',
    minMissionsCompleted: 14,
    values: {
      title: 'The Bell-Founder’s Fire',
      client: 'The Kiln Pass Potters’ Guild',
      spirit: 'the bell-founder who died casting the great shrine bell',
      legend:
        '“He poured the bronze himself,” the guild’s headwoman says, “and the mould cracked, and the fire took him. Now the old foundry burns every night, and anyone who goes near it is pulled into the flames.”',
      preparation:
        'The binding must be woven from the founder’s own bell-rope, sealed with salt and bronze, and laid round the foundry before the fire rises.',
      readied:
        'The bell-rope lies in a circle round the foundry, every knot humming like a struck bell.',
      rushed:
        'The bell-rope is tied in haste, and some of the knots ring false. You go in knowing the binding will not hold for long.',
      manifest:
        'The foundry fire roars up, and out of it steps a man of molten bronze and smoke, his hands outstretched for more heat.',
      foe: 'kiln-wraith',
      ambush:
        'You strike while he kneels at the cracked mould, trying over and over to pour bronze that is no longer there.',
      ending:
        'The binding closes and the founder sinks into the bell-rope. The foundry goes cold, and the great bell on the shrine hill rings once, by itself.',
    },
  },
  {
    id: 'keeper-of-the-dark-lighthouse',
    templateId: 'b-spirit-binding',
    minMissionsCompleted: 20,
    reward: { ryo: 540, reputation: 12 },
    values: {
      title: 'The Keeper of the Dark Lighthouse',
      client: 'The Harbour-Master of Port Shiomachi',
      spirit: 'the keeper of the old Shiomachi lighthouse',
      legend:
        '“His lamp went out one stormy night, and a ship went down on the rocks,” the harbour-master says. “He never forgave himself. Now he puts out every lamp on the coast to make them suffer as he did.”',
      preparation:
        'The binding must be painted round the lighthouse’s lamp-room in salt-water ink, with seals that will hold against the sea wind.',
      readied:
        'The seals glow round the lamp-room like a second light, steady even in the wind off the sea.',
      rushed:
        'The salt-water ink runs in the wind, and some of the seals are smudged. You climb the stair knowing the binding will not hold.',
      manifest:
        'The lamp flares and dies, and out of the dark steps an old man in a keeper’s coat, his hands reaching for the light in your eyes.',
      foe: 'kiln-wraith',
      ambush:
        'You strike while he stands at the window, staring out at the rocks where the ship went down.',
      ending:
        'The binding closes and the keeper sinks into the walls of his lighthouse. The lamp burns again, and the harbour-master says it has never burned so bright.',
    },
  },
  {
    id: 'the-swordsmiths-son',
    templateId: 'b-rogue-hunt',
    minMissionsCompleted: 9,
    values: {
      title: 'The Swordsmith’s Son',
      client: 'Kurogane Elder Tanzō',
      quarry: 'Kurogane Jin, who stole his father’s master blade and fled the village',
      dossier:
        'The file lists his training, his duels and the night he left. It does not say that his father, the clan’s greatest smith, died a week before, and named a cousin his heir.',
      trail:
        'He left by the river gate a month ago, and he was seen heading for the mountain passes with a long bundle on his back.',
      trap: 'Across the mountain path a fine wire is strung between two pines, glinting in the morning sun, and the snow beneath it is too smooth.',
      cornered:
        'Jin waits on a mountain ledge, his father’s blade drawn. “He made it for me,” he says. “Not for my cousin. For me.”',
      foe: 'kurogane-renegade',
      parley:
        'Jin looks at the blade for a long time, then sheathes it and holds it out to you. “Tell them I want to forge my own,” he says.',
      ending:
        'You bring the blade home. The clan elders read your report, and the cousin, quietly, gives Jin back his place at the forge.',
    },
  },
  {
    id: 'lantern-keeper-who-ran',
    templateId: 'b-rogue-hunt',
    minMissionsCompleted: 15,
    values: {
      title: 'The Lantern-Keeper Who Ran',
      client: 'The Tōrokage’s Office',
      quarry: 'Tōkaku Sayo, a chūnin who ran with the ledger of the village’s lantern names',
      dossier:
        'The file lists her clan, her rank and her missions. It does not say that her daughter died of fever last winter, and that the clan did not hang a lantern for her.',
      trail:
        'She left on the night of the Festival of Lanterns, while every eye was on the canal, and was seen on the road to Mount Reikon.',
      trap: 'At the foot of the pilgrim path a lantern hangs from a pine branch, and its light makes your head swim when you look at it.',
      cornered:
        'Sayo kneels at the summit shrine, the ledger open in front of her, writing her daughter’s name in it in her own blood.',
      foe: 'ember-missing-nin',
      parley:
        'Sayo finishes the name, closes the ledger and hands it to you. “Now she’s home,” she says. “Take me back.”',
      ending:
        'The ledger goes back to the archive, with the new name in it. The Tōkaku elders hang a lantern for the girl, and Sayo is allowed to light it before her trial.',
    },
  },
  {
    id: 'woman-with-the-ember-fan',
    templateId: 'b-rogue-hunt',
    minMissionsCompleted: 22,
    reward: { ryo: 600, reputation: 12 },
    values: {
      title: 'The Woman with the Ember Fan',
      client: 'The Tōrokage’s Office',
      quarry: 'Hibana Rin, who sells the clan’s fire techniques to anyone who pays',
      dossier:
        'The file lists the villages that have bought her techniques and the dead they have left. It does not say that she was once the clan’s finest teacher.',
      trail:
        'She was last seen in the dunes border, teaching a raider band to breathe fire, and has not stayed in one place since.',
      trap: 'In the doorway of a ruined caravanserai a single paper fan lies open, and the air above it shimmers with heat.',
      cornered:
        'Rin sits on the caravanserai’s roof, her fan in her hand. “I taught them all for free, once,” she says. “Nobody listened then.”',
      foe: 'ember-missing-nin',
      parley:
        'Rin closes her fan and drops it at your feet. “Take it, then. You’ll find the clan won’t want it back.”',
      ending:
        'The Hibana elders take the fan and lock it away. They are quiet for a long time when they read your report, and then they ask whether Rin will teach again.',
    },
  },
];

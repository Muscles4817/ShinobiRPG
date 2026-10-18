import type { MissionFill } from '../../../../missionTemplates';

/** C-rank team jobs on the road: caravans to guard, people to bring back and hauntings to lay. */
export const C_TEAM_ROAD_FILLS: readonly MissionFill[] = [
  {
    id: 'porcelain-caravan',
    templateId: 'c-team-caravan',
    minMissionsCompleted: 2,
    values: {
      title: 'The Porcelain Caravan',
      client: 'The Kiln Pass Potters’ Guild',
      caravan: 'four ox-carts of porcelain packed in straw',
      road: 'the switchback road down from Kiln Pass',
      region: 'mountain-pass',
      departure:
        'The potters have packed every bowl like a newborn, and they flinch at every rut. “Porcelain doesn’t bleed,” your sensei says. “That’s what makes it worth stealing.”',
      signs:
        'At the third switchback there is fresh straw on the road, of the kind the potters pack with, and none of their carts has passed this way yet.',
      ambush:
        'Robbers wearing the potters’ own straw cloaks rise from the ditch, led by a chief with a stolen guild token, with a big man with a club beside him and a bowman on the bank.',
      foe: 'bandit-chief',
      second: 'bandit-thug',
      third: 'bandit-archer',
      ending:
        'The carts reach the village without a single cracked bowl. The guild master gives each of you a cup from the best kiln, and your sensei drinks tea from {leader.theirs} for a month.',
    },
  },
  {
    id: 'glass-from-the-dunes',
    templateId: 'c-team-caravan',
    minMissionsCompleted: 6,
    reward: { ryo: 480, reputation: 8 },
    values: {
      title: 'Glass from the Dunes',
      client: 'The Sakyūgakure Glass Traders',
      caravan: 'a string of camels laden with desert glass',
      road: 'the dune road from the border to the village',
      region: 'dune-road',
      departure:
        'The traders wrap their faces against the sand and their camels spit at you. “Walk where they walk,” your sensei says. “The dunes move. The camels know where.”',
      signs:
        'At noon a line of tracks crosses the caravan’s path, deep and fresh, and loops round behind the next dune instead of going on.',
      ambush:
        'Raiders burst over the dune crest, a leader in a rich trader’s veil with two bowmen sliding down the sand behind him, arrows on the string.',
      foe: 'bandit-chief',
      second: 'bandit-archer',
      third: 'bandit-archer',
      ending:
        'The caravan reaches the village gate at dusk, and the traders hang a string of glass lanterns on it in thanks. They catch the light of the real ones and burn like jewels.',
    },
  },
  {
    id: 'lantern-oil-convoy',
    templateId: 'c-team-caravan',
    minMissionsCompleted: 9,
    reward: { ryo: 460, reputation: 8 },
    values: {
      title: 'The Lantern Oil Convoy',
      client: 'The Hibana Lamplighters’ Guild',
      caravan: 'three barrel-carts of lantern oil for the coming festival',
      road: 'the coast road and the river road from Port Shiomachi',
      region: 'coast-road',
      departure:
        'The barrels slosh and stink, and every one of them is enough to light a street for a year. “One spark,” your sensei says, “and we all go up with it. So nobody fights near the carts.”',
      signs:
        'Where the coast road turns inland, the river ferry is moored on the wrong bank, and its ferryman is nowhere to be seen.',
      ambush:
        'Raiders rise from the reeds by the ferry, their chief holding a torch high, with a pirate swinging a boat-hook and a bowman with fire-arrows behind.',
      foe: 'bandit-chief',
      second: 'river-pirate',
      third: 'bandit-archer',
      ending:
        'The oil reaches the village untouched, and on festival night every lantern burns bright. The guild master points out which street your barrels lit.',
    },
  },
  {
    id: 'first-tea-of-spring',
    templateId: 'c-team-caravan',
    minMissionsCompleted: 14,
    reward: { ryo: 450, reputation: 8 },
    values: {
      title: 'The First Tea of Spring',
      client: 'Tea Grower Oshima',
      caravan: 'the first picking of the spring tea, bound for the capital',
      road: 'the hill road over the eastern ridges',
      region: 'hill-road',
      departure:
        'Oshima rides on the lead cart with her chests of tea like a general with her treasure. “This tea goes to a prince,” she says. “If it arrives wet, I’ll sell you all to the circus.”',
      signs:
        'On the ridge the trees have been cut back to give a clear view of the road, and the stumps are fresh and smell of sap.',
      ambush:
        'Robbers drop out of the cedars, led by a chief who knows exactly what a chest of first-picking tea is worth, with two thugs carrying sacks to take it off in.',
      foe: 'bandit-chief',
      second: 'bandit-thug',
      third: 'bandit-thug',
      ending:
        'The tea reaches the capital road dry and fragrant, and Oshima opens one chest at the border post and brews a pot for the whole team on the spot.',
    },
  },
  {
    id: 'lost-on-mount-reikon',
    templateId: 'c-team-rescue',
    minMissionsCompleted: 3,
    values: {
      title: 'Lost on Mount Reikon',
      client: 'The Mountain Temple',
      lost: 'a party of pilgrims and their guide',
      wild: 'the high pilgrim path on Mount Reikon',
      briefing:
        'The pilgrims went up to light lanterns at the summit shrine, and the mist came down behind them. That was four days ago. “The mountain is thick with the dead,” the abbot says. “They do not always mean harm.”',
      trail:
        'Mist hangs on the path, the spirits murmur from every rock, and the pilgrims’ footprints come and go as if someone keeps rubbing them out.',
      threat:
        'The pilgrims are huddled in a cave, and a great grey bear stands at its mouth while a red-faced macaque taunts them from the rocks above.',
      foe: 'ash-fell-bear',
      second: 'reikon-macaque',
      survivors:
        'The pilgrims are cold and starving, and their guide has a deep bear-scratch down his back.',
      ending:
        'At the temple gate the guide tells the abbot that the lanterns on the summit shrine are lit, every one, and that he will carry the next pilgrims up himself.',
    },
  },
  {
    id: 'lost-in-the-salt-marsh',
    templateId: 'c-team-rescue',
    minMissionsCompleted: 7,
    values: {
      title: 'Lost in the Salt Marsh',
      client: 'The Shiomachi Clam Diggers',
      lost: 'a family of clam diggers caught by the tide',
      wild: 'the salt marsh north of Port Shiomachi',
      briefing:
        'They went out on the low tide and the sea fog rolled in. That was two tides ago. Their neighbours have searched until their legs gave out.',
      trail:
        'The marsh is a maze of channels that fill and empty with the tide, and every footprint is washed away within the hour.',
      threat:
        'The family has climbed onto an old salt-boiling hut, and a pair of marsh boars are rooting at its walls, half mad with hunger.',
      foe: 'ash-wood-boar',
      second: 'ash-wood-boar',
      survivors:
        'The family is soaked and blue with cold, and the youngest has a high fever from a night in wet clothes.',
      ending:
        'In Shiomachi the youngest, wrapped in three blankets, asks if you will come back and dig clams with them when the weather turns.',
    },
  },
  {
    id: 'snowbound-at-kiln-pass',
    templateId: 'c-team-rescue',
    minMissionsCompleted: 12,
    values: {
      title: 'Snowbound at Kiln Pass',
      client: 'The Village Post Office',
      lost: 'a post-runner and his mule train',
      wild: 'the snowbound heights above Kiln Pass',
      briefing:
        'The first snow came early, and the post-runner was caught on the high road. He has been gone three days, and he was carrying the village’s winter letters.',
      trail:
        'Snow has covered every track, the wind cuts through every layer, and the only sign of the road is a line of buried waymarkers.',
      threat:
        'The runner and his mules are trapped in a shepherd’s hut, and a bear woken early from its winter sleep is tearing at the door, with a tanuki darting about its legs.',
      foe: 'ash-fell-bear',
      second: 'feral-tanuki',
      survivors:
        'The runner is half frozen and his fingers are white, and one of the mules has gone lame.',
      ending:
        'The runner insists on delivering every letter himself, bandaged hands and all. The last one he gives to you, from someone you had forgotten you knew.',
    },
  },
  {
    id: 'ghost-ship-at-shiomachi',
    templateId: 'c-team-haunting',
    minMissionsCompleted: 4,
    values: {
      title: 'The Ghost Ship at Shiomachi',
      client: 'The Harbour-Master of Port Shiomachi',
      place: 'the harbour of Port Shiomachi',
      dread:
        'Every night a ship with no lights sails into the harbour and sinks at the quay, and every night a fisherman walks off the quay to board it. “Don’t look at the deck,” your sensei says. “Whatever you see there.”',
      pull: 'The ghost ship glides in on the dark water, and a voice calls each of you by name from its rail.',
      ghosts:
        'On the drowned deck stand the crew of a fishing boat lost in a storm, still hauling at nets full of nothing, still waiting to come home.',
      foe: 'hungry-ghost',
      second: 'canal-drowned',
      ending:
        'The fishermen of Shiomachi row lanterns out to where the ship sank, one for every man aboard. The ship does not come back.',
    },
  },
  {
    id: 'field-of-broken-spears',
    templateId: 'c-team-haunting',
    minMissionsCompleted: 8,
    values: {
      title: 'The Field of Broken Spears',
      client: 'Headman Ōtomo of the East Farms',
      place: 'an old battlefield under the east farms’ rice paddies',
      dread:
        'When the farmers dug a new paddy they turned up broken spears, and now the dead soldiers march across the fields every night. “They don’t know the war is over,” your sensei says.',
      pull: 'The marching dead call out a muster as you cross the field, and your feet start to keep their time.',
      ghosts:
        'Two soldiers in rusted armour stand guard at the edge of the paddy, one with a broken spear, one with a broken sword, waiting for an order to fall back.',
      foe: 'hungry-ghost',
      second: 'hungry-ghost',
      ending:
        'You light lanterns along the field’s edges and sound the old call to retreat. The marching dead turn, at last, and walk off into the night towards home.',
    },
  },
  {
    id: 'the-potters-empty-village',
    templateId: 'c-team-haunting',
    minMissionsCompleted: 11,
    values: {
      title: 'The Potters’ Empty Village',
      client: 'The Kiln Pass Potters’ Guild',
      place: 'the abandoned potters’ village below Kiln Pass',
      dread:
        'A plague emptied the village a lifetime ago, and nobody has lived there since. Now its kilns are burning again, and the guild’s apprentices hear their names called from the smoke.',
      pull: 'The smell of wet clay and kiln smoke wraps round the team, and somewhere a potter’s wheel is turning, and it is so very peaceful.',
      ghosts:
        'In the old storehouse a hungry potter crouches over a pile of cracked bowls, and a cold merchant counts the guild’s debts on his fingers.',
      foe: 'hungry-ghost',
      second: 'storehouse-wraith',
      ending:
        'You light the village’s lanterns, every one, and the kilns go cold for the last time. The guild sends a priest every year now, to keep them lit.',
    },
  },
  {
    id: 'the-reikon-stair',
    templateId: 'c-team-haunting',
    minMissionsCompleted: 16,
    reward: { ryo: 360, reputation: 9 },
    values: {
      title: 'The Endless Stair of Reikon',
      client: 'The Mountain Temple',
      place: 'the great stone stair up Mount Reikon',
      dread:
        'Pilgrims climb the stair and never reach the top, or the bottom. The temple has found three of them sitting on the steps, starving, sure they were nearly there.',
      pull: 'The steps go on and on, and the top is always just ahead, and you could climb for ever if only you kept climbing.',
      ghosts:
        'Two pilgrims sit on a landing halfway up, holding out their lanterns. Their lanterns are dark, and they want yours.',
      foe: 'hungry-ghost',
      second: 'hungry-ghost',
      ending:
        'You light their lanterns from yours, and they climb the last steps at once, and the stair has an end again. The monks hang new lanterns on the landing.',
    },
  },
];

import type { MissionFill } from '../../../../missionTemplates';

/** S-rank hunts a jōnin leads: rogues of their own grade, each with a past in the village. */
export const JONIN_S_FILLS: readonly MissionFill[] = [
  {
    id: 'the-hollow-lantern',
    templateId: 's-hunt',
    values: {
      title: 'The Hollow Lantern',
      client: 'The Tōrokage’s Office',
      quarry: 'the rogue jōnin they call the Hollow Lantern',
      briefing:
        'Years ago an archivist walked out of the sealed stacks with a lantern no one was meant to light. Villages along the river have started losing their dead, the graves open and the lanterns over them gone dark. The Tōrokage wants it ended, and wants the lantern back unopened.',
      trail:
        'The trail is ash and nothing else. Every village the Lantern passed through has had its lamps go out the night after, and nobody remembers a stranger.',
      found:
        'You follow the dark lamps upriver to a burned-out shrine, and see one lantern burning inside it, before anyone there sees you.',
      cold: 'You find the burned-out shrine upriver, but the lamps along the path have been lit for you. They know you are coming.',
      lair: 'Inside the shrine the Hollow Lantern sits writing seals on the floor by the light of the stolen lantern. A missing-nin in ember colours keeps the door.',
      foe: 'hollow-lantern',
      second: 'ember-missing-nin',
      surrender:
        'The Lantern closes the lantern’s shutter with one finger. “Take it home, then. I have read enough.”',
      ending:
        'The lantern goes back into the sealed archive, still shut. The river villages light their graves again, and the archive’s records say the archivist died years ago.',
    },
  },
  {
    id: 'the-warlords-blade',
    templateId: 's-hunt',
    minMissionsCompleted: 26,
    reward: { ryo: 1750, reputation: 26 },
    values: {
      title: 'The Warlord’s Blade',
      client: 'The Tōrokage’s Office',
      quarry: 'the village’s best sword, now the dune warlord’s',
      briefing:
        'The warlord in the dunes has a swordsman who cuts down caravan guards three at a time, and the survivors all describe the same stance. It is one the Kurogane forge taught, to one student only, before he left the village.',
      trail:
        'The warlord moves his camp every few days across the dunes, and the wind fills in his tracks by the next morning.',
      found:
        'You find the camp at a dry well at dusk, and the Blade alone at its edge, sharpening, before the camp knows you are there.',
      cold: 'You find the camp at a dry well, but a rider has gone ahead of you. The Blade is waiting with his sword drawn.',
      lair: 'The Blade stands between you and the warlord’s tent, and a Kurogane renegade who left with him stands at his shoulder.',
      foe: 'dune-warlords-blade',
      second: 'kurogane-renegade',
      surrender:
        'The Blade lays his sword across the sand between you. “Tell the forge I kept the edge. It is all I kept.”',
      ending:
        'Without his blade the warlord’s raids fall off within a season. The forge takes back its sword and hangs it on the wall, and nobody asks whose it was.',
    },
  },
  {
    id: 'the-salt-widow',
    templateId: 's-hunt',
    minMissionsCompleted: 32,
    reward: { ryo: 1900, reputation: 28 },
    values: {
      title: 'The Salt Widow',
      client: 'The Tōrokage’s Office',
      quarry: 'the Salt Widow, the water jōnin who leads the strait’s pirates',
      briefing:
        'Port Shiomachi has lost three ships this season, and every captain who came back says a woman walked across the water to them. The village lost a water jōnin to the strait, years ago now. The harbourmaster has written to ask, very politely, whether she was ever found.',
      trail:
        'The strait is all reefs and fog, and the Widow’s ships hide among the islands where no chart is any good.',
      found:
        'You find her anchorage among the outer islands and come in under the fog, before her lookouts see the boat.',
      cold: 'You find her anchorage among the outer islands, but the fog lifts as you come in. The whole cove is watching.',
      lair: 'The Salt Widow stands on the water between her ships and you, and a missing-nin with ember on his sleeves waits on the nearest deck.',
      foe: 'salt-widow',
      second: 'ember-missing-nin',
      surrender:
        'The Widow lets the sea take her weight and sinks to her knees on the water. “Tell the harbour I am sorry about the ships. Not about the rest.”',
      ending:
        'The strait is quiet by the next new moon. Port Shiomachi writes to thank the village, and the letter does not mention the Widow by any name.',
    },
  },
  {
    id: 'the-guttering-monk',
    templateId: 's-hunt',
    minMissionsCompleted: 36,
    reward: { ryo: 2050, reputation: 30 },
    values: {
      title: 'The Guttering Monk',
      client: 'The Tōrokage’s Office',
      quarry: 'the Guttering Monk, the Lantern Wind student who lit the seventh wick',
      briefing:
        'The mountain temples have been going dark one by one, their monks beaten senseless and their lamps drunk dry. Kōun read the report twice and said only that he knows the student, and that he should have stopped teaching him sooner.',
      trail:
        'He keeps to the pilgrim paths at night and sleeps in the temples he empties, and the pilgrims who meet him on the stair remember a lantern, not a face.',
      found:
        'You find the last temple on the ridge with one lamp still lit, and the Monk asleep beside it, before he wakes.',
      cold: 'You find the last temple on the ridge, but every lamp in it is lit. He has been sitting up for you.',
      lair: 'The Monk stands in the temple yard with his sleeves tied back, and a Kurogane renegade who has been buying his fights for a season leans on the gate.',
      foe: 'guttering-monk',
      second: 'kurogane-renegade',
      surrender:
        'The Monk lets the heat go out of his hands and sits down in the yard. “Tell the old man I lit them all. Tell him it was worth it.”',
      ending:
        'The temples light their lamps again by the first snow. Kōun sweeps the training ground at dawn as he always has, and does not ask how it ended.',
    },
  },
  {
    id: 'the-kiln-abbess',
    templateId: 's-hunt',
    minMissionsCompleted: 40,
    reward: { ryo: 2200, reputation: 32 },
    values: {
      title: 'The Kiln Abbess',
      client: 'The Tōrokage’s Office',
      quarry: 'the Kiln Abbess, who keeps the salamanders without the Kiln Mother’s leave',
      briefing:
        'Farms along the falls road have been burned out in the night, and the ash in the fields is still warm at noon. Rokuro of the Haibara came to the office himself to say the heat is salamander heat, and that whoever is calling them does not feed the kilns.',
      trail:
        'The burned farms make no line on the map, and the salamanders leave no tracks a dog will follow, only scorched stones and the smell of a kiln.',
      found:
        'You find the old kiln temple above the falls with smoke at one chimney only, and the Abbess asleep in the warm ash, before anything in the coals stirs.',
      cold: 'You find the old kiln temple above the falls, but every chimney is smoking. Something in the coals has told her you are on the stair.',
      lair: 'The Abbess sits cross-legged in the temple yard with her eyes half shut and the heat coming off her, and a missing-nin in ember colours keeps the kiln door.',
      foe: 'kiln-abbess',
      second: 'ember-missing-nin',
      surrender:
        'The Abbess lets the heat go out of her, and the coals go grey around her knees. “Tell the Mother I am sorry. She will not remember me either way.”',
      ending:
        'The kilns above the falls go cold again, and the farms along the road rebuild before the rains. Rokuro feeds the great kilns that night as on every other, and says nothing to anyone.',
    },
  },
];

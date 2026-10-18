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
        'Years ago an archivist walked out of the sealed stacks with a lantern no one was meant to light. Villages along the river have started losing their dead: the graves are open, the lanterns over them gone dark. The Tōrokage wants it ended, and wants the lantern back unopened.',
      trail:
        'The trail is ash and nothing else: every village the Lantern passed through has had its lamps go out the night after, and nobody remembers a stranger.',
      found:
        'You follow the dark lamps upriver to a burned-out shrine, and see one lantern burning inside it, before anyone there sees you.',
      cold: 'You find the burned-out shrine upriver, but the lamps along the path have been lit for you. They know you are coming.',
      lair: 'Inside the shrine the Hollow Lantern sits writing seals on the floor by the light of the stolen lantern. A missing-nin in ember colours keeps the door.',
      foe: 'hollow-lantern',
      second: 'ember-missing-nin',
      surrender:
        'The Lantern closes the lantern’s shutter with one finger. "Take it home, then. I have read enough."',
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
        'The Blade lays his sword across the sand between you. "Tell the forge I kept the edge. It is all I kept."',
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
        'Port Shiomachi has lost three ships this season, and every captain who came back says a woman walked across the water to them. The village lost a water jōnin to the strait a long time ago. The harbourmaster has written to ask, very politely, whether she was ever found.',
      trail:
        'The strait is all reefs and fog, and the Widow’s ships hide among the islands where no chart is any good.',
      found:
        'You find her anchorage among the outer islands and come in under the fog, before her lookouts see the boat.',
      cold: 'You find her anchorage among the outer islands, but the fog lifts as you come in. The whole cove is watching.',
      lair: 'The Salt Widow stands on the water between her ships and you, and a missing-nin with ember on his sleeves waits on the nearest deck.',
      foe: 'salt-widow',
      second: 'ember-missing-nin',
      surrender:
        'The Widow lets the sea take her weight and sinks to her knees on the water. "Tell the harbour I am sorry about the ships. Not about the rest."',
      ending:
        'The strait is quiet by the next new moon. Port Shiomachi writes to thank the village, and the letter does not mention the Widow by any name.',
    },
  },
];

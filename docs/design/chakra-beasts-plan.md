# Chakra beasts

The bestiary's animals are plain on purpose (`content-pass-plan.md`): no chakra, no
techniques, only traits, size and meat. This plan is the other side of that line: animals whose
lines have lived beside chakra for generations and come out of it strange. A boar whose tusks
smoke, a fox whose tracks lead you in circles, an old bear with moss on its back that the
mountain itself seems to answer to.

## What a chakra beast is

An animal of a kind the bestiary already has (or could), changed by where it lives: a leyline
under a mountain, a battlefield where too many shinobi died, a shrine grove, the edge of a great
beast's sleep. It is still an animal. It doesn't talk, sign contracts or use hand signs; what it
does, it does the way a heron fishes, by instinct grown over generations.

Three things set it apart from a plain animal, and each is already a fight rule:

- **Chakra.** It has a pool (`maxChakra`) and may have a **nature**, which strengthens its own
  element's techniques like anyone's (`rules/elements.ts`).
- **Techniques of its own.** Breath, spit, a charge wreathed in its element, a cry that dazes, a
  coat that hides it. Beast techniques are body moves where they are bites and charges (breath,
  `rules/breath.ts`) and moulded where they carry an element.
- **A gift.** Some carry one of the perks people earn by blood or training: `mimicry` (a shrike
  that answers your technique with your technique), `insight` or `foresight` (an owl that has
  watched shinobi fight for sixty years), a `shield` that rises from where its power came from (a
  turtle's shell of hardened dust), or a hive living in its body (`EnemyDef.hive`).

None of that needs new engine rules for the first pass. The line between plain and changed is
drawn in content: a plain animal has no chakra and no techniques; a chakra beast has both, and
its banner says so (`kind: 'Chakra Beast'`, so scouting and the field book can tell them apart).

## Three degrees of change

| Degree      | Danger        | What it is                                                                              |
| ----------- | ------------- | --------------------------------------------------------------------------------------- |
| **Touched** | petty, armed  | A plain body with a trickle of chakra and one trick: a hiding coat, a dazing cry.       |
| **Changed** | armed, deadly | A nature and an elemental technique or two, often a size up.                            |
| **Elder**   | deadly, elite | Named and old (`proper`), one of a kind, with a gift: mimicry, eyes, a shield, a brood. |

Elders are the bestiary's equivalent of named missing-nin: few, each with a description that is
a story, met on hunts and arcs rather than on the road.

## A first roster, by country

About eighteen, written once in `content/shared/bestiary/chakraBeasts.ts` for every pack (beast
techniques are shared, like companions', so no `FoeKit` roles are needed):

- **Woods:** a mist fox (touched: illusions, `illusionist`); an ember-tusk boar (changed: fire,
  a burning charge); an echo shrike (touched: `mimicry`, small and quick); the moss-backed bear
  (elder: earth, `huge`, armoured, slow and terrible).
- **Mountains:** a thunder kite (changed: lightning, swift dive); a stone serow (changed: earth,
  armoured, a charge that knocks); the old owl of the pass (elder: genjutsu, `foresight`).
- **River and marsh:** a lightning eel (changed: lightning, a shock that dazes); a mist toad
  (touched: water, a fog field); a marsh serpent (changed: water, a coiling pin).
- **Shore:** a tide crab (changed: water, a water wall); an ink squid (touched: a blinding
  cloud); a storm gull flock (touched: wind, `pack`).
- **Desert:** a glass scorpion (changed: a poison sting, `afflict`); a dune serpent (changed:
  earth, hides under the sand); the sand-sea turtle (elder: a dust `shield`, `huge`).
- **Anywhere chakra pools:** chakra hornets (touched: a hive, `EnemyDef.hive`); a lantern moth
  swarm (touched: glow, drain).

Each joins the bestiary bench at its danger, like every other foe.

## What has to be built

1. **Beast techniques for foes.** Add the new techniques to `shared/beastTechniques.ts` (or a
   sibling file) and give them a source exemption like companions' and summons': a technique held
   by a chakra beast is its own (`validateSources.ts`), and only foes of kind `Chakra Beast` may
   hold one (validated, so people never learn a boar's charge).
2. **The roster** above, with drops.
3. **The kitchen.** Chakra-rich meat and parts as `drops` (ember boar flank, thunder eel, moss
   bear fat, glass scorpion venom sac), each an ingredient only a beaten beast leaves (the existing
   `drops` route), and recipes that use them: chakra back as you eat, a study bonus for the
   beast's element (`studyElement`), a provision. One role each, as always.
4. **Jobs.** Hunt fills for the changed beasts (`c-team-hunt`, B-rank hunts); a protect job (a
   white stag poachers want, where the job fails if the beast dies); road-event bands for touched
   and changed beasts on the roads whose regions fit; and one arc around an elder (the old owl of
   the pass, say: something is wrong on the mountain, and the owl has been watching it).
5. **Scouting and the field book.** A read says "Changed by chakra" and names the nature and the
   gift once seen. The field book's foes page takes them with no code; a page of its own for chakra
   beasts is a later choice.

Then, later:

6. **Companions.** A changed wild kind you can track and win over in a chakra-rich wild place
   (`trackWild`), whose techniques open by bond stage like any kind's (`CompanionKindDef`), slower
   to bond than a plain wolf and worth it.
7. **Rules gaps, only if the first pass shows them.** Candidates: a beast that regenerates (a
   heal over exchanges), venom that stacks, a shell that cracks and stays cracked. Each a verb or a
   lingering effect, added only when a beast can't be written without it.

## Order

1. Beast techniques, the source exemption and its validation; the roster; the bench.
2. Drops and the recipes that use them.
3. Hunt fills, the protect job, road-event bands, then the elder's arc.
4. Scouting's "changed by chakra" line.
5. Later: changed companions, and any rule a beast turns out to need.

## Open questions

- **What the world calls them.** "Chakra beasts" is a working name. The original pack may want
  its own word, and the fan pack has canon ones; the banner text could come from `SettingText`.
- **Where the line with summons sits.** Summoning clans speak and sign contracts. Are elders what
  a chakra beast becomes when it lives long enough to talk, or a different thing entirely? This
  plan keeps them apart: elders never speak.
- **Tailed beasts** and anything of that scale are out of scope.
- **How rare.** Touched beasts could be common on the roads near chakra places, or rare
  everywhere. This plan starts rare: a band on a few regions' roads, and hunts.

# The naruto cast against the fighter types

Each canon character read by how they fight in the story, not by their stat lines in the pack
(those are rewritten next, to the stat model). The point is to find what the types miss: a
character who fits no type shows a missing type, a hole in the fight engine, or both. Nobody is
squeezed into a type that doesn't describe them.

## Who fits

| Character                            | Fits                                 | How they fight                                                       |
| ------------------------------------ | ------------------------------------ | -------------------------------------------------------------------- |
| Rock Lee, Might Guy                  | close fighter                        | taijutsu and speed; the Gates are techniques                         |
| Hinata, Neji, Hiashi                 | strikes the chakra itself (new)      | Gentle Fist: taijutsu, control and the Byakugan                      |
| Sasuke                               | closes with jutsu                    | fire ninjutsu, taijutsu, speed and the Sharingan                     |
| Asuma, Raiga                         | closes with jutsu                    | chakra blades or lightning swords, and ninjutsu                      |
| Hayate, Yūgao, Raidō, Masaru, Tengen | weapons fighter                      | kenjutsu, closing with speed (Hayate with clones too)                |
| Zabuza                               | weapons fighter                      | kenjutsu, closing in the Hidden Mist (ninjutsu as the way in)        |
| Tenten, Genma, Haku, Kin             | marksman (new)                       | the weapon art at throwing steel or senbon, aimed by the eyes        |
| Kotetsu                              | weapons fighter                      | a giant club: a blunt weapon of the weapon art                       |
| Kurenai, Shion, early Sakura         | illusionist                          | genjutsu, control, wits                                              |
| Ino, Inoichi, Aoba                   | illusionist, or sensor               | the mind arts read as genjutsu; sensing                              |
| Shikamaru, Shikaku                   | binds and outthinks (new)            | shadow holds, intellect, control                                     |
| Kakashi                              | tactician (new) or closes with jutsu | many arts, genius, Chidori to close                                  |
| Hiruzen, Iruka, Ebisu                | all-rounder (new)                    | several arts, control, choosing the distance                         |
| Naruto (early)                       | wins by numbers (new)                | shadow clones, reserves and stamina                                  |
| Hotaru                               | ninjutsu fighter                     | ninjutsu from range                                                  |
| Kaname                               | close fighter                        | taijutsu                                                             |
| Izumo                                | ninjutsu fighter                     | water ninjutsu                                                       |
| Gōzu and Meizu, Dosu                 | close fighter                        | claws and chain, a sound gauntlet: close work with gear              |
| Ao                                   | sensor                               | the Byakugan, sensing                                                |
| Kiba, Tsume                          | fights beside a beast partner (new)  | a close art and speed, with the ninken read as a fighter             |
| Shino, Shibi                         | fights through the hive (new)        | the hive graded by its strain and fullness, chakra control, reserves |
| Anko (later Jiraiya)                 | summoner (new)                       | the strongest summons that answers, ninjutsu, reserves for upkeep    |

## Who doesn't fit

These need a type the stats alone can't express, a change to the engine, or both.

| Character    | What they are                         | What's missing                                                                                                                                                                                              |
| ------------ | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chōji, Chōza | a heavy body that walks through blows | **Heavy, half done.** Size (`rules/size.ts`) lets a big body walk in through a hold-off in the fight, but readiness still asks a close fighter for speed and eyes or ninjutsu to get in: it can't see size. |
| Ibiki        | interrogation and torture             | Not a fighter's type: his work is off the battlefield.                                                                                                                                                      |
| Hana         | animal medic                          | Medic and beast partner at once: no type joins the two yet.                                                                                                                                                 |

## Next

- Weapons are filled (decision 18 in CLAUDE.md): weapon classes with their own
  handling and reach, mastery per class, throws on the weapon art, so the marksman and blunt
  weapons have a home. Size lets a heavy body close in the fight; readiness doesn't read it yet.
- Readiness now reads companions, hives and summons (`exam/kitReadiness.ts`), so beast
  partners, hive users and summoners have types.

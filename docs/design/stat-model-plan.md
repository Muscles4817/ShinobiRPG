# The stat model

What a stat value means, by kind of stat, and what has to change to match. This replaces
the reading the game was built on, where each grade belonged to a rank (E–D genin, C chūnin,
B–A jōnin, S kage) and validation held each person's best stat inside their rank's band. A
grade is never a cap: anyone may hold any grade in any stat.

## The scale

Values run 0–60. The grade bands stay where they are; S widens to cover everything from
barely elite to the gods among men.

| Grade | Values | Skills: who sits here on average             |
| ----- | ------ | -------------------------------------------- |
| E     | 0–8    | Genin                                        |
| D     | 8–13   | A good genin                                 |
| C     | 13–20  | Chūnin                                       |
| B     | 20–28  | Jōnin                                        |
| A     | 28–40  | A good jōnin                                 |
| S     | 40–60  | Elite, up to Hashirama and Madara at the top |

The rank column is an **average for an ordinary shinobi** (no clan, no gift) in their main
art, never a limit. A clan child, a prodigy or a specialist sits well off it.

## Three kinds of stat

Each kind comes from somewhere different, grows differently and is read in different words.

### Skills: taijutsu, ninjutsu, genjutsu, kenjutsu, fūinjutsu and chakra control

Trained. These follow the rank chart above. Graduates start low (mostly E, the best of the
year a D or a C in their art); years of work and teaching move them. Talent (aptitude) sets
how fast and how far. Only skills are read against rank ("chūnin-level ninjutsu").

### Body: strength, speed, stamina and chakra reserves

Natural athleticism, read against real people. Genin graduate at 16–19, so they are grown, not
children: what their body is at graduation is mostly what it is. Values are anchored on
real-world adult performance, with S kept for what no unaided human can do:

| Value | Who, in real-world terms                                                          | 100 m   | Deadlift (× bodyweight) | VO2max (ml/kg/min) |
| ----- | --------------------------------------------------------------------------------- | ------- | ----------------------- | ------------------ |
| 4     | An untrained adult                                                                | ~14.5 s | ~1.0×                   | ~42                |
| 8     | Fit, sporty (top 20%)                                                             | ~12.5 s | ~1.6×                   | ~50                |
| 13    | A strong club athlete (top 5%)                                                    | ~11.3 s | ~2.2×                   | ~58                |
| 20    | A national-level athlete                                                          | ~10.3 s | ~2.8×                   | ~68                |
| 28    | World-class (Walcott at 18, Bolt)                                                 | ~9.8 s  | ~3.5×                   | ~80+               |
| 40+   | Beyond human: chakra-driven bodies (Guy, Tsunade's strength, the Raikage's speed) |         |                         |                    |

Real numbers, roughly: an untrained man runs 100 m in 13–15 s, national finalists in about
10.1 s, the best in the world in 9.8 s or less. A beginner deadlifts about bodyweight; elite
lifters, the top 5%, about 3.25×. VO2max in the twenties: average men about 42, the top 5%
about 55, elite endurance athletes 80 or more. (Sources at the end.)

**At graduation** the academy has selected and drilled its students, so the class sits above
the general population: a median near 7–8 in each body stat, most between 4 and 14, a few
outliers at 18–22 (a Lee-type speed or a clan's strength). Reserves are born and clan-driven
more than any other body stat.

**Growth after graduation** follows how much real bodies still change after 18:

- **Speed** is the least trainable. Sprinters peak around 23–26 and gain a few percent over
  their career: about one grade at most, mostly in the first years.
- **Strength** is the most trainable: lifts can double from fit to advanced over years, with
  a peak around 27–30. About two grades of headroom for most, more for a big frame.
- **Stamina** trains well (aerobic capacity rises 15–25% with training, economy more) and
  peaks late, around 28–32. About two grades.
- **Reserves** grow slowly with use (as now), much faster for clans built on them.
- A **late bloomer** (late puberty) gets one more lift to body limits early in their genin
  years, rolled at creation, like a breakthrough.
- Beyond human (S) comes only through breakthroughs: the Gates, a clan's arts, a bloodline.

### Mind: intellect, perception and willpower

Individual and mostly innate, like real ability: any grade at any rank. Rolled at creation on a
wide curve (median about 7, the top 5% at C, the top 1% at B, a rare few at A as genin:
Shikamaru's intellect). It grows slowly with experience: perception and willpower more than
intellect.

## Clans

Clans should move the body and mind a long way, and their limits with them. Today Akimichi get
+2 strength and +2 stamina and nothing for reserves; Nara +3 intellect. Proposed: shifts of
5–10 at graduation in the clan's signature stats (an Akimichi graduates at B strength and C
reserves where an ordinary student is at D), and limits raised to match.

## What changes in the code

1. **Grades** (`systems/stats/tiers.ts`): S runs to 60 and values are kept within 0–60. Only
   skills are read against rank; body and mind get their own words ("an athlete", "world-class",
   "beyond human"; "sharp", "brilliant").
2. **Validation** (`content/validateRanks.ts`): the rank bands go. Role and rank still pair, and
   every value stays within 0–60. The editor's band note goes with them.
3. **Chūnin readiness** (`exam/entry.ts`, `readinessGap`): counts skills only, so a sharp mind
   or a fast body doesn't make a genin ready.
4. **Limits** (`systems/stats/limits.ts`): curves per kind (speed nearly fixed, strength and
   stamina trainable, mind slow), raised by clan, the build and a late bloom.
5. **Creation and classmates** (`systems/profile/`, `game/student.ts`, `game/aptitude.ts`): body
   and mind are rolled from the class curves above, shaped by clan, build, upbringing and notes
   (a genius note, a late bloomer). The academy file's development points go into skills only.
6. **Clans**: body and mind shifts and limits as above, in both packs.
7. **Content pass**: every person and foe in both packs rewritten to the model (Guy's taijutsu
   S, Kakashi's intellect S, Hiruzen's body ordinary but fast with deep reserves, bandits as
   untrained adults, samurai as trained ones, Zabuza as the jōnin-grade swordsman he is), and
   companion kinds' bodies set against the same human anchors.
8. **Combat**: wider spreads change who wins. Rerun the fight table and the benches, then retune
   the damage gap, `SKILL_DEFENCE_SHARE`, `cappedHit`, and intellect's slots and judgement
   against them.
9. **Saves**: existing characters keep their stats; nothing is rescaled.

## The baseline

`fight-table-before.md` (in `research/`) is the table on today's numbers: 30 watched bouts a
row between canon fighters. What it shows before any change:

- **Fights end almost at once.** Equal jōnin last about a round (Asuma against Kurenai: 1.1
  rounds, Kurenai every time), far short of the two-to-three-round target for equals.
- **The caps distort the top.** Guy beats Hiruzen 93% of the time and Kakashi 77%, because
  Hiruzen's stats sit at a flat A and Guy's taijutsu could not go above A.
- **Foes are too weak for their story.** Kakashi beats Zabuza every time inside a round
  (Zabuza's kenjutsu is 20 against Asuma's 32).
- **One missing defence decides a fight.** Kurenai beats Asuma every time: genjutsu meets
  willpower, and his is a flat C.

Rerun it after each step with `VITE_FIGHT_TABLE=true npx vitest run src/test/fightTable --silent=false`,
which prints the table between `FIGHT TABLE` and `END OF TABLE`.

## Sources

- [Age of peak sprint performance (PMC11571461)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11571461/)
- [Cooper Institute VO2max percentiles, ages 20–29](https://www8.garmin.com/manuals/webhelp/venu/EN-US/GUID-1FBCCD9E-19E1-4E4C-BD60-1793B5B97EB3.html)
- [Deadlift standards by percentile (Strength Level)](https://www.strengthlevel.com/strength-standards/deadlift/lb)
- [100 m times of US national-level sprinters (PMC8580521)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8580521/)
- [Average 100 m times by level (rough, blog)](https://marathonhandbook.com/average-100-meter-time/)

# Milestone 3, the rest: control, spirits, mastery, natures, the Gates

What is left of milestone 3 (progression) after the progression, techniques and creation runs.
Ranks are done (the exam, promotion, jōnin nomination); a nature is found, not picked (the
chakra paper). Part 1 records what we agreed. Part 2 is the order. Part 3 records what was
built.

---

## Part 1: Decisions

1. **Chakra control shows up in the world as exercises you learn, not stat thresholds.**
   Tree-walking and water-walking are learned over sessions at a place that offers them, once
   your chakra control reaches the exercise's grade. Mastering one is a **breakthrough**
   (`exercise:<id>`): it moves the chakra control limit a little, and for walking it opens the
   way across a surface (roads with a `walk` need, `game/walking.ts`).
2. **Your sensei teaches tree-walking.** It is closed until they start it with you at a weekly
   lesson (the kunai marks on the bark); after that you practise on your own. Water-walking is
   practised on your own, on the water: Shiomachi's breakwater in the original pack.
3. **Two exercises for now:** tree-walking and water-walking. Others (wall-walking, a chakra
   scalpel) can come as the same kind of thing later.
4. **Order:** control exercises → spirits (which opens Mount Reikon) → technique mastery
   stages → a second nature → the Gates.

## Part 2: Order of work

1. **Control exercises** (this run's first step).
2. **Spirits.** Summons and spirit contracts; the spirit art; Mount Reikon opens (world plan
   step 12).
3. **Technique mastery stages.** Unstable → proficient → mastered → a signature variant.
4. **A second nature.** Hard-won, a moment rather than a pick.
5. **The Gates.** High-risk power: huge strength, then injury; a breakthrough of the same kind.

## Part 3: What was built

1. **Control exercises.** `ExerciseDef` (`content/exercises.ts`, shared in
   `shared/exercises.ts`): the grade it takes, the pace, whether the sensei starts it, the
   surface it walks, its limit bonus and its lines. Training places list `exerciseIds`.
   `practise` is a session (`game/exercises.ts`): progress = pace × talent for chakra control
   × a little more for each grade of control past the one it needs; early sessions may end in
   a fall (a little harm, some progress all the same). Your sensei starts tree-walking after a
   weekly lesson once your control is at D. The training page shows each exercise with how far
   you've got. `canWalk` now reads mastery, replacing the stand-in grade rule from world-plan
   step 9. Progress lives on `character.exercises` (absent in older saves: none begun, so no
   save step). Also: a genin on a pass keeps to safe roads where a safe way exists, instead of
   being refused the quickest road when it has bandits on it.

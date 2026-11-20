# Thinking foes in every fight: what they showed

Foes now think ahead in every fight (`engines/plan/mind/planner/`, `docs/design/research/planner-foes.md`
for how). Turning them on everywhere is the point of putting the AI first: a foe that looks for
the best thing to do finds the holes in the rules and in our own default plans. This is the list
of what it found, kept until each is settled. Nothing here has been tuned away.

## Fixed on the way

- **A watched bout's fighters on your side never played their kit when they thought.** The round
  a mind plans from (`asRound`) dropped the fact that the bout is only watched, so the player's
  fighter announced no kit plays: Jiraiya never called Gamabunta or opened Sage Mode, and no one
  played for time against a killer. The round now carries it.
- **A burn or poison that finished someone told its full strength.** The story said a burn took 3
  when 2 was left. Lingering harm now goes through `taken`, as every hit does
  (`lingering.test.ts`).

## Settled with the owner

1. **A thinking fighter now thinks before every exchange,** not once a round. It used to plan one
   or two moves at a round's start and then decide the old way, sometimes on instinct. A plan of
   moves it already holds is kept unless a fresh look beats it clearly (`planner/think.ts`).
   Measured on the bench cast, one look costs about 48 ms on the bench machine (median 38, the
   slowest in twenty about 120), so four a round is affordable off the page's thread. A sharp
   jōnin against the seventh gate now outlasts it every time (`gateSurvival.test.ts`).
2. **A killer since a fighter settled on its move lets a sharp mind think again**
   (`newKiller` in `survival.ts`). What the player sees of a foe's next move is a read, never a
   promise, so a foe changing its mind looks like a misread, which reads can already be.
3. **Whose plan a fighter fights by is kept on the fighter** (`ownPlan`, `plan/ownPlan.ts`), set
   as the fight starts. It was worked out from the round each time, and two readings of the round
   (`asRound`, the instinct moment) had lost it, so a watched fighter of yours never played for
   time. The second time a kind of bug appeared, its cause was fixed.
4. **The far gap is in every fight** (`plan/farGap.ts`): crossing between mid and far is the harder
   step both ways. The far holder's second shot is gone: at that distance a single thrown blade
   is less likely to stop anyone, not more (below).

## Being designed

- **Holding off: hit is not stopped.** The owner's picture: a single kunai at far range almost
  never stops anyone short of a very skilled thrower; a volley of shuriken hits more often but
  lightly, and a closer it hits still gets through, taking the harm (poisoned tips make that
  dearer); a technique that fires many blades is better at far; something heavy, like a giant
  shuriken, stops all but the toughest. Shuriken run out, so coming unprepared is punished. A
  holder with no way to keep someone off and nowhere to hide is in trouble.
- **Default plans walked into a hold-off again and again.** The owner reads this as the game
  needing more ways to close, not a plan to patch: a cheap clone technique to draw the shot while
  you come in (clones already screen a charge, `plan/screening.ts`, but no default plan uses them),
  and the far gap and the hold-off rules above.
- **Thinking casters seldom cast when crowded,** so seals broken up close (a rule on trial) come up
  far less often in versus.

## For the ready sense (`docs/design/ready-sense-plan.md`)

- Hiding is easier the further away you are, even without a technique: in a forest at far range it
  is very easy, and finding someone there by your own senses is hard.
- Most sensing techniques don't reach well at far range (as Neji against the Sound's spider user).

## The benches, played thinking

The pipeline plays every fight by instinct; thinking runs locally, with
`npm run test:thinking -- src/test/bench` for the benches.

**The matrix** (every cast member against every other at chūnin, both sides thinking, 8 seeds a
pair): 22 pairs fall outside the 15–85% band that were inside it by instinct.

- powerhouse against stalker, mist blade, gates, foresight and mimic
- versatile against illusionist, and illusionist against versatile
- sealer against trapper; shrouded against trapper, foresight and mimic
- sensor against powerhouse and stalker
- cloner against counterer and summoner; counterer against mist blade
- summoner against rusher and mist blade
- gates against foresight and mimic; foresight and mimic against stalker

Eight seeds a pair is noisy (one standard error is near 18 points), so the first step is a run at
`REPORT_SEEDS` to see which are real. Foresight and mimic recur: they were the reacting kits the
planner bench already saw do worse thinking.

**The bestiary** (each foe at the scale its danger means, 20 seeds): the retainer captain is
beaten 17.5% (target 18%) and the moss-backed bear 16.7% (target 20%); the wandering sword saint
didn't finish inside 30 seconds.

**The team bench:** the back-row cover and mixed-band tests didn't finish inside 20 seconds.

**Cost:** the whole bench suite took about 34 minutes thinking against about 9 by instinct, most
of it the bestiary and foreign shinobi benches. Their per-test time limits are set for instinct,
so a thinking run shows some as timeouts until those limits read the run.

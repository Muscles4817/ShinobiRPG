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

## Open questions (the owner decides)

1. **After its short plan, a thinking fighter falls back on old judgement.** It plans once a round
   (one or two moves), then for the rest of the round decides as today's AI does: at the end of
   the exchange before, and sometimes on instinct instead of its plan. A sharp jōnin against the
   seventh gate braces as planned, then on instinct throws a bolt and is cut down: it outlasts the
   gate a quarter of the time, where re-deciding each turn by its plan outlasted it at least half
   the time (`gateSurvival.test.ts`, which now measures today's minds). Should a thinking mind keep
   thinking each exchange of the round?
2. **An announced move stands when a killer appears before the fighter's turn.** Everyone shows
   their next move at the end of an exchange and keeps to it unless it has become pointless. If
   Guy opens a gate earlier in the exchange, a fighter who announced a bolt still throws it rather
   than brace. Should a fighter who reads the fight be let off their announcement then? The
   announcement is a promise to the player, so letting foes break it costs trust in the telegraph.
3. **Default plans walk into a hold-off again and again.** A thinking archer keeps kunai ready and
   shoots anyone who steps in. The plan the game fills in for a fighter who wants to fight up close
   tries to step in every exchange, is stopped every time ("You make another try, and Asuka shuts
   it down again"), and a puppeteer never unseals the puppet it could have sent in from where it
   stood (`puppetry.test.ts`). Should default plans notice they are being held off and do
   something from where they stand?
4. **Thinking casters seldom cast when crowded,** so seals broken up close (a rule on trial) come
   up far less often in versus.

## The benches, played thinking

CI plays these by instinct until the findings are worked through; the weekly run
(`bench-thinking.yml`) plays them thinking. Run the same by hand with
`VITE_BENCH_THINKING=true npx vitest run src/test/bench`.

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
so the weekly run will show some as timeouts until those limits read the run.

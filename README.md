# Shinobi RPG

A text-based shinobi life RPG you can play offline on your phone.

You are a freshly graduated Genin in a world where the elements answer to those who listen and
the dead do not always rest. Train, eat, pay your rent, study techniques and take missions.
Later milestones add relationships, travel, elements and spirits, and the choice between going
rogue and rising to Kage.

## Playing

```bash
npm install
npm run dev        # http://localhost:5173
```

**On your phone:** the game is published to GitHub Pages at
**https://muscles4817.github.io/ShinobiRPG/** every time CI passes on `main`
(`.github/workflows/deploy.yml`). Open it in your phone's browser and use
**Add to Home Screen** (Safari: Share → Add to Home Screen; Chrome: ⋮ → Install app).
It then runs as an app and works fully offline; progress autosaves on the device.
New versions download automatically the next time you open it with a connection.

One-time setup: in the repo go to **Settings → Pages → Build and deployment → Source** and
choose **GitHub Actions**.

## What's in it

- **Two worlds.** _Hidden Leaf_ uses Naruto names (a fan pack for personal play);
  _Land of Embers_ is the game's own setting. Choose when you start a new life.
- **The village is home.** Each village has its own backdrop and sky that follows the time of
  day, and places to visit: Mission Hall, Training Grounds, Market, Academy, Home, Hospital.
- **Every place works differently.** A drill board for training, food stalls, your rented room
  (pay rent or get locked out), a notice board of jobs, a rack of technique scrolls.
- **Missions play as a story** with real odds on every choice; fights use a hand of technique
  cards. Results come as cards: fight results, mission debriefs, hospital bills.
- **Travel** lists the other villages (coming soon).

## Releases

`npm run build` includes every pack. For anything public, use `npm run build:release`, which
leaves fan packs out entirely (`npm run check:release` verifies it). Note that the GitHub
Pages deploy uses the normal build, so it includes the fan pack.

## Development

See **[CLAUDE.md](./CLAUDE.md)** for the architecture, module boundaries and code-quality rules.

```bash
npm run check      # typecheck + lint + format + architecture + tests + build (what CI runs)
```

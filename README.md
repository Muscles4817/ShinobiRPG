# Shinobi RPG

A text-based shinobi life RPG you can play offline on your phone.

You are a freshly graduated Genin of **Tōrōgakure, the Village Hidden Among Lanterns**, in a
world where the elements answer to those who listen and the dead do not always rest. Train,
eat, rest, study techniques and take missions. Later milestones add relationships, travel,
elements and spirits, and the choice between going rogue and rising to Kage.

## Playing

```bash
npm install
npm run dev        # http://localhost:5173
```

Once the built app (`npm run build` → `dist/`) is hosted on any static host (e.g. GitHub Pages),
open it on your phone and use **Add to Home Screen**. It installs as an app and works fully
offline; your progress autosaves on the device.

## Milestone 1 (current)

- Character creation with three aptitudes (Taijutsu / Ninjutsu / Genjutsu prodigy)
- Calendar with four time slots per day, seasons and years
- Ten stats with diminishing-returns training at nine training spots
- Health, chakra, energy and hunger; food stalls, naps and sleep
- Ten techniques to study at the academy library
- Six D-rank missions with stat-check choices and turn-based combat
- Hospital, reputation, journal, autosave and versioned saves

## Development

See **[CLAUDE.md](./CLAUDE.md)** for the architecture, module boundaries and code-quality rules.

```bash
npm run check      # typecheck + lint + format + architecture + tests + build (what CI runs)
```

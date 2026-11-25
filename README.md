# dapur-kilat

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/xenkira/dapur-kilat/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/xenkira/dapur-kilat/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Dapur Kilat is a fast cooking game for make.fun's "Make the best cooking game" bounty ($250 in USDC). Orders come in on the board — Burger Klasik, Burger Keju, Salad Segar, Burger Spesial — and you run the kitchen: grab ingredients from the bins, grill the patty, chop the vegetables on the board, stack the plate in the right order and serve before the customer's patience runs out. One 150-second shift, combos raise the tip, burnt patties go in the trash.

Everything is drawn with canvas shapes and every sound is synthesized with WebAudio: no image, audio or font files, no network request, no library. Play it with mouse or keyboard (1-6 ingredients, G grill, C chop, P plate, S serve, T trash, M mute, Enter start).

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Or serve `game/` with any static HTTP server — `game/index.html` opens in desktop Chrome and plays offline.

The hand-in program copies `game/` and `screenshots/` to `/output` and writes `/output/dossier.json`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Requires Node 22.18 or later, standard library only.

## Screenshots

The four screenshots in `screenshots/` are real renders of the game's own code in a browser (see `shots.json` for the scene each one shows): the cover is mid-shift with three orders on the board, a patty on the grill, a tomato half-chopped and a burger mid-assembly; then the title screen, a plate ready to serve, and the shift results.

---

<sub>Entered on [make.fun](https://make.fun/?ref=jj1n87tn&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>

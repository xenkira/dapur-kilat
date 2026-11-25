// Dapur Kilat — the hand-in program (Node 22, standard library only).
// It copies the game's static files and the maker's screenshots from
// beside this file into /output, then writes /output/dossier.json with
// the kit's vendored library, so the scorer can rebuild the same dossier
// byte for byte from what is handed in. It is deterministic: two runs
// write the same bytes, because it only copies files and writes the
// dossier the library computes from them.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer caps /output at 1000 entries and 64 MiB, shared by game/,
// screenshots/ and dossier.json; the game itself stays far under the
// gate's own caps (993 files / 48 MiB for game/, 4 shots at 256 KiB).
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function mustExist(path: string, what: string): void {
  if (!existsSync(path)) throw new Error(`Dapur Kilat: ${what} is missing at ${path}`);
}

mustExist(join(repoRoot, 'game', 'index.html'), 'game/index.html');
mustExist(join(repoRoot, 'screenshots'), 'screenshots/');

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

writeFileSync(join(outDir, 'dossier.json'), buildDossier(outDir, DOSSIER_CAPS));

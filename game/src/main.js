// Dapur Kilat — boot and frame loop. The canvas is scaled to the window
// while the game itself always thinks in its 1280x800 logical size, so a
// click on a station lands on the same spot at any window size.

import { VIEW_W, VIEW_H } from './config.js';
import { mulberry32 } from './random.js';
import { makeAudio } from './audio.js';
import { newGame, update } from './state.js';
import { attachInput } from './input.js';
import { render } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

const params = new URLSearchParams(location.search);
const seedParam = params.get('seed');
const seed = seedParam === null ? (Date.now() % 2147483647) : Number(seedParam);
const rng = mulberry32(Number.isFinite(seed) ? seed : 1);

const audio = makeAudio();
const g = newGame(rng);
// A read-only handle for play-testing and screenshots: the test script
// reads the score and the screen, it never writes the state.
window.__dapur = g;
g.mouse = { x: VIEW_W / 2, y: VIEW_H / 2 };
g.audioMuted = false;

attachInput(canvas, g, audio);

const shot = params.get('shot');
if (shot) applyShot(g, shot, seedParam === null ? null : seed);

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(VIEW_W * dpr);
  canvas.height = Math.round(VIEW_H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', resize);
resize();

// The status line mirrors the game for screen readers.
function announce() {
  const line =
    g.screen === 'title'
      ? 'Dapur Kilat. Tekan Enter untuk mulai memasak.'
      : g.screen === 'done'
        ? `Shift selesai. Koin ${g.coins}, pesanan tersaji ${g.served}.`
        : `Sisa waktu ${Math.ceil(g.timeLeft)} detik. Koin ${g.coins}. Pesanan aktif ${g.orders.length}.`;
  if (status.textContent !== line) status.textContent = line;
}

let last = performance.now();
let announcedAt = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  // The clock only runs while playing; a shot scene holds its moment.
  if (g.screen === 'playing' && !params.get('shot')) update(g, dt);
  if (g.screen === 'playing' && params.get('shot')) update(g, 0);
  render(ctx, g);
  if (now - announcedAt > 1000) {
    announcedAt = now;
    announce();
  }
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

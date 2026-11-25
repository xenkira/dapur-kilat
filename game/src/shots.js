// Dapur Kilat — screenshot scenes. ?shot=start|mid|serve|end (with an
// optional ?seed=) drops the live game into a real state built with the
// same state functions the player drives: nothing here is a picture, it
// is the game itself at a chosen moment, so the screenshots are renders
// of the game's own code.

import { startShift, say } from './state.js';
import { SHIFT_SECONDS } from './config.js';

export function applyShot(g, shot, seed) {
  if (shot === 'start') {
    g.screen = 'title';
    return;
  }
  startShift(g);
  if (shot === 'mid') {
    // Forty-five seconds into a busy shift: three orders on the board, a
    // patty half-grilled, a tomato half-chopped, a burger mid-assembly.
    g.elapsed = 45;
    g.timeLeft = SHIFT_SECONDS - 45;
    g.orders = [
      { id: 1, recipe: 'burger', patience: 28, max: 45 },
      { id: 2, recipe: 'salad', patience: 18, max: 45 },
      { id: 3, recipe: 'cheese', patience: 38, max: 45 },
    ];
    g.grill = [{ kind: 'patty', t: 2.4, burnt: false }, null];
    g.board = { kind: 'tomato', chopsLeft: 1 };
    g.plate = ['bun', 'patty', 'lettuce'];
    g.hand = { kind: 'tomato', prepped: true };
    g.mouse = { x: 1060, y: 470 }; // the chopped tomato hovers over the plate
    g.coins = 120;
    g.served = 3;
    g.combo = 2;
    g.bestCombo = 2;
    say(g, 'Burger Klasik hampir jadi — tomatnya tinggal dipotong!');
  } else if (shot === 'serve') {
    // A finished plate that matches the top order, ready to serve.
    g.elapsed = 72;
    g.timeLeft = SHIFT_SECONDS - 72;
    g.orders = [
      { id: 4, recipe: 'burger', patience: 30, max: 45 },
      { id: 5, recipe: 'cheese', patience: 22, max: 45 },
    ];
    g.plate = ['bun', 'patty', 'lettuce', 'tomato', 'bun'];
    g.coins = 210;
    g.served = 5;
    g.combo = 3;
    g.bestCombo = 3;
    say(g, 'Piring cocok dengan pesanan #4 — tekan SAJI!');
  } else if (shot === 'end') {
    g.screen = 'done';
    g.elapsed = SHIFT_SECONDS;
    g.timeLeft = 0;
    g.coins = 480;
    g.served = 9;
    g.missed = 2;
    g.combo = 0;
    g.bestCombo = 4;
    g.stats = { served: 9, missed: 2, earned: 480 };
    g.orders = [];
    g.plate = [];
  }
  if (seed !== null && seed !== undefined) {
    // The seed only steadies the order stream; a shot scene is fixed
    // above, so this is a no-op anchor for the screenshot script.
    void seed;
  }
}

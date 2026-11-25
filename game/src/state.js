// Dapur Kilat — the whole game state and its rules. No drawing here:
// render.js reads this state, input.js calls these verbs.

import {
  INGREDIENTS, RECIPES, RECIPE_ORDER, ORDER_PATIENCE, SPAWN_EVERY_EARLY,
  SPAWN_EVERY_LATE, MAX_ORDERS, GRILL_SECONDS, BURN_SECONDS, SHIFT_SECONDS,
} from './config.js';
import { pickWeighted } from './random.js';

let orderId = 1;

export function newGame(rng) {
  return {
    screen: 'title',
    rng,
    elapsed: 0,
    timeLeft: SHIFT_SECONDS,
    orders: [],
    spawnIn: 2,
    firstOrderDone: false,
    hand: null, // { kind, prepped } — prepped: cooked patty / chopped veggie / ready bun & cheese
    grill: [null, null], // { kind: 'patty', t, burnt }
    board: null, // { kind, chopsLeft }
    plate: [], // kinds, bottom to top
    coins: 0,
    served: 0,
    missed: 0,
    combo: 0,
    bestCombo: 0,
    message: '',
    messageUntil: 0,
    muted: false,
    stats: { served: 0, missed: 0, earned: 0 },
  };
}

export function startShift(g) {
  g.screen = 'playing';
  g.elapsed = 0;
  g.timeLeft = SHIFT_SECONDS;
  g.orders = [];
  g.spawnIn = 1.5;
  g.firstOrderDone = false;
  g.hand = null;
  g.grill = [null, null];
  g.board = null;
  g.plate = [];
  g.coins = 0;
  g.served = 0;
  g.missed = 0;
  g.combo = 0;
  g.bestCombo = 0;
  g.stats = { served: 0, missed: 0, earned: 0 };
  say(g, 'Shift dimulai! Ambil bahan dari rak bawah.');
}

export function say(g, text, seconds = 2.5) {
  g.message = text;
  g.messageUntil = g.elapsed + seconds;
}

function spawnOrder(g, forceRecipe) {
  if (g.orders.length >= MAX_ORDERS) return;
  let recipe = forceRecipe;
  if (!recipe) {
    const late = g.elapsed > 45;
    recipe = pickWeighted(g.rng, [
      [3, 'burger'],
      [2, 'cheese'],
      [2, 'salad'],
      [late ? 1 : 0.4, 'special'],
    ]);
  }
  g.orders.push({
    id: orderId++,
    recipe,
    patience: ORDER_PATIENCE,
    max: ORDER_PATIENCE,
  });
}

export function update(g, dt) {
  if (g.screen !== 'playing') return;
  g.elapsed += dt;
  g.timeLeft = Math.max(0, SHIFT_SECONDS - g.elapsed);
  if (g.timeLeft <= 0) {
    g.screen = 'done';
    return;
  }
  // Orders arrive on a timer; the very first is always a Burger Klasik
  // so the opening seconds teach the same dish every time.
  g.spawnIn -= dt;
  if (g.spawnIn <= 0) {
    if (!g.firstOrderDone) {
      spawnOrder(g, 'burger');
      g.firstOrderDone = true;
    } else {
      spawnOrder(g, null);
    }
    g.spawnIn = g.elapsed > 60 ? SPAWN_EVERY_LATE : SPAWN_EVERY_EARLY;
  }
  // Patience drains; an order that runs out walks away.
  for (const o of g.orders) o.patience -= dt;
  const before = g.orders.length;
  g.orders = g.orders.filter((o) => o.patience > 0);
  const lost = before - g.orders.length;
  if (lost > 0) {
    g.missed += lost;
    g.stats.missed += lost;
    g.combo = 0;
    say(g, lost === 1 ? 'Pelanggan pergi — pesanannya hangus!' : `${lost} pelanggan pergi!`);
  }
  // The grill cooks; a patty left too long burns.
  for (const slot of g.grill) {
    if (!slot) continue;
    slot.t += dt;
    if (!slot.burnt && slot.t >= BURN_SECONDS) slot.burnt = true;
  }
}

export function isPrepped(item) {
  if (!item) return false;
  const ing = INGREDIENTS[item.kind];
  if (ing.needs === 'none') return true;
  return item.prepped === true;
}

export function takeFromBin(g, kind) {
  if (g.hand) { say(g, 'Tanganmu sudah penuh — taruh dulu di meja.'); return 'error'; }
  const ing = INGREDIENTS[kind];
  g.hand = { kind, prepped: ing.needs === 'none' };
  return 'pickup';
}

export function interactGrill(g, slotIdx) {
  const slot = g.grill[slotIdx];
  if (slot && slot.burnt) {
    // A burnt patty goes straight in the bin when you grab it.
    g.grill[slotIdx] = null;
    say(g, 'Daging gosong dibuang!');
    return 'error';
  }
  if (slot && !g.hand && slot.t >= GRILL_SECONDS) {
    g.hand = { kind: 'patty', prepped: true };
    g.grill[slotIdx] = null;
    return 'pickup';
  }
  if (slot && !g.hand) { say(g, 'Dagingnya belum matang — tunggu sebentar.'); return 'error'; }
  if (!slot && g.hand && g.hand.kind === 'patty' && !g.hand.prepped) {
    g.grill[slotIdx] = { kind: 'patty', t: 0, burnt: false };
    g.hand = null;
    return 'sizzle';
  }
  if (!slot && g.hand) { say(g, 'Pemanggang hanya untuk daging mentah.'); return 'error'; }
  if (slot && g.hand) { say(g, 'Slot pemanggang ini sudah terisi.'); return 'error'; }
  return null;
}

export function interactBoard(g) {
  const b = g.board;
  if (!b && g.hand && INGREDIENTS[g.hand.kind].needs === 'chop' && !g.hand.prepped) {
    g.board = { kind: g.hand.kind, chopsLeft: INGREDIENTS[g.hand.kind].chop };
    g.hand = null;
    return 'place';
  }
  if (!b && g.hand) { say(g, 'Bahan ini tidak perlu dipotong.'); return 'error'; }
  if (b && !g.hand && b.chopsLeft > 0) {
    b.chopsLeft -= 1;
    return 'chop';
  }
  if (b && !g.hand && b.chopsLeft === 0) {
    g.hand = { kind: b.kind, prepped: true };
    g.board = null;
    return 'pickup';
  }
  if (b && g.hand) { say(g, 'Talenan sedang dipakai — tanganmu penuh.'); return 'error'; }
  return null;
}

export function interactPlate(g) {
  if (g.hand && isPrepped(g.hand)) {
    g.plate.push(g.hand.kind);
    g.hand = null;
    return 'place';
  }
  if (g.hand && !isPrepped(g.hand)) {
    say(g, 'Bahan itu belum siap — masak atau potong dulu.');
    return 'error';
  }
  if (!g.hand && g.plate.length > 0) {
    const kind = g.plate.pop();
    g.hand = { kind, prepped: true };
    return 'pickup';
  }
  return null;
}

export function interactTrash(g) {
  if (g.hand) {
    g.hand = null;
    say(g, 'Dibuang.');
    return 'place';
  }
  if (g.plate.length > 0) {
    g.plate = [];
    say(g, 'Piring dikosongkan.');
    return 'place';
  }
  return null;
}

export function plateMatches(g, recipeId) {
  const stack = RECIPES[recipeId].stack;
  if (g.plate.length !== stack.length) return false;
  return stack.every((kind, i) => g.plate[i] === kind);
}

export function matchingOrder(g) {
  // Serve the most impatient matching order first.
  let best = null;
  for (const o of g.orders) {
    if (plateMatches(g, o.recipe) && (!best || o.patience < best.patience)) best = o;
  }
  return best;
}

export function serve(g) {
  if (g.plate.length === 0) { say(g, 'Piring masih kosong.'); return 'error'; }
  const order = matchingOrder(g);
  if (!order) {
    say(g, 'Tidak ada pesanan yang cocok dengan piring ini!');
    return 'error';
  }
  const recipe = RECIPES[order.recipe];
  const tip = Math.round(recipe.base * 0.5 * (order.patience / order.max));
  const comboBonus = Math.round(recipe.base * 0.1 * Math.min(g.combo, 5));
  const earned = recipe.base + tip + comboBonus;
  g.coins += earned;
  g.stats.earned += earned;
  g.served += 1;
  g.stats.served += 1;
  g.combo += 1;
  g.bestCombo = Math.max(g.bestCombo, g.combo);
  g.orders = g.orders.filter((o) => o !== order);
  g.plate = [];
  say(g, `Tersaji! +${earned} koin${g.combo > 1 ? ` — combo x${g.combo}!` : ''}`, 3);
  return 'serve';
}

export function starsFor(g) {
  if (g.coins >= 550) return 3;
  if (g.coins >= 400) return 2;
  if (g.coins >= 250) return 1;
  return 0;
}

export { RECIPES, RECIPE_ORDER };

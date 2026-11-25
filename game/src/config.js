// Dapur Kilat — tuning and content: every ingredient, recipe and station
// lives here so the rest of the game only reads data, never magic numbers.

export const VIEW_W = 1280;
export const VIEW_H = 800;
export const SHIFT_SECONDS = 150;

export const INGREDIENTS = {
  bun:     { name: 'Roti',     key: '1', color: '#e8b25c', dark: '#b97f2e', needs: 'none',  chop: 0 },
  patty:   { name: 'Daging',   key: '2', color: '#7a4a21', dark: '#4e2c10', needs: 'grill', chop: 0 },
  lettuce: { name: 'Selada',   key: '3', color: '#58b368', dark: '#2f7a3e', needs: 'chop',  chop: 3 },
  tomato:  { name: 'Tomat',    key: '4', color: '#e04b3a', dark: '#9c2418', needs: 'chop',  chop: 3 },
  cheese:  { name: 'Keju',     key: '5', color: '#f5c542', dark: '#c08d12', needs: 'none',  chop: 0 },
  onion:   { name: 'Bawang',   key: '6', color: '#b388d6', dark: '#7a4ba0', needs: 'chop',  chop: 3 },
};

export const BIN_ORDER = ['bun', 'patty', 'lettuce', 'tomato', 'cheese', 'onion'];

// A recipe is the exact stack a plate must hold, bottom to top.
// Bun always closes the stack: the last 'bun' is the top bun.
export const RECIPES = {
  burger: {
    name: 'Burger Klasik', short: 'Burger', base: 40,
    stack: ['bun', 'patty', 'lettuce', 'tomato', 'bun'],
    color: '#e8b25c',
  },
  cheese: {
    name: 'Burger Keju', short: 'Burger Keju', base: 50,
    stack: ['bun', 'patty', 'cheese', 'lettuce', 'bun'],
    color: '#f5c542',
  },
  salad: {
    name: 'Salad Segar', short: 'Salad', base: 30,
    stack: ['lettuce', 'tomato', 'onion'],
    color: '#58b368',
  },
  special: {
    name: 'Burger Spesial', short: 'Spesial', base: 60,
    stack: ['bun', 'patty', 'cheese', 'tomato', 'onion', 'bun'],
    color: '#d97b2f',
  },
};

export const RECIPE_ORDER = ['burger', 'cheese', 'salad', 'special'];

export const ORDER_PATIENCE = 45;      // seconds an order waits before walking out
export const SPAWN_EVERY_EARLY = 14;   // seconds between new orders, first minute
export const SPAWN_EVERY_LATE = 11;    // seconds between new orders after 60 s
export const MAX_ORDERS = 3;
export const GRILL_SECONDS = 4;        // patty cooks this long
export const BURN_SECONDS = 9;         // patty left this long is burnt

// Layout, in the 1280x800 logical canvas.
export const LAYOUT = {
  hud: { h: 64 },
  board: { x: 16, y: 80, w: 280, h: 480 },
  grill: { x: 330, y: 400, w: 290, h: 200 },
  board2: { x: 650, y: 400, w: 250, h: 200 }, // chopping board
  plate: { x: 930, y: 400, w: 334, h: 200 },
  bins: { x: 330, y: 640, w: 934, h: 130 },
  trash: { x: 1160, y: 80, w: 104, h: 64 },
};

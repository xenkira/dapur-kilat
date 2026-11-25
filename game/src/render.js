// Dapur Kilat — every pixel the player sees. All art is drawn with canvas
// shapes: no image files, no fonts to download, nothing over the network.

import { VIEW_W, VIEW_H, INGREDIENTS, RECIPES, LAYOUT, GRILL_SECONDS } from './config.js';
import { binRect, grillSlotRect, boardRect, plateRect, serveRect, trashRect, startRect, restartRect } from './input.js';
import { matchingOrder, starsFor } from './state.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, align = 'left', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

// One ingredient icon, drawn at (x, y) with radius r. `state` is
// 'raw' | 'cooked' | 'burnt' for patty, 'whole' | 'chopped' for veggies.
export function drawIngredient(ctx, kind, x, y, r, state = 'ready') {
  const ing = INGREDIENTS[kind];
  ctx.save();
  ctx.translate(x, y);
  if (kind === 'bun') {
    ctx.fillStyle = '#e8b25c';
    ctx.beginPath();
    ctx.arc(0, r * 0.25, r, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c98f3d';
    ctx.fillRect(-r, r * 0.2, r * 2, r * 0.25);
    ctx.fillStyle = '#fff3d6';
    for (const [dx, dy] of [[-0.45, -0.45], [0.1, -0.65], [0.5, -0.35], [-0.05, -0.25]]) {
      ctx.beginPath();
      ctx.ellipse(dx * r, dy * r, r * 0.12, r * 0.07, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'patty') {
    const c = state === 'burnt' ? '#241408' : state === 'cooked' ? '#7a4a21' : '#a05a3a';
    const c2 = state === 'burnt' ? '#120a04' : state === 'cooked' ? '#4e2c10' : '#7a3d24';
    ctx.fillStyle = c;
    rr(ctx, -r, -r * 0.55, r * 2, r * 1.1, r * 0.5);
    ctx.fill();
    ctx.fillStyle = c2;
    ctx.beginPath();
    ctx.ellipse(-r * 0.3, -r * 0.15, r * 0.18, r * 0.1, 0, 0, Math.PI * 2);
    ctx.ellipse(r * 0.35, r * 0.2, r * 0.15, r * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'lettuce') {
    ctx.fillStyle = state === 'chopped' ? '#7ccb8a' : '#58b368';
    for (const [dx, dy, s] of [[-0.5, 0.1, 0.55], [0.45, 0.15, 0.5], [0, -0.35, 0.6]]) {
      ctx.beginPath();
      ctx.arc(dx * r, dy * r, s * r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#2f7a3e';
    ctx.lineWidth = r * 0.08;
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, r * 0.1);
    ctx.quadraticCurveTo(0, -r * 0.5, r * 0.6, r * 0.15);
    ctx.stroke();
  } else if (kind === 'tomato') {
    ctx.fillStyle = state === 'chopped' ? '#ef6a55' : '#e04b3a';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f0836f';
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.3, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2f7a3e';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.8, r * 0.28, r * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'cheese') {
    ctx.fillStyle = '#f5c542';
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.6);
    ctx.lineTo(r, r * 0.6);
    ctx.lineTo(0, -r * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c08d12';
    for (const [dx, dy] of [[-0.3, 0.25], [0.3, 0.1], [0.05, 0.4]]) {
      ctx.beginPath();
      ctx.arc(dx * r, dy * r, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'onion') {
    ctx.strokeStyle = state === 'chopped' ? '#c9a2e0' : '#b388d6';
    ctx.lineWidth = r * 0.22;
    for (const rad of [0.85, 0.55, 0.28]) {
      ctx.beginPath();
      ctx.arc(0, 0, rad * r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#efe6f7';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawPlateStack(ctx, stack, cx, baseY, w) {
  // Layers bottom to top; a bun on top is drawn as a dome.
  let y = baseY;
  const h = 13;
  for (let i = 0; i < stack.length; i++) {
    const kind = stack[i];
    const isTopBun = kind === 'bun' && i === stack.length - 1 && stack.length > 1;
    if (isTopBun) {
      ctx.fillStyle = '#e8b25c';
      ctx.beginPath();
      ctx.arc(cx, y - 4, w / 2, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff3d6';
      for (const dx of [-0.25, 0.05, 0.3]) {
        ctx.beginPath();
        ctx.ellipse(cx + dx * w, y - 14, 3, 2, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      y -= 8;
    } else {
      const c = kind === 'patty' ? '#7a4a21' : INGREDIENTS[kind].color;
      ctx.fillStyle = c;
      rr(ctx, cx - w / 2, y - h, w, h, 6);
      ctx.fill();
      y -= h + 1;
    }
  }
  // The plate itself.
  ctx.fillStyle = '#f2f2f2';
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 6, w / 2 + 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9c9c9';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawTicket(ctx, order, x, y, w, h) {
  const recipe = RECIPES[order.recipe];
  const frac = Math.max(0, order.patience / order.max);
  const urgent = frac < 0.35;
  ctx.fillStyle = '#fff8ec';
  rr(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = urgent ? '#d33' : '#d8c49a';
  ctx.lineWidth = urgent ? 3 : 2;
  ctx.stroke();
  text(ctx, `#${order.id} ${recipe.name}`, x + 12, y + 22, 17, '#4a2f14');
  // Mini stack icons, left to right in assembly order.
  let ix = x + 26;
  for (const kind of recipe.stack) {
    drawIngredient(ctx, kind, ix, y + 58, 13);
    ix += 30;
  }
  text(ctx, `+${recipe.base} koin`, x + w - 12, y + 22, 15, '#8a6d1f', 'right');
  // Patience bar.
  ctx.fillStyle = '#e8dcc4';
  rr(ctx, x + 12, y + h - 26, w - 24, 12, 6);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#58b368' : frac > 0.25 ? '#e8a13a' : '#d33';
  rr(ctx, x + 12, y + h - 26, (w - 24) * frac, 12, 6);
  ctx.fill();
  text(ctx, `${Math.ceil(order.patience)} dtk`, x + w - 12, y + h - 46, 13, urgent ? '#d33' : '#7a6a4a', 'right');
}

function drawBins(ctx, g) {
  const names = ['Roti', 'Daging', 'Selada', 'Tomat', 'Keju', 'Bawang'];
  const kinds = ['bun', 'patty', 'lettuce', 'tomato', 'cheese', 'onion'];
  text(ctx, 'BAHAN — klik atau tekan 1-6', LAYOUT.bins.x, LAYOUT.bins.y - 14, 15, '#f6e3c5');
  for (let i = 0; i < 6; i++) {
    const r = binRect(i);
    const held = g.hand && g.hand.kind === kinds[i];
    ctx.fillStyle = held ? '#ffe9b0' : '#fff8ec';
    rr(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.fill();
    ctx.strokeStyle = held ? '#e8a13a' : '#d8c49a';
    ctx.lineWidth = held ? 3 : 2;
    ctx.stroke();
    drawIngredient(ctx, kinds[i], r.x + r.w / 2, r.y + 52, 30);
    text(ctx, names[i], r.x + r.w / 2, r.y + 100, 16, '#4a2f14', 'center');
    text(ctx, `[${i + 1}]`, r.x + r.w - 10, r.y + 16, 13, '#b09a6a', 'right');
  }
}

function drawGrill(ctx, g) {
  const L = LAYOUT.grill;
  ctx.fillStyle = '#3a3f46';
  rr(ctx, L.x, L.y, L.w, L.h, 14);
  ctx.fill();
  text(ctx, 'PEMANGGANG  [G]', L.x + 16, L.y + 24, 15, '#f6e3c5');
  for (let i = 0; i < 2; i++) {
    const r = grillSlotRect(i);
    ctx.fillStyle = '#23262b';
    rr(ctx, r.x, r.y, r.w, r.h, 10);
    ctx.fill();
    const slot = g.grill[i];
    if (slot) {
      const frac = Math.min(1, slot.t / GRILL_SECONDS);
      drawIngredient(ctx, 'patty', r.x + r.w / 2, r.y + r.h / 2 - 6, 34, slot.burnt ? 'burnt' : slot.t >= GRILL_SECONDS ? 'cooked' : 'raw');
      // Cook progress ring.
      ctx.strokeStyle = slot.burnt ? '#d33' : '#e8a13a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(r.x + r.w / 2, r.y + r.h / 2 - 6, 44, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
      ctx.stroke();
      text(ctx, slot.burnt ? 'GOSONG!' : slot.t >= GRILL_SECONDS ? 'MATANG' : 'memasak…', r.x + r.w / 2, r.y + r.h - 12, 13, slot.burnt ? '#ff8080' : '#f6e3c5', 'center');
    } else {
      text(ctx, 'kosong', r.x + r.w / 2, r.y + r.h / 2, 14, '#7a828c', 'center');
    }
  }
}

function drawBoard(ctx, g) {
  const L = LAYOUT.board2;
  ctx.fillStyle = '#8b5e3c';
  rr(ctx, L.x, L.y, L.w, L.h, 14);
  ctx.fill();
  text(ctx, 'TALENAN  [C]', L.x + 16, L.y + 24, 15, '#f6e3c5');
  const r = boardRect();
  ctx.fillStyle = '#e8c99a';
  rr(ctx, r.x, r.y, r.w, r.h, 10);
  ctx.fill();
  const b = g.board;
  if (b) {
    drawIngredient(ctx, b.kind, r.x + r.w / 2, r.y + r.h / 2, 34, b.chopsLeft === 0 ? 'chopped' : 'whole');
    if (b.chopsLeft > 0) {
      text(ctx, `potong ${b.chopsLeft}x lagi`, r.x + r.w / 2, r.y + r.h - 12, 13, '#7a5a34', 'center');
      ctx.strokeStyle = '#5a4632';
      ctx.lineWidth = 3;
      for (let i = 0; i < b.chopsLeft; i++) {
        const x0 = r.x + 40 + i * 18;
        ctx.beginPath();
        ctx.moveTo(x0, r.y + 16);
        ctx.lineTo(x0 + 10, r.y + 34);
        ctx.stroke();
      }
    } else {
      text(ctx, 'siap diambil!', r.x + r.w / 2, r.y + r.h - 12, 13, '#2f7a3e', 'center');
    }
  } else {
    text(ctx, 'taruh sayur di sini', r.x + r.w / 2, r.y + r.h / 2, 14, '#a08050', 'center');
  }
}

function drawPlateArea(ctx, g) {
  const L = LAYOUT.plate;
  ctx.fillStyle = '#5b7fa6';
  rr(ctx, L.x, L.y, L.w, L.h, 14);
  ctx.fill();
  text(ctx, 'PIRING SAJI  [P]', L.x + 16, L.y + 24, 15, '#f6e3c5');
  const r = plateRect();
  drawPlateStack(ctx, g.plate, r.x + r.w / 2, r.y + r.h - 18, 120);
  if (g.plate.length === 0) text(ctx, 'piring kosong', r.x + r.w / 2, r.y + r.h / 2 - 20, 14, '#dfe9f2', 'center');
  const s = serveRect();
  const match = matchingOrder(g);
  ctx.fillStyle = match ? '#3fae5a' : '#9aa5ad';
  rr(ctx, s.x, s.y, s.w, s.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'SAJI', s.x + s.w / 2, s.y + 22, 20, '#ffffff', 'center');
  text(ctx, '[S]', s.x + s.w / 2, s.y + 44, 13, '#e8f4ea', 'center');
  if (match) {
    text(ctx, `cocok: #${match.id} ${RECIPES[match.recipe].name}!`, s.x + s.w / 2, s.y + 76, 13, '#e8f4ea', 'center');
  }
  const t = trashRect();
  ctx.fillStyle = '#6b4a2f';
  rr(ctx, t.x, t.y, t.w, t.h, 10);
  ctx.fill();
  text(ctx, 'SAMPAH [T]', t.x + t.w / 2, t.y + t.h / 2, 14, '#f6e3c5', 'center');
}

function drawHand(ctx, g) {
  if (!g.hand || !g.mouse) return;
  const { x, y } = g.mouse;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.arc(x + 3, y + 4, 26, 0, Math.PI * 2);
  ctx.fill();
  const state = g.hand.kind === 'patty' ? (g.hand.prepped ? 'cooked' : 'raw') : (g.hand.prepped ? 'chopped' : 'whole');
  drawIngredient(ctx, g.hand.kind, x, y, 24, state);
  ctx.restore();
}

function drawHud(ctx, g) {
  ctx.fillStyle = '#4a2f14';
  ctx.fillRect(0, 0, VIEW_W, LAYOUT.hud.h);
  text(ctx, 'DAPUR KILAT', 20, 32, 26, '#ffd98a');
  const mm = Math.floor(g.timeLeft / 60);
  const ss = Math.floor(g.timeLeft % 60).toString().padStart(2, '0');
  const low = g.timeLeft <= 20;
  text(ctx, `${mm}:${ss}`, 330, 32, 28, low ? '#ff8080' : '#ffffff');
  text(ctx, `Koin: ${g.coins}`, 470, 32, 22, '#ffd98a');
  text(ctx, `Tersaji: ${g.served}`, 640, 32, 20, '#ffffff');
  text(ctx, g.combo > 1 ? `Combo x${g.combo}` : '', 780, 32, 20, '#7ce38b');
  text(ctx, g.audioMuted ? 'Suara: mati [M]' : 'Suara: nyala [M]', 1080, 32, 16, '#d8c49a', 'right');
  // Shift progress bar.
  ctx.fillStyle = '#2e1d0c';
  ctx.fillRect(0, LAYOUT.hud.h - 6, VIEW_W, 6);
  ctx.fillStyle = low ? '#d33' : '#e8a13a';
  ctx.fillRect(0, LAYOUT.hud.h - 6, VIEW_W * (g.timeLeft / 150), 6);
}

function drawBoardArea(ctx, g) {
  if (g.orders.length === 0) {
    ctx.fillStyle = 'rgba(255,248,236,0.75)';
    rr(ctx, LAYOUT.board.x, LAYOUT.board.y, LAYOUT.board.w, 90, 12);
    ctx.fill();
    text(ctx, 'Belum ada pesanan…', LAYOUT.board.x + 16, LAYOUT.board.y + 45, 16, '#7a6a4a');
  }
  g.orders.forEach((o, i) => {
    drawTicket(ctx, o, LAYOUT.board.x, LAYOUT.board.y + i * 158, LAYOUT.board.w, 146);
  });
}

function drawMessage(ctx, g) {
  if (!g.message || g.elapsed > g.messageUntil) return;
  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = '#2e1d0c';
  ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
  const w = ctx.measureText(g.message).width + 36;
  rr(ctx, (VIEW_W - Math.max(w, 200)) / 2, 76, Math.max(w, 200), 36, 18);
  ctx.fill();
  text(ctx, g.message, VIEW_W / 2, 95, 16, '#ffd98a', 'center');
  ctx.restore();
}

function drawKitchen(ctx, g) {
  // Walls and floor.
  ctx.fillStyle = '#f6e3c5';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#e8c99a';
  ctx.fillRect(0, LAYOUT.hud.h, VIEW_W, 8);
  ctx.fillStyle = '#caa06a';
  ctx.fillRect(0, 380, VIEW_W, 420);
  // Counter band behind the stations.
  ctx.fillStyle = '#a9744f';
  ctx.fillRect(312, 384, 952, 232);
  ctx.fillStyle = '#8b5e3c';
  ctx.fillRect(312, 384, 952, 12);
  drawBoardArea(ctx, g);
  drawGrill(ctx, g);
  drawBoard(ctx, g);
  drawPlateArea(ctx, g);
  drawBins(ctx, g);
  drawMessage(ctx, g);
  drawHand(ctx, g);
}

function drawTitle(ctx, g) {
  ctx.fillStyle = '#f6e3c5';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#4a2f14';
  ctx.fillRect(0, 0, VIEW_W, 120);
  text(ctx, 'DAPUR KILAT', VIEW_W / 2, 62, 52, '#ffd98a', 'center');
  text(ctx, 'Game masak cepat — sajikan pesanan sebelum pelanggan pergi!', VIEW_W / 2, 160, 22, '#4a2f14', 'center');
  // A sample ticket and plate, drawn with the same pieces the game uses.
  drawTicket(ctx, { id: 1, recipe: 'burger', patience: 32, max: 45 }, 240, 210, 280, 146);
  drawPlateStack(ctx, ['bun', 'patty', 'lettuce', 'tomato', 'bun'], 880, 330, 150);
  text(ctx, 'Contoh pesanan: Burger Klasik', 240, 380, 16, '#7a6a4a');
  text(ctx, 'Contoh piring: roti + daging + selada + tomat + roti', 760, 380, 16, '#7a6a4a');
  text(ctx, 'Cara main:', VIEW_W / 2, 440, 20, '#4a2f14', 'center');
  text(ctx, '1. Klik bahan (atau 1-6)  •  2. Panggang daging di pemanggang [G]', VIEW_W / 2, 474, 18, '#5a4632', 'center');
  text(ctx, '3. Potong sayur di talenan [C]  •  4. Susun di piring [P], lalu SAJI [S]', VIEW_W / 2, 502, 18, '#5a4632', 'center');
  text(ctx, 'Shift 150 detik. Pesanan yang kehabisan waktu akan pergi. Combo menaikkan tip!', VIEW_W / 2, 530, 16, '#7a6a4a', 'center');
  const r = startRect();
  ctx.fillStyle = '#3fae5a';
  rr(ctx, r.x, r.y, r.w, r.h, 14);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'MULAI MASAK', r.x + r.w / 2, r.y + r.h / 2, 24, '#ffffff', 'center');
  text(ctx, 'atau tekan Enter', VIEW_W / 2, r.y + r.h + 24, 15, '#7a6a4a', 'center');
}

function drawDone(ctx, g) {
  ctx.fillStyle = 'rgba(46,29,12,0.92)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  text(ctx, 'SHIFT SELESAI!', VIEW_W / 2, 130, 48, '#ffd98a', 'center');
  const stars = starsFor(g);
  text(ctx, '★'.repeat(stars) + '☆'.repeat(3 - stars), VIEW_W / 2, 200, 44, '#ffd98a', 'center');
  text(ctx, `Koin terkumpul: ${g.coins}`, VIEW_W / 2, 280, 30, '#ffffff', 'center');
  text(ctx, `Pesanan tersaji: ${g.served}   •   Pesanan hangus: ${g.missed}`, VIEW_W / 2, 330, 22, '#f6e3c5', 'center');
  text(ctx, `Combo terbaik: x${g.bestCombo}`, VIEW_W / 2, 368, 22, '#f6e3c5', 'center');
  const verdict = stars === 3 ? 'Koki bintang tiga! Dapur ini milikmu.' : stars === 2 ? 'Dapur yang solid — sedikit lagi bintang tiga.' : stars === 1 ? 'Shift yang lumayan. Latihan lagi, yuk.' : 'Dapur berantakan — coba lagi, koki!';
  text(ctx, verdict, VIEW_W / 2, 420, 20, '#ffd98a', 'center');
  const r = restartRect();
  ctx.fillStyle = '#3fae5a';
  rr(ctx, r.x, r.y, r.w, r.h, 14);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'MAIN LAGI', r.x + r.w / 2, r.y + r.h / 2, 24, '#ffffff', 'center');
}

export function render(ctx, g) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  if (g.screen === 'title') drawTitle(ctx, g);
  else if (g.screen === 'done') { drawKitchen(ctx, g); drawDone(ctx, g); }
  else { drawKitchen(ctx, g); drawHud(ctx, g); }
}

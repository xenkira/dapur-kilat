// Dapur Kilat — mouse and keyboard. Every clickable station is a rect in
// the 1280x800 logical canvas; render.js draws exactly these rects, so a
// click always lands where the picture says it does.

import { LAYOUT, BIN_ORDER, INGREDIENTS } from './config.js';
import {
  takeFromBin, interactGrill, interactBoard, interactPlate, interactTrash,
  serve, startShift, say,
} from './state.js';

export function binRect(i) {
  return { x: LAYOUT.bins.x + i * 156, y: LAYOUT.bins.y, w: 152, h: LAYOUT.bins.h };
}

export function grillSlotRect(i) {
  return { x: LAYOUT.grill.x + 15 + i * 140, y: LAYOUT.grill.y + 50, w: 130, h: 110 };
}

export function boardRect() {
  return { x: LAYOUT.board2.x + 20, y: LAYOUT.board2.y + 50, w: 210, h: 110 };
}

export function plateRect() {
  return { x: LAYOUT.plate.x + 20, y: LAYOUT.plate.y + 30, w: 170, h: 150 };
}

export function serveRect() {
  return { x: LAYOUT.plate.x + 210, y: LAYOUT.plate.y + 40, w: 110, h: 60 };
}

export function trashRect() {
  return { x: LAYOUT.trash.x, y: LAYOUT.trash.y, w: LAYOUT.trash.w, h: LAYOUT.trash.h };
}

export function startRect() {
  return { x: 510, y: 556, w: 260, h: 64 };
}

export function restartRect() {
  return { x: 510, y: 620, w: 260, h: 64 };
}

function inside(r, x, y) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function playSound(audio, result) {
  if (!audio || !result) return;
  if (result === 'pickup') audio.pickup();
  else if (result === 'place') audio.place();
  else if (result === 'chop') audio.chop();
  else if (result === 'sizzle') audio.sizzle();
  else if (result === 'serve') audio.serve();
  else if (result === 'error') audio.error();
}

export function attachInput(canvas, g, audio) {
  function toLogical(ev) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((ev.clientX - r.left) / r.width) * 1280,
      y: ((ev.clientY - r.top) / r.height) * 800,
    };
  }

  function grillAction() {
    // Keyboard G: put raw patty on the first free slot, else take the
    // first cooked one.
    if (g.hand && g.hand.kind === 'patty' && !g.hand.prepped) {
      const free = g.grill.findIndex((s) => s === null);
      if (free >= 0) return interactGrill(g, free);
      say(g, 'Pemanggang penuh!');
      return 'error';
    }
    const cooked = g.grill.findIndex((s) => s && !s.burnt && s.t >= 4);
    if (cooked >= 0) return interactGrill(g, cooked);
    const burnt = g.grill.findIndex((s) => s && s.burnt);
    if (burnt >= 0) return interactGrill(g, burnt);
    const any = g.grill.findIndex((s) => s !== null);
    if (any >= 0) return interactGrill(g, any);
    say(g, 'Pemanggang kosong — bawa daging mentah dulu.');
    return 'error';
  }

  function clickAt(x, y) {
    audio.unlock();
    if (g.screen === 'title') {
      if (inside(startRect(), x, y)) { startShift(g); audio.done(); }
      return;
    }
    if (g.screen === 'done') {
      if (inside(restartRect(), x, y)) { startShift(g); audio.done(); }
      return;
    }
    if (inside(trashRect(), x, y)) { playSound(audio, interactTrash(g)); return; }
    if (inside(serveRect(), x, y)) { playSound(audio, serve(g)); return; }
    if (inside(plateRect(), x, y)) { playSound(audio, interactPlate(g)); return; }
    if (inside(boardRect(), x, y)) { playSound(audio, interactBoard(g)); return; }
    for (let i = 0; i < 2; i++) {
      if (inside(grillSlotRect(i), x, y)) { playSound(audio, interactGrill(g, i)); return; }
    }
    for (let i = 0; i < BIN_ORDER.length; i++) {
      if (inside(binRect(i), x, y)) { playSound(audio, takeFromBin(g, BIN_ORDER[i])); return; }
    }
  }

  canvas.addEventListener('pointerdown', (ev) => {
    const p = toLogical(ev);
    g.mouse = { x: p.x, y: p.y };
    clickAt(p.x, p.y);
  });
  canvas.addEventListener('pointermove', (ev) => {
    const p = toLogical(ev);
    g.mouse = { x: p.x, y: p.y };
  });

  window.addEventListener('keydown', (ev) => {
    if (ev.repeat) return;
    audio.unlock();
    if (g.screen === 'title' || g.screen === 'done') {
      if (ev.key === 'Enter' || ev.key === ' ') { startShift(g); audio.done(); }
      return;
    }
    const k = ev.key.toLowerCase();
    if (k >= '1' && k <= '6') {
      const kind = BIN_ORDER[Number(k) - 1];
      if (kind) playSound(audio, takeFromBin(g, kind));
    } else if (k === 'g') { playSound(audio, grillAction()); }
    else if (k === 'c') { playSound(audio, interactBoard(g)); }
    else if (k === 'p') { playSound(audio, interactPlate(g)); }
    else if (k === 's' || ev.key === 'Enter') { playSound(audio, serve(g)); }
    else if (k === 't') { playSound(audio, interactTrash(g)); }
    else if (k === 'm') {
      const muted = audio.toggleMute();
      say(g, muted ? 'Suara dimatikan.' : 'Suara dinyalakan.');
    }
  });
}

export { INGREDIENTS };

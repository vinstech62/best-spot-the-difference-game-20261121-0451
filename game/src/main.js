// Boot and the one loop: clicks and keys go to the world, the world
// advances with the real clock, the renderer paints what is there, and the
// audio kit answers the world's events. ?seed=N is accepted for repeatable
// sessions; ?shot=cover|play|hint|end stages a screenshot scene instead of
// running the loop and sets window.__shotReady once it has painted.

import { PANEL, SCENE } from './config.js';
import { createWorld, EVENT_CLEAR, EVENT_FIND, EVENT_HINT, EVENT_MISS, EVENT_OVER, EVENT_WIN } from './world.js';
import { createRenderer, HINT_BUTTON, PANEL_RECTS } from './render.js';
import { createInput, KEY_CONFIRM, KEY_HINT, KEY_MUTE, KEY_PAUSE } from './input.js';
import { createAudio } from './audio.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld();
const renderer = createRenderer(canvas);
const audio = createAudio();
const view = { ...world.state, cursor: null };

function syncView() {
  const cursor = view.cursor;
  Object.assign(view, world.state);
  view.cursor = cursor;
}

function announce() {
  const s = world.state;
  status.textContent = s.phase === 'play'
    ? 'Level ' + (s.levelIndex + 1) + '. Found ' + s.found.size + ' of ' + s.diffs.length + '. ' + Math.ceil(s.timeLeft) + ' seconds left.'
    : 'Lantern Lane spot the difference. Phase: ' + s.phase + '. Score ' + s.score + '.';
}

function playEvents(events) {
  if (events & EVENT_FIND) audio.find();
  if (events & EVENT_MISS) audio.miss();
  if (events & EVENT_HINT) audio.hint();
  if (events & EVENT_CLEAR) audio.clear();
  if (events & EVENT_WIN) audio.clear();
  if (events & EVENT_OVER) audio.over();
}

/** A playfield point -> a hunt check, a hint press, or a confirm. */
function handlePoint(point, now) {
  audio.unlock();
  const s = world.state;
  if (s.phase !== 'play') {
    if (s.phase !== 'paused') world.confirm();
    else world.togglePause();
    announce();
    return;
  }
  if (point.x >= HINT_BUTTON.x && point.x <= HINT_BUTTON.x + HINT_BUTTON.width
    && point.y >= HINT_BUTTON.y && point.y <= HINT_BUTTON.y + HINT_BUTTON.height) {
    playEvents(world.useHint(now));
    announce();
    return;
  }
  for (const rect of PANEL_RECTS) {
    if (point.x >= rect.x && point.x < rect.x + rect.width && point.y >= rect.y && point.y < rect.y + rect.height) {
      const sceneX = ((point.x - rect.x) / rect.width) * SCENE.width;
      const sceneY = ((point.y - rect.y) / rect.height) * SCENE.height;
      playEvents(world.checkPoint(sceneX, sceneY, now));
      announce();
      return;
    }
  }
}

createInput(canvas, {
  onPoint: (point) => handlePoint(point, performance.now() / 1000),
  onCursor: (cursor) => { view.cursor = cursor.active ? cursor : null; },
  onKey: (key, cursor) => {
    const now = performance.now() / 1000;
    audio.unlock();
    if (key === KEY_HINT) { playEvents(world.useHint(now)); announce(); return; }
    if (key === KEY_PAUSE) { world.togglePause(); announce(); return; }
    if (key === KEY_MUTE) { audio.toggleMute(); return; }
    if (key === KEY_CONFIRM) {
      if (world.state.phase === 'play' && cursor && cursor.active) handlePoint(cursor, now);
      else { world.confirm(); announce(); }
    }
  },
});

// The screenshot path: stage, paint twice (fonts settle), flag readiness.
if (shot) {
  const now = 12;
  stageShot(world, shot, now);
  syncView();
  view.cursor = null;
  renderer.render(view, now);
  requestAnimationFrame(() => {
    renderer.render(view, now);
    window.__shotReady = true;
  });
} else {
  let last = performance.now();
  const frame = (ms) => {
    const now = ms / 1000;
    const dt = Math.min(0.1, (ms - last) / 1000);
    last = ms;
    playEvents(world.step(dt, now));
    syncView();
    renderer.render(view, now);
    requestAnimationFrame(frame);
  };
  announce();
  requestAnimationFrame(frame);
}

// The game's rules and state, with no drawing and no browser in it: which
// differences are found, the clock, the hints, the score and the screens.
// checkPoint() is the one judge of a click: near an unfound difference it
// finds it (on both panels at once), anywhere else it costs time.

import {
  FIND_POINTS, HINTS_PER_LEVEL, HINT_SECONDS, LEVELS, MISTAKE_SECONDS, SECOND_POINTS,
} from './config.js';
import { levelDifferences } from './scenes.js';

export const EVENT_FIND = 1;
export const EVENT_MISS = 2;
export const EVENT_HINT = 4;
export const EVENT_CLEAR = 8;
export const EVENT_OVER = 16;
export const EVENT_WIN = 32;

export function createWorld() {
  const state = {
    phase: 'title',
    levelIndex: 0,
    diffs: [],
    found: new Set(),
    timeLeft: 0,
    hintsLeft: HINTS_PER_LEVEL,
    score: 0,
    mistakes: 0,
    message: '',
    messageUntil: 0,
    hintDiff: null,
    hintUntil: 0,
    effects: [],
    shake: 0,
    cursor: null,
  };

  function loadLevel(index) {
    state.levelIndex = index;
    const level = LEVELS[index];
    state.diffs = levelDifferences(level);
    state.found = new Set();
    state.timeLeft = level.seconds;
    state.hintsLeft = HINTS_PER_LEVEL;
    state.hintDiff = null;
    state.hintUntil = 0;
    state.effects = [];
  }

  function startGame() {
    state.score = 0;
    state.mistakes = 0;
    loadLevel(0);
    state.phase = 'play';
  }

  /** Advance the clock and decay effects; returns event flags for sounds. */
  function step(dt, now) {
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 3);
    state.effects = state.effects.filter((fx) => now - fx.at < 0.8);
    if (state.phase !== 'play') return 0;
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.phase = 'over';
      return EVENT_OVER;
    }
    return 0;
  }

  /**
   * Judge one hunt click given in scene coordinates. Returns an event flag:
   * the nearest unfound difference within its radius is a find; anything
   * else is a miss and costs MISTAKE_SECONDS.
   */
  function checkPoint(sceneX, sceneY, now) {
    if (state.phase !== 'play') return 0;
    let best = null;
    let bestDist = Infinity;
    for (const diff of state.diffs) {
      if (state.found.has(diff.id)) continue;
      const d = Math.hypot(diff.x - sceneX, diff.y - sceneY);
      if (d < bestDist) { bestDist = d; best = diff; }
    }
    if (best && bestDist <= Math.max(best.r, 26)) {
      state.found.add(best.id);
      state.score += FIND_POINTS;
      state.effects.push({ diff: best, at: now });
      state.message = 'Found! ' + best.label + '.';
      state.messageUntil = now + 2.4;
      if (state.hintDiff && state.hintDiff.id === best.id) state.hintDiff = null;
      if (state.found.size === state.diffs.length) {
        state.score += Math.ceil(state.timeLeft) * SECOND_POINTS;
        if (state.levelIndex === LEVELS.length - 1) {
          state.phase = 'win';
          return EVENT_FIND | EVENT_WIN;
        }
        state.phase = 'clear';
        return EVENT_FIND | EVENT_CLEAR;
      }
      return EVENT_FIND;
    }
    state.mistakes += 1;
    state.timeLeft = Math.max(0, state.timeLeft - MISTAKE_SECONDS);
    state.shake = 1;
    state.message = 'Not there — 5 seconds lost.';
    state.messageUntil = now + 1.8;
    if (state.timeLeft <= 0) {
      state.phase = 'over';
      return EVENT_MISS | EVENT_OVER;
    }
    return EVENT_MISS;
  }

  /** Spend a hint: pulse the ring around one unfound difference. */
  function useHint(now) {
    if (state.phase !== 'play' || state.hintsLeft <= 0) return 0;
    const remaining = state.diffs.filter((d) => !state.found.has(d.id));
    if (!remaining.length) return 0;
    state.hintsLeft -= 1;
    state.timeLeft = Math.max(1, state.timeLeft - HINT_SECONDS);
    state.hintDiff = remaining[Math.floor(now * 7) % remaining.length];
    state.hintUntil = now + 2.6;
    state.message = 'A hint shimmers… for 8 seconds.';
    state.messageUntil = now + 2;
    return EVENT_HINT;
  }

  /** The one confirm action: start, advance, retry — by phase. */
  function confirm() {
    if (state.phase === 'title' || state.phase === 'over' || state.phase === 'win') startGame();
    else if (state.phase === 'clear') {
      loadLevel(state.levelIndex + 1);
      state.phase = 'play';
    } else if (state.phase === 'paused') state.phase = 'play';
  }

  function togglePause() {
    if (state.phase === 'play') state.phase = 'paused';
    else if (state.phase === 'paused') state.phase = 'play';
  }

  loadLevel(0);
  return { state, startGame, loadLevel, step, checkPoint, useHint, confirm, togglePause };
}

// Lantern Lane — Spot the Difference: every tuning number in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to
// the window, so no rule below depends on the screen size. Each picture panel
// shows the same 600x500 scene; the left one is the original, the right one
// carries every difference of the level.

export const FIELD = { width: 1280, height: 720 };

/** Where the two picture panels sit on the playfield. */
export const PANEL = { y: 118, width: 592, height: 492, leftX: 24, rightX: 664, gap: 48 };

/** The scene's own coordinate box; render.js draws the street inside it. */
export const SCENE = { width: 600, height: 500 };

/** Seconds taken off the clock for one wrong click. */
export const MISTAKE_SECONDS = 5;

/** Seconds a hint costs beyond the hint itself; hints are limited per level. */
export const HINT_SECONDS = 8;
export const HINTS_PER_LEVEL = 3;

/** Score for one find, plus the time bonus banked when a level is cleared. */
export const FIND_POINTS = 100;
export const SECOND_POINTS = 2;

export const FONT = '"Trebuchet MS", "Segoe UI", Verdana, sans-serif';

/**
 * The three levels. Each names its differences (ids from scenes.js), its
 * clock, and the palette its street is painted with: the same lane at
 * night, at harbor dawn, and in a bright garden morning.
 */
export const LEVELS = [
  {
    name: 'Lantern Lane',
    subtitle: 'The night market wakes up',
    seconds: 150,
    diffs: ['moon', 'lanternColor', 'cat', 'window', 'flowers', 'sign', 'fish'],
    sky: ['#1d2450', '#3a2d63', '#6d4470'],
    ground: '#2c2340',
    street: '#453a5e',
    roof: '#241b38',
    wallA: '#4a3a6b',
    wallB: '#5d4470',
    wallC: '#3c3260',
    glow: '#ffd98a',
    accent: '#ff7a6b',
    backdrop: 'roofs',
  },
  {
    name: 'Harbor Dawn',
    subtitle: 'First light over the water',
    seconds: 165,
    diffs: ['star', 'lanternMissing', 'bike', 'umbrella', 'clock', 'bird', 'steam', 'door', 'moon'],
    sky: ['#f2a56b', '#e88ca0', '#7d6ba8'],
    ground: '#4a3550',
    street: '#6b4a5e',
    roof: '#3a2a48',
    wallA: '#7a5570',
    wallB: '#8a5f74',
    wallC: '#6b4a68',
    glow: '#ffe9b0',
    accent: '#ffd166',
    backdrop: 'harbor',
  },
  {
    name: 'Clockwork Garden',
    subtitle: 'Every petal out of place',
    seconds: 180,
    diffs: ['bulb', 'star', 'lanternColor', 'cat', 'window', 'flowers', 'sign', 'fish', 'bike', 'umbrella', 'clock', 'steam'],
    sky: ['#8fd0e8', '#bfe6d8', '#f6ecc8'],
    ground: '#3f6b4a',
    street: '#7a8a6b',
    roof: '#4a3a5e',
    wallA: '#c98a6b',
    wallB: '#d8a06b',
    wallC: '#b87a68',
    glow: '#fff3b0',
    accent: '#e85d75',
    backdrop: 'garden',
  },
];

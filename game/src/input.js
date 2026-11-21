// Pointer and keyboard input. Pointer clicks arrive in playfield
// coordinates; the keyboard drives a crosshair cursor (arrow keys move it,
// Enter or Space checks where it points) so the whole hunt is playable
// without a mouse. H asks for a hint, P pauses, M mutes.

import { FIELD } from './config.js';

export const KEY_HINT = 'hint';
export const KEY_PAUSE = 'pause';
export const KEY_CONFIRM = 'confirm';
export const KEY_MUTE = 'mute';

const CURSOR_STEP = 18;

export function createInput(canvas, handlers) {
  const cursor = { x: FIELD.width / 2, y: 360, active: false };

  function toField(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * FIELD.width,
      y: ((event.clientY - rect.top) / rect.height) * FIELD.height,
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    cursor.active = false;
    handlers.onPoint(toField(event));
  });

  window.addEventListener('keydown', (event) => {
    const moves = {
      ArrowLeft: [-CURSOR_STEP, 0],
      ArrowRight: [CURSOR_STEP, 0],
      ArrowUp: [0, -CURSOR_STEP],
      ArrowDown: [0, CURSOR_STEP],
    };
    if (moves[event.code]) {
      const [dx, dy] = moves[event.code];
      cursor.active = true;
      cursor.x = Math.min(FIELD.width - 8, Math.max(8, cursor.x + dx));
      cursor.y = Math.min(FIELD.height - 8, Math.max(8, cursor.y + dy));
      handlers.onCursor({ ...cursor });
    } else if (event.code === 'Enter' || event.code === 'Space') {
      if (!event.repeat) handlers.onKey(KEY_CONFIRM, { ...cursor, active: cursor.active });
    } else if (event.code === 'KeyH') handlers.onKey(KEY_HINT, null);
    else if (event.code === 'KeyP' || event.code === 'Escape') handlers.onKey(KEY_PAUSE, null);
    else if (event.code === 'KeyM') handlers.onKey(KEY_MUTE, null);
    else return;
    event.preventDefault();
  });

  return { cursor };
}

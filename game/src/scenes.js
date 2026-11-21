// The difference catalogue: every spot where the right-hand picture can
// differ from the left. Positions are scene coordinates (600x500, see
// config.js); x/y is the centre a click must land near, r is how generous
// the click may be, and label is the words the game celebrates a find with.
// render.js paints each id twice: plain for the original panel, and with
// the change applied for the spot-it panel.

export const DIFFERENCES = {
  moon: { x: 522, y: 56, r: 34, label: 'The full moon slipped into a crescent' },
  star: { x: 70, y: 58, r: 26, label: 'One bright star blinked out' },
  bulb: { x: 186, y: 96, r: 22, label: 'A string-light bulb went dark' },
  bird: { x: 252, y: 78, r: 24, label: 'A sparrow landed on the wire' },
  lanternColor: { x: 302, y: 120, r: 26, label: 'A lantern swapped red for teal' },
  lanternMissing: { x: 428, y: 112, r: 26, label: 'A lantern vanished from the string' },
  cat: { x: 148, y: 128, r: 26, label: 'The roof cat wandered off' },
  clock: { x: 44, y: 196, r: 28, label: 'The tower clock jumped twenty minutes' },
  window: { x: 208, y: 218, r: 24, label: 'A warm window went dark' },
  sign: { x: 336, y: 238, r: 34, label: 'The tea house sign lost a letter' },
  fish: { x: 548, y: 196, r: 30, label: 'One carp banner swam away' },
  umbrella: { x: 118, y: 322, r: 32, label: 'The stall umbrella changed its stripes' },
  door: { x: 258, y: 356, r: 26, label: 'A door was repainted orange' },
  steam: { x: 396, y: 392, r: 24, label: 'The teapot stopped steaming' },
  flowers: { x: 92, y: 418, r: 26, label: 'One flower left the pot' },
  bike: { x: 508, y: 428, r: 32, label: 'The delivery bicycle rolled away' },
};

/** The difference records of one level, in the order its ids are listed. */
export function levelDifferences(level) {
  return level.diffs.map((id) => ({ id, ...DIFFERENCES[id] }));
}

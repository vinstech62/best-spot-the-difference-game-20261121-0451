// The screenshot scenes behind ?shot=cover|play|hint|end. Each stages the
// real world state — a level part-way hunted, with markers on the finds and
// a counter of what remains — paints it, and sets window.__shotReady, so a
// screenshot is always a true render of the game itself. The cover shows
// level 1 with 4 of 7 found: both panels, markers, and "3 left to find".

import { LEVELS } from './config.js';

function findSome(world, ids, now) {
  for (const id of ids) {
    const diff = world.state.diffs.find((d) => d.id === id);
    if (diff) {
      world.state.found.add(id);
      world.state.score += 100;
    }
  }
}

export function stageShot(world, name, now) {
  const s = world.state;
  if (name === 'cover') {
    world.loadLevel(0);
    s.phase = 'play';
    findSome(world, ['moon', 'cat', 'window', 'flowers'], now);
    s.timeLeft = 96;
    s.message = 'Found! A warm window went dark.';
    s.messageUntil = now + 999;
  } else if (name === 'play') {
    world.loadLevel(1);
    s.phase = 'play';
    findSome(world, ['moon', 'clock', 'door', 'steam', 'bike'], now);
    s.timeLeft = 88;
    const diff = s.diffs.find((d) => d.id === 'bird');
    s.effects.push({ diff, at: now - 0.15 });
    s.found.add('bird');
    s.message = 'Found! A sparrow landed on the wire.';
    s.messageUntil = now + 999;
  } else if (name === 'hint') {
    world.loadLevel(2);
    s.phase = 'play';
    findSome(world, ['bulb', 'star', 'cat', 'window', 'sign', 'fish', 'umbrella'], now);
    s.timeLeft = 74;
    s.hintsLeft = 2;
    s.hintDiff = s.diffs.find((d) => d.id === 'clock');
    s.hintUntil = now + 999;
    s.message = 'A hint shimmers… for 8 seconds.';
    s.messageUntil = now + 999;
  } else {
    world.loadLevel(2);
    s.phase = 'win';
    findSome(world, LEVELS[2].diffs, now);
    s.score = 2740;
    s.timeLeft = 41;
  }
  s.cursor = null;
  return s.phase;
}

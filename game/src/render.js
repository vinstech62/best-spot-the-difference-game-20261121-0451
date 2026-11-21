// Drawing only: the world state in, pixels out. The street scene is painted
// twice per frame from the same code — once plain (the original) and once
// with the level's differences applied — so the two panels can only differ
// where scenes.js says they do. Found differences get a green ring and a
// tick on BOTH panels; the header carries the counter of how many remain,
// the clock, the score and the hint button.

import { FIELD, FONT, LEVELS, PANEL, SCENE } from './config.js';
import { createRandom } from './random.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

/** Screen-space rectangles the input layer needs (hint button, panels). */
export const HINT_BUTTON = { x: 1064, y: 18, width: 192, height: 44 };
export const PANEL_RECTS = [
  { x: PANEL.leftX, y: PANEL.y, width: PANEL.width, height: PANEL.height },
  { x: PANEL.rightX, y: PANEL.y, width: PANEL.width, height: PANEL.height },
];

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function star(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(angle) * rad;
    const py = y + Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function lantern(ctx, x, y, color, glow) {
  ctx.strokeStyle = 'rgba(20,14,30,0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, y - 26); ctx.lineTo(x, y - 14); ctx.stroke();
  const grad = ctx.createRadialGradient(x, y, 2, x, y, 20);
  grad.addColorStop(0, glow);
  grad.addColorStop(1, color);
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.ellipse(x, y, 13, 16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(20,14,30,0.45)';
  ctx.lineWidth = 1;
  for (const dy of [-8, 0, 8]) {
    ctx.beginPath(); ctx.ellipse(x, y + dy, 13, 4.5, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.fillStyle = '#2c2340';
  ctx.fillRect(x - 5, y + 16, 10, 5);
}

function drawCat(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(x, y, 16, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 13, y - 8, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 7, y - 13); ctx.lineTo(x + 10, y - 21); ctx.lineTo(x + 13, y - 14); ctx.closePath();
  ctx.moveTo(x + 15, y - 14); ctx.lineTo(x + 19, y - 21); ctx.lineTo(x + 20, y - 12); ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x - 14, y + 2); ctx.quadraticCurveTo(x - 26, y - 6, x - 22, y - 16); ctx.stroke();
}

function drawScene(ctx, ox, oy, level, applied, time) {
  const sx = PANEL.width / SCENE.width;
  const sy = PANEL.height / SCENE.height;
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(sx, sy);
  ctx.beginPath(); ctx.rect(0, 0, SCENE.width, SCENE.height); ctx.clip();
  const rand = createRandom(1234);

  // Sky and its fixed scatter of small stars.
  const sky = ctx.createLinearGradient(0, 0, 0, 330);
  sky.addColorStop(0, level.sky[0]);
  sky.addColorStop(0.6, level.sky[1]);
  sky.addColorStop(1, level.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 500);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  for (let i = 0; i < 42; i += 1) {
    const x = rand() * 600;
    const y = rand() * 150;
    if (Math.hypot(x - 70, y - 58) < 30 || Math.hypot(x - 522, y - 56) < 44) continue;
    ctx.globalAlpha = 0.25 + rand() * 0.55;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
  if (!applied.has('star')) star(ctx, 70, 58, 13, '#fff6c9');
  else star(ctx, 70, 58, 5, 'rgba(255,246,201,0.35)');

  // The moon: full in the original, a crescent once the difference applies.
  ctx.fillStyle = '#fdf3c4';
  ctx.beginPath(); ctx.arc(522, 56, 26, 0, Math.PI * 2); ctx.fill();
  if (applied.has('moon')) {
    ctx.fillStyle = level.sky[0];
    ctx.beginPath(); ctx.arc(536, 48, 22, 0, Math.PI * 2); ctx.fill();
  }

  // Backdrop by level: rooftops, a harbor with a boat, or garden hills.
  ctx.fillStyle = 'rgba(24,18,40,0.35)';
  if (level.backdrop === 'harbor') {
    ctx.fillStyle = '#7d5a78';
    ctx.fillRect(0, 268, 600, 44);
    ctx.fillStyle = '#54383f';
    ctx.fillRect(238, 236, 74, 32);
    ctx.beginPath(); ctx.moveTo(228, 268); ctx.lineTo(322, 268); ctx.lineTo(306, 282); ctx.lineTo(244, 282); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2c2340';
    ctx.fillRect(272, 196, 4, 42);
    ctx.fillStyle = '#ffe9b0';
    ctx.beginPath(); ctx.moveTo(276, 200); ctx.lineTo(302, 224); ctx.lineTo(276, 224); ctx.closePath(); ctx.fill();
  } else if (level.backdrop === 'garden') {
    ctx.fillStyle = '#5d8a5e';
    ctx.beginPath(); ctx.ellipse(120, 330, 220, 62, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(480, 336, 240, 70, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#4a3a5e'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(556, 268); ctx.lineTo(556, 196); ctx.stroke();
    ctx.strokeStyle = '#e8e0c8'; ctx.lineWidth = 4;
    const a = time * 0.7;
    for (let i = 0; i < 4; i += 1) {
      const ang = a + (i * Math.PI) / 2;
      ctx.beginPath(); ctx.moveTo(556, 196); ctx.lineTo(556 + Math.cos(ang) * 30, 196 + Math.sin(ang) * 30); ctx.stroke();
    }
  } else {
    ctx.fillStyle = 'rgba(20,14,36,0.55)';
    ctx.fillRect(0, 236, 150, 76);
    ctx.fillRect(430, 226, 170, 86);
    ctx.beginPath(); ctx.moveTo(-6, 236); ctx.lineTo(75, 196); ctx.lineTo(156, 236); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(424, 226); ctx.lineTo(515, 184); ctx.lineTo(606, 226); ctx.closePath(); ctx.fill();
  }

  // Wire across the top: a sparrow may land on it, and a bulb may go dark.
  ctx.strokeStyle = 'rgba(16,12,28,0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 66); ctx.quadraticCurveTo(300, 104, 600, 60); ctx.stroke();
  if (applied.has('bird')) {
    ctx.fillStyle = '#2e2a3a';
    ctx.beginPath(); ctx.ellipse(252, 72, 10, 7, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(261, 66, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffb347';
    ctx.beginPath(); ctx.moveTo(266, 66); ctx.lineTo(272, 68); ctx.lineTo(266, 70); ctx.closePath(); ctx.fill();
  }
  const bulbXs = [96, 140, 186, 232, 278];
  bulbXs.forEach((x, i) => {
    const y = 78 + Math.sin((x / 600) * Math.PI) * 14;
    const dark = applied.has('bulb') && x === 186;
    ctx.strokeStyle = 'rgba(16,12,28,0.8)';
    ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x, y); ctx.stroke();
    ctx.fillStyle = dark ? '#3a3650' : (i % 2 ? '#ffd98a' : '#ff9d7a');
    ctx.beginPath(); ctx.arc(x, y + 5, 6, 0, Math.PI * 2); ctx.fill();
  });

  // Buildings: clock tower on the left, tea house in the middle, tall house right.
  ctx.fillStyle = level.wallC;
  ctx.fillRect(8, 150, 76, 262);
  ctx.fillStyle = level.roof;
  ctx.beginPath(); ctx.moveTo(0, 152); ctx.lineTo(46, 112); ctx.lineTo(92, 152); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f3ead2';
  ctx.beginPath(); ctx.arc(44, 196, 24, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2c2340'; ctx.lineWidth = 3; ctx.stroke();
  const minuteAngle = applied.has('clock') ? (25 / 60) * Math.PI * 2 : (5 / 60) * Math.PI * 2;
  const hourAngle = ((7 + 25 / 60) / 12) * Math.PI * 2;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(44, 196); ctx.lineTo(44 + Math.sin(hourAngle) * 11, 196 - Math.cos(hourAngle) * 11); ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(44, 196); ctx.lineTo(44 + Math.sin(minuteAngle) * 17, 196 - Math.cos(minuteAngle) * 17); ctx.stroke();
  ctx.fillStyle = level.wallC;
  ctx.fillRect(24, 300, 40, 112);

  ctx.fillStyle = level.wallA;
  ctx.fillRect(120, 168, 200, 244);
  ctx.fillStyle = level.roof;
  ctx.beginPath(); ctx.moveTo(108, 170); ctx.lineTo(220, 122); ctx.lineTo(332, 170); ctx.closePath(); ctx.fill();
  if (!applied.has('cat')) drawCat(ctx, 148, 138, '#241d33');
  // Windows of the tea house; one warm window can go dark.
  const windows = [[150, 200], [208, 218], [262, 200], [150, 268], [262, 268]];
  for (const [wx, wy] of windows) {
    const dark = applied.has('window') && wx === 208;
    ctx.fillStyle = dark ? '#241d33' : level.glow;
    ctx.fillRect(wx - 15, wy - 17, 30, 34);
    ctx.strokeStyle = '#2c2340'; ctx.lineWidth = 2; ctx.strokeRect(wx - 15, wy - 17, 30, 34);
    ctx.beginPath(); ctx.moveTo(wx, wy - 17); ctx.lineTo(wx, wy + 17); ctx.stroke();
  }
  // The tea house door: teal, unless repainted orange.
  ctx.fillStyle = applied.has('door') ? '#e87e35' : '#2e7d74';
  roundRect(ctx, 236, 322, 44, 90, 8); ctx.fill();
  ctx.fillStyle = '#ffd98a';
  ctx.beginPath(); ctx.arc(270, 368, 3.5, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = level.wallB;
  ctx.fillRect(356, 188, 150, 224);
  ctx.fillStyle = level.roof;
  ctx.beginPath(); ctx.moveTo(346, 190); ctx.lineTo(431, 148); ctx.lineTo(516, 190); ctx.closePath(); ctx.fill();
  for (const [wx, wy] of [[386, 232], [452, 232], [386, 306], [452, 306]]) {
    ctx.fillStyle = level.glow;
    ctx.fillRect(wx - 14, wy - 16, 28, 32);
    ctx.strokeStyle = '#2c2340'; ctx.lineWidth = 2; ctx.strokeRect(wx - 14, wy - 16, 28, 32);
  }

  // The shop sign between the roofs: a letter goes missing.
  ctx.fillStyle = '#233047';
  roundRect(ctx, 250, 216, 172, 44, 8); ctx.fill();
  ctx.strokeStyle = level.accent; ctx.lineWidth = 3; roundRect(ctx, 250, 216, 172, 44, 8); ctx.stroke();
  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'bold 23px ' + FONT_PLACEHOLDER;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(applied.has('sign') ? 'TEA MOUSE' : 'TEA HOUSE', 336, 239);

  // Lantern string across the lane; one lantern changes colour, one vanishes.
  ctx.strokeStyle = 'rgba(16,12,28,0.8)';
  ctx.beginPath(); ctx.moveTo(84, 96); ctx.quadraticCurveTo(300, 148, 520, 92); ctx.stroke();
  const lanternXs = [130, 190, 250, 302, 362, 428, 486];
  lanternXs.forEach((x, i) => {
    if (applied.has('lanternMissing') && x === 428) return;
    const y = 104 + Math.sin(((x - 84) / 436) * Math.PI) * 22;
    let color = i % 2 ? '#c94f5e' : '#e8a04c';
    if (applied.has('lanternColor') && x === 302) color = '#3fbfae';
    lantern(ctx, x, y + 16, color, '#fff0c0');
  });

  // Carp banners on a pole at the right edge; one can swim away.
  ctx.strokeStyle = '#2c2340'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(548, 150); ctx.lineTo(548, 300); ctx.stroke();
  const fishCount = applied.has('fish') ? 2 : 3;
  const fishColors = ['#e85d75', '#3f8fbf', '#e8a04c'];
  for (let i = 0; i < fishCount; i += 1) {
    const fy = 168 + i * 34;
    ctx.fillStyle = fishColors[i];
    ctx.beginPath();
    ctx.moveTo(548, fy);
    ctx.quadraticCurveTo(578, fy - 10, 592, fy + 4);
    ctx.quadraticCurveTo(578, fy + 14, 548, fy + 10);
    ctx.closePath(); ctx.fill();
  }

  // Ground and street.
  ctx.fillStyle = level.ground;
  ctx.fillRect(0, 412, 600, 88);
  ctx.fillStyle = level.street;
  ctx.fillRect(0, 452, 600, 48);
  ctx.strokeStyle = 'rgba(255,233,176,0.35)';
  ctx.lineWidth = 3;
  ctx.setLineDash([26, 20]);
  ctx.beginPath(); ctx.moveTo(0, 476); ctx.lineTo(600, 476); ctx.stroke();
  ctx.setLineDash([]);

  // Market stall with a striped umbrella on the left.
  ctx.fillStyle = '#6b4a35';
  ctx.fillRect(58, 356, 128, 10);
  ctx.fillRect(66, 366, 8, 52);
  ctx.fillRect(170, 366, 8, 52);
  ctx.fillStyle = '#8a5f43';
  ctx.fillRect(58, 336, 128, 20);
  const umb = applied.has('umbrella') ? ['#7a5fb0', '#e8e0f0'] : ['#c94f5e', '#f3e3c2'];
  for (let i = 0; i < 6; i += 1) {
    ctx.fillStyle = umb[i % 2];
    ctx.beginPath();
    ctx.moveTo(122, 268);
    ctx.lineTo(52 + i * 24, 336);
    ctx.lineTo(76 + i * 24, 336);
    ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = '#2c2340'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(122, 268); ctx.lineTo(122, 336); ctx.stroke();
  // Crates of oranges on the stall.
  ctx.fillStyle = '#e8913a';
  for (const [cx, cy] of [[84, 326], [100, 326], [92, 312], [140, 326], [156, 326], [148, 312]]) {
    ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
  }

  // Flower pot by the stall: three blooms, or two.
  ctx.fillStyle = '#a8542e';
  ctx.beginPath(); ctx.moveTo(74, 424); ctx.lineTo(110, 424); ctx.lineTo(104, 448); ctx.lineTo(80, 448); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#3f7a44'; ctx.lineWidth = 3;
  const blooms = applied.has('flowers') ? [[84, 404], [100, 398]] : [[84, 404], [100, 398], [92, 416]];
  for (const [bx, by] of blooms) {
    ctx.beginPath(); ctx.moveTo(92, 424); ctx.lineTo(bx, by + 6); ctx.stroke();
    ctx.fillStyle = '#e85d75';
    for (let p = 0; p < 5; p += 1) {
      const ang = (p / 5) * Math.PI * 2;
      ctx.beginPath(); ctx.arc(bx + Math.cos(ang) * 6, by + Math.sin(ang) * 6, 4.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#ffd166';
    ctx.beginPath(); ctx.arc(bx, by, 3.5, 0, Math.PI * 2); ctx.fill();
  }

  // The tea stall table with its pot: steam curls, unless it stopped.
  ctx.fillStyle = '#6b4a35';
  ctx.fillRect(352, 420, 96, 8);
  ctx.fillRect(360, 428, 8, 30);
  ctx.fillRect(432, 428, 8, 30);
  ctx.fillStyle = '#3fbfae';
  ctx.beginPath(); ctx.ellipse(396, 408, 20, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(414, 404); ctx.lineTo(428, 398); ctx.lineTo(416, 412); ctx.closePath(); ctx.fill();
  if (!applied.has('steam')) {
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 3;
    for (const off of [-8, 4]) {
      ctx.beginPath();
      ctx.moveTo(396 + off, 392);
      ctx.quadraticCurveTo(390 + off, 378, 398 + off, 366 + Math.sin(time * 2 + off) * 2);
      ctx.stroke();
    }
  }

  // The delivery bicycle leaning by the tall house; it can roll away.
  if (!applied.has('bike')) {
    ctx.strokeStyle = '#233047'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(478, 446, 17, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(538, 446, 17, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(478, 446); ctx.lineTo(502, 416); ctx.lineTo(538, 446); ctx.lineTo(508, 446);
    ctx.moveTo(502, 416); ctx.lineTo(524, 416); ctx.lineTo(538, 446);
    ctx.moveTo(524, 416); ctx.lineTo(520, 406);
    ctx.stroke();
    ctx.fillStyle = '#c94f5e';
    ctx.fillRect(512, 402, 18, 7);
  }

  ctx.restore();
}

const FONT_PLACEHOLDER = '"Trebuchet MS", "Segoe UI", Verdana, sans-serif';

function drawMarker(ctx, x, y, r, pulse) {
  ctx.strokeStyle = '#57e389';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(x, y, r + pulse, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, r + pulse + 4, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#57e389';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.42, y + 1);
  ctx.lineTo(x - r * 0.12, y + r * 0.38);
  ctx.lineTo(x + r * 0.48, y - r * 0.36);
  ctx.stroke();
}

function panelPoint(panelX, diff) {
  return {
    x: panelX + (diff.x / SCENE.width) * PANEL.width,
    y: PANEL.y + (diff.y / SCENE.height) * PANEL.height,
    r: Math.max(20, diff.r * (PANEL.width / SCENE.width)),
  };
}

function drawPanel(ctx, world, panelX, applied, time) {
  const level = LEVELS[world.levelIndex];
  roundRect(ctx, panelX - 4, PANEL.y - 4, PANEL.width + 8, PANEL.height + 8, 14);
  ctx.fillStyle = '#141126';
  ctx.fill();
  ctx.save();
  roundRect(ctx, panelX, PANEL.y, PANEL.width, PANEL.height, 10);
  ctx.clip();
  drawScene(ctx, panelX, PANEL.y, level, applied, time);
  ctx.restore();
  for (const diff of world.diffs) {
    if (!world.found.has(diff.id)) continue;
    const p = panelPoint(panelX, diff);
    drawMarker(ctx, p.x, p.y, p.r * 0.72, 0);
  }
  if (world.hintDiff && world.hintUntil > time) {
    const p = panelPoint(panelX, world.hintDiff);
    const pulse = 6 + Math.sin(time * 10) * 3;
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r + pulse, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(16,12,28,0.82)';
  roundRect(ctx, panelX + 12, PANEL.y + 10, 168, 32, 8); ctx.fill();
  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'bold 17px ' + FONT;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(applied.size ? 'SPOT IT! →' : '← ORIGINAL', panelX + 24, PANEL.y + 27);
}

function formatClock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function drawHeader(ctx, world, time) {
  const level = LEVELS[world.levelIndex];
  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'bold 30px ' + FONT;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Lantern Lane', 24, 34);
  ctx.font = '17px ' + FONT;
  ctx.fillStyle = '#cfc4e8';
  ctx.fillText('Level ' + (world.levelIndex + 1) + ' · ' + level.name + ' — ' + level.subtitle, 24, 66);

  const remaining = world.diffs.length - world.found.size;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px ' + FONT;
  ctx.fillText(remaining + ' left to find', 640, 32);
  ctx.font = '16px ' + FONT;
  ctx.fillStyle = '#cfc4e8';
  ctx.fillText('Found ' + world.found.size + ' of ' + world.diffs.length + ' differences', 640, 64);

  const urgent = world.timeLeft <= 20 && world.phase === SCREEN_PLAY;
  ctx.textAlign = 'right';
  ctx.fillStyle = urgent && Math.sin(time * 8) > 0 ? '#ff7a6b' : '#ffffff';
  ctx.font = 'bold 28px ' + FONT;
  ctx.fillText('⏱ ' + formatClock(world.timeLeft), 1036, 32);
  ctx.font = '16px ' + FONT;
  ctx.fillStyle = '#cfc4e8';
  ctx.fillText('Score ' + world.score, 1036, 64);

  ctx.fillStyle = world.hintsLeft > 0 ? '#ffd166' : '#5a5470';
  roundRect(ctx, HINT_BUTTON.x, HINT_BUTTON.y, HINT_BUTTON.width, HINT_BUTTON.height, 10); ctx.fill();
  ctx.fillStyle = '#241d33';
  ctx.font = 'bold 19px ' + FONT;
  ctx.textAlign = 'center';
  ctx.fillText('💡 Hint (' + world.hintsLeft + ')', HINT_BUTTON.x + HINT_BUTTON.width / 2, HINT_BUTTON.y + 23);

  // Timer bar under the header: it drains and reddens as time runs out.
  const frac = Math.max(0, world.timeLeft / level.seconds);
  ctx.fillStyle = '#2c2340';
  roundRect(ctx, 24, 92, 1232, 10, 5); ctx.fill();
  ctx.fillStyle = frac > 0.35 ? '#57e389' : frac > 0.15 ? '#ffd166' : '#ff7a6b';
  if (frac > 0) { roundRect(ctx, 24, 92, 1232 * frac, 10, 5); ctx.fill(); }
}

function drawBanner(ctx, title, lines, prompt) {
  ctx.fillStyle = 'rgba(14,10,26,0.78)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.fillStyle = '#241d3d';
  roundRect(ctx, 340, 190, 600, 330, 18); ctx.fill();
  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3;
  roundRect(ctx, 340, 190, 600, 330, 18); ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'bold 42px ' + FONT;
  ctx.fillText(title, 640, 258);
  ctx.font = '20px ' + FONT;
  ctx.fillStyle = '#e8e2f5';
  lines.forEach((line, i) => ctx.fillText(line, 640, 316 + i * 32));
  ctx.font = 'bold 21px ' + FONT;
  ctx.fillStyle = '#57e389';
  ctx.fillText(prompt, 640, 316 + lines.length * 32 + 26);
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = FIELD.width;
  canvas.height = FIELD.height;

  function render(world, time) {
    ctx.fillStyle = '#191430';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    const level = LEVELS[world.levelIndex];
    const applied = new Set(level.diffs);
    ctx.save();
    if (world.shake > 0) ctx.translate(Math.sin(time * 70) * world.shake * 6, 0);
    drawPanel(ctx, world, PANEL.leftX, new Set(), time);
    drawPanel(ctx, world, PANEL.rightX, applied, time);
    ctx.restore();

    // Fresh-find celebration rings, expanding on both panels at once.
    for (const fx of world.effects) {
      const age = time - fx.at;
      if (age < 0 || age > 0.7) continue;
      for (const panelX of [PANEL.leftX, PANEL.rightX]) {
        const p = panelPoint(panelX, fx.diff);
        ctx.strokeStyle = 'rgba(87,227,137,' + (1 - age / 0.7) + ')';
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.5 + age * 46, 0, Math.PI * 2); ctx.stroke();
      }
    }

    drawHeader(ctx, world, time);

    ctx.fillStyle = '#cfc4e8';
    ctx.font = '16px ' + FONT;
    ctx.textAlign = 'center';
    if (world.message && world.messageUntil > time) {
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 19px ' + FONT;
      ctx.fillText(world.message, 640, 648);
    } else {
      ctx.fillText('Click a difference in either picture · H hint · Arrow keys + Enter to hunt by keyboard · P pause', 640, 648);
    }
    if (world.cursor && world.phase === SCREEN_PLAY) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      const c = world.cursor;
      ctx.beginPath();
      ctx.moveTo(c.x - 14, c.y); ctx.lineTo(c.x - 5, c.y);
      ctx.moveTo(c.x + 5, c.y); ctx.lineTo(c.x + 14, c.y);
      ctx.moveTo(c.x, c.y - 14); ctx.lineTo(c.x, c.y - 5);
      ctx.moveTo(c.x, c.y + 5); ctx.lineTo(c.x, c.y + 14);
      ctx.stroke();
    }

    if (world.phase === SCREEN_TITLE) {
      drawBanner(ctx, 'Spot the Difference!', [
        'Two pictures of Lantern Lane, almost twins.',
        'Click every difference before the clock runs out.',
        'Wrong clicks cost 5 seconds. Three levels, rising trickiness.',
      ], 'Click or press Enter to start');
    } else if (world.phase === SCREEN_PAUSED) {
      drawBanner(ctx, 'Paused', ['The lanterns wait for you.'], 'Press P or click to resume');
    } else if (world.phase === SCREEN_CLEAR) {
      drawBanner(ctx, 'Level clear!', [
        level.name + ' solved with ' + formatClock(world.timeLeft) + ' to spare.',
        'Score ' + world.score,
      ], 'Click or press Enter for the next level');
    } else if (world.phase === SCREEN_OVER) {
      drawBanner(ctx, 'Time up!', [
        'You found ' + world.found.size + ' of ' + world.diffs.length + ' differences.',
        'Score ' + world.score,
      ], 'Click or press Enter to try again');
    } else if (world.phase === SCREEN_WIN) {
      drawBanner(ctx, 'Master spotter!', [
        'All three levels cleared. Final score ' + world.score + '.',
        'The lane is exactly as it should be — because you checked.',
      ], 'Click or press Enter to play again');
    }
  }

  return { render };
}

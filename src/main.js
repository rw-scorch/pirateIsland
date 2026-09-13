import { createState, createShip } from './state.js';
import { loadImages, shipAssetPaths, worldAssetPaths } from './assets.js';
import { drawShip } from './render/shipRig.js';
import { drawWorld } from './render/world.js';
import { buildDebugPanel } from './debugPanel.js';
import { createInput } from './input.js';
import { createCamera, updateCamera } from './camera.js';
import { updateWind } from './sim/wind.js';
import { updateShip } from './sim/sailing.js';
import { resolveCollision } from './sim/collision.js';
import { generateWorld } from './world/worldGen.js';
import { TILE_SIZE } from './world/tileset.js';
import { fireBroadside, sideTowards, updateCannonballs, updateReload } from './sim/gunnery.js';
import { updateAIShip } from './sim/ai.js';
import { isHostile, isFlyingFalseColours, updateAdmiraltySuspicion, applyFireConsequence } from './sim/factions.js';

const MUZZLE_IMG = 'assets/fx/particles/muzzle_01.png';
const HIT_IMG = 'assets/fx/pirate/explosion2.png';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
}
window.addEventListener('resize', resize);
resize();

const world = generateWorld();
const state = createState();
state.balls = [];
state.effects = []; // transient muzzle/hit flashes: {x,y,img,start,duration}

// Start just off the port pier's water side.
const [pierX, pierY] = world.pier[world.pier.length - 1];
state.player.x = (pierX + 1.5) * TILE_SIZE;
state.player.y = (pierY + 3) * TILE_SIZE; // south of the pier, facing open water

// One hostile AI ship (Black Account — aggressive by default, see
// sim/factions.js) to prove out chase-and-broadside before more factions
// show up in the world.
const target = createShip({
  sailFaction: 2,
  x: state.player.x + 320,
  y: state.player.y - 20,
  heading: Math.PI / 2,
});
state.targets = [target];

const camera = createCamera(state.player.x, state.player.y);

const images = await loadImages([...shipAssetPaths(), ...worldAssetPaths(), MUZZLE_IMG, HIT_IMG]);

let firedThisFrame = false;

const input = createInput({
  canvas,
  onAnchorToggle: () => {
    state.player.anchored = !state.player.anchored;
  },
  onFlagCycle: () => {
    state.player.flagFaction = (state.player.flagFaction % 6) + 1;
  },
  onFire: (clientX, clientY) => {
    const aim = clientToWorld(clientX, clientY);
    const side = sideTowards(state.player, aim.x, aim.y);
    const before = state.balls.length;
    fireBroadside(state.player, side, (ball) => state.balls.push(ball));
    if (state.balls.length > before) {
      const muzzleBall = state.balls[before];
      spawnEffect(MUZZLE_IMG, muzzleBall.x, muzzleBall.y, 0.12);
      firedThisFrame = true;
    }
  },
});

function clientToWorld(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const localX = clientX - rect.left;
  const localY = clientY - rect.top;
  return {
    x: camera.x + (localX - w / 2),
    y: camera.y + (localY - h / 2),
  };
}

function spawnEffect(img, x, y, duration) {
  state.effects.push({ img, x, y, start: performance.now() / 1000, duration });
}

buildDebugPanel(document.getElementById('debug-panel'), state.player, () => {});

// Exposed for manual inspection in devtools; not used by any UI.
window.__marrowSea = { state, camera, world };

const SHIP_SCALE = 3;
let lastTime = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  updateWind(state.wind, dt);
  const prevX = state.player.x;
  const prevY = state.player.y;
  updateShip(
    state.player,
    state.wind,
    {
      left: input.left(),
      right: input.right(),
      trimUp: input.trimUp(),
      trimDown: input.trimDown(),
    },
    dt
  );
  resolveCollision(state.player, world, prevX, prevY);
  updateReload(state.player, dt);

  for (const ai of state.targets) {
    const aiPrevX = ai.x;
    const aiPrevY = ai.y;
    updateAIShip(ai, state.player, state.wind, dt, (ball) => state.balls.push(ball), state.standings);
    resolveCollision(ai, world, aiPrevX, aiPrevY);
    updateReload(ai, dt);
    updateAdmiraltySuspicion(ai, state.player, dt, firedThisFrame, state.standings);
  }
  firedThisFrame = false;

  updateCannonballs(state.balls, [state.player, ...state.targets], dt, (ship, subsystem, x, y, shooter) => {
    spawnEffect(HIT_IMG, x, y, 0.25);
    if (shooter === state.player) applyFireConsequence(ship, state.standings);
  });
  updateCamera(camera, state.player.x, state.player.y, dt);

  render(now / 1000);
  requestAnimationFrame(frame);
}

function render(timeSec) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  ctx.save();
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

  drawWorld(ctx, images, world, camera, w, h, timeSec);

  const originX = w / 2 - camera.x;
  const originY = h / 2 - camera.y;
  ctx.translate(originX, originY);

  for (const t of state.targets) drawShip(ctx, images, t, t.x, t.y, SHIP_SCALE);
  drawShip(ctx, images, state.player, state.player.x, state.player.y, SHIP_SCALE);

  const ball = images.get('assets/ships/gun/cannonBall.png');
  for (const b of state.balls) {
    ctx.drawImage(ball, b.x - ball.width / 2, b.y - ball.height / 2);
  }

  drawEffects(timeSec);

  ctx.restore();

  drawHud(w, h);
  drawCrosshair();
}

function drawEffects(timeSec) {
  for (let i = state.effects.length - 1; i >= 0; i--) {
    const fx = state.effects[i];
    const age = timeSec - fx.start;
    if (age > fx.duration) {
      state.effects.splice(i, 1);
      continue;
    }
    const img = images.get(fx.img);
    if (!img) continue;
    ctx.save();
    ctx.globalAlpha = 1 - age / fx.duration;
    ctx.drawImage(img, fx.x - img.width / 2, fx.y - img.height / 2);
    ctx.restore();
  }
}

function drawCrosshair() {
  const m = input.mouseClient();
  const rect = canvas.getBoundingClientRect();
  ctx.save();
  ctx.strokeStyle = '#e8f4f8';
  ctx.lineWidth = 1.5;
  const x = m.clientX - rect.left;
  const y = m.clientY - rect.top;
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.moveTo(x - 12, y);
  ctx.lineTo(x + 12, y);
  ctx.moveTo(x, y - 12);
  ctx.lineTo(x, y + 12);
  ctx.stroke();
  ctx.restore();
}

function drawHud(w, h) {
  const ship = state.player;
  const wind = state.wind;
  const falseColours = isFlyingFalseColours(ship);
  ctx.save();
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#e8f4f8';
  const lines = [
    `speed ${ship.speed.toFixed(0)} px/s`,
    `trim ${(ship.trim * 100).toFixed(0)}%`,
    `heading ${((ship.heading * 180) / Math.PI).toFixed(0)}°`,
    `wind ${((wind.angle * 180) / Math.PI).toFixed(0)}° @ ${(wind.strength * 100).toFixed(0)}%`,
    ship.anchored ? 'anchored' : ship.mastIntact ? 'under sail' : 'rowing (mast down)',
    `flag ${ship.flagFaction} / sail ${ship.sailFaction}${falseColours ? '  (false colours)' : ''}`,
    `standings ${Object.entries(state.standings).map(([f, v]) => `${f}:${v}`).join(' ')}`,
    `target hull ${target.hullHp.toFixed(0)} sail ${target.sailHp.toFixed(0)} mast ${target.mastHp.toFixed(0)} crew ${target.crewCount} — ${isHostile(target, state.standings) ? 'HOSTILE' : 'holding'}`,
  ];
  lines.forEach((line, i) => ctx.fillText(line, 12, h - 12 - (lines.length - 1 - i) * 18));

  // wind direction arrow, top right
  const cx = w - 50;
  const cy = 50;
  ctx.translate(cx, cy);
  ctx.rotate(wind.angle);
  ctx.strokeStyle = '#e8f4f8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(0, 16);
  ctx.moveTo(0, -16);
  ctx.lineTo(-6, -8);
  ctx.moveTo(0, -16);
  ctx.lineTo(6, -8);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#e8f4f8';
  ctx.fillText('wind', w - 66, 20);

  ctx.fillStyle = '#9fd0e0';
  ctx.fillText('A/D helm  W/S trim  Space anchor  mouse aim, click fire  F false colours  M chart (soon)', 12, 20);
}

requestAnimationFrame(frame);

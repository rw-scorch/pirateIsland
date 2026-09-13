import { createState } from './state.js';
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

// Start just off the port pier's water side.
const [pierX, pierY] = world.pier[world.pier.length - 1];
state.player.x = (pierX + 1.5) * TILE_SIZE;
state.player.y = (pierY + 3) * TILE_SIZE; // south of the pier, facing open water

const camera = createCamera(state.player.x, state.player.y);

const images = await loadImages([...shipAssetPaths(), ...worldAssetPaths()]);

const input = createInput({
  onAnchorToggle: () => {
    state.player.anchored = !state.player.anchored;
  },
});

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
  drawShip(ctx, images, state.player, state.player.x, state.player.y, SHIP_SCALE);
  ctx.restore();

  drawHud(w, h);
}

function drawHud(w, h) {
  const ship = state.player;
  const wind = state.wind;
  ctx.save();
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#e8f4f8';
  const lines = [
    `speed ${ship.speed.toFixed(0)} px/s`,
    `trim ${(ship.trim * 100).toFixed(0)}%`,
    `heading ${((ship.heading * 180) / Math.PI).toFixed(0)}°`,
    `wind ${((wind.angle * 180) / Math.PI).toFixed(0)}° @ ${(wind.strength * 100).toFixed(0)}%`,
    ship.anchored ? 'anchored' : ship.mastIntact ? 'under sail' : 'rowing (mast down)',
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
  ctx.fillText('A/D helm   W/S trim   Space anchor   M chart (soon)', 12, 20);
}

requestAnimationFrame(frame);

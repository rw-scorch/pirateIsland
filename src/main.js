import { createState } from './state.js';
import { loadImages, shipAssetPaths } from './assets.js';
import { drawShip } from './render/shipRig.js';
import { buildDebugPanel } from './debugPanel.js';
import { createInput } from './input.js';
import { createCamera, updateCamera } from './camera.js';
import { updateWind } from './sim/wind.js';
import { updateShip } from './sim/sailing.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
}
window.addEventListener('resize', resize);
resize();

const state = createState();
const camera = createCamera(state.player.x, state.player.y);

const images = await loadImages(shipAssetPaths());

const input = createInput({
  onAnchorToggle: () => {
    state.player.anchored = !state.player.anchored;
  },
});

buildDebugPanel(document.getElementById('debug-panel'), state.player, () => {});

// Exposed for manual inspection in devtools; not used by any UI.
window.__marrowSea = { state, camera };

const SHIP_SCALE = 3;
let lastTime = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  updateWind(state.wind, dt);
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
  updateCamera(camera, state.player.x, state.player.y, dt);

  render();
  requestAnimationFrame(frame);
}

function render() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  ctx.save();
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  ctx.fillStyle = '#1b4a63';
  ctx.fillRect(0, 0, w, h);
  drawWaterTexture(w, h);

  const originX = w / 2 - camera.x;
  const originY = h / 2 - camera.y;
  ctx.translate(originX, originY);
  drawShip(ctx, images, state.player, state.player.x, state.player.y, SHIP_SCALE);
  ctx.restore();

  drawHud(w, h);
}

// Placeholder open-water look until step 3 brings the real tile world.
function drawWaterTexture(w, h) {
  const t = performance.now() / 1000;
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = '#bfe3f0';
  ctx.lineWidth = 2;
  const spacing = 40;
  const offset = ((t * 20) % spacing + spacing) % spacing;
  for (let y = -spacing + offset; y < h + spacing; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += 20) {
      ctx.lineTo(x, y + Math.sin((x + t * 60) * 0.03) * 4);
    }
    ctx.stroke();
  }
  ctx.restore();
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
  ctx.fillText('A/D helm   W/S trim   Space anchor', 12, 20);
}

requestAnimationFrame(frame);

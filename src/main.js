import { createState } from './state.js';
import { loadImages, shipAssetPaths } from './assets.js';
import { drawShip } from './render/shipRig.js';
import { buildDebugPanel } from './debugPanel.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
}
window.addEventListener('resize', resize);
resize();

const state = createState();

const referencePath = 'assets/ships/prebuilt/ship (3).png';
const images = await loadImages([...shipAssetPaths(), referencePath]);
const referenceImg = images.get(referencePath);

function render() {
  ctx.save();
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  ctx.fillStyle = '#1b3a4b';
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  const cy = canvas.clientHeight / 2;
  const leftX = canvas.clientWidth / 2 - 220;
  const rightX = canvas.clientWidth / 2 + 220;

  // Reference calibration image, drawn alongside at the same scale so the
  // assembled sprite can be checked against Kenney's own composite.
  ctx.save();
  ctx.translate(leftX - (referenceImg.width * 4) / 2, cy - (referenceImg.height * 4) / 2);
  ctx.scale(4, 4);
  ctx.drawImage(referenceImg, 0, 0);
  ctx.restore();

  drawShip(ctx, images, state.player, rightX, cy, 4);

  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText('reference: ship (3).png', leftX, cy - (referenceImg.height * 4) / 2 - 10);
  ctx.fillText('assembled', rightX, cy - 240);
  ctx.textAlign = 'left';

  ctx.restore();
  requestAnimationFrame(render);
}

buildDebugPanel(document.getElementById('debug-panel'), state.player, () => {});

requestAnimationFrame(render);

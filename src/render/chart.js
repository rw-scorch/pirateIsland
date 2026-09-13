import { TILE_SIZE } from '../world/tileset.js';
import { LAND, ROCK, QUAY } from '../world/worldGen.js';
import { isRevealed } from '../world/fog.js';

export const PARCHMENT_PATH = 'assets/chart/paper/parchmentFolded.png';
export const CHART_ICONS = {
  ship: 'assets/chart/icons/ship.png',
  dock: 'assets/chart/icons/dock.png',
  skull: 'assets/chart/icons/skull.png',
  rocks: 'assets/chart/icons/rocks.png',
  compass: 'assets/chart/icons/compass.png',
};

function layout(world, w, h) {
  const margin = 70;
  const worldW = world.width * TILE_SIZE;
  const worldH = world.height * TILE_SIZE;
  const scale = Math.min((w - margin * 2) / worldW, (h - margin * 2) / worldH);
  const offsetX = (w - worldW * scale) / 2;
  const offsetY = (h - worldH * scale) / 2;
  return {
    scale,
    offsetX,
    offsetY,
    toChart: (wx, wy) => ({ x: offsetX + wx * scale, y: offsetY + wy * scale }),
  };
}

function drawIcon(ctx, images, path, x, y, rotation, scale = 1) {
  const img = images.get(path);
  if (!img) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.restore();
}

// A line-art chart, not a minimap: parchment background, ink-toned marks
// for explored coastline/hazards, fog everywhere the player hasn't sailed.
export function drawChart(ctx, images, world, fog, player, targets, w, h) {
  ctx.save();
  ctx.fillStyle = '#e8d8ae';
  ctx.fillRect(0, 0, w, h);
  const paper = images.get(PARCHMENT_PATH);
  if (paper) ctx.drawImage(paper, 0, 0, w, h);

  const { scale, offsetX, offsetY, toChart } = layout(world, w, h);
  const tileChart = TILE_SIZE * scale;

  ctx.fillStyle = 'rgba(35, 26, 16, 0.6)';
  ctx.fillRect(offsetX, offsetY, world.width * tileChart, world.height * tileChart);

  for (let ty = 0; ty < world.height; ty++) {
    for (let tx = 0; tx < world.width; tx++) {
      if (!isRevealed(fog, world, tx, ty)) continue;
      const cx = offsetX + tx * tileChart;
      const cy = offsetY + ty * tileChart;
      ctx.fillStyle = 'rgba(223, 201, 151, 0.95)';
      ctx.fillRect(cx - 0.5, cy - 0.5, tileChart + 1, tileChart + 1);
      const cell = world.cellType[world.idx(tx, ty)];
      if (cell === LAND) {
        ctx.fillStyle = '#8a6f3d';
        ctx.fillRect(cx + 1, cy + 1, tileChart - 2, tileChart - 2);
      } else if (cell === QUAY) {
        ctx.fillStyle = '#4c4a45';
        ctx.fillRect(cx + 1, cy + 1, tileChart - 2, tileChart - 2);
      }
      // rock hazards get their own line-art icon below rather than a fill
    }
  }

  for (let ty = 0; ty < world.height; ty++) {
    for (let tx = 0; tx < world.width; tx++) {
      if (world.cellType[world.idx(tx, ty)] !== ROCK) continue;
      if (!isRevealed(fog, world, tx, ty)) continue;
      const c = toChart((tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE);
      drawIcon(ctx, images, CHART_ICONS.rocks, c.x, c.y, 0, 0.5);
    }
  }

  // Home port is always known, fog or not.
  const [pierX, pierY] = world.pier[0];
  const portPos = toChart(pierX * TILE_SIZE, pierY * TILE_SIZE);
  drawIcon(ctx, images, CHART_ICONS.dock, portPos.x, portPos.y, 0, 0.7);

  for (const t of targets) {
    const tx = Math.floor(t.x / TILE_SIZE);
    const ty = Math.floor(t.y / TILE_SIZE);
    if (!isRevealed(fog, world, tx, ty)) continue;
    const p = toChart(t.x, t.y);
    drawIcon(ctx, images, CHART_ICONS.skull, p.x, p.y, 0, 0.6);
  }

  const pp = toChart(player.x, player.y);
  drawIcon(ctx, images, CHART_ICONS.ship, pp.x, pp.y, player.heading, 0.8);

  drawIcon(ctx, images, CHART_ICONS.compass, w - 70, h - 70, 0, 0.8);

  ctx.fillStyle = '#2b2013';
  ctx.font = '20px "Kenney Pixel", monospace';
  ctx.fillText('Marrow Sea', offsetX, offsetY - 20);

  ctx.restore();
}

export function chartAssetPaths() {
  return [PARCHMENT_PATH, ...Object.values(CHART_ICONS)];
}

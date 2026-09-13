import { TILE_SIZE } from './tileset.js';

export const WATER = 0;
export const LAND = 1;
export const ROCK = 2;
export const QUAY = 3;

function inEllipse(x, y, cx, cy, rx, ry) {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  return dx * dx + dy * dy <= 1;
}

// Fixed archipelago layout so the port and coastline are predictable to
// look at and to test collision against. Procedural generation can replace
// this later without touching autotile/render/collision.
export function generateWorld() {
  const width = 70;
  const height = 50;
  const cellType = new Uint8Array(width * height);
  const isDeep = new Uint8Array(width * height);
  const idx = (x, y) => y * width + x;

  const islands = [
    { cx: 16, cy: 24, rx: 10, ry: 7.5 }, // home island
    { cx: 44, cy: 12, rx: 6, ry: 5 },
    { cx: 52, cy: 32, rx: 5, ry: 4 },
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (const isl of islands) {
        if (inEllipse(x, y, isl.cx, isl.cy, isl.rx, isl.ry)) {
          cellType[idx(x, y)] = LAND;
          break;
        }
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (cellType[idx(x, y)] !== LAND) continue;
      let allLand = true;
      for (let dy = -1; dy <= 1 && allLand; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height || cellType[idx(nx, ny)] !== LAND) {
            allLand = false;
            break;
          }
        }
      }
      if (allLand) isDeep[idx(x, y)] = 1;
    }
  }

  const rockSpots = [
    [30, 18], [31, 20], [30, 30], [38, 9], [39, 15], [47, 24], [48, 29],
  ];
  for (const [x, y] of rockSpots) {
    if (cellType[idx(x, y)] === WATER) cellType[idx(x, y)] = ROCK;
  }

  // Port pier: a straight breakwater running east from the home island's
  // coastline into open water, with mooring rings on its outer two tiles.
  const pierRow = 24;
  let px = 16;
  while (cellType[idx(px, pierRow)] === LAND) px++;
  const pierLength = 4;
  const pier = [];
  for (let i = 0; i < pierLength; i++) {
    cellType[idx(px + i, pierRow)] = QUAY;
    pier.push([px + i, pierRow]);
  }
  const mooringCells = [pier[1], pier[2]];

  return { width, height, cellType, isDeep, idx, pier, mooringCells, pierRow };
}

export function isSolid(world, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= world.width || ty >= world.height) return true;
  return world.cellType[world.idx(tx, ty)] !== WATER;
}

export function worldToTile(worldPos) {
  return Math.floor(worldPos / TILE_SIZE);
}

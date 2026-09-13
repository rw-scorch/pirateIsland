import { LAND } from './worldGen.js';
import { SAND_EDGE, SAND_CORNER, SAND_INTERIOR, GRASS_INTERIOR } from './tileset.js';

function isLand(world, x, y) {
  if (x < 0 || y < 0 || x >= world.width || y >= world.height) return false;
  return world.cellType[world.idx(x, y)] === LAND;
}

// Deterministic pseudo-random pick so interior texture variants stay stable
// across frames without storing per-cell state.
export function pick(arr, x, y) {
  const h = (x * 928371 + y * 123457) >>> 0;
  return arr[h % arr.length];
}

// Returns a tile_NN sprite number for a LAND cell, or null for cells drawn
// by other means (water, rock, quay).
export function landTileFor(world, x, y) {
  const n = isLand(world, x, y - 1);
  const s = isLand(world, x, y + 1);
  const w = isLand(world, x - 1, y);
  const e = isLand(world, x + 1, y);
  const missing = { n: !n, s: !s, w: !w, e: !e };
  const missingCount = Object.values(missing).filter(Boolean).length;

  if (missingCount === 0) {
    return world.isDeep[world.idx(x, y)] ? pick(GRASS_INTERIOR, x, y) : pick(SAND_INTERIOR, x, y);
  }
  if (missingCount === 1) {
    if (missing.n) return SAND_EDGE.N;
    if (missing.s) return SAND_EDGE.S;
    if (missing.w) return SAND_EDGE.W;
    return SAND_EDGE.E;
  }
  if (missingCount === 2) {
    if (missing.n && missing.w) return SAND_CORNER.NW;
    if (missing.n && missing.e) return SAND_CORNER.NE;
    if (missing.s && missing.w) return SAND_CORNER.SW;
    if (missing.s && missing.e) return SAND_CORNER.SE;
    // opposite pair missing (thin strip) — no matching piece, fall back
    return pick(SAND_INTERIOR, x, y);
  }
  // isolated spit/islet — no matching piece, fall back
  return pick(SAND_INTERIOR, x, y);
}

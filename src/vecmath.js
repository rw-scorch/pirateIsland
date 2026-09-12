// Small vector/angle helpers shared by sailing and camera code.

export function headingVector(heading) {
  // Matches ctx.rotate(heading) in shipRig.js: at heading 0 the bow (local +y) points here.
  return { x: -Math.sin(heading), y: Math.cos(heading) };
}

export function angleVector(angle) {
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

// Signed-safe angle between two direction vectors, result in [0, PI].
export function angleBetween(a, b) {
  const dot = a.x * b.x + a.y * b.y;
  const cross = a.x * b.y - a.y * b.x;
  return Math.abs(Math.atan2(cross, dot));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

// Shortest-path lerp between two angles (radians).
export function lerpAngle(a, b, t) {
  let diff = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  return a + diff * t;
}

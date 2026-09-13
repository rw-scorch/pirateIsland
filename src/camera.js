const FOLLOW_SPEED = 4; // higher = snappier

export function createCamera(x = 0, y = 0) {
  return { x, y };
}

export function updateCamera(camera, targetX, targetY, dt) {
  const t = Math.min(1, FOLLOW_SPEED * dt);
  camera.x += (targetX - camera.x) * t;
  camera.y += (targetY - camera.y) * t;
}

import { headingVector, angleVector, angleBetween, lerp, clamp } from '../vecmath.js';

const BASE_TURN_RATE = 1.1; // rad/s at full hull condition
const TRIM_RATE = 0.7; // per second
const MAX_SPEED = 150; // px/s at full trim, beam reach, clean sail, strong wind
const OAR_SPEED = 45; // px/s, mast down
const ACCEL = 1.4; // speed easing per second

const HULL_TURN_FACTOR = { 1: 1, 2: 0.85, 3: 0.65, 4: 0.4 };
const SAIL_WEAR_FACTOR = { 1: 1, 2: 0.75, 3: 0.45, 4: 0.05 };

// Angle-to-wind efficiency: worst dead into and dead away from the wind,
// best on a beam reach. Symmetric — an arcade simplification, not a real
// points-of-sail polar.
function pointOfSailEfficiency(deltaToWindTo) {
  return 0.15 + 0.85 * Math.sin(deltaToWindTo);
}

export function updateShip(ship, wind, input, dt) {
  const turnRate = BASE_TURN_RATE * HULL_TURN_FACTOR[ship.hullCondition];
  if (!ship.anchored) {
    if (input.left) ship.heading -= turnRate * dt;
    if (input.right) ship.heading += turnRate * dt;
  }

  if (input.trimUp) ship.trim = clamp(ship.trim + TRIM_RATE * dt, 0, 1);
  if (input.trimDown) ship.trim = clamp(ship.trim - TRIM_RATE * dt, 0, 1);

  let targetSpeed;
  if (ship.anchored) {
    targetSpeed = 0;
  } else if (!ship.mastIntact) {
    targetSpeed = OAR_SPEED;
  } else {
    const forward = headingVector(ship.heading);
    const windTo = angleVector(wind.angle);
    const delta = angleBetween(forward, windTo);
    const efficiency = pointOfSailEfficiency(delta);
    targetSpeed = MAX_SPEED * ship.trim * efficiency * SAIL_WEAR_FACTOR[ship.sailWear] * wind.strength;
  }
  ship.speed = lerp(ship.speed, targetSpeed, Math.min(1, ACCEL * dt));

  const forward = headingVector(ship.heading);
  ship.x += forward.x * ship.speed * dt;
  ship.y += forward.y * ship.speed * dt;
}

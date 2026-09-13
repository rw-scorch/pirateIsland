import { updateShip } from './sailing.js';
import { fireBroadside, sideTowards, canFire } from './gunnery.js';
import { isHostile } from './factions.js';

const CHASE_RANGE = 260; // px, closer than this the AI tries to run parallel instead of closing further
const FIRE_RANGE = 380;

function angleDiff(a, b) {
  let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  return d;
}

function headingTo(dx, dy) {
  return Math.atan2(-dx, dy);
}

// One AI ship's turn: decide hostility, then either sit at anchor or chase
// and broadside the player. Non-combat patrol routes are out of scope for
// now — an idle ship just holds position.
export function updateAIShip(ai, player, wind, dt, spawnBall, standings) {
  const hostile = isHostile(ai, standings);
  ai.anchored = !hostile;

  if (!hostile) {
    updateShip(ai, wind, { left: false, right: false, trimUp: false, trimDown: false }, dt);
    return;
  }

  const dx = player.x - ai.x;
  const dy = player.y - ai.y;
  const dist = Math.hypot(dx, dy);
  const directHeading = headingTo(dx, dy);

  let desired;
  if (dist > CHASE_RANGE) {
    desired = directHeading;
  } else {
    // run a beam parallel to the target instead of ramming it
    const beamA = directHeading + Math.PI / 2;
    const beamB = directHeading - Math.PI / 2;
    desired = Math.abs(angleDiff(ai.heading, beamA)) < Math.abs(angleDiff(ai.heading, beamB)) ? beamA : beamB;
  }

  const diff = angleDiff(ai.heading, desired);
  const input = {
    left: diff < -0.06,
    right: diff > 0.06,
    trimUp: true,
    trimDown: false,
  };
  updateShip(ai, wind, input, dt);

  if (dist <= FIRE_RANGE && canFire(ai)) {
    const side = sideTowards(ai, player.x, player.y);
    fireBroadside(ai, side, spawnBall);
  }
}

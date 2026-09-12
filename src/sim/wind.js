import { lerp, lerpAngle, clamp } from '../vecmath.js';

export function createWind() {
  return {
    angle: Math.random() * Math.PI * 2,
    strength: 0.6,
    targetAngle: Math.random() * Math.PI * 2,
    targetStrength: 0.6,
    retargetTimer: 6,
  };
}

// Wind ambles toward a new random heading/strength every 6-14s instead of
// snapping, so it reads as drifting rather than randomly teleporting.
export function updateWind(wind, dt) {
  wind.retargetTimer -= dt;
  if (wind.retargetTimer <= 0) {
    wind.targetAngle = wind.angle + (Math.random() - 0.5) * Math.PI * 0.8;
    wind.targetStrength = clamp(0.35 + Math.random() * 0.65, 0.35, 1);
    wind.retargetTimer = 6 + Math.random() * 8;
  }
  wind.angle = lerpAngle(wind.angle, wind.targetAngle, dt * 0.15);
  wind.strength = lerp(wind.strength, wind.targetStrength, dt * 0.2);
}

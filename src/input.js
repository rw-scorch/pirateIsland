// Only DOM-coupled input layer. Keeps raw key state and fires an edge
// callback for anchor, since dropping/weighing anchor should toggle once
// per press rather than repeat while held.

export function createInput({ onAnchorToggle, onFlagCycle, onFire, canvas } = {}) {
  const keys = new Set();
  const mouse = { clientX: 0, clientY: 0 };

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.repeat) onAnchorToggle?.();
    if (e.code === 'KeyF' && !e.repeat) onFlagCycle?.();
    keys.add(e.code);
  });
  window.addEventListener('keyup', (e) => {
    keys.delete(e.code);
  });
  canvas?.addEventListener('mousemove', (e) => {
    mouse.clientX = e.clientX;
    mouse.clientY = e.clientY;
  });
  canvas?.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    onFire?.(e.clientX, e.clientY);
  });

  return {
    left: () => keys.has('KeyA'),
    right: () => keys.has('KeyD'),
    trimUp: () => keys.has('KeyW'),
    trimDown: () => keys.has('KeyS'),
    mouseClient: () => mouse,
  };
}

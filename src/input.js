// Only DOM-coupled input layer. Keeps raw key state and fires an edge
// callback for anchor, since dropping/weighing anchor should toggle once
// per press rather than repeat while held.

export function createInput({ onAnchorToggle } = {}) {
  const keys = new Set();

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.repeat) onAnchorToggle?.();
    keys.add(e.code);
  });
  window.addEventListener('keyup', (e) => {
    keys.delete(e.code);
  });

  return {
    left: () => keys.has('KeyA'),
    right: () => keys.has('KeyD'),
    trimUp: () => keys.has('KeyW'),
    trimDown: () => keys.has('KeyS'),
  };
}

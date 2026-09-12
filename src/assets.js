// Thin image loading/caching layer. Paths are relative to index.html.

const cache = new Map();

function loadImage(path) {
  if (cache.has(path)) return cache.get(path);
  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${path}`));
    img.src = path;
  });
  cache.set(path, promise);
  return promise;
}

export async function loadImages(pathList) {
  const entries = await Promise.all(
    pathList.map(async (path) => [path, await loadImage(path)])
  );
  return new Map(entries);
}

export function shipAssetPaths() {
  const paths = [];
  for (let i = 1; i <= 4; i++) paths.push(`assets/ships/hull/hullLarge (${i}).png`);
  for (let i = 1; i <= 24; i++) paths.push(`assets/ships/sail/sailLarge (${i}).png`);
  for (let i = 1; i <= 6; i++) paths.push(`assets/ships/flag/flag (${i}).png`);
  for (let i = 1; i <= 6; i++) paths.push(`assets/ships/crew/crew (${i}).png`);
  paths.push('assets/ships/rig/pole.png');
  paths.push('assets/ships/rig/nest.png');
  paths.push('assets/ships/gun/cannon.png');
  return paths;
}

import { normalizeCase, normalizeRegionTextures } from "./normalize.js";
import { AVATARS, MAX_SIZE, MIN_SIZE, DEFAULT_OBJECT_RULES } from "./catalogs.js";
import { makeId, clamp } from "./utils.js";

const MALE_NAMES = [
  "Bruno", "Dario", "Felix", "Hugo", "Ivan", "Leo", "Luis", "Marco",
  "Nico", "Pablo", "Raul", "Simon", "Tomas", "Vicente", "Yago", "Zacarías"
];

const FEMALE_NAMES = [
  "Ana", "Carla", "Elena", "Iris", "Lara", "Luna", "Mara", "Nina",
  "Olga", "Sara", "Tina", "Vera", "Zara", "Clara", "Flora", "Sofia"
];

function maleName(index) {
  return MALE_NAMES[index % MALE_NAMES.length];
}

function femaleName(index) {
  return FEMALE_NAMES[index % FEMALE_NAMES.length];
}

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRegions(rows, cols) {
  const area = rows * cols;
  const numRegions = clamp(Math.round(Math.sqrt(area)), 3, 8);
  const grid = Array.from({ length: rows }, () => Array(cols).fill(-1));
  const seeds = [];

  const minDist = Math.max(1, Math.floor(Math.min(rows, cols) / Math.max(numRegions, 2)));
  let stuck = 0;
  while (seeds.length < numRegions && stuck < 100) {
    const r = randomInt(0, rows - 1);
    const c = randomInt(0, cols - 1);
    if (grid[r][c] !== -1) { stuck++; continue; }
    if (seeds.length > 0 && seeds.some(([sr, sc]) => Math.abs(sr - r) + Math.abs(sc - c) < minDist)) { stuck++; continue; }
    seeds.push([r, c]);
    grid[r][c] = seeds.length - 1;
    stuck = 0;
  }

  if (seeds.length < numRegions) {
    for (let r = 0; r < rows && seeds.length < numRegions; r++) {
      for (let c = 0; c < cols && seeds.length < numRegions; c++) {
        if (grid[r][c] === -1) {
          seeds.push([r, c]);
          grid[r][c] = seeds.length - 1;
        }
      }
    }
  }

  const queue = seeds.map(([r, c], i) => ({ r, c, region: i }));
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  for (let qi = 0; qi < queue.length; qi++) {
    const { r, c, region } = queue[qi];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === -1) {
        grid[nr][nc] = region;
        queue.push({ r: nr, c: nc, region });
      }
    }
  }

  return grid;
}

export function generateCase(rows, cols) {
  rows = clamp(rows || 6, MIN_SIZE, MAX_SIZE);
  cols = clamp(cols || 6, MIN_SIZE, MAX_SIZE);
  const total = Math.min(rows, cols);
  const suspectCount = total - 1;

  const suspects = Array.from({ length: suspectCount }, (_, i) => ({
    id: makeId(i % 2 === 0 ? maleName(i) : femaleName(i)),
    name: i % 2 === 0 ? maleName(i) : femaleName(i),
    color: AVATARS[i % AVATARS.length],
    clue: ""
  }));

  const victimName = femaleName(randomInt(0, 99));

  const regions = generateRegions(rows, cols);
  const maxRegion = Math.max(0, ...regions.flat());
  const regionNames = Array.from({ length: maxRegion + 1 }, (_, i) => `Zona ${i + 1}`);

  let solRows, solCols, victimCell;

  for (let attempt = 0; attempt < 50; attempt++) {
    solRows = shuffle(Array.from({ length: rows }, (_, i) => i)).slice(0, total);
    solCols = shuffle(Array.from({ length: cols }, (_, i) => i)).slice(0, total);

    victimCell = [solRows[0], solCols[0]];
    const victimRegion = regions[victimCell[0]]?.[victimCell[1]];

    const candidates = [];
    for (let i = 1; i < total; i++) {
      if (regions[solRows[i]]?.[solCols[i]] === victimRegion) candidates.push(i);
    }

    if (candidates.length > 0) {
      const mi = candidates[randomInt(0, candidates.length - 1)];
      [solRows[1], solRows[mi]] = [solRows[mi], solRows[1]];
      [solCols[1], solCols[mi]] = [solCols[mi], solCols[1]];
      break;
    }
  }

  if (!victimCell) victimCell = [solRows[0], solCols[0]];

  const solution = {};
  for (let i = 1; i < total; i++) {
    solution[suspects[i - 1].id] = { row: solRows[i], col: solCols[i] };
  }

  return normalizeCase({
    id: makeId(`generado-${Date.now()}`),
    title: `Murdoku ${rows}x${cols}`,
    difficulty: "Generado",
    rows,
    cols,
    size: Math.max(rows, cols),
    victim: { name: victimName, row: victimCell[0], col: victimCell[1], clue: "" },
    suspects,
    regions,
    regionNames,
    regionTextures: normalizeRegionTextures(null, regionNames.length),
    objects: {},
    objectRules: structuredClone(DEFAULT_OBJECT_RULES),
    solution,
    murderer: suspects[0].id
  });
}

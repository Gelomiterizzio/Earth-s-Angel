// AI-assisted: Cursor (Composer), reviewed by B
// Campaign changes assisted by OpenAI Codex. Human review pending.
import type {
  BuildingDef,
  BuildingType,
  DifficultyConfig,
  DifficultyId,
  EarthData,
  GameData,
  LevelConfig,
  NasaSepRecord,
  SimConstants,
} from '../core/types';

const TERRAIN_CHARS: Record<string, string> = {
  '.': 'llano',
  '#': 'roca',
  o: 'crater',
  i: 'hielo',
  m: 'mineral',
  '?': 'misterio',
  S: 'nave',
};

const P0_BUILDINGS: BuildingType[] = [
  'nave',
  'panel',
  'bateria',
  'generador',
  'reciclador',
  'extractor',
  'invernadero',
  'refugio',
];

const DIFFICULTIES: DifficultyId[] = ['facil', 'media', 'imposible'];
const RESOURCES = ['energia', 'oxigeno', 'agua', 'alimentos', 'materiales'] as const;
const EARTH_LINES = ['energia', 'agua', 'reciclaje', 'restauracion'] as const;
const EARTH_INDICATORS = ['agua', 'emisiones', 'ecosistemas'] as const;

export function dataError(file: string, key: string, detail: string): Error {
  return new Error(`[${file}] ${key}: ${detail}`);
}

/** ">100 MeV" is severe. ">10 MeV" is moderate. "13-100 MeV" matches neither. */
export function radiationLevelForInstrument(instrument: string): 1 | 2 | null {
  if (instrument.includes('>100 MeV')) return 2;
  if (instrument.includes('>10 MeV')) return 1;
  return null;
}

function minutesBetween(begin: string, eventTime: string): number | null {
  const start = utcMinutes(begin);
  const end = utcMinutes(eventTime);
  if (start === null || end === null) return null;
  return end - start;
}

function utcMinutes(stamp: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(stamp);
  if (!match) return null;
  const utc = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
  );
  return utc / 60000;
}

function assertNonNeg(file: string, key: string, n: number): void {
  if (!Number.isInteger(n) || n < 0) {
    throw dataError(file, key, `expected non-negative integer, got ${n}`);
  }
}

function assertRange(file: string, key: string, n: number, min: number, max: number): void {
  if (!Number.isInteger(n) || n < min || n > max) {
    throw dataError(file, key, `expected integer in [${min}, ${max}], got ${n}`);
  }
}

export function validateConstants(c: SimConstants): void {
  const file = 'balance/constants.json';
  const ints: (keyof SimConstants)[] = [
    'panelOutput',
    'batteryCapacity',
    'extractorWater',
    'recyclePct',
    'generatorWaterIn',
    'generatorOxygenOut',
    'greenhouseWaterIn',
    'greenhouseCycleDays',
    'greenhouseHarvest',
    'greenhouseStressPenalty',
    'crewNeedPerDay',
    'backgroundExposure',
    'exposureCaution',
    'exposureLimit',
    'healthRecovery',
    'exploreRevealRadius',
  ];
  for (const k of ints) {
    assertNonNeg(file, k, c[k] as number);
  }
  for (const k of ['repairCost', 'labClueDays'] as const) {
    const value = c[k];
    if (value !== undefined) assertNonNeg(file, k, value);
  }
  assertNonNeg(file, 'exposure.1.unsheltered', c.exposure['1'].unsheltered);
  assertNonNeg(file, 'exposure.1.sheltered', c.exposure['1'].sheltered);
  assertNonNeg(file, 'exposure.2.unsheltered', c.exposure['2'].unsheltered);
  assertNonNeg(file, 'exposure.2.sheltered', c.exposure['2'].sheltered);
  assertNonNeg(file, 'healthPenalty.oxigeno', c.healthPenalty.oxigeno);
  assertNonNeg(file, 'healthPenalty.agua', c.healthPenalty.agua);
  assertNonNeg(file, 'healthPenalty.alimentos', c.healthPenalty.alimentos);
}

export function validateBuildings(
  buildings: Record<string, BuildingDef>,
  required: BuildingType[] = P0_BUILDINGS,
): void {
  const file = 'content/buildings.json';
  for (const type of required) {
    const b = buildings[type];
    if (!b) throw dataError(file, type, 'missing building');
    assertNonNeg(file, `${type}.cost`, b.cost);
    assertNonNeg(file, `${type}.apCost`, b.apCost);
    assertNonNeg(file, `${type}.buildDays`, b.buildDays);
    assertNonNeg(file, `${type}.energyPerDay`, b.energyPerDay);
    assertNonNeg(file, `${type}.priority`, b.priority);
    if (b.capacity !== undefined) assertNonNeg(file, `${type}.capacity`, b.capacity);
    if (!b.nameKey || !b.descKey || !b.whyKey) {
      throw dataError(file, type, 'missing nameKey/descKey/whyKey');
    }
  }
}

export function validateLunaMap(level: LevelConfig): void {
  validateBaseMap(level, 'luna', [73, 73], { S: 1, i: 52, m: 62, '?': 1 }, { x: 25, y: 25 });
}

export function validateMarsMap(level: LevelConfig): void {
  validateBaseMap(level, 'marte', [81, 81], { S: 1, i: 73, m: 87, '?': 1 }, { x: 9, y: 8 });
}

function validateBaseMap(
  level: LevelConfig,
  id: 'luna' | 'marte',
  [width, height]: readonly [number, number],
  counts: Record<string, number>,
  ship: LevelConfig['ship'],
): void {
  const file = `content/levels/${id}.json`;
  if (level.id !== id) throw dataError(file, 'id', `must be ${id}`);
  if (level.width !== width || level.height !== height) {
    throw dataError(file, 'width/height', `must be ${width}×${height}`);
  }
  if (level.rows.length !== height) {
    throw dataError(file, 'rows', `expected ${height} rows, got ${level.rows.length}`);
  }
  const tiles: Record<string, number> = {};
  for (let y = 0; y < height; y++) {
    const row = level.rows[y];
    if (row.length !== width) {
      throw dataError(file, `rows[${y}]`, `expected ${width} chars, got ${row.length}`);
    }
    for (let x = 0; x < width; x++) {
      const ch = row[x];
      if (!(ch in TERRAIN_CHARS)) {
        throw dataError(file, `rows[${y}][${x}]`, `invalid char '${ch}'`);
      }
      tiles[ch] = (tiles[ch] ?? 0) + 1;
    }
  }
  for (const [ch, expected] of Object.entries(counts)) {
    if (tiles[ch] !== expected) {
      throw dataError(file, 'rows', `expected ${expected} ${ch}, got ${tiles[ch] ?? 0}`);
    }
  }
  if (level.ship.x !== ship.x || level.ship.y !== ship.y || level.rows[ship.y][ship.x] !== 'S') {
    throw dataError(file, 'ship', `ship marker and coordinates must be at (${ship.x},${ship.y})`);
  }
  if (level.secret) {
    const { x, y } = level.secret.beacon;
    assertRange(file, 'secret.beacon.x', x, 0, width - 1);
    assertRange(file, 'secret.beacon.y', y, 0, height - 1);
    if (level.rows[y][x] !== '.') throw dataError(file, 'secret.beacon', 'must be on flat ground');
  }
  assertNonNeg(file, 'initialExploredRadius', level.initialExploredRadius);
  assertNonNeg(file, 'forecastHorizonDays', level.forecastHorizonDays);
  if (level.forecastHorizonWithComms !== undefined) {
    assertNonNeg(file, 'forecastHorizonWithComms', level.forecastHorizonWithComms);
    if (level.forecastHorizonWithComms < level.forecastHorizonDays) {
      throw dataError(file, 'forecastHorizonWithComms', 'shorter than forecastHorizonDays');
    }
  }
  for (const k of RESOURCES) {
    assertNonNeg(file, `baseCaps.${k}`, level.baseCaps[k]);
  }
}

function validateDifficultyBlock(
  file: string,
  id: DifficultyId,
  cfg: DifficultyConfig,
  level: LevelConfig,
  sep: NasaSepRecord[],
): void {
  const { baseCaps } = level;
  assertNonNeg(file, `${id}.crewSize`, cfg.crewSize);
  if (cfg.dayLimit !== null) assertNonNeg(file, `${id}.dayLimit`, cfg.dayLimit);
  for (const k of RESOURCES) {
    assertNonNeg(file, `${id}.initial.${k}`, cfg.initial[k]);
  }
  assertNonNeg(file, `${id}.mineralYield`, cfg.mineralYield);
  assertNonNeg(file, `${id}.reserveThreshold`, cfg.reserveThreshold);
  assertNonNeg(file, `${id}.energyThreshold`, cfg.energyThreshold);
  assertNonNeg(file, `${id}.streakDays`, cfg.streakDays);
  assertNonNeg(file, `${id}.shelterEnergy`, cfg.shelterEnergy);
  if (cfg.dustCap !== undefined) assertRange(file, `${id}.dustCap`, cfg.dustCap, 0, 100);
  if (cfg.dustPerDay !== undefined) assertRange(file, `${id}.dustPerDay`, cfg.dustPerDay, 0, 100);
  if (cfg.linkDays !== undefined) assertNonNeg(file, `${id}.linkDays`, cfg.linkDays);
  if (cfg.maxLinkOutage !== undefined) assertNonNeg(file, `${id}.maxLinkOutage`, cfg.maxLinkOutage);
  if (cfg.logistics) {
    const { near, far } = cfg.logistics;
    assertNonNeg(file, `${id}.logistics.near`, near);
    if (far !== null) assertRange(file, `${id}.logistics.far`, far, near + 1, Number.MAX_SAFE_INTEGER);
  }

  if (cfg.dayLimit !== null && cfg.streakDays > cfg.dayLimit) {
    throw dataError(file, `${id}.streakDays`, 'greater than dayLimit');
  }
  if (cfg.reserveThreshold > baseCaps.oxigeno) {
    throw dataError(file, `${id}.reserveThreshold`, 'greater than baseCaps.oxigeno');
  }
  if (cfg.reserveThreshold > baseCaps.agua) {
    throw dataError(file, `${id}.reserveThreshold`, 'greater than baseCaps.agua');
  }
  if (cfg.reserveThreshold > baseCaps.alimentos) {
    throw dataError(file, `${id}.reserveThreshold`, 'greater than baseCaps.alimentos');
  }

  let lastDay = 0;
  const ranges: { type: string; start: number; end: number }[] = [];
  for (let ei = 0; ei < cfg.events.length; ei++) {
    const e = cfg.events[ei];
    const key = `${id}.events[${ei}]`;
    assertNonNeg(file, `${key}.startDay`, e.startDay);
    assertNonNeg(file, `${key}.durationDays`, e.durationDays);
    if (e.startDay < 1) throw dataError(file, `${key}.startDay`, 'must be >= 1');
    if (e.durationDays < 1) throw dataError(file, `${key}.durationDays`, 'must be >= 1');
    if (e.solarFactorPct !== undefined) assertRange(file, `${key}.solarFactorPct`, e.solarFactorPct, 0, 100);
    if (e.type === 'averia' && (!e.target || !level.availableBuildings.includes(e.target))) {
      throw dataError(file, `${key}.target`, 'requires a building available in this level');
    }
    if (e.type === 'tormenta-solar' && e.sourceRef && !sep.some((r) => r.nasa.sepID === e.sourceRef)) {
      throw dataError(file, `${key}.sourceRef`, `unknown ${e.sourceRef}`);
    }
    const end = e.startDay + e.durationDays - 1;
    lastDay = Math.max(lastDay, end);
    for (const other of ranges) {
      if (other.type === e.type && !(end < other.start || e.startDay > other.end)) {
        throw dataError(file, key, `overlaps same type ${e.type}`);
      }
    }
    ranges.push({ type: e.type, start: e.startDay, end });
  }
  if (cfg.dayLimit !== null && lastDay > cfg.dayLimit) {
    throw dataError(file, `${id}.dayLimit`, 'less than last event day');
  }
}

export function validateNasa(records: NasaSepRecord[]): void {
  const file = 'nasa/donki-sep.json';
  if (!records.length) throw dataError(file, 'records', 'empty');
  const seen = new Set<string>();
  let has1 = false;
  let has2 = false;
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const key = `records[${i}]`;
    const blob = JSON.stringify(r);
    if (blob.includes('SYNTHETIC')) {
      throw dataError(file, key, 'contains SYNTHETIC');
    }
    if (!r.nasa.sepID) throw dataError(file, `${key}.nasa.sepID`, 'empty');
    if (!r.nasa.eventTime) throw dataError(file, `${key}.nasa.eventTime`, 'empty');
    if (!r.nasa.instrument) throw dataError(file, `${key}.nasa.instrument`, 'empty');
    if (!r.nasa.link?.startsWith('https://ccmc.gsfc.nasa.gov/')) {
      throw dataError(file, `${key}.nasa.link`, 'must start with https://ccmc.gsfc.nasa.gov/');
    }
    if (seen.has(r.nasa.sepID)) {
      throw dataError(file, `${key}.nasa.sepID`, 'duplicate');
    }
    seen.add(r.nasa.sepID);

    const expected = radiationLevelForInstrument(r.nasa.instrument);
    if (expected === null) {
      throw dataError(file, `${key}.nasa.instrument`, 'channel is not >100 MeV or >10 MeV');
    }
    if (r.game.radiationLevel !== expected) {
      throw dataError(
        file,
        `${key}.game.radiationLevel`,
        `incoherent with instrument (expected ${expected})`,
      );
    }
    if (r.nasa.flare && r.game.leadMinutes !== null) {
      const minutes = minutesBetween(r.nasa.flare.beginTime, r.nasa.eventTime);
      if (minutes !== r.game.leadMinutes) {
        throw dataError(
          file,
          `${key}.game.leadMinutes`,
          `expected ${minutes} from flare.beginTime to eventTime`,
        );
      }
    }
    if (r.game.radiationLevel === 1) has1 = true;
    if (r.game.radiationLevel === 2) has2 = true;
  }
  if (!has1) throw dataError(file, 'records', 'need at least one level-1 record');
  if (!has2) throw dataError(file, 'records', 'need at least one level-2 record');
}

function readPath(obj: unknown, dotted: string): unknown {
  return dotted.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as object)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function collectTextKeys(value: unknown, out: string[]): void {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) collectTextKeys(item, out);
    return;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (key.toLowerCase().includes('key') && typeof child === 'string') out.push(child);
    else collectTextKeys(child, out);
  }
}

export function validateContentCatalogs(
  en: unknown,
  es: unknown,
  sources: unknown[],
): void {
  const keys: string[] = [];
  for (const source of sources) collectTextKeys(source, keys);
  for (const key of keys) {
    const path = key.startsWith('content.') ? key.slice('content.'.length) : key;
    if (typeof readPath(en, path) !== 'string') {
      throw dataError('i18n/en/content.json', key, 'missing string');
    }
    if (typeof readPath(es, path) !== 'string') {
      throw dataError('i18n/es/content.json', key, 'missing string');
    }
  }
}

export function validateCards(
  cards: { id: string; tag: string; source?: { url?: string } }[],
): void {
  for (const card of cards) {
    if (card.tag === 'nasa' && !card.source?.url?.startsWith('http')) {
      throw dataError('content/cards.json', card.id, 'nasa tag requires a source url');
    }
  }
}

function validateEarth(data: EarthData): void {
  const file = 'balance/tierra.json';
  assertRange(file, 'maxLevel', data.maxLevel, 1, Number.MAX_SAFE_INTEGER);
  for (const line of EARTH_LINES) {
    const rule = data.lines[line];
    if (!rule) throw dataError(file, `lines.${line}`, 'missing');
    assertNonNeg(file, `lines.${line}.cost`, rule.cost);
    for (const [indicator, effect] of Object.entries(rule.effects)) {
      if (!Object.hasOwn(data.start, indicator)) {
        throw dataError(file, `lines.${line}.effects.${indicator}`, 'unknown indicator');
      }
      assertNonNeg(file, `lines.${line}.effects.${indicator}`, effect);
    }
  }
  for (const id of EARTH_INDICATORS) {
    assertRange(file, `start.${id}`, data.start[id], 0, 100);
    assertRange(file, `drift.${id}`, data.drift[id], -100, 100);
  }
  assertRange(file, 'combos.recyclingBoostsWaterAt', data.combos.recyclingBoostsWaterAt, 1, data.maxLevel);
  assertRange(file, 'combos.cleanPowerDiscountAt', data.combos.cleanPowerDiscountAt, 1, data.maxLevel);
  assertRange(file, 'combos.lowWaterThreshold', data.combos.lowWaterThreshold, 0, 100);
  assertRange(file, 'combos.restorationDiscountCost', data.combos.restorationDiscountCost, 0, data.lines.restauracion.cost);
  for (const id of DIFFICULTIES) {
    const rule = data.difficulty[id];
    const key = `difficulty.${id}`;
    if (!rule) throw dataError(file, key, 'missing');
    assertRange(file, `${key}.seasons`, rule.seasons, 1, Number.MAX_SAFE_INTEGER);
    assertNonNeg(file, `${key}.budget`, rule.budget);
    assertNonNeg(file, `${key}.carryMax`, rule.carryMax);
    for (const indicator of EARTH_INDICATORS) {
      assertRange(file, `${key}.targets.${indicator}`, rule.targets[indicator], 0, 100);
    }
  }
}

export function validateGameData(data: GameData): void {
  validateConstants(data.constants);
  validateLunaMap(data.levels.luna);
  if (data.levels.marte) validateMarsMap(data.levels.marte);
  const levels = [data.levels.luna, data.levels.marte].filter((level) => level !== undefined);
  const required = new Set(P0_BUILDINGS);
  for (const level of levels) {
    for (const type of level.availableBuildings) {
      required.add(type);
      if (!data.buildings[type]?.levels.includes(level.id)) {
        throw dataError(`content/levels/${level.id}.json`, 'availableBuildings', `unavailable building ${type}`);
      }
    }
  }
  validateBuildings(data.buildings, [...required]);
  validateNasa(data.nasa.sep);
  if (data.earth) validateEarth(data.earth);

  for (const d of DIFFICULTIES) {
    const block = data.difficulty[d];
    if (!block) throw dataError('balance/difficulty.json', d, 'missing');
    assertNonNeg('balance/difficulty.json', `${d}.earthDays`, block.earthDays);
    assertNonNeg('balance/difficulty.json', `${d}.bonusDays`, block.bonusDays);
    for (const level of levels) {
      const file = `balance/${level.id}.json`;
      const config = block.levels[level.id];
      if (!config) throw dataError(file, d, 'missing');
      validateDifficultyBlock(file, d, config, level, data.nasa.sep);
    }
  }
}

// AI-assisted: Cursor (Composer), reviewed by B
import type {
  BuildingDef,
  BuildingType,
  DifficultyConfig,
  DifficultyId,
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
  assertNonNeg(file, 'exposure.1.unsheltered', c.exposure['1'].unsheltered);
  assertNonNeg(file, 'exposure.1.sheltered', c.exposure['1'].sheltered);
  assertNonNeg(file, 'exposure.2.unsheltered', c.exposure['2'].unsheltered);
  assertNonNeg(file, 'exposure.2.sheltered', c.exposure['2'].sheltered);
  assertNonNeg(file, 'healthPenalty.oxigeno', c.healthPenalty.oxigeno);
  assertNonNeg(file, 'healthPenalty.agua', c.healthPenalty.agua);
  assertNonNeg(file, 'healthPenalty.alimentos', c.healthPenalty.alimentos);
}

export function validateBuildings(buildings: Record<string, BuildingDef>): void {
  const file = 'content/buildings.json';
  for (const type of P0_BUILDINGS) {
    const b = buildings[type];
    if (!b) throw dataError(file, type, 'missing building');
    assertNonNeg(file, `${type}.cost`, b.cost);
    assertNonNeg(file, `${type}.apCost`, b.apCost);
    assertNonNeg(file, `${type}.buildDays`, b.buildDays);
    assertNonNeg(file, `${type}.energyPerDay`, b.energyPerDay);
    if (!b.nameKey || !b.descKey || !b.whyKey) {
      throw dataError(file, type, 'missing nameKey/descKey/whyKey');
    }
  }
}

export function validateLunaMap(level: LevelConfig): void {
  const file = 'content/levels/luna.json';
  if (level.width !== 12 || level.height !== 12) {
    throw dataError(file, 'width/height', 'must be 12×12');
  }
  if (level.rows.length !== 12) {
    throw dataError(file, 'rows', `expected 12 rows, got ${level.rows.length}`);
  }
  let S = 0;
  let i = 0;
  let m = 0;
  let q = 0;
  for (let y = 0; y < 12; y++) {
    const row = level.rows[y];
    if (row.length !== 12) {
      throw dataError(file, `rows[${y}]`, `expected 12 chars, got ${row.length}`);
    }
    for (let x = 0; x < 12; x++) {
      const ch = row[x];
      if (!(ch in TERRAIN_CHARS)) {
        throw dataError(file, `rows[${y}][${x}]`, `invalid char '${ch}'`);
      }
      if (ch === 'S') S++;
      if (ch === 'i') i++;
      if (ch === 'm') m++;
      if (ch === '?') q++;
    }
  }
  if (S !== 1) throw dataError(file, 'rows', `expected one S, got ${S}`);
  if (i !== 3) throw dataError(file, 'rows', `expected three i, got ${i}`);
  if (m !== 5) throw dataError(file, 'rows', `expected five m, got ${m}`);
  if (q !== 1) throw dataError(file, 'rows', `expected one ?, got ${q}`);
  if (level.ship.x !== 5 || level.ship.y !== 5) {
    throw dataError(file, 'ship', 'must be at (5,5)');
  }
  for (const k of ['energia', 'oxigeno', 'agua', 'alimentos', 'materiales'] as const) {
    assertNonNeg(file, `baseCaps.${k}`, level.baseCaps[k]);
  }
}

function validateDifficultyBlock(
  file: string,
  id: DifficultyId,
  cfg: DifficultyConfig,
  baseCaps: LevelConfig['baseCaps'],
): void {
  assertNonNeg(file, `${id}.crewSize`, cfg.crewSize);
  if (cfg.dayLimit !== null) assertNonNeg(file, `${id}.dayLimit`, cfg.dayLimit);
  for (const k of Object.keys(cfg.initial) as (keyof typeof cfg.initial)[]) {
    assertNonNeg(file, `${id}.initial.${k}`, cfg.initial[k]);
  }
  assertNonNeg(file, `${id}.mineralYield`, cfg.mineralYield);
  assertNonNeg(file, `${id}.reserveThreshold`, cfg.reserveThreshold);
  assertNonNeg(file, `${id}.energyThreshold`, cfg.energyThreshold);
  assertNonNeg(file, `${id}.streakDays`, cfg.streakDays);
  assertNonNeg(file, `${id}.shelterEnergy`, cfg.shelterEnergy);

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

export function validateGameData(data: GameData): void {
  validateConstants(data.constants);
  validateBuildings(data.buildings as Record<string, BuildingDef>);
  validateLunaMap(data.levels.luna);
  validateNasa(data.nasa.sep);

  const diffs: DifficultyId[] = ['facil', 'media', 'imposible'];
  for (const d of diffs) {
    const block = data.difficulty[d];
    if (!block) throw dataError('balance/difficulty.json', d, 'missing');
    assertNonNeg('balance/difficulty.json', `${d}.earthDays`, block.earthDays);
    assertNonNeg('balance/difficulty.json', `${d}.bonusDays`, block.bonusDays);
    const luna = block.levels.luna;
    if (!luna) throw dataError('balance/luna.json', d, 'missing');
    validateDifficultyBlock('balance/luna.json', d, luna, data.levels.luna.baseCaps);

    for (const e of luna.events) {
      if (e.type === 'tormenta-solar' && e.sourceRef) {
        if (!data.nasa.sep.some((r) => r.nasa.sepID === e.sourceRef)) {
          throw dataError(
            'balance/luna.json',
            `${d}.events.sourceRef`,
            `unknown ${e.sourceRef}`,
          );
        }
      }
    }
  }
}

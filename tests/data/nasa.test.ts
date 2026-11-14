// AI-assisted: Cursor (Composer), reviewed by B
import { describe, expect, it } from 'vitest';
import {
  describeSepRecord,
  findSepRecord,
  loadSepRecords,
  recordsByLevel,
} from '../../src/data/nasa/adapter';
import { loadGameData } from '../../src/data/index';
import { validateNasa } from '../../src/data/validate';
import lunaBalance from '../../src/data/balance/luna.json';

describe('D-NASA-01 form', () => {
  it('every record has required nasa fields and CCMC link', () => {
    const records = loadSepRecords();
    validateNasa(records);
    for (const r of records) {
      expect(r.nasa.sepID.length).toBeGreaterThan(0);
      expect(r.nasa.eventTime.length).toBeGreaterThan(0);
      expect(r.nasa.instrument.length).toBeGreaterThan(0);
      expect(r.nasa.link.startsWith('https://ccmc.gsfc.nasa.gov/')).toBe(true);
      expect(r.nasa.flare).not.toBeNull();
    }
  });
});

describe('D-NASA-02 production data', () => {
  it('has no SYNTHETIC and balance sourceRefs exist', () => {
    const records = loadSepRecords();
    expect(JSON.stringify(records)).not.toContain('SYNTHETIC');
    const ids = new Set(records.map((r) => r.nasa.sepID));
    for (const diff of Object.values(lunaBalance)) {
      for (const e of diff.events) {
        if (e.sourceRef) expect(ids.has(e.sourceRef)).toBe(true);
      }
    }
  });
});

describe('D-NASA-03 principal record', () => {
  it('2017-09-10 severe record has X8.2 and leadMinutes 50', () => {
    const r = findSepRecord('2017-09-10T16:25:00-SEP-001');
    expect(r).not.toBeNull();
    expect(r!.nasa.instrument).toContain('>100 MeV');
    expect(r!.game.radiationLevel).toBe(2);
    expect(r!.game.leadMinutes).toBe(50);
    expect(r!.nasa.flare?.classType).toBe('X8.2');
    expect(r!.nasa.flare?.activeRegionNum).toBe(12673);
    const d = describeSepRecord(r!);
    expect(d.leadMinutes).toBe(50);
    expect(recordsByLevel(1).length).toBeGreaterThanOrEqual(1);
    expect(recordsByLevel(2).length).toBeGreaterThanOrEqual(1);
  });

  it('loadGameData fails conceptually without sep (validated nonempty)', () => {
    expect(() => validateNasa([])).toThrow(/donki-sep\.json/);
    expect(() => loadGameData()).not.toThrow();
  });
});

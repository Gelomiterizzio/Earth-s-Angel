// AI-assisted: Cursor (Composer), reviewed by B
import type { NasaSepRecord } from '../../core/types';
import raw from './donki-sep.json';

interface DonkiFile {
  source: string;
  sourceUrl: string;
  endpoint: string;
  retrievedAt: string;
  notice: string;
  records: NasaSepRecord[];
}

const file = raw as DonkiFile;

export function loadSepRecords(): NasaSepRecord[] {
  return file.records.map((r) => structuredClone(r));
}

export function findSepRecord(sepID: string): NasaSepRecord | null {
  const found = file.records.find((r) => r.nasa.sepID === sepID);
  return found ? structuredClone(found) : null;
}

export function recordsByLevel(level: 1 | 2): NasaSepRecord[] {
  return file.records.filter((r) => r.game.radiationLevel === level).map((r) => structuredClone(r));
}

export function describeSepRecord(r: NasaSepRecord): {
  id: string;
  dateISO: string;
  link: string;
  instrument: string;
  flareClass: string | null;
  activeRegion: number | null;
  leadMinutes: number | null;
} {
  return {
    id: r.nasa.sepID,
    dateISO: r.nasa.eventTime,
    link: r.nasa.link,
    instrument: r.nasa.instrument,
    flareClass: r.nasa.flare?.classType ?? null,
    activeRegion: r.nasa.flare?.activeRegionNum ?? null,
    leadMinutes: r.game.leadMinutes,
  };
}

export function getDonkiMeta(): {
  source: string;
  sourceUrl: string;
  retrievedAt: string;
  notice: string;
} {
  return {
    source: file.source,
    sourceUrl: file.sourceUrl,
    retrievedAt: file.retrievedAt,
    notice: file.notice,
  };
}

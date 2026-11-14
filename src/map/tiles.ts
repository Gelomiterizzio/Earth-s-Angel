// AI-assisted: Cursor (Composer) and OpenAI Codex. Team review pending.
import type { BuildingType, Terrain } from '../core/types';

export const TERRAIN_SPRITE: Record<Terrain, number> = {
  llano: 0, roca: 1, crater: 2, hielo: 3, mineral: 4, misterio: 5, nave: 0,
};

export const TERRAIN_FALLBACK: Record<Terrain, { fill: string; letter: string }> = {
  llano: { fill: '#8E9AAF', letter: '.' },
  roca: { fill: '#4A5568', letter: '#' },
  crater: { fill: '#2D3748', letter: 'o' },
  hielo: { fill: '#9BE7FF', letter: 'i' },
  mineral: { fill: '#C9A227', letter: 'm' },
  misterio: { fill: '#7DF9FF', letter: '?' },
  nave: { fill: '#DDE3EE', letter: 'S' },
};

export const STRUCTURE_SPRITE: Record<BuildingType, { sheet: 'buildings' | 'extras'; index: number; letter: string }> = {
  nave: { sheet: 'buildings', index: 0, letter: 'S' },
  panel: { sheet: 'buildings', index: 1, letter: 'P' },
  bateria: { sheet: 'buildings', index: 2, letter: 'B' },
  generador: { sheet: 'buildings', index: 3, letter: 'G' },
  reciclador: { sheet: 'buildings', index: 4, letter: 'R' },
  extractor: { sheet: 'buildings', index: 5, letter: 'E' },
  invernadero: { sheet: 'buildings', index: 6, letter: 'I' },
  refugio: { sheet: 'buildings', index: 7, letter: 'H' },
  deposito: { sheet: 'extras', index: 0, letter: 'D' },
  comunicaciones: { sheet: 'extras', index: 1, letter: 'C' },
  laboratorio: { sheet: 'extras', index: 2, letter: 'L' },
  habitat: { sheet: 'extras', index: 3, letter: 'A' },
};

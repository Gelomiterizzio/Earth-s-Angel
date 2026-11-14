// AI-assisted: OpenAI Codex. Human review pending.
import type { Action, BuildingType } from '../../../src/core';

const build = (building: BuildingType, x: number, y: number): Action => ({ type: 'BUILD', building, x, y });
const explore = (x: number, y: number): Action => ({ type: 'EXPLORE', x, y });
const collect = (x: number, y: number): Action => ({ type: 'COLLECT', x, y });
const clean: Action = { type: 'CLEAN_PANELS' };

export const MARS_PLAN: Record<number, Action[]> = {
  1: [build('panel', 8, 7), build('generador', 8, 8), build('invernadero', 8, 9), explore(12, 8)],
  2: [build('panel', 9, 7), build('extractor', 9, 6), explore(14, 8), explore(11, 11)],
  3: [collect(15, 8), build('extractor', 10, 6), build('reciclador', 9, 9)],
  4: [explore(12, 13), collect(12, 13), build('panel', 10, 7), clean],
  5: [build('panel', 11, 7), build('bateria', 10, 9), explore(13, 6), explore(15, 5), explore(6, 10)],
  6: [explore(16, 3), explore(18, 4), clean],
  7: [collect(19, 4), build('invernadero', 11, 9), build('panel', 11, 8)],
  8: [explore(4, 10), explore(2, 10), collect(2, 10)],
  9: [build('refugio', 7, 7), build('refugio', 7, 8)],
  10: [explore(5, 8), explore(3, 6), explore(2, 4), clean],
  11: [explore(2, 2), collect(2, 2), build('comunicaciones', 10, 10)],
  14: [explore(15, 1), collect(14, 0), build('generador', 7, 9)],
  15: [build('panel', 10, 8), clean],
};

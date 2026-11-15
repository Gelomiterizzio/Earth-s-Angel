// AI-assisted: Antigravity (Gemini), reviewed by A

import type { DayPlan, ExpectedRow } from './runner';

export const FACIL_PLAN: DayPlan[] = [
  {
    day: 1,
    actions: [
      { type: 'BUILD', building: 'panel', x: 24, y: 24 },
      { type: 'BUILD', building: 'panel', x: 25, y: 24 },
      { type: 'COLLECT', x: 23, y: 27 },
      { type: 'EXPLORE', x: 28, y: 28 },
    ],
  },
  {
    day: 2,
    actions: [
      { type: 'BUILD', building: 'extractor', x: 29, y: 28 },
      { type: 'BUILD', building: 'reciclador', x: 26, y: 24 },
    ],
  },
  {
    day: 3,
    actions: [
      { type: 'BUILD', building: 'generador', x: 24, y: 25 },
      { type: 'BUILD', building: 'invernadero', x: 26, y: 26 },
    ],
  },
  {
    day: 4,
    actions: [{ type: 'BUILD', building: 'refugio', x: 26, y: 25 }],
  },
  { day: 5, actions: [] },
  { day: 6, actions: [] },
  { day: 7, actions: [] },
  { day: 8, actions: [] },
  { day: 9, shelter: true, actions: [] },
];

export const FACIL_EXPECTED: ExpectedRow[] = [
  { day: 1, energia: 16, capEnergia: 20, oxigeno: 28, agua: 28, alimentos: 36, materiales: 58, streak: 0, exposure: 1 },
  { day: 2, energia: 20, capEnergia: 20, oxigeno: 24, agua: 24, alimentos: 32, materiales: 42, streak: 0, exposure: 2 },
  { day: 3, energia: 20, capEnergia: 20, oxigeno: 20, agua: 29, alimentos: 28, materiales: 24, streak: 0, exposure: 3 },
  { day: 4, energia: 20, capEnergia: 20, oxigeno: 22, agua: 30, alimentos: 24, materiales: 10, streak: 1, exposure: 4 },
  { day: 5, energia: 14, capEnergia: 20, oxigeno: 24, agua: 31, alimentos: 20, materiales: 10, streak: 2, exposure: 5 },
  { day: 6, energia: 16, capEnergia: 20, oxigeno: 26, agua: 32, alimentos: 16, materiales: 10, streak: 3, exposure: 6 },
  { day: 7, energia: 18, capEnergia: 20, oxigeno: 28, agua: 33, alimentos: 36, materiales: 10, streak: 4, exposure: 7 },
  { day: 8, energia: 20, capEnergia: 20, oxigeno: 30, agua: 34, alimentos: 32, materiales: 10, streak: 5, exposure: 8 },
  { day: 9, energia: 18, capEnergia: 20, oxigeno: 32, agua: 35, alimentos: 28, materiales: 10, streak: 6, exposure: 11 },
];

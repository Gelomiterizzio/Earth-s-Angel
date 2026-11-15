// AI-assisted: Antigravity (Gemini), reviewed by A

import type { DayPlan, ExpectedRow } from './runner';

export const MEDIA_PLAN: DayPlan[] = [
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
    actions: [
      { type: 'EXPLORE', x: 22, y: 28 },
      { type: 'COLLECT', x: 21, y: 28 },
      { type: 'BUILD', building: 'bateria', x: 24, y: 26 },
      { type: 'EXPLORE', x: 23, y: 22 },
    ],
  },
  {
    day: 5,
    actions: [
      { type: 'BUILD', building: 'refugio', x: 26, y: 25 },
      { type: 'COLLECT', x: 23, y: 21 },
    ],
  },
  {
    day: 6,
    actions: [{ type: 'BUILD', building: 'panel', x: 23, y: 24 }],
  },
  { day: 7, actions: [] },
  { day: 8, shelter: true, actions: [] },
  { day: 9, actions: [] },
];

export const MEDIA_EXPECTED: ExpectedRow[] = [
  { day: 1, energia: 10, capEnergia: 20, oxigeno: 20, agua: 20, alimentos: 28, materiales: 43, streak: 0, exposure: 1 },
  { day: 2, energia: 20, capEnergia: 20, oxigeno: 16, agua: 16, alimentos: 24, materiales: 27, streak: 0, exposure: 2 },
  { day: 3, energia: 20, capEnergia: 20, oxigeno: 12, agua: 21, alimentos: 20, materiales: 9, streak: 0, exposure: 3 },
  { day: 4, energia: 10, capEnergia: 20, oxigeno: 14, agua: 22, alimentos: 16, materiales: 19, streak: 0, exposure: 4 },
  { day: 5, energia: 12, capEnergia: 40, oxigeno: 16, agua: 23, alimentos: 12, materiales: 20, streak: 0, exposure: 5 },
  { day: 6, energia: 14, capEnergia: 40, oxigeno: 18, agua: 24, alimentos: 8, materiales: 14, streak: 0, exposure: 6 },
  { day: 7, energia: 24, capEnergia: 40, oxigeno: 20, agua: 25, alimentos: 28, materiales: 14, streak: 1, exposure: 7 },
  { day: 8, energia: 28, capEnergia: 40, oxigeno: 22, agua: 26, alimentos: 24, materiales: 14, streak: 2, exposure: 13 },
  { day: 9, energia: 38, capEnergia: 40, oxigeno: 24, agua: 27, alimentos: 20, materiales: 14, streak: 3, exposure: 14 },
];

// AI-assisted: Antigravity (Gemini), reviewed by A

import type { DayPlan, ExpectedRow } from './runner';

export const IMPOSIBLE_PLAN: DayPlan[] = [
  {
    day: 1,
    actions: [
      { type: 'COLLECT', x: 23, y: 27 },
      { type: 'BUILD', building: 'panel', x: 24, y: 24 },
      { type: 'BUILD', building: 'panel', x: 25, y: 24 },
      { type: 'EXPLORE', x: 28, y: 28 },
    ],
  },
  {
    day: 2,
    actions: [
      { type: 'BUILD', building: 'extractor', x: 29, y: 28 },
      { type: 'BUILD', building: 'invernadero', x: 26, y: 26 },
    ],
  },
  {
    day: 3,
    actions: [
      { type: 'BUILD', building: 'reciclador', x: 26, y: 24 },
      { type: 'BUILD', building: 'generador', x: 24, y: 25 },
    ],
  },
  {
    day: 4,
    actions: [
      { type: 'EXPLORE', x: 22, y: 28 },
      { type: 'COLLECT', x: 21, y: 28 },
      { type: 'EXPLORE', x: 23, y: 22 },
      { type: 'COLLECT', x: 23, y: 21 },
    ],
  },
  {
    day: 5,
    actions: [
      { type: 'BUILD', building: 'refugio', x: 26, y: 25 },
      { type: 'BUILD', building: 'panel', x: 23, y: 24 },
    ],
  },
  {
    day: 6,
    actions: [{ type: 'BUILD', building: 'bateria', x: 24, y: 26 }],
  },
  { day: 7, actions: [] },
  { day: 8, shelter: true, actions: [] },
  { day: 9, shelter: true, actions: [] },
  { day: 10, actions: [] },
  { day: 11, actions: [] },
  { day: 12, actions: [] },
  { day: 13, actions: [] },
];

export const IMPOSIBLE_EXPECTED: ExpectedRow[] = [
  { day: 1, energia: 8, capEnergia: 20, oxigeno: 16, agua: 16, alimentos: 20, materiales: 37, streak: 0, exposure: 1 },
  { day: 2, energia: 20, capEnergia: 20, oxigeno: 12, agua: 12, alimentos: 16, materiales: 19, streak: 0, exposure: 2 },
  { day: 3, energia: 20, capEnergia: 20, oxigeno: 8, agua: 12, alimentos: 12, materiales: 3, streak: 0, exposure: 3 },
  { day: 4, energia: 20, capEnergia: 20, oxigeno: 10, agua: 13, alimentos: 8, materiales: 33, streak: 0, exposure: 4 },
  { day: 5, energia: 10, capEnergia: 20, oxigeno: 12, agua: 14, alimentos: 4, materiales: 13, streak: 0, exposure: 5 },
  { day: 6, energia: 2, capEnergia: 20, oxigeno: 14, agua: 15, alimentos: 24, materiales: 8, streak: 0, exposure: 6 },
  { day: 7, energia: 12, capEnergia: 40, oxigeno: 16, agua: 16, alimentos: 20, materiales: 8, streak: 1, exposure: 7 },
  { day: 8, energia: 14, capEnergia: 40, oxigeno: 18, agua: 17, alimentos: 16, materiales: 8, streak: 2, exposure: 13 },
  { day: 9, energia: 16, capEnergia: 40, oxigeno: 20, agua: 18, alimentos: 12, materiales: 8, streak: 0, exposure: 19 },
  { day: 10, energia: 26, capEnergia: 40, oxigeno: 22, agua: 19, alimentos: 32, materiales: 8, streak: 1, exposure: 20 },
  { day: 11, energia: 36, capEnergia: 40, oxigeno: 24, agua: 20, alimentos: 28, materiales: 8, streak: 2, exposure: 21 },
  { day: 12, energia: 40, capEnergia: 40, oxigeno: 26, agua: 21, alimentos: 24, materiales: 8, streak: 3, exposure: 22 },
  { day: 13, energia: 40, capEnergia: 40, oxigeno: 28, agua: 22, alimentos: 20, materiales: 8, streak: 4, exposure: 23 },
];

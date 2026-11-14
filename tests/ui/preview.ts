// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
// Browser harness for the interface. It is not the simulation.
import en from '../../src/data/i18n/en/ui.json';
import es from '../../src/data/i18n/es/ui.json';
import { attachAudio, createAudio } from '../../src/audio/index';
import { registerScreens } from '../../src/ui/index';
import { mountPreviewMap } from './preview-map';

const extra = {
  en: {
    'content.building.panel.name': 'Solar panel',
    'content.building.bateria.name': 'Battery',
    'content.building.generador.name': 'Oxygen generator',
    'content.building.reciclador.name': 'Water recycler',
    'content.building.extractor.name': 'Ice extractor',
    'content.building.invernadero.name': 'Greenhouse',
    'content.building.refugio.name': 'Shelter',
    'content.building.deposito.name': 'Supply depot',
    'content.building.comunicaciones.name': 'Communications',
    'content.building.laboratorio.name': 'Laboratory',
    'content.building.habitat.name': 'Habitat',
    'content.building.panel.why': 'Power from sunlight.',
    'content.building.bateria.why': 'Stores power for a dark day.',
    'content.building.generador.why': 'Turns water into air.',
    'content.building.reciclador.why': 'Brings used water back.',
    'content.building.extractor.why': 'Pulls water from ice.',
    'content.building.invernadero.why': 'Grows food over several days.',
    'content.building.refugio.why': 'Shields the crew from a solar storm.',
    'content.building.deposito.why': 'Stores more supplies.',
    'content.building.comunicaciones.why': 'Extends the weather forecast.',
    'content.building.laboratorio.why': 'Records findings and activates beacons.',
    'content.building.habitat.why': 'Adds shelter space and a logistics base.',
    'content.event.tormenta-solar.name': 'Solar storm',
    'content.event.sombra.name': 'Shade',
    'content.crew.commander': 'Commander',
    'content.crew.engineer': 'Engineer',
    'content.crew.botanist': 'Botanist',
    'content.crew.medic': 'Medic',
    'content.crew.geologist': 'Geologist',
    'content.crew.communications': 'Communications specialist',
    'sim.error.NO_MATERIALS': 'You need {need} materials. You have {have}.',
    'sim.error.NO_AP': 'Not enough action points.',
    'sim.error.WRONG_PHASE': 'Not now.',
    'sim.cause.lowLight': 'Low light: the panels made less.',
    'sim.cause.streakUp': 'A stable day. Streak: 2 of 3.',
    'sim.defeat.exposicion': 'The crew took too much radiation.',
    'sim.principle.exposicion': 'Radiation adds up. It does not go down.',
    'sim.suggestion.exposicion': 'Place the shelter before the storm and save power to use it.',
    'sim.principle.victory': 'A stable base balances power, water, air, food and shielding.',
    'sim.suggestion.victory': 'Keep a margin on the days that follow.',
  },
  es: {
    'content.building.panel.name': 'Panel solar',
    'content.building.bateria.name': 'Batería',
    'content.building.generador.name': 'Generador de oxígeno',
    'content.building.reciclador.name': 'Reciclador de agua',
    'content.building.extractor.name': 'Extractor de hielo',
    'content.building.invernadero.name': 'Invernadero',
    'content.building.refugio.name': 'Refugio',
    'content.building.deposito.name': 'Depósito',
    'content.building.comunicaciones.name': 'Comunicaciones',
    'content.building.laboratorio.name': 'Laboratorio',
    'content.building.habitat.name': 'Hábitat',
    'content.building.panel.why': 'Electricidad con la luz del Sol.',
    'content.building.bateria.why': 'Guarda energía para un día oscuro.',
    'content.building.generador.why': 'Saca aire del agua.',
    'content.building.reciclador.why': 'Recupera el agua usada.',
    'content.building.extractor.why': 'Saca agua del hielo.',
    'content.building.invernadero.why': 'Da comida al cabo de varios días.',
    'content.building.refugio.why': 'Protege a la tripulación de la tormenta solar.',
    'content.building.deposito.why': 'Permite guardar más suministros.',
    'content.building.comunicaciones.why': 'Amplía el pronóstico meteorológico.',
    'content.building.laboratorio.why': 'Registra hallazgos y activa balizas.',
    'content.building.habitat.why': 'Añade plazas de refugio y un punto logístico.',
    'content.event.tormenta-solar.name': 'Tormenta solar',
    'content.event.sombra.name': 'Sombra',
    'content.crew.commander': 'Comandante',
    'content.crew.engineer': 'Ingeniera',
    'content.crew.botanist': 'Botánico',
    'content.crew.medic': 'Médica',
    'content.crew.geologist': 'Geóloga',
    'content.crew.communications': 'Especialista en comunicaciones',
    'sim.error.NO_MATERIALS': 'Hacen falta {need} materiales. Tienes {have}.',
    'sim.error.NO_AP': 'No quedan puntos de acción.',
    'sim.error.WRONG_PHASE': 'Ahora no.',
    'sim.cause.lowLight': 'Poca luz: los paneles rindieron menos.',
    'sim.cause.streakUp': 'Día estable. Racha: 2 de 3.',
    'sim.defeat.exposicion': 'La tripulación recibió demasiada radiación.',
    'sim.principle.exposicion': 'La radiación se acumula y no baja.',
    'sim.suggestion.exposicion': 'Coloca el refugio antes de la tormenta y guarda energía para usarlo.',
    'sim.principle.victory': 'Una base estable equilibra energía, agua, aire, comida y protección.',
    'sim.suggestion.victory': 'Mantén margen en los días que siguen.',
  },
};

const building = (type, cost, apCost, why) => ({
  type,
  cost,
  apCost,
  buildDays: type === 'refugio' ? 2 : 1,
  energyPerDay: 0,
  requiresTerrain: type === 'extractor' ? 'hielo' : 'llano',
  levels: ['luna'],
  priority: 1,
  nameKey: `content.building.${type}.name`,
  descKey: `content.building.${type}.name`,
  whyKey: why,
});

const levelPack = (dayLimit, streakDays, radiationLevel, durationDays) => ({
  crewSize: 4,
  dayLimit,
  initial: { energia: 10, oxigeno: 24, agua: 24, alimentos: 32, materiales: 40 },
  mineralYield: 15,
  reserveThreshold: 16,
  energyThreshold: 10,
  streakDays,
  shelterEnergy: 6,
  events: [{ type: 'tormenta-solar', startDay: 8, durationDays, radiationLevel }],
});

const data = {
  buildings: {
    panel: building('panel', 6, 1, 'content.building.panel.why'),
    bateria: building('bateria', 5, 1, 'content.building.bateria.why'),
    generador: building('generador', 8, 2, 'content.building.generador.why'),
    reciclador: building('reciclador', 8, 2, 'content.building.reciclador.why'),
    extractor: building('extractor', 8, 2, 'content.building.extractor.why'),
    invernadero: building('invernadero', 10, 2, 'content.building.invernadero.why'),
    refugio: building('refugio', 14, 3, 'content.building.refugio.why'),
    nave: building('nave', 0, 0, 'content.building.panel.why'),
    deposito: building('deposito', 8, 1, 'content.building.deposito.why'),
    comunicaciones: building('comunicaciones', 12, 2, 'content.building.comunicaciones.why'),
    laboratorio: building('laboratorio', 12, 2, 'content.building.laboratorio.why'),
    habitat: building('habitat', 16, 3, 'content.building.habitat.why'),
  },
  levels: {
    luna: {
      id: 'luna',
      width: 12,
      height: 12,
      rows: [],
      ship: { x: 5, y: 5 },
      initialExploredRadius: 2,
      baseCaps: { energia: 20, oxigeno: 40, agua: 40, alimentos: 40, materiales: 60 },
      availableBuildings: ['panel', 'bateria', 'generador', 'reciclador', 'extractor', 'invernadero', 'refugio'],
      objectives: ['soporte', 'energia', 'alimentos', 'reservas', 'proteccion', 'racha'],
      forecastHorizonDays: 3,
    },
    marte: {
      id: 'marte', width: 12, height: 12, rows: [], ship: { x: 5, y: 5 }, initialExploredRadius: 2,
      baseCaps: { energia: 30, oxigeno: 60, agua: 60, alimentos: 60, materiales: 90 },
      availableBuildings: ['panel', 'bateria', 'generador', 'reciclador', 'extractor', 'invernadero', 'refugio',
        'deposito', 'comunicaciones', 'laboratorio', 'habitat'],
      objectives: ['soporte'], forecastHorizonDays: 3,
    },
    tierra: {
      id: 'tierra', width: 1, height: 1, rows: [], ship: { x: 0, y: 0 }, initialExploredRadius: 0,
      baseCaps: { energia: 0, oxigeno: 0, agua: 0, alimentos: 0, materiales: 0 },
      availableBuildings: [], objectives: [], forecastHorizonDays: 0,
    },
  },
  difficulty: {
    facil: { earthDays: 64, bonusDays: 12, levels: { luna: levelPack(24, 2, 1, 1), marte: levelPack(24, 2, 1, 1), tierra: levelPack(4, 1, 0, 1) } },
    media: { earthDays: 54, bonusDays: 10, levels: { luna: levelPack(20, 3, 2, 1), marte: levelPack(20, 3, 2, 1), tierra: levelPack(4, 1, 0, 1) } },
    imposible: { earthDays: 44, bonusDays: 8, levels: { luna: levelPack(16, 4, 2, 2), marte: levelPack(16, 4, 2, 2), tierra: levelPack(4, 1, 0, 1) } },
  },
  constants: {},
  nasa: { sep: [] },
  tutorial: [
    { id: 't01', trigger: { event: 'day/started', day: 8 }, highlight: 'hud-meters', textKey: 'content.building.panel.why', completeOn: 'day/ended' },
  ],
  cards: [
    { id: 'solarStorm', titleKey: 'content.event.tormenta-solar.name', bodyKey: 'content.building.refugio.why', tag: 'nasa', source: { label: 'DONKI', url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/' }, level: 'luna' },
  ],
};

function crew() {
  return [
    { id: 1, nameKey: 'content.crew.commander', health: 100, exposure: 7 },
    { id: 2, nameKey: 'content.crew.engineer', health: 90, exposure: 4 },
    { id: 3, nameKey: 'content.crew.botanist', health: 100, exposure: 2 },
    { id: 4, nameKey: 'content.crew.medic', health: 80, exposure: 1 },
  ];
}

function fixture(difficulty = 'media') {
  const sample = {
    campaign: {
      version: 1, seed: 'EA-DEMO', canonical: true, difficulty: 'media', level: 'luna',
      earthDaysRemaining: 47, appliedTransitions: [], clues: [], narrativeFlags: {}, manifest: null, history: [],
    },
    mission: {
      level: 'luna', day: 8, phase: 'planning', ap: 2, apSpentToday: 0, shelterToday: false, decisionPending: null,
      resources: { energia: 24, oxigeno: 20, agua: 25, alimentos: 28, materiales: 14 },
      caps: { energia: 40, oxigeno: 40, agua: 40, alimentos: 40, materiales: 60 },
      map: { width: 12, height: 12, tiles: [] },
      buildings: [{ id: 1, type: 'nave', x: 5, y: 5, placedDay: 1, operationalFromDay: 1, enabled: true, growth: 0, stress: 0, damaged: false }],
      nextBuildingId: 2,
      crew: crew(),
      schedule: [],
      energyPriority: [],
      wastewater: 0,
      harvests: 0,
      streak: 1,
      objectives: ['soporte', 'energia', 'alimentos', 'reservas', 'proteccion', 'racha'].map((id, index) => ({ id, met: index < 2, current: id === 'racha' ? 1 : undefined, target: id === 'racha' ? 3 : undefined })),
      discoveries: [],
      lastReport: null,
      result: null,
    },
  };
  sample.campaign.difficulty = difficulty;
  if (cinematic === 'intro' && previewParams.get('day') !== '8') {
    const pack = data.difficulty[difficulty];
    sample.campaign.earthDaysRemaining = pack.earthDays;
    sample.mission.day = 1;
    sample.mission.ap = 4;
    sample.mission.resources = { ...pack.levels.luna.initial };
    sample.mission.streak = 0;
    sample.mission.crew = sample.mission.crew.map((member) => ({ ...member, health: 100, exposure: 0 }));
    sample.mission.objectives = sample.mission.objectives.map((goal) => ({
      ...goal,
      met: false,
      current: goal.id === 'racha' ? 0 : undefined,
      target: goal.id === 'racha' ? pack.levels.luna.streakDays : undefined,
    }));
  }
  return sample;
}

const listeners = new Set();
const eventHandlers = new Map();
let state = null;

const store = {
  getState: () => state,
  load(next) {
    state = next;
    for (const listener of listeners) listener(state);
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  on(type, handler) {
    const list = eventHandlers.get(type) ?? new Set();
    list.add(handler);
    eventHandlers.set(type, list);
    return () => list.delete(handler);
  },
  dispatch(action) {
    if (!state) return { ok: false, state, error: { code: 'WRONG_PHASE', messageKey: 'sim.error.WRONG_PHASE' } };
    if (action.type === 'END_DAY') {
      if (action.day !== state.mission.day || state.mission.phase !== 'planning') {
        const error = { code: 'STALE_DAY', messageKey: 'sim.error.WRONG_PHASE' };
        emit('action/rejected', { type: 'action/rejected', error });
        return { ok: false, state, error };
      }
      state = {
        ...state,
        mission: {
          ...state.mission,
          phase: 'report',
          lastReport: {
            day: state.mission.day,
            level: state.mission.level,
            activeEvents: [],
            solarFactorPct: 25,
            radiationLevel: 0,
            energy: { start: 24, generated: 8, used: 4, end: 24, cap: 40, wasted: 0, unpowered: [] },
            produced: { agua: 6, oxigeno: 6, alimentos: 0 },
            moduleInputs: { agua: 2 },
            crewConsumed: { oxigeno: 4, agua: 4, alimentos: 4 },
            shortages: { oxigeno: 0, agua: 0, alimentos: 0 },
            wasted: {},
            crew: state.mission.crew.map((member) => ({ id: member.id, health: member.health, healthDelta: 0, exposure: member.exposure, exposureDelta: 1, sheltered: false })),
            shelter: { requested: false, active: false },
            stable: true,
            streak: state.mission.streak + 1,
            objectives: state.mission.objectives,
            causeEffectKeys: ['lowLight', 'streakUp'],
            result: null,
          },
        },
      };
      emit('day/ended', { type: 'day/ended', report: state.mission.lastReport });
      publish();
      return { ok: true, state, events: [] };
    }
    if (action.type === 'ACK_REPORT') {
      state = { ...state, mission: { ...state.mission, phase: 'planning', day: state.mission.day + 1, ap: 4 } };
      publish();
      return { ok: true, state, events: [] };
    }
    if (action.type === 'RESTART_MISSION') {
      state = fixture(state.campaign.difficulty);
      publish();
      return { ok: true, state, events: [] };
    }
    const error = { code: 'WRONG_PHASE', messageKey: 'sim.error.WRONG_PHASE' };
    emit('action/rejected', { type: 'action/rejected', error });
    return { ok: false, state, error };
  },
};

function publish() {
  for (const listener of listeners) listener(state);
}
function emit(type, event) {
  for (const handler of eventHandlers.get(type) ?? []) handler(event);
}

const uiListeners = new Set();
let uiState = { tool: { kind: 'inspect' }, hover: null, openPanel: null };
const uiStore = {
  getState: () => uiState,
  setTool(tool) { uiState = { ...uiState, tool }; for (const listener of uiListeners) listener(uiState); },
  setHover(hover) { uiState = { ...uiState, hover }; },
  openPanel(openPanel) { uiState = { ...uiState, openPanel }; },
  subscribe(listener) { uiListeners.add(listener); return () => uiListeners.delete(listener); },
};

const defaults = () => ({
  language: 'en', volumeMaster: 80, volumeMusic: 60, volumeSfx: 80, muted: false,
  subtitles: true, reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  fullscreen: false, tutorial: true, learningCheck: true,
});
let optionsState = defaults();
try {
  const saved = JSON.parse(localStorage.getItem('ea.options.v1') ?? 'null');
  if (saved && typeof saved === 'object') optionsState = { ...defaults(), ...saved };
} catch { /* keep defaults */ }
const optionListeners = new Set();
const options = {
  get: () => optionsState,
  set(key, value) {
    optionsState = { ...optionsState, [key]: value };
    try { localStorage.setItem('ea.options.v1', JSON.stringify(optionsState)); } catch { /* session only */ }
    for (const listener of optionListeners) listener(optionsState);
  },
  reset() {
    optionsState = defaults();
    try { localStorage.setItem('ea.options.v1', JSON.stringify(optionsState)); } catch { /* session only */ }
    for (const listener of optionListeners) listener(optionsState);
  },
  subscribe(listener) { optionListeners.add(listener); return () => optionListeners.delete(listener); },
};

const catalogs = { en: { ...en, ...extra.en }, es: { ...es, ...extra.es } };
const t = (key, params) => {
  let text = catalogs[options.get().language]?.[key] ?? catalogs.en[key] ?? key;
  if (params) for (const [name, value] of Object.entries(params)) text = text.replaceAll(`{${name}}`, String(value));
  return text;
};

const screens = new Map();
const flowListeners = new Set();
const history = [];
let scene = { scene: 'arranque', params: {} };
let cinematicLock = null;
const root = document.getElementById('ui');
const previewParams = new URLSearchParams(location.search);
const requestedCinematic = previewParams.get('cinematic');
const cinematicFixtures = {
  moonToMars: { level: 'marte', destination: 'mision' },
  marsVictory: { level: 'marte', destination: 'creditos' },
  wormhole: { level: 'tierra', destination: 'mision' },
  earthVictory: { level: 'tierra', destination: 'creditos' },
};
const cinematic = requestedCinematic && Object.hasOwn(cinematicFixtures, requestedCinematic)
  ? requestedCinematic
  : 'intro';

const flow = {
  current: () => scene,
  register(id, screen) { screens.set(id, screen); },
  go(next, params = {}) {
    if (next === scene.scene && next !== 'cinematica') return;
    const from = scene.scene;
    screens.get(from)?.unmount();
    history.push(from);
    scene = { scene: next, params };
    root.replaceChildren();
    screens.get(next)?.mount(root, ctx);
    for (const listener of flowListeners) listener({ from, to: next });
    const first = root.querySelector('button, input, a');
    if (first instanceof HTMLElement && document.activeElement === document.body) first.focus();
  },
  back() {
    const previous = history.pop() ?? 'titulo';
    this.go(previous);
  },
  startCampaign(difficulty) {
    state = fixture(difficulty);
    const preset = cinematicFixtures[cinematic];
    if (preset) {
      state.campaign.level = preset.level;
      state.mission.level = preset.level;
      state.mission.day = 1;
      state.mission.ap = 4;
    }
    if (cinematic === 'moonToMars') {
      const bonus = data.difficulty[difficulty].bonusDays;
      state.campaign.appliedTransitions.push('luna->marte');
      state.campaign.earthDaysRemaining += bonus;
      state.campaign.manifest = {
        crew: [...state.mission.crew],
        supplies: state.mission.resources,
        discoveries: [],
        bonusDaysApplied: bonus,
      };
    }
    if (preset?.level === 'marte') {
      state.mission.crew.push(
        { id: 5, nameKey: 'content.crew.geologist', health: 100, exposure: 0 },
        { id: 6, nameKey: 'content.crew.communications', health: 100, exposure: 0 },
      );
    }
    publish();
    cinematicLock = cinematic;
    this.go('cinematica', { id: cinematic });
  },
  completeCinematic(id) {
    if (cinematicLock !== id) return;
    cinematicLock = null;
    this.go(cinematicFixtures[id]?.destination ?? 'mision');
  },
  hasActiveMission: () => state !== null,
  subscribe(listener) { flowListeners.add(listener); return () => flowListeners.delete(listener); },
};

const audio = createAudio(options);
const ctx = { store, uiStore, flow, options, t, audio, data };
registerScreens(flow);
attachAudio(audio, store, flow);
mountPreviewMap(document.getElementById('map'), ctx);
flow.go('titulo');

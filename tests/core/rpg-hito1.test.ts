// AI-assisted: Antigravity (Gemini), reviewed by A

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppContext } from '../../src/app/context';
import { createFlow } from '../../src/app/flow';
import { createI18n } from '../../src/app/i18n';
import { bindGlobalInput } from '../../src/app/input';
import { createOptionsService, type StorageLike } from '../../src/app/options';
import { createPersistenceService, SAVE_STORAGE_KEY } from '../../src/app/persistence';
import { createSilentAudio } from '../../src/app/silent-audio';
import { createStore } from '../../src/app/store';
import { createUiStore } from '../../src/app/ui-store';
import { fixtureState } from '../../src/core/fixtures';
import { applyTransition } from '../../src/core/progression';
import { deserialize, serialize } from '../../src/core/save';
import { loadGameData } from '../../src/data/index';
import {
  buildMissionJournalData,
  canWalk,
  createMapView,
  inspectWalkTarget,
  describeWalkTarget,
} from '../../src/map/index';
import { openLunarSecret } from '../../src/ui/cinematics/lunar-secret';
import { mountDayReport } from '../../src/ui/panels/day-report';
import { MEDIA_PLAN } from './plans/media';
import { runPlan } from './plans/runner';

const data = loadGameData();

vi.mock('../../src/ui/cinematics/lunar-secret', { spy: true });

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

class FakeElement {
  tagName: string;
  className = '';
  id = '';
  hidden = false;
  disabled = false;
  tabIndex = 0;
  type = '';
  title = '';
  width = 0;
  height = 0;
  isContentEditable = false;
  parentElement: FakeElement | null = null;
  children: FakeElement[] = [];
  private _text = '';
  private attrs = new Map<string, string>();
  private styles = new Map<string, string>();
  private listeners = new Map<string, Set<(e: unknown) => void>>();
  dataset: Record<string, string | undefined>;
  style: {
    setProperty: (k: string, v: string) => void;
    getPropertyValue: (k: string) => string;
    gridTemplateColumns?: string;
    width?: string;
    left?: string;
    top?: string;
  };
  classList: {
    add: (...tokens: string[]) => void;
    remove: (...tokens: string[]) => void;
    toggle: (token: string, force?: boolean) => boolean;
    contains: (token: string) => boolean;
  };

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
    const attrs = this.attrs;
    this.dataset = new Proxy({} as Record<string, string | undefined>, {
      get: (_target, prop: string) => attrs.get(`data-${camelToKebab(prop)}`),
      set: (_target, prop: string, value: string) => {
        attrs.set(`data-${camelToKebab(prop)}`, String(value));
        return true;
      },
      deleteProperty: (_target, prop: string) => {
        attrs.delete(`data-${camelToKebab(prop)}`);
        return true;
      },
      has: (_target, prop: string) => attrs.has(`data-${camelToKebab(prop)}`),
    });
    const styles = this.styles;
    this.style = {
      setProperty(k: string, v: string) {
        styles.set(k, v);
      },
      getPropertyValue(k: string) {
        return styles.get(k) ?? '';
      },
    };
    const self = this;
    this.classList = {
      add(...tokens: string[]) {
        const set = new Set(self.className.split(/\s+/).filter(Boolean));
        for (const t of tokens) set.add(t);
        self.className = [...set].join(' ');
      },
      remove(...tokens: string[]) {
        const set = new Set(self.className.split(/\s+/).filter(Boolean));
        for (const t of tokens) set.delete(t);
        self.className = [...set].join(' ');
      },
      toggle(token: string, force?: boolean) {
        const has = this.contains(token);
        const next = force !== undefined ? force : !has;
        if (next) this.add(token);
        else this.remove(token);
        return next;
      },
      contains(token: string) {
        return self.className.split(/\s+/).filter(Boolean).includes(token);
      },
    };
  }

  get isConnected(): boolean {
    let cur: FakeElement | null = this;
    while (cur) {
      if (cur.tagName === 'BODY') return true;
      cur = cur.parentElement;
    }
    return false;
  }

  get textContent(): string {
    if (this.children.length === 0) return this._text;
    return this._text + this.children.map((c) => c.textContent).join(' ');
  }

  set textContent(val: string) {
    this.children = [];
    this._text = String(val);
  }

  setAttribute(name: string, value: string): void {
    this.attrs.set(name, String(value));
    if (name === 'id') this.id = String(value);
    if (name === 'class') this.className = String(value);
  }

  getAttribute(name: string): string | null {
    if (name === 'style') {
      return [...this.styles.entries()].map(([k, v]) => `${k}: ${v}`).join('; ');
    }
    return this.attrs.get(name) ?? null;
  }

  removeAttribute(name: string): void {
    this.attrs.delete(name);
  }

  toggleAttribute(name: string, force?: boolean): boolean {
    const has = this.attrs.has(name);
    const next = force !== undefined ? force : !has;
    if (next) this.attrs.set(name, '');
    else this.attrs.delete(name);
    return next;
  }

  hasAttribute(name: string): boolean {
    return this.attrs.has(name);
  }

  append(...nodes: (FakeElement | string)[]): void {
    for (const node of nodes) {
      if (typeof node === 'string') {
        const span = new FakeElement('SPAN');
        span.textContent = node;
        span.parentElement = this;
        this.children.push(span);
      } else {
        node.remove();
        node.parentElement = this;
        this.children.push(node);
      }
    }
  }

  prepend(...nodes: FakeElement[]): void {
    for (const node of [...nodes].reverse()) {
      node.remove();
      node.parentElement = this;
      this.children.unshift(node);
    }
  }

  replaceChildren(...nodes: FakeElement[]): void {
    for (const child of this.children) child.parentElement = null;
    this.children = [];
    this._text = '';
    this.append(...nodes);
  }

  remove(): void {
    if (!this.parentElement) return;
    const idx = this.parentElement.children.indexOf(this);
    if (idx >= 0) this.parentElement.children.splice(idx, 1);
    this.parentElement = null;
  }

  contains(other: unknown): boolean {
    if (other === this) return true;
    for (const child of this.children) {
      if (child.contains(other)) return true;
    }
    return false;
  }

  matches(selector: string): boolean {
    return selector
      .split(',')
      .map((s) => s.trim())
      .some((part) => this.matchesSingle(part));
  }

  private matchesSingle(selector: string): boolean {
    if (!selector) return false;
    let rest = selector;
    if (rest.startsWith('#')) {
      const m = /^#([a-zA-Z0-9_-]+)/.exec(rest);
      if (!m || this.id !== m[1]) return false;
      rest = rest.slice(m[0].length);
    }
    const tagMatch = /^[a-zA-Z0-9]+/.exec(rest);
    if (tagMatch) {
      if (this.tagName !== tagMatch[0].toUpperCase()) return false;
      rest = rest.slice(tagMatch[0].length);
    }
    const classMatches = rest.matchAll(/\.([a-zA-Z0-9_-]+)/g);
    for (const cm of classMatches) {
      if (!this.classList.contains(cm[1])) return false;
    }
    const attrMatches = rest.matchAll(/\[([a-zA-Z0-9_-]+)(?:="([^"]*)")?\]/g);
    for (const am of attrMatches) {
      const attrName = am[1];
      const attrVal = am[2];
      if (!this.attrs.has(attrName)) return false;
      if (attrVal !== undefined && this.attrs.get(attrName) !== attrVal) return false;
    }
    if (rest.includes(':not(:disabled)') && this.disabled) return false;
    return true;
  }

  closest(selector: string): FakeElement | null {
    let cur: FakeElement | null = this;
    while (cur) {
      if (cur.matches(selector)) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  querySelector<T = FakeElement>(selector: string): T | null {
    return (this.querySelectorAll(selector)[0] as unknown as T) ?? null;
  }

  querySelectorAll(selector: string): FakeElement[] {
    const out: FakeElement[] = [];
    const visit = (el: FakeElement) => {
      for (const child of el.children) {
        if (child.matches(selector)) out.push(child);
        visit(child);
      }
    };
    visit(this);
    return out;
  }

  addEventListener(type: string, fn: (e: unknown) => void): void {
    const set = this.listeners.get(type) ?? new Set();
    set.add(fn);
    this.listeners.set(type, set);
  }

  removeEventListener(type: string, fn: (e: unknown) => void): void {
    this.listeners.get(type)?.delete(fn);
  }

  dispatchEvent(event: { type: string; target?: unknown }): boolean {
    if (!event.target) event.target = this;
    for (const fn of this.listeners.get(event.type) ?? []) {
      fn(event);
    }
    return true;
  }

  click(): void {
    if (this.disabled) return;
    this.dispatchEvent({ type: 'click', target: this });
  }

  focus(): void {
    fakeDocument.activeElement = this;
  }

  getContext(): null {
    return null;
  }

  getBoundingClientRect() {
    return { width: 960, height: 540 };
  }

  showModal(): void {
    this.setAttribute('open', '');
  }

  close(): void {
    this.removeAttribute('open');
  }
}

class FakeKeyboardEvent {
  type: string;
  key: string;
  repeat: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  defaultPrevented = false;
  propagationStopped = false;
  target: unknown;

  constructor(
    type: string,
    init: {
      key: string;
      repeat?: boolean;
      ctrlKey?: boolean;
      altKey?: boolean;
      metaKey?: boolean;
      target?: unknown;
    },
  ) {
    this.type = type;
    this.key = init.key;
    this.repeat = Boolean(init.repeat);
    this.ctrlKey = Boolean(init.ctrlKey);
    this.altKey = Boolean(init.altKey);
    this.metaKey = Boolean(init.metaKey);
    this.target = init.target ?? fakeDocument.activeElement ?? fakeDocument.body;
  }

  preventDefault(): void {
    this.defaultPrevented = true;
  }

  stopPropagation(): void {
    this.propagationStopped = true;
  }
}

const windowListeners = new Map<string, Set<(e: unknown) => void>>();
const fakeDocument = {
  baseURI: 'http://localhost/',
  documentElement: { lang: 'en' },
  body: new FakeElement('body'),
  activeElement: null as FakeElement | null,
  createElement(tag: string) {
    return new FakeElement(tag);
  },
  querySelector<T = FakeElement>(selector: string): T | null {
    return fakeDocument.body.querySelector<T>(selector);
  },
  querySelectorAll(selector: string): FakeElement[] {
    return fakeDocument.body.querySelectorAll(selector);
  },
  getElementById(id: string): FakeElement | null {
    return fakeDocument.body.querySelector(`#${id}`);
  },
  addEventListener() {},
  removeEventListener() {},
};

const fakeWindow = {
  matchMedia: () => ({ matches: true }),
  addEventListener(type: string, fn: (e: unknown) => void) {
    const set = windowListeners.get(type) ?? new Set();
    set.add(fn);
    windowListeners.set(type, set);
  },
  removeEventListener(type: string, fn: (e: unknown) => void) {
    windowListeners.get(type)?.delete(fn);
  },
  dispatchEvent(event: FakeKeyboardEvent) {
    for (const fn of [...(windowListeners.get(event.type) ?? [])]) {
      fn(event);
      if (event.propagationStopped) break;
    }
    return !event.defaultPrevented;
  },
};

function createMemoryStorage(): StorageLike & {
  dump: Record<string, string>;
  removeItem(k: string): void;
} {
  const dump: Record<string, string> = {};
  return {
    dump,
    getItem(k: string) {
      return k in dump ? dump[k] : null;
    },
    setItem(k: string, v: string) {
      dump[k] = v;
    },
    removeItem(k: string) {
      delete dump[k];
    },
  };
}

function setupMissionTestHarness(difficulty: 'facil' | 'media' | 'imposible' = 'media', seed = 'EA-HITO1') {
  fakeDocument.body = new FakeElement('body');
  fakeDocument.activeElement = fakeDocument.body;
  windowListeners.clear();

  const mapEl = new FakeElement('div');
  mapEl.id = 'map';
  const uiEl = new FakeElement('div');
  uiEl.id = 'ui';
  fakeDocument.body.append(mapEl, uiEl);

  const mem = createMemoryStorage();
  const options = createOptionsService(mem);
  options.set('reducedMotion', true);
  options.set('tutorial', false);
  options.set('learningCheck', false);
  // These checks use the fixed Moon layout from the level document.
  options.set('randomMap', false);
  const i18n = createI18n(options.get().language);
  options.subscribe(({ language }) => i18n.setLang(language));

  const store = createStore(data);
  const persistence = createPersistenceService(mem);
  store.subscribe((state) => {
    persistence.saveCampaign(state);
  });
  const uiStore = createUiStore();
  const audio = createSilentAudio();

  let mapView!: ReturnType<typeof createMapView>;
  const flow = createFlow({
    uiRoot: uiEl as unknown as HTMLElement,
    getContext: () => ctx,
    getMapView: () => mapView,
    search: `?seed=${encodeURIComponent(seed)}`,
  });

  const ctx: AppContext = {
    store,
    uiStore,
    flow,
    options,
    t: (key, params) => i18n.t(key, params),
    audio,
    data,
  };

  for (const id of ['titulo', 'dificultad', 'cinematica', 'mision', 'pausa', 'opciones', 'resultado'] as const) {
    flow.register(id, { mount() {}, unmount() {} });
  }

  mapView = createMapView(mapEl as unknown as HTMLElement, ctx);
  const unbindInput = bindGlobalInput(ctx);

  // Start from Title -> New Game (startCampaign) -> opening cinematic -> mision
  flow.go('titulo');
  flow.startCampaign(difficulty);
  // Mission design screen (default design), then the launch cinematic.
  flow.go('cinematica', { id: 'opening' });
  flow.completeCinematic('opening');

  const pressKey = (key: string, opts: { repeat?: boolean; target?: unknown } = {}) => {
    const ev = new FakeKeyboardEvent('keydown', { key, ...opts });
    fakeWindow.dispatchEvent(ev);
    return ev;
  };

  return {
    ctx,
    store,
    uiStore,
    flow,
    persistence,
    mem,
    mapEl,
    uiEl,
    mapView,
    pressKey,
    cleanup() {
      unbindInput();
      mapView.destroy();
    },
  };
}

describe('Hito 1 · Una misión lunar jugable (T-RPG-A1)', () => {
  beforeEach(() => {
    class FakeImage extends FakeElement {
      src = '';
      complete = false;
      naturalWidth = 0;
      constructor() {
        super('img');
      }
    }
    (globalThis as Record<string, unknown>).HTMLElement = FakeElement;
    (globalThis as Record<string, unknown>).Node = FakeElement;
    (globalThis as Record<string, unknown>).Image = FakeImage;
    (globalThis as Record<string, unknown>).document = fakeDocument;
    (globalThis as Record<string, unknown>).window = fakeWindow;
    (globalThis as Record<string, unknown>).requestAnimationFrame = () => 1;
    (globalThis as Record<string, unknown>).cancelAnimationFrame = () => {};
  });

  afterEach(() => {
    windowListeners.clear();
  });

  it('describes what the astronaut is facing: ship, mineral, collected ground and scaffolding', () => {
    const h = setupMissionTestHarness('media', 'EA-LOOK-01');
    try {
      const look = (state: ReturnType<typeof h.store.getState>, pos: { x: number; y: number }, face: { x: number; y: number }) =>
        describeWalkTarget(h.ctx, state!, inspectWalkTarget(h.ctx, state!, pos, face));
      const t = (key: string, params?: Record<string, string | number>) =>
        h.ctx.t('content.map.look.prefix', { what: h.ctx.t(`content.map.look.${key}`, params) });
      let state = h.store.getState();
      const ship = h.ctx.t(h.ctx.data.buildings.nave.nameKey);
      expect(look(state, { x: 25, y: 26 }, { x: 0, y: -1 })).toBe(t('ship', { name: ship }));
      expect(look(state, { x: 24, y: 27 }, { x: -1, y: 0 })).toBe(t('terrain.mineral', { n: 15 }));
      expect(h.mapEl.querySelector('.walk-hint-look')?.textContent).toBe(look(state, { x: 25, y: 26 }, { x: 0, y: 1 }));

      h.store.dispatch({ type: 'COLLECT', x: 23, y: 27 });
      state = h.store.getState();
      expect(look(state, { x: 24, y: 27 }, { x: -1, y: 0 })).toBe(t('terrain.collected'));
      expect(inspectWalkTarget(h.ctx, state!, { x: 24, y: 27 }, { x: -1, y: 0 }).primary?.action)
        .toMatchObject({ type: 'BUILD', building: 'panel', x: 23, y: 27 });

      h.store.dispatch({ type: 'BUILD', building: 'panel', x: 23, y: 27 });
      state = h.store.getState();
      const panel = h.ctx.t(h.ctx.data.buildings.panel.nameKey);
      expect(look(state, { x: 24, y: 27 }, { x: -1, y: 0 })).toBe(t('building.scaffold', { name: panel, day: 2 }));
    } finally {
      h.cleanup();
    }
  });

  it('starts beside the ship and explains why the step into fog is blocked', () => {
    const h = setupMissionTestHarness('media', 'EA-FOG-01');
    try {
      const { width, height } = h.store.getState()!.mission.map;
      expect([width, height]).toEqual([73, 73]);
      expect(h.mapView.walk.getSnapshot().position).toEqual({ x: 25, y: 26 });
      h.pressKey('d'); // face east
      h.pressKey('d'); // (26, 26)
      h.pressKey('d'); // (27, 26), last explored column
      h.pressKey('d'); // (28, 26) is unexplored
      expect(h.mapView.walk.getSnapshot().position).toEqual({ x: 27, y: 26 });
      expect(h.mapEl.querySelector('.walk-hint')?.textContent).toContain(h.ctx.t('content.map.walk.fogAhead', { ap: 1 }));
      expect(h.store.getState()?.mission.ap).toBe(4);
    } finally {
      h.cleanup();
    }
  });

  it('1. Walking with WASD and arrows updates position, camera, and target while respecting collisions and keeping AP intact', () => {
    const h = setupMissionTestHarness('media', 'EA-WALK-01');
    try {
      const initial = h.store.getState()!;
      expect(initial.mission.ap).toBe(4);
      expect(initial.mission.apSpentToday).toBe(0);

      // Starts at (25, 26), just south of the ship at (25, 25), facing south (25, 27)
      expect(h.mapView.walk.getSnapshot().position).toEqual({ x: 25, y: 26 });
      expect(h.mapView.walk.getSnapshot().target).toEqual({ x: 25, y: 27 });
      expect(h.mapEl.querySelector('.walk-avatar')?.getAttribute('style')).toContain('--walk-x: 25');
      expect(h.mapEl.querySelector('.walk-avatar')?.getAttribute('style')).toContain('--walk-y: 26');

      // Pressing W faces north toward the ship (25, 25), which is blocked ('nave')
      h.pressKey('w');
      expect(h.mapView.walk.getSnapshot().position).toEqual({ x: 25, y: 26 });
      expect(h.mapView.walk.getSnapshot().target).toEqual({ x: 25, y: 25 });
      expect(canWalk(initial, { x: 25, y: 25 })).toBe(false);

      // A change of direction aims at the target without taking a step.
      h.pressKey('a');
      expect(h.mapView.walk.getSnapshot().position).toEqual({ x: 25, y: 26 });
      expect(h.mapView.walk.getSnapshot().target).toEqual({ x: 24, y: 26 });
      h.pressKey('a');
      expect(h.mapView.walk.getSnapshot().position).toEqual({ x: 24, y: 26 });
      h.pressKey('s');
      h.pressKey('s');
      expect(h.mapView.walk.getSnapshot().position).toEqual({ x: 24, y: 27 });
      h.pressKey('a');
      // (23, 27) is an uncollected mineral deposit -> collision blocks stepping onto (23, 27)
      expect(h.mapView.walk.getSnapshot().position).toEqual({ x: 24, y: 27 });
      expect(h.mapView.walk.getSnapshot().target).toEqual({ x: 23, y: 27 });

      // Crater at (21, 26), rock at (22, 23), and unexplored fog at (28, 26) are blocked even if explored
      const withRevealed = structuredClone(initial);
      for (const tile of withRevealed.mission.map.tiles) {
        if ((tile.x === 21 && tile.y === 26) || (tile.x === 22 && tile.y === 23)) {
          tile.explored = true;
        }
      }
      expect(canWalk(withRevealed, { x: 21, y: 26 })).toBe(false); // crater
      expect(canWalk(withRevealed, { x: 22, y: 23 })).toBe(false); // roca
      expect(canWalk(initial, { x: 28, y: 26 })).toBe(false); // unexplored fog

      // Arrow keys also move the astronaut
      h.pressKey('ArrowRight');
      h.pressKey('ArrowRight');
      expect(h.mapView.walk.getSnapshot().position).toEqual({ x: 25, y: 27 });

      // Action points remain untouched after walking
      const afterWalk = h.store.getState()!;
      expect(afterWalk.mission.ap).toBe(4);
      expect(afterWalk.mission.apSpentToday).toBe(0);
    } finally {
      h.cleanup();
    }
  });

  it('opens the secret only for fresh keys in order at the lunar corner and keeps the selected crew', () => {
    const h = setupMissionTestHarness('media', 'EA-LUNAR-SECRET');
    const openSecret = vi.mocked(openLunarSecret);
    openSecret.mockClear();
    const press = (keys: string) => { for (const key of keys) h.pressKey(key); };
    try {
      press('wsdada');
      expect(openSecret).not.toHaveBeenCalled();

      const explored = structuredClone(h.store.getState()!);
      for (const tile of explored.mission.map.tiles) {
        if (tile.x >= explored.mission.map.width - 4 && tile.y <= 3) tile.explored = true;
      }
      h.store.load(explored);
      const corner = { x: explored.mission.map.width - 2, y: 1 };
      h.mapView.walk.reset(explored, { x: corner.x, y: 0 });
      h.pressKey('q');
      fakeDocument.body.querySelector('[data-action-focus="crew-1"]')?.click();
      fakeDocument.body.querySelector('.walk-actions-close')?.click();
      expect(h.mapView.walk.getSnapshot()).toMatchObject({ position: corner, crewId: 1 });

      press('wsadad');
      press('w');
      h.pressKey('s', { repeat: true });
      press('dada');
      press('wsd');
      fakeWindow.dispatchEvent(new FakeKeyboardEvent('blur', { key: '' }));
      press('ada');
      press('wsd');
      h.flow.go('pausa');
      h.flow.back();
      press('ada');
      expect(openSecret).not.toHaveBeenCalled();

      const mission = h.store.getState();
      press('wsdad');
      const beforeLastKey = h.mapView.walk.getSnapshot();
      press('a');
      expect(openSecret).toHaveBeenCalledExactlyOnceWith(h.ctx, 'engineer', h.mapEl);
      const secret = fakeDocument.body.querySelector('[data-lunar-secret][open]');
      expect(secret?.getAttribute('aria-modal')).toBe('true');
      expect(h.store.getState()).toBe(mission);
      expect(h.mapView.walk.getSnapshot()).toEqual(beforeLastKey);

      press('wsdada');
      expect(openSecret).toHaveBeenCalledTimes(1);
      expect(h.mapView.walk.getSnapshot()).toEqual(beforeLastKey);
      secret?.querySelector('button')?.click();
      expect(fakeDocument.body.querySelector('[data-lunar-secret]')).toBeNull();
      expect(fakeDocument.activeElement).toBe(h.mapEl);
    } finally {
      h.cleanup();
    }
  });

  it('2. E interaction presents action, cost, readyDay/yield, and blocked reason before confirming, and ignores key repeat', () => {
    const h = setupMissionTestHarness('media', 'EA-INTERACT-01');
    try {
      // At (25, 26) facing (25, 27) flat ground: default contextual action is BUILD Solar panel
      const snap1 = h.mapView.walk.getSnapshot();
      expect(snap1.targetInfo?.primary).toMatchObject({
        action: { type: 'BUILD', building: 'panel', x: 25, y: 27 },
        costMaterials: 6,
        costAp: 1,
        readyDay: 2,
        error: null,
      });
      const hintBtn = h.mapEl.querySelector('.walk-hint-action');
      const hintStatus = h.mapEl.querySelector('.walk-hint-status');
      expect(hintBtn?.textContent).toContain('E Install Solar panel 6 materials, 1 AP');
      expect(hintStatus?.textContent).toContain('Ready on day 2');

      // A build shortcut cannot give the commander access to the engineer's extractor.
      h.pressKey('5');
      const snapBlocked = h.mapView.walk.getSnapshot();
      expect(snapBlocked.targetInfo?.primary?.error?.code).toBe('WRONG_TERRAIN');
      expect(hintBtn?.dataset.blocked).toBe('true');
      expect(hintStatus?.textContent).toContain('Only Engineer can do this');

      // Pressing E while blocked does not spend AP or materials
      h.pressKey('e');
      expect(h.store.getState()?.mission.ap).toBe(4);
      expect(h.store.getState()?.mission.resources.materiales).toBe(40);

      // Switch back to Solar panel ('1'): key repeat (event.repeat === true) must be ignored
      h.pressKey('1');
      h.pressKey('e', { repeat: true });
      expect(h.store.getState()?.mission.buildings).toHaveLength(1); // Only the ship
      expect(h.store.getState()?.mission.ap).toBe(4);

      // Single press of E confirms and places the Solar panel at (25, 27)
      h.pressKey('e', { repeat: false });
      expect(h.store.getState()?.mission.buildings).toHaveLength(2);
      expect(h.store.getState()?.mission.resources.materiales).toBe(34);
      expect(h.store.getState()?.mission.ap).toBe(3);
    } finally {
      h.cleanup();
    }
  });

  it('3. Complete Day 1 sortie from New Game: compares Energy choice vs. Materials choice and verifies Day Report consequences', () => {
    // Route A: Invest Day 1 action in Energy (install Solar panel at (25, 27))
    const energyRun = setupMissionTestHarness('media', 'EA-CHOICE-CMP');
    let energyDay1Materials = 0;
    let energyDay1ReportText = '';
    let energyDay2Generated = 0;
    try {
      expect(energyRun.mapView.walk.getSnapshot().position).toEqual({ x: 25, y: 26 });
      energyRun.pressKey('e'); // Build Solar panel at (25, 27)
      const afterBuild = energyRun.store.getState()!;
      expect(afterBuild.mission.resources.materiales).toBe(34);
      expect(afterBuild.mission.buildings.at(-1)).toMatchObject({
        type: 'panel',
        x: 25,
        y: 27,
        placedDay: 1,
        operationalFromDay: 2,
      });

      // End Day 1 with F
      energyRun.pressKey('f');
      expect(energyRun.store.getState()?.mission.phase).toBe('report');

      const reportCleanup = mountDayReport(energyRun.uiEl as unknown as HTMLElement, energyRun.ctx);
      energyDay1ReportText = energyRun.uiEl.textContent;
      energyDay1Materials = energyRun.store.getState()!.mission.resources.materiales;
      expect(energyDay1ReportText).toMatch(/34\s*Materials/);
      expect(energyDay1ReportText).toContain('Solar panel · Ready on day 2');

      // Acknowledge Day 1 report and close Day 2 to verify operationalFromDay = 2 power generation
      energyRun.uiEl.querySelector('.btn-primary')?.click();
      reportCleanup();
      expect(energyRun.store.getState()?.mission.day).toBe(2);
      energyRun.pressKey('f');
      energyDay2Generated = energyRun.store.getState()!.mission.lastReport!.energy.generated;
      expect(energyDay2Generated).toBe(8);
    } finally {
      energyRun.cleanup();
    }

    // Route B: Invest Day 1 action in Materials (walk to (24, 27) and collect mineral at (23, 27))
    const materialsRun = setupMissionTestHarness('media', 'EA-CHOICE-CMP');
    try {
      materialsRun.pressKey('a'); // face west
      materialsRun.pressKey('a'); // (24, 26)
      materialsRun.pressKey('s'); // face south
      materialsRun.pressKey('s'); // (24, 27)
      materialsRun.pressKey('a'); // face (23, 27) mineral
      expect(materialsRun.mapView.walk.getSnapshot().target).toEqual({ x: 23, y: 27 });
      expect(materialsRun.mapView.walk.getSnapshot().targetInfo?.primary).toMatchObject({
        action: { type: 'COLLECT', x: 23, y: 27 },
        costAp: 1,
        yieldMaterials: 15,
      });

      materialsRun.pressKey('e'); // Collect mineral at (23, 27)
      const afterCollect = materialsRun.store.getState()!;
      expect(afterCollect.mission.resources.materiales).toBe(55);
      expect(afterCollect.mission.buildings).toHaveLength(1); // Only the ship
      // Once collected, (23, 27) is walkable flat ground
      expect(canWalk(afterCollect, { x: 23, y: 27 })).toBe(true);

      // End Day 1 with F
      materialsRun.pressKey('f');
      expect(materialsRun.store.getState()?.mission.phase).toBe('report');

      const reportCleanup = mountDayReport(
        materialsRun.uiEl as unknown as HTMLElement,
        materialsRun.ctx,
      );
      const materialsDay1ReportText = materialsRun.uiEl.textContent;
      expect(materialsDay1ReportText).toMatch(/55\s*Materials/);
      expect(materialsDay1ReportText).not.toContain('Solar panel · Ready on day 2');

      // Acknowledge Day 1 report and close Day 2: no solar panel built, so generated is 0
      materialsRun.uiEl.querySelector('.btn-primary')?.click();
      reportCleanup();
      materialsRun.pressKey('f');
      const materialsDay2Generated =
        materialsRun.store.getState()!.mission.lastReport!.energy.generated;
      expect(materialsDay2Generated).toBe(0);

      // Verify the state divergence between the two choices
      expect(afterCollect.mission.resources.materiales).toBeGreaterThan(energyDay1Materials);
      expect(energyDay2Generated).toBeGreaterThan(materialsDay2Generated);
    } finally {
      materialsRun.cleanup();
    }
  });

  it('4. Repairs a damaged building with E only after selecting engineering', () => {
    const h = setupMissionTestHarness('media', 'EA-REPAIR-01');
    try {
      const base = fixtureState('media-dia-1');
      base.mission.buildings.push({
        id: 2,
        type: 'panel',
        x: 25,
        y: 27,
        placedDay: 1,
        operationalFromDay: 1,
        enabled: true,
        damaged: true,
        growth: 0,
        stress: 0,
      });
      h.store.load(base);
      h.pressKey('e');
      expect(h.store.getState()!.mission.buildings.at(-1)?.damaged).toBe(true);
      h.pressKey('q');
      fakeDocument.body.querySelector('[data-action-focus="crew-1"]')?.click();
      fakeDocument.body.querySelector('.walk-actions-close')?.click();

      // Astronaut at (25, 26) facing (25, 27) sees the damaged Solar panel
      const snap = h.mapView.walk.getSnapshot();
      expect(snap.targetInfo?.primary).toMatchObject({
        action: { type: 'REPAIR', buildingId: 2 },
        costMaterials: data.constants.repairCost ?? 2,
        costAp: 1,
        error: null,
      });
      expect(h.mapEl.querySelector('.walk-hint-action')?.textContent).toContain(
        'E Repair Solar panel 2 materials, 1 AP',
      );

      const matsBefore = h.store.getState()!.mission.resources.materiales;
      const apBefore = h.store.getState()!.mission.ap;
      h.pressKey('e');

      const repaired = h.store.getState()!;
      expect(repaired.mission.buildings.find((b) => b.id === 2)?.damaged).toBe(false);
      expect(repaired.mission.resources.materiales).toBe(matsBefore - (data.constants.repairCost ?? 2));
      expect(repaired.mission.ap).toBe(apBefore - 1);
    } finally {
      h.cleanup();
    }
  });

  it('shows only the selected lunar specialty and stops other roles at the map click entry point', () => {
    const h = setupMissionTestHarness('media', 'EA-ROLES-01');
    try {
      h.pressKey('q');
      const expected = [
        ['panel', 'bateria', 'SCAN'],
        ['generador', 'reciclador'],
        ['invernadero', 'laboratorio'],
        ['refugio'],
      ];
      for (const [id, actions] of expected.entries()) {
        fakeDocument.body.querySelector(`[data-action-focus="crew-${id}"]`)?.click();
        const buttons = fakeDocument.body.querySelectorAll('.walk-action-option');
        expect(buttons.map((button) => button.dataset.actionFocus)).toEqual(actions);
      }
      fakeDocument.body.querySelector('.walk-actions-close')?.click();
      h.pressKey('1');
      h.mapEl.querySelector('[data-x="25"][data-y="27"]')?.click();
      expect(h.store.getState()?.mission.buildings).toHaveLength(1);
      expect(h.store.getState()?.mission.ap).toBe(4);
      expect(h.mapEl.querySelector('.walk-hint-status')?.textContent).toContain('Switch crew with Q');
    } finally {
      h.cleanup();
    }
  });

  it('5. Opens Mission Journal with M (presenting active objective, deadlines, and progress) and yields priority to modals and pause', () => {
    const h = setupMissionTestHarness('media', 'EA-JOURNAL-01');
    try {
      expect(h.mapView.walk.getSnapshot().journalOpen).toBe(false);

      // Press M to open Mission Journal
      h.pressKey('m');
      expect(h.mapView.walk.getSnapshot().journalOpen).toBe(true);
      const journalDialog = fakeDocument.body.querySelector('[data-panel="journal"]');
      expect(journalDialog).not.toBeNull();
      expect(h.mapEl.contains(journalDialog)).toBe(false);
      expect(journalDialog?.getAttribute('role')).toBe('dialog');
      expect(journalDialog?.getAttribute('aria-modal')).toBe('true');

      const journalData = buildMissionJournalData(h.ctx, h.store.getState()!);
      expect(journalData.activeObjective?.id).toBe('soporte');
      expect(journalData.windowText).toContain('Day 1 of 20');
      expect(journalData.earthDeadlineText).toContain('54 days');
      expect(journalDialog?.textContent).toContain(journalData.activeObjectiveText);
      expect(journalDialog?.textContent).toContain(journalData.windowText);
      expect(journalDialog?.textContent).toContain(journalData.earthDeadlineText);

      // While Journal modal is open, WASD and E do not move the astronaut or spend AP
      h.pressKey('a');
      h.pressKey('e');
      expect(h.mapView.walk.getSnapshot().position).toEqual({ x: 25, y: 26 });
      expect(h.store.getState()?.mission.ap).toBe(4);

      // Press M again to close Mission Journal
      h.pressKey('m');
      expect(h.mapView.walk.getSnapshot().journalOpen).toBe(false);
      expect(fakeDocument.body.querySelector('[data-panel="journal"]')).toBeNull();

      // While in Pause scene, WASD and E do not move the astronaut
      h.pressKey('p');
      expect(h.flow.current().scene).toBe('pausa');
      h.pressKey('a');
      h.pressKey('e');
      expect(h.mapView.walk.getSnapshot().position).toEqual({ x: 25, y: 26 });
      expect(h.store.getState()?.mission.ap).toBe(4);

      // Escape resumes mission from pause
      h.pressKey('Escape');
      expect(h.flow.current().scene).toBe('mision');
      h.pressKey('a');
      h.pressKey('a');
      expect(h.mapView.walk.getSnapshot().position).toEqual({ x: 24, y: 26 });
    } finally {
      h.cleanup();
    }
  });

  it('migrates a legacy 12×12 lunar save without losing progress', () => {
    const storage = createMemoryStorage();
    const current = fixtureState('media-dia-1');
    // Rebuild the save as it looked before the map grew: a 12×12 board with the ship at (5, 5).
    const legacy = JSON.parse(JSON.stringify(current)) as typeof current;
    legacy.mission.map = {
      width: 12,
      height: 12,
      tiles: current.mission.map.tiles
        .filter((t) => t.x >= 20 && t.x < 32 && t.y >= 20 && t.y < 32)
        .map((t) => ({ ...t, x: t.x - 20, y: t.y - 20 })),
    };
    legacy.mission.buildings = legacy.mission.buildings.map((b) => ({ ...b, x: b.x - 20, y: b.y - 20 }));
    legacy.mission.resources.materiales = 31;
    legacy.mission.map.tiles[7 * 12 + 3].collected = true;
    legacy.mission.discoveries = ['misterio-9-1'];
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(serialize(legacy)));
    const loaded = createPersistenceService(storage).loadCampaign(data);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    const { map, buildings, resources, discoveries } = loaded.state.mission;
    expect([map.width, map.height]).toEqual([73, 73]);
    expect(map.tiles[27 * map.width + 23]).toMatchObject({ collected: true, x: 23, y: 27 });
    expect(map.tiles[27 * map.width + 32]).toMatchObject({ explored: false, x: 32, y: 27 });
    expect(buildings).toEqual(current.mission.buildings);
    expect(buildings[0]).toMatchObject({ type: 'nave', x: 25, y: 25 });
    expect(discoveries).toEqual(['misterio-29-21']);
    expect(resources.materiales).toBe(31);
  });

  it('migrates a 30×28 lunar save into the expanded map', () => {
    const storage = createMemoryStorage();
    const current = fixtureState('media-dia-1');
    const legacy = JSON.parse(JSON.stringify(current)) as typeof current;
    legacy.mission.map = {
      width: 30,
      height: 28,
      tiles: current.mission.map.tiles
        .filter((t) => t.x >= 20 && t.x < 50 && t.y >= 20 && t.y < 48)
        .map((t) => ({ ...t, x: t.x - 20, y: t.y - 20 })),
    };
    legacy.mission.buildings = legacy.mission.buildings.map((b) => ({ ...b, x: b.x - 20, y: b.y - 20 }));
    legacy.mission.map.tiles[5 * 30 + 13].explored = true;
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(serialize(legacy)));
    const loaded = createPersistenceService(storage).loadCampaign(data);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    const { map, buildings } = loaded.state.mission;
    expect([map.width, map.height]).toEqual([73, 73]);
    expect(map.tiles[25 * map.width + 33]).toMatchObject({ explored: true, x: 33, y: 25 });
    expect(buildings).toEqual(current.mission.buildings);
  });

  it.each([['luna', 51, 73], ['marte', 20, 81]] as const)(
    'expands a %s save with the original coordinates and progress intact', (level, oldSize, newSize) => {
      const storage = createMemoryStorage();
      const transition = level === 'marte'
        ? applyTransition(runPlan('media', MEDIA_PLAN, data).finalState, 'luna->marte', data) : null;
      if (transition && !transition.ok) throw new Error('Expected a valid Mars arrival');
      const state = transition?.state ?? fixtureState('media-dia-1');
      const tiles = state.mission.map.tiles.filter(({ x, y }) => x < oldSize && y < oldSize);
      const deposit = tiles.find((tile) => tile.terrain === 'mineral')!;
      deposit.explored = deposit.collected = true;
      state.mission.map = { width: oldSize, height: oldSize, tiles };
      const buildings = state.mission.buildings;
      storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(serialize(state)));
      const loaded = createPersistenceService(storage).loadCampaign(data);
      expect(loaded.ok).toBe(true);
      if (!loaded.ok) return;
      expect(loaded.state.mission.map).toMatchObject({ width: newSize, height: newSize });
      expect(loaded.state.mission.map.tiles[deposit.y * newSize + deposit.x]).toEqual(deposit);
      expect(loaded.state.mission.buildings).toEqual(buildings);
    },
  );

  it('6. Continues working after serializing, saving, and reloading an existing save', () => {
    const h1 = setupMissionTestHarness('media', 'EA-SAVE-01');
    let savedData!: ReturnType<typeof serialize>;
    try {
      // Build Solar panel at (25, 27) and collect mineral at (23, 27)
      h1.pressKey('e'); // Build panel at (25, 27): 40 - 6 = 34 materials, 3 AP left
      h1.pressKey('a'); // face west
      h1.pressKey('a'); // (24, 26)
      h1.pressKey('s'); // face south
      h1.pressKey('s'); // (24, 27)
      h1.pressKey('a'); // face (23, 27)
      h1.pressKey('e'); // Collect mineral at (23, 27): 34 + 15 = 49 materials, 2 AP left

      const stateBeforeSave = h1.store.getState()!;
      expect(stateBeforeSave.mission.resources.materiales).toBe(49);
      expect(stateBeforeSave.mission.ap).toBe(2);
      savedData = serialize(stateBeforeSave);
    } finally {
      h1.cleanup();
    }

    // Reload save into a fresh session
    const h2 = setupMissionTestHarness('media', 'EA-SAVE-02');
    try {
      const loaded = deserialize(savedData, data);
      expect(loaded.ok).toBe(true);
      if (!loaded.ok) return;
      h2.store.load(loaded.state);

      // Verify state restored and astronaut can walk, open journal, explore fog, and end the day
      expect(h2.store.getState()?.mission.resources.materiales).toBe(49);
      expect(h2.store.getState()?.mission.ap).toBe(2);
      expect(h2.mapView.walk.getSnapshot().position).toEqual({ x: 25, y: 26 });

      // Walk east to (27, 26) facing unexplored fog at (28, 26) and explore with E
      h2.pressKey('d'); // face east
      h2.pressKey('d'); // (26, 26)
      h2.pressKey('d'); // (27, 26) facing (28, 26)
      expect(inspectWalkTarget(h2.ctx, h2.store.getState()!, { x: 27, y: 26 }, { x: 1, y: 0 }).primary?.action).toEqual({
        type: 'EXPLORE',
        x: 28,
        y: 26,
      });
      h2.pressKey('e');
      expect(h2.store.getState()?.mission.ap).toBe(1);

      // End day with F
      h2.pressKey('f');
      expect(h2.store.getState()?.mission.phase).toBe('report');
      expect(h2.store.getState()?.mission.lastReport?.day).toBe(1);
    } finally {
      h2.cleanup();
    }
  });
});

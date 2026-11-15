// AI-assisted: Claude Code (claude-opus-5-5), Antigravity (Gemini). Human review by C pending.
// Mission design screen, between choosing the difficulty and the launch from Earth. The player
// picks the mission objective, the launch vehicle, the trajectory (with visible orbital window
// and travel time), the spacecraft cabin module, the communications antenna and the payload
// (supplies, science instruments and crew equipment) within a budget and the rocket's mass capacity.
// It shows live what each choice costs and does; the rules live in src/core/design.ts.
import type { AppContext, Screen } from '../app-bridge';
import {
  COMMS,
  DEFAULT_DESIGN,
  DESIGN_OBJECTIVES,
  designTrajectoryDays,
  evaluateDesign,
  launchWithDesign,
  PAYLOAD,
  ROCKETS,
  SHIPS,
  TRAJECTORIES,
  type CommsId,
  type DesignObjectiveId,
  type MissionDesign,
  type PayloadId,
  type RocketId,
  type ShipId,
  type TrajectoryId,
} from '../../core/design';
import { button } from '../components/button';
import { bindChrome, press, showNarrow } from '../chrome';
import { cleaner, el, on } from '../dom';
import { antennaDescription, objectiveGoal, payloadEffect } from '../design-copy';

let cleanup: (() => void) | null = null;

export const designScreen: Screen = {
  mount(root, ctx) {
    cleanup = mountDesign(root, ctx);
  },
  unmount() {
    cleanup?.();
    cleanup = null;
  },
};

const ICON: Record<string, string> = {
  autosuficiente: '🏠', hielo: '🧊', solar: '☀️',
  ligero: '🚀', medio: '🚀', pesado: '🚀',
  economica: '🌙', estandar: '🛰️', rapida: '⚡',
  'ship:pequena': '🛸', 'ship:estandar': '🏠', 'ship:grande': '🏗️',
  'comms:estandar': '📻', 'comms:alta': '📡',
  oxigeno: '🫧', agua: '💧', alimentos: '🥫', materiales: '🧱', bateria: '🔋',
  espectrometro: '🔬', sensor: '☢', herramientas: '🧰', taladro: '⛏', exotraje: '🧑‍🚀',
};

/** Remembered while the page is open, so going back and forth keeps the player's choices. */
let lastDesign: MissionDesign = { ...DEFAULT_DESIGN, payload: [] };

function mountDesign(root: HTMLElement, ctx: AppContext): () => void {
  const bag = cleaner();
  const screen = el('section', 'screen screen-menu design-screen');
  root.append(screen);
  bag.add(bindChrome(ctx));
  bag.add(showNarrow(screen, ctx));
  bag.add(() => screen.remove());
  const table = ctx.data.missionDesign;
  const base = document.querySelector('.presentation-shield') ? DEFAULT_DESIGN : lastDesign;
  let design: MissionDesign = { ...DEFAULT_DESIGN, ...base, payload: [...base.payload] };
  let launched = false;

  const t = (key: string, params?: Record<string, string | number>): string => ctx.t(`ui.design.${key}`, params);

  function choice<T extends string>(
    group: string, id: T, selected: boolean, detail: string, onPick: () => void, description: string, multi = false,
  ): HTMLButtonElement {
    const card = el('button', `design-card${selected ? ' is-selected' : ''}`);
    card.type = 'button';
    card.dataset.design = `${group}:${id}`;
    card.setAttribute(multi ? 'aria-pressed' : 'aria-checked', String(selected));
    if (!multi) card.setAttribute('role', 'radio');
    const icon = el('span', 'design-icon', ICON[`${group}:${id}`] ?? ICON[id] ?? '•');
    icon.setAttribute('aria-hidden', 'true');
    card.append(icon, el('strong', undefined, t(`${group}.${id}.name`)), el('span', 'design-detail', detail),
      el('span', 'design-desc', description));
    card.addEventListener('click', press(ctx, onPick));
    return card;
  }

  function section(titleKey: string, cards: HTMLElement[], radio = true, noteKey?: string): HTMLElement {
    const block = el('section', 'design-section');
    const heading = el('h2', undefined, t(titleKey));
    const row = el('div', 'design-row');
    if (radio) {
      row.setAttribute('role', 'radiogroup');
      row.setAttribute('aria-label', heading.textContent ?? '');
    }
    row.append(...cards);
    block.append(heading);
    if (noteKey) block.append(el('p', 'design-orbital', t(noteKey)));
    block.append(row);
    return block;
  }

  function meter(labelKey: string, value: number, max: number, over: boolean): HTMLElement {
    const box = el('div', `design-meter${over ? ' is-over' : ''}`);
    const label = el('span', 'design-meter-label', t(labelKey, { value, max }));
    const bar = el('span', 'design-meter-bar');
    bar.setAttribute('role', 'meter');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', String(max));
    bar.setAttribute('aria-valuenow', String(value));
    bar.setAttribute('aria-label', label.textContent ?? '');
    const fill = el('span', 'design-meter-fill');
    fill.style.setProperty('--share', String(max > 0 ? Math.min(1, value / max) : 0));
    bar.append(fill);
    box.append(label, bar);
    return box;
  }

  const paint = (): void => {
    const focusKey = (document.activeElement as HTMLElement | null)?.dataset?.design;
    const scroll = screen.scrollTop;
    screen.replaceChildren();
    if (!table) {
      screen.append(el('p', undefined, t('unavailable')));
      return;
    }
    const state = ctx.store.getState();
    const difficulty = state?.campaign.difficulty ?? 'media';
    const check = evaluateDesign(design, difficulty, ctx.data);

    const head = el('header', 'design-head');
    head.append(el('h1', 'screen-title', t('heading')), el('p', 'design-intro', t('intro')));

    const objective = section('objective', DESIGN_OBJECTIVES.map((id: DesignObjectiveId) =>
      choice('objective', id, design.objective === id, objectiveGoal(ctx, id), () => { design.objective = id; paint(); }, t(`objective.${id}.desc`))));
    const rocket = section('rocket', ROCKETS.map((id: RocketId) => {
      const r = table.rockets[id];
      return choice('rocket', id, design.rocket === id, t('rocketDetail', { capacity: r.capacity, cost: r.cost }),
        () => { design.rocket = id; paint(); }, t(`rocket.${id}.desc`));
    }));
    const trajectory = section('trajectory', TRAJECTORIES.map((id: TrajectoryId) => {
      const tr = table.trajectories[id];
      const days = state ? designTrajectoryDays({ ...state.campaign, design: { ...design, trajectory: id } }, ctx.data) : tr.earthDays;
      const detail = t(tr.travelDays === undefined || tr.windowDays === undefined ? 'trajectoryDetailLegacy' : 'trajectoryDetail', {
        cost: tr.cost,
        days,
        travel: tr.travelDays ?? '',
        window: tr.windowDays ?? '',
      });
      return choice('trajectory', id, design.trajectory === id, detail,
        () => { design.trajectory = id; paint(); }, t(`trajectory.${id}.desc`));
    }), true, 'orbitalNote');
    const shipId = design.ship ?? 'pequena';
    const ship = section('ship', SHIPS.map((id: ShipId) => {
      const s = table.ships?.[id] ?? { mass: 0, cost: 0, storage: 0 };
      return choice('ship', id, shipId === id, t('shipDetail', { mass: s.mass, cost: s.cost, storage: s.storage }),
        () => { design.ship = id; paint(); }, t(`ship.${id}.desc`));
    }));
    const commsId = design.comms ?? 'estandar';
    const comms = section('comms', COMMS.map((id: CommsId) => {
      const c = table.comms?.[id] ?? { mass: 0, cost: 0, forecast: 0 };
      return choice('comms', id, commsId === id, t('commsDetail', { mass: c.mass, cost: c.cost }),
        () => { design.comms = id; paint(); }, t(`comms.${id}.desc`, antennaDescription(ctx.data, c.forecast)));
    }));

    const groups = (['supply', 'instrument', 'crew'] as const).map((kind) => {
      const items = PAYLOAD.filter((id) => table.payload[id].kind === kind);
      return section(`group.${kind}`, items.map((id: PayloadId) => {
        const item = table.payload[id];
        const on = design.payload.includes(id);
        return choice('payload', id, on, t('itemDetail', { mass: item.mass, cost: item.cost }), () => {
          design.payload = on ? design.payload.filter((p) => p !== id) : [...design.payload, id];
          paint();
        }, payloadEffect(ctx, id), true);
      }), false);
    });

    const left = el('div', 'design-column');
    left.append(objective, rocket, trajectory, ship);
    const right = el('div', 'design-column');
    right.append(comms, ...groups);
    const body = el('div', 'design-body');
    body.append(left, right);

    const meters = el('div', 'design-meters');
    meters.append(
      meter('budget', check.cost, check.budget, check.problem === 'budget'),
      meter('mass', check.mass, check.capacity, check.problem === 'mass'),
    );
    const status = el('p', `design-status${check.problem ? ' is-problem' : ''}`,
      check.problem ? t(`problem.${check.problem}`) : t('ready'));
    status.setAttribute('role', 'status');
    const back = button({ label: t('back'), onClick: press(ctx, () => ctx.flow.go('dificultad')) });
    const go = button({ label: t('launch'), className: 'btn-primary design-launch', onClick: press(ctx, launch, 'sfx-confirm') });
    go.disabled = Boolean(check.problem);
    const actions = el('div', 'design-actions');
    actions.append(back, go);
    const foot = el('footer', 'design-foot');
    foot.append(meters, status, el('p', 'design-note', t('note')), actions);

    screen.append(head, body, foot);
    screen.scrollTop = scroll;
    const again = focusKey ? screen.querySelector<HTMLElement>(`[data-design="${focusKey}"]`) : null;
    (again ?? screen.querySelector<HTMLElement>('.design-card.is-selected'))?.focus({ preventScroll: true });
  };

  function launch(): void {
    if (launched) return;
    const state = ctx.store.getState();
    if (!state) return;
    const next = launchWithDesign(state, design, ctx.data);
    if (!next) return;
    launched = true;
    lastDesign = { ...design, payload: [...design.payload] };
    ctx.store.replaceState(next);
    ctx.flow.go('cinematica', { id: 'opening' });
  }

  bag.add(on(screen, 'keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      ctx.flow.go('dificultad');
    }
  }));
  paint();
  screen.scrollTop = 0;
  bag.add(ctx.options.subscribe(() => { if (!launched) paint(); }));
  ctx.audio.playMusic('music-menu');
  return () => bag.run();
}

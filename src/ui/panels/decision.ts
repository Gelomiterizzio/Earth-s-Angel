// AI-assisted: Cursor (Composer) and OpenAI Codex. Human review of the integrated layout pending.
import type { AppContext } from '../../app/context';
import { designSuitShield } from '../../core/design';
import { previewEnergy } from '../../core/index';
import { getOperationalShelterSeats } from '../../core/radiation';
import { describeSepRecord, findSepRecord } from '../../data/nasa/adapter';
import type { RadiationLevel, ScheduledEvent } from '../../core/types';

function levelLabel(ctx: AppContext, level: RadiationLevel): string {
  if (level === 1) return ctx.t('content.decision.levelModerate');
  if (level === 2) return ctx.t('content.decision.levelSevere');
  return '';
}

function activeStorm(state: NonNullable<ReturnType<AppContext['store']['getState']>>): ScheduledEvent | null {
  const day = state.mission.day;
  return (
    state.mission.schedule.find(
      (e) =>
        e.type === 'tormenta-solar' &&
        e.startDay <= day &&
        day < e.startDay + e.durationDays,
    ) ?? null
  );
}

function trapFocus(dialog: HTMLElement, e: KeyboardEvent): void {
  if (e.key !== 'Tab') return;
  const focusable = dialog.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    last.focus();
    e.preventDefault();
  } else if (!e.shiftKey && document.activeElement === last) {
    first.focus();
    e.preventDefault();
  }
}

/**
 * Modal storm decision panel. Mount when mission.phase === 'decision'.
 * Returns cleanup.
 */
export function mountDecisionPanel(root: HTMLElement, ctx: AppContext): () => void {
  const host = document.createElement('div');
  host.className = 'panel-decision';
  root.appendChild(host);

  let unsub: (() => void) | null = null;
  let keyHandler: ((e: KeyboardEvent) => void) | null = null;

  const render = (): void => {
    const state = ctx.store.getState();
    host.innerHTML = '';
    if (!state || state.mission.phase !== 'decision') {
      host.hidden = true;
      if (keyHandler) {
        window.removeEventListener('keydown', keyHandler);
        keyHandler = null;
      }
      return;
    }
    host.hidden = false;

    const storm = activeStorm(state);
    const rad = (storm?.radiationLevel ?? 0) as RadiationLevel;
    const sourceRef = storm?.sourceRef;
    const record =
      sourceRef && sourceRef !== 'SYNTHETIC' ? findSepRecord(sourceRef) : null;
    const isSynthetic = !record || sourceRef === 'SYNTHETIC';

    const cfg = ctx.data.difficulty[state.campaign.difficulty].levels[state.mission.level];
    const shelterEnergy = cfg?.shelterEnergy ?? 0;
    const energyPreview = previewEnergy(state, ctx.data);
    const band = rad > 0 ? ctx.data.constants.exposure[String(rad) as '1' | '2'] : null;
    const shelteredExp = band?.sheltered ?? 0;
    const unshelteredExp = Math.max(0, (band?.unsheltered ?? 0) - designSuitShield(state.campaign, ctx.data));

    const hasShelter = getOperationalShelterSeats(state.mission.buildings, state.mission.day, ctx.data) > 0;
    const canShelter = hasShelter && energyPreview.shelterAffordable;
    const energyOnHand = state.mission.resources.energia + energyPreview.generated;
    let shelterDisabledReason = '';
    if (!hasShelter) shelterDisabledReason = ctx.t('content.decision.noShelter');
    else if (!energyPreview.shelterAffordable) {
      shelterDisabledReason = ctx.t('content.decision.needEnergy', {
        need: Math.max(0, shelterEnergy - energyOnHand),
      });
    }

    const dialog = document.createElement('div');
    dialog.className = 'dialog decision-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'decision-title');
    dialog.tabIndex = -1;

    const title = document.createElement('h2');
    title.id = 'decision-title';
    title.tabIndex = -1;
    title.textContent = ctx.t('content.decision.title');
    dialog.appendChild(title);

    const level = document.createElement('p');
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = rad === 2 ? '✖ ' : '▲ ';
    level.append(icon, document.createTextNode(levelLabel(ctx, rad)));
    dialog.appendChild(level);

    const nasaBlock = document.createElement('section');
    nasaBlock.className = 'decision-data decision-data-nasa';
    nasaBlock.setAttribute('aria-label', ctx.t('content.decision.nasaBlockLabel'));
    const nasaLabel = document.createElement('strong');
    nasaLabel.textContent = ctx.t('content.decision.nasaBlockLabel');
    nasaBlock.appendChild(nasaLabel);

    if (isSynthetic) {
      const p = document.createElement('p');
      p.textContent = ctx.t('content.decision.testDataNotice');
      nasaBlock.appendChild(p);
    } else if (record) {
      const d = describeSepRecord(record);
      const lines = document.createElement('ul');
      lines.className = 'goal-list';
      const dateStr = d.dateISO.slice(0, 10);
      const items: string[] = [
        `${ctx.t('content.decision.idLabel')}: ${d.id}`,
        `${dateStr}`,
        d.flareClass
          ? `${ctx.t('content.decision.flareLabel')}: ${d.flareClass}`
          : '',
        d.activeRegion != null
          ? `${ctx.t('content.decision.regionLabel')}: ${d.activeRegion}`
          : '',
        `${ctx.t('content.decision.instrumentLabel')}: ${d.instrument}`,
        d.leadMinutes != null
          ? `${ctx.t('content.decision.leadLabel')}: ${d.leadMinutes}`
          : '',
      ].filter(Boolean);
      for (const text of items) {
        const li = document.createElement('li');
        li.textContent = text;
        lines.appendChild(li);
      }
      nasaBlock.appendChild(lines);
      const link = document.createElement('a');
      link.href = d.link;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = ctx.t('content.decision.linkLabel');
      nasaBlock.appendChild(link);
      const notice = document.createElement('p');
      notice.textContent = ctx.t('content.decision.archivedNotice');
      nasaBlock.appendChild(notice);
    }
    dialog.appendChild(nasaBlock);

    const gameBlock = document.createElement('section');
    gameBlock.className = 'decision-data decision-data-game';
    gameBlock.setAttribute('aria-label', ctx.t('content.decision.gameBlockLabel'));
    const gameLabel = document.createElement('strong');
    gameLabel.textContent = ctx.t('content.decision.gameBlockLabel');
    gameBlock.appendChild(gameLabel);
    const expP = document.createElement('p');
    expP.textContent = `${ctx.t('content.decision.exposureWith', { n: shelteredExp })} · ${ctx.t('content.decision.exposureWithout', { n: unshelteredExp })}`;
    gameBlock.appendChild(expP);
    dialog.appendChild(gameBlock);

    const actions = document.createElement('div');
    actions.className = 'decision-actions';

    const shelterBtn = document.createElement('button');
    shelterBtn.className = 'btn btn-primary';
    shelterBtn.type = 'button';
    shelterBtn.textContent = `${ctx.t('content.decision.shelterBtn')} — ${ctx.t('content.decision.shelterCost', {
      energy: shelterEnergy,
      exposure: shelteredExp,
    })}`;
    shelterBtn.disabled = !canShelter;
    if (shelterDisabledReason) {
      shelterBtn.title = shelterDisabledReason;
      const reason = document.createElement('span');
      reason.className = 'decision-reason';
      reason.textContent = shelterDisabledReason;
      actions.appendChild(reason);
    }
    shelterBtn.addEventListener('click', () => {
      ctx.audio.unlock();
      ctx.audio.playSfx('sfx-confirm');
      const r = ctx.store.dispatch({
        type: 'DECIDE_SHELTER',
        shelter: true,
        day: state.mission.day,
      });
      if (!r.ok) status.textContent = ctx.t(r.error.messageKey, r.error.params);
    });

    const workBtn = document.createElement('button');
    workBtn.className = 'btn';
    workBtn.type = 'button';
    workBtn.textContent = `${ctx.t('content.decision.workBtn')} — ${ctx.t('content.decision.workCost', {
      ap: state.mission.ap,
      exposure: unshelteredExp,
    })}`;
    workBtn.addEventListener('click', () => {
      ctx.audio.unlock();
      ctx.audio.playSfx('sfx-confirm');
      const r = ctx.store.dispatch({
        type: 'DECIDE_SHELTER',
        shelter: false,
        day: state.mission.day,
      });
      if (!r.ok) status.textContent = ctx.t(r.error.messageKey, r.error.params);
    });

    actions.appendChild(shelterBtn);
    actions.appendChild(workBtn);
    dialog.appendChild(actions);

    const status = document.createElement('p');
    status.className = 'decision-status';
    status.setAttribute('aria-live', 'assertive');
    dialog.appendChild(status);

    const compare = document.createElement('p');
    compare.textContent = ctx.t('content.decision.compareShelter', {
      with: shelteredExp,
      without: unshelteredExp,
    });
    dialog.appendChild(compare);

    host.appendChild(dialog);
    title.focus();

    if (keyHandler) window.removeEventListener('keydown', keyHandler);
    keyHandler = (e: KeyboardEvent) => {
      if (host.hidden) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      trapFocus(dialog, e);
    };
    window.addEventListener('keydown', keyHandler);
  };

  unsub = ctx.store.subscribe(() => render());
  const unsubOptions = ctx.options.subscribe(() => render());
  render();

  return () => {
    unsub?.();
    unsubOptions();
    if (keyHandler) window.removeEventListener('keydown', keyHandler);
    host.remove();
  };
}

/** Forecast copy keys for HUD (C). */
export const FORECAST_KEYS = {
  stormIn2: 'content.event.tormenta-solar.forecast2',
  stormIn1: 'content.event.tormenta-solar.forecast1',
  shadowIn2: 'content.event.sombra.forecast2',
  shadowIn1: 'content.event.sombra.forecast1',
} as const;

// AI-assisted: Antigravity (Gemini), reviewed by A

import type { BuildingType } from '../core/types';
import type { AppContext } from './context';

const BUILDING_SLOTS: BuildingType[] = [
  'panel',
  'bateria',
  'generador',
  'reciclador',
  'extractor',
  'invernadero',
  'refugio',
];

function isTextOrSliderFocused(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

function isModalOpen(): boolean {
  if (typeof document === 'undefined') return false;
  return document.querySelector('[role="dialog"][aria-modal="true"]') !== null;
}

export function bindGlobalInput(ctx: AppContext): () => void {
  if (typeof window === 'undefined') return () => {};

  function onKeyDown(e: KeyboardEvent): void {
    ctx.audio.unlock();
    if (e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.repeat) return;
    if (isTextOrSliderFocused(e.target)) return;

    const scene = ctx.flow.current().scene;

    if (
      scene === 'mision' &&
      ctx.uiStore.getState().openPanel === 'journal' &&
      (e.key === 'Escape' || e.key.toLowerCase() === 'm')
    ) {
      ctx.uiStore.openPanel(null);
      e.preventDefault();
      return;
    }

    if (scene === 'cinematica' && e.key === 'Enter') {
      const id = String(ctx.flow.current().params.id ?? 'opening');
      ctx.flow.completeCinematic(id);
      e.preventDefault();
      return;
    }

    if (e.key === 'Escape') {
      if (isModalOpen()) return;
      if (scene === 'mision') {
        const ui = ctx.uiStore.getState();
        if (ui.openPanel) {
          ctx.uiStore.openPanel(null);
          e.preventDefault();
          return;
        }
        if (ui.tool.kind !== 'inspect') {
          ctx.uiStore.setTool({ kind: 'inspect' });
          e.preventDefault();
          return;
        }
        ctx.flow.go('pausa');
        e.preventDefault();
        return;
      }
      if (scene === 'pausa' || scene === 'opciones') {
        ctx.flow.back();
        e.preventDefault();
        return;
      }
    }

    if (isModalOpen()) return;
    if (scene !== 'mision') return;

    const state = ctx.store.getState();
    if (!state || state.mission.phase !== 'planning') return;

    const key = e.key.toLowerCase();
    if (key === 'p') {
      ctx.flow.go('pausa');
      e.preventDefault();
    } else if (key === 'c') {
      ctx.uiStore.setTool({ kind: 'collect' });
      e.preventDefault();
    } else if (key === 'h' || e.key === '?') {
      const currentPanel = ctx.uiStore.getState().openPanel;
      ctx.uiStore.openPanel(currentPanel === 'help' ? null : 'help');
      e.preventDefault();
    } else if (key === 'b') {
      if (state.mission.level === 'luna' || state.mission.level === 'marte') {
        ctx.uiStore.openPanel(ctx.uiStore.getState().openPanel === 'base' ? null : 'base');
      } else {
        document.querySelector<HTMLElement>('[data-build-palette] button')?.focus();
      }
      e.preventDefault();
    } else if (key === 'm') {
      const currentPanel = ctx.uiStore.getState().openPanel;
      ctx.uiStore.openPanel(currentPanel === 'journal' ? null : 'journal');
      e.preventDefault();
    } else if (key === 'f') {
      const endDayBtn = document.querySelector<HTMLButtonElement>('[data-action="end-day"]');
      if (endDayBtn) {
        if (!endDayBtn.disabled) endDayBtn.click();
      } else {
        ctx.store.dispatch({ type: 'END_DAY', day: state.mission.day });
      }
      e.preventDefault();
    } else if (e.key >= '1' && e.key <= '7') {
      const idx = Number(e.key) - 1;
      const bType = BUILDING_SLOTS[idx];
      if (bType) {
        ctx.uiStore.setTool({ kind: 'build', building: bType });
        e.preventDefault();
      }
    }
  }

  window.addEventListener('keydown', onKeyDown);
  return () => {
    window.removeEventListener('keydown', onKeyDown);
  };
}

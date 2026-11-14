// AI-assisted: Antigravity (Gemini), reviewed by A

import { advanceDay } from '../core/day-cycle';
import type { Action } from '../core/types';
import type { AppContext } from './context';

export function mountDebugTools(ctx: AppContext): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  let panel: HTMLElement | null = null;

  function togglePanel(): void {
    if (panel) {
      panel.remove();
      panel = null;
      return;
    }

    panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.right = '12px';
    panel.style.bottom = '12px';
    panel.style.zIndex = '9999';
    panel.style.background = '#101935';
    panel.style.border = '2px solid #7DF9FF';
    panel.style.padding = '12px';
    panel.style.color = '#F2F4FF';
    panel.style.fontFamily = 'monospace';
    panel.style.fontSize = '12px';
    panel.style.maxWidth = '360px';

    const title = document.createElement('div');
    title.textContent = 'DEV DEBUG (Ctrl+Shift+D)';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '8px';
    panel.appendChild(title);

    const btnAdv = document.createElement('button');
    btnAdv.type = 'button';
    btnAdv.textContent = '+1 Day';
    btnAdv.onclick = () => {
      const s = ctx.store.getState();
      if (!s) return;
      const res = advanceDay(s, ctx.data);
      ctx.store.replaceState(res.state, res.events);
    };
    panel.appendChild(btnAdv);

    const btnWin = document.createElement('button');
    btnWin.type = 'button';
    btnWin.textContent = 'Force Victory';
    btnWin.style.marginLeft = '6px';
    btnWin.onclick = () => {
      const s = ctx.store.getState();
      if (!s) return;
      ctx.store.replaceState({
        ...s,
        mission: {
          ...s.mission,
          phase: 'ended',
          result: {
            outcome: 'victory',
            level: s.mission.level,
            difficulty: s.campaign.difficulty,
            seed: s.campaign.seed,
            daysUsed: s.mission.day,
            earthDaysRemaining: s.campaign.earthDaysRemaining,
            resources: { ...s.mission.resources },
            margins: { oxigeno: 8, agua: 8, alimentos: 8, energia: 10 },
            maxExposure: 14,
            incidents: [],
            principleKey: 'sim.principle.victory',
            suggestionKey: 'sim.suggestion.victory',
          },
        },
      });
    };
    panel.appendChild(btnWin);

    const planInput = document.createElement('textarea');
    planInput.placeholder = 'JSON Action[]';
    planInput.rows = 3;
    planInput.style.display = 'block';
    planInput.style.width = '100%';
    planInput.style.marginTop = '8px';
    panel.appendChild(planInput);

    const btnRunPlan = document.createElement('button');
    btnRunPlan.type = 'button';
    btnRunPlan.textContent = 'Apply JSON Actions';
    btnRunPlan.style.marginTop = '4px';
    btnRunPlan.onclick = () => {
      try {
        const actions = JSON.parse(planInput.value) as Action[];
        for (const a of actions) {
          ctx.store.dispatch(a);
        }
      } catch (e) {
        console.error(e);
      }
    };
    panel.appendChild(btnRunPlan);

    document.body.appendChild(panel);
  }

  function onKey(e: KeyboardEvent): void {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
      togglePanel();
      e.preventDefault();
    }
  }

  window.addEventListener('keydown', onKey);
  return () => {
    window.removeEventListener('keydown', onKey);
    panel?.remove();
  };
}

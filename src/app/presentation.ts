// AI-assisted: Claude Code (claude-opus-5-5). Human review by A pending.
// Presentation mode: press X anywhere to watch the game play itself (Moon, solar storm, Mars,
// ending) with a caption per day. Press X again to stop. The player's save and options are
// restored afterwards, so a demo never overwrites a real campaign.
import { createCampaign, startDay } from '../core';
import type { AppContext } from './context';
import { OPTIONS_STORAGE_KEY } from './options';
import { SAVE_STORAGE_KEY } from './persistence';
import { missionSteps, PRESENTATION_DIFFICULTY, PRESENTATION_SEED, type ScriptStep } from './presentation-script';
import '../styles/presentation.css';

const BACKUP_KEY = 'ea.presentation.backup';

type Backup = { save: string | null; options: string | null };

/** Put the player's save and options back, if a presentation left a backup behind. */
function restoreBackup(): boolean {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (raw === null) return false;
    const backup = JSON.parse(raw) as Backup;
    for (const [key, value] of [[SAVE_STORAGE_KEY, backup.save], [OPTIONS_STORAGE_KEY, backup.options]] as const) {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    }
    localStorage.removeItem(BACKUP_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Call before the app reads storage. A presentation that was cut short (reload, closed tab)
 * leaves its backup in storage: this puts the player's save and options back first.
 */
export function recoverInterruptedPresentation(): void {
  restoreBackup();
}

const PACE = {
  luna: { short: 800, report: 2600, decision: 3200, caption: 1400 },
  marte: { short: 380, report: 1300, decision: 2600, caption: 900 },
} as const;

export function mountPresentationMode(ctx: AppContext): () => void {
  let running = false;
  let stopped = false;
  let pending: (() => void) | null = null;
  let shield: HTMLElement | null = null;
  let caption: HTMLElement | null = null;

  const wait = (ms: number): Promise<void> => new Promise((resolve) => {
    const timer = setTimeout(() => { pending = null; resolve(); }, ms);
    pending = () => { clearTimeout(timer); resolve(); };
  });

  function say(key: string, params: Record<string, number> = {}): void {
    if (!caption) return;
    const text = caption.querySelector('.presentation-text');
    if (text) text.textContent = ctx.t(`ui.presentation.${key}`, params);
  }

  function readStorage(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  function restoreAndReload(): void {
    restoreBackup();
    location.reload();
  }

  function stop(): void {
    if (!running) return;
    stopped = true;
    pending?.();
    restoreAndReload();
  }

  function goTo(scene: Parameters<AppContext['flow']['go']>[0]): void {
    const current = ctx.flow.current().scene;
    if (current === scene) return;
    if (current === 'mision') ctx.flow.go('pausa');
    if (ctx.flow.current().scene !== 'titulo' && scene !== 'titulo') ctx.flow.go('titulo');
    if (ctx.flow.current().scene !== scene) ctx.flow.go(scene);
  }

  function closeShelterScene(): void {
    document.querySelector<HTMLButtonElement>('.shelter-scene button')?.click();
  }

  async function playMission(level: 'luna' | 'marte'): Promise<void> {
    const pace = PACE[level];
    const state = (): NonNullable<ReturnType<typeof ctx.store.getState>> => {
      const s = ctx.store.getState();
      if (!s) throw new Error('presentation: no state');
      return s;
    };
    let lastCaption = '';
    for (const step of missionSteps(state) as Generator<ScriptStep>) {
      if (stopped) return;
      if (step.kind === 'caption') {
        // Generic days only update the day number; a new message also gets time to be read.
        say(step.key, { day: step.day });
        if (step.key !== lastCaption || !step.key.endsWith('Day')) await wait(pace.caption);
        lastCaption = step.key;
        continue;
      }
      const result = ctx.store.dispatch(step.action);
      if (!result.ok) {
        console.warn('[presentation] step rejected', step.action, result.error.code);
        return;
      }
      await wait(pace[step.pause]);
      if (step.pause === 'decision') closeShelterScene();
    }
  }

  async function run(): Promise<void> {
    running = true;
    stopped = false;
    // Kept in storage, not memory, so a reload in the middle of the show still restores it.
    try {
      if (localStorage.getItem(BACKUP_KEY) === null) {
        const backup: Backup = { save: readStorage(SAVE_STORAGE_KEY), options: readStorage(OPTIONS_STORAGE_KEY) };
        localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
      }
    } catch { /* storage unavailable: nothing to protect */ }
    // Tutorial bubbles and quiz questions would stop the show: switch them off for the demo only.
    ctx.options.set('tutorial', false);
    ctx.options.set('learningCheck', false);

    const stage = document.getElementById('stage') ?? document.body;
    shield = document.createElement('div');
    shield.className = 'presentation-shield';
    caption = document.createElement('div');
    caption.className = 'presentation-caption';
    caption.setAttribute('role', 'status');
    caption.setAttribute('aria-live', 'polite');
    const badge = document.createElement('span');
    badge.className = 'presentation-badge';
    badge.textContent = ctx.t('ui.presentation.badge');
    const text = document.createElement('p');
    text.className = 'presentation-text';
    const stopButton = document.createElement('button');
    stopButton.type = 'button';
    stopButton.className = 'presentation-stop';
    stopButton.textContent = ctx.t('ui.presentation.stop');
    stopButton.addEventListener('click', stop);
    caption.append(badge, text, stopButton);
    stage.append(shield, caption);

    say('start');
    goTo('titulo');
    await wait(2200);
    if (stopped) return;

    // A fixed, canonical campaign: the script is checked against it in the tests.
    const created = createCampaign(PRESENTATION_DIFFICULTY, PRESENTATION_SEED, ctx.data, { canonical: true });
    const opened = startDay(created, ctx.data);
    ctx.store.replaceState(opened.state, opened.events);
    ctx.flow.go('dificultad');
    ctx.flow.go('cinematica', { id: 'opening' });
    say('opening');
    await wait(5000);
    if (stopped) return;
    ctx.flow.completeCinematic('opening');
    await wait(900);

    await playMission('luna');
    if (stopped) return;
    say('moonWin');
    await wait(4200);
    if (stopped) return;

    ctx.flow.departToMars?.();
    say('toMars');
    await wait(5200);
    if (stopped) return;
    ctx.flow.completeCinematic('moonToMars');
    await wait(900);

    say('marsArrive');
    await wait(2600);
    await playMission('marte');
    if (stopped) return;
    say('marsWin');
    await wait(4200);
    if (stopped) return;

    ctx.flow.chooseEnding?.('mars');
    say('ending');
    await wait(6500);
    if (stopped) return;
    ctx.flow.completeCinematic('marsVictory');
    say('end');
    await wait(5000);
    if (stopped) return;
    stop();
  }

  const onKey = (event: KeyboardEvent): void => {
    const target = event.target as HTMLElement | null;
    if (target?.closest?.('input, textarea, select') || target?.isContentEditable) return;
    if (event.key.toLowerCase() === 'x' && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.repeat) return;
      if (running) stop();
      else void run().catch((error: unknown) => {
        console.error('[presentation]', error);
        stop();
      });
      return;
    }
    // While the demo runs, the keyboard belongs to it.
    if (running) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
  window.addEventListener('keydown', onKey, true);
  return () => {
    window.removeEventListener('keydown', onKey, true);
    pending?.();
    shield?.remove();
    caption?.remove();
  };
}

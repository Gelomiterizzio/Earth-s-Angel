// AI-assisted: Claude Code (claude-opus-5-5). Directed and approved by the team.
// Platform mode manager: PC (keyboard and mouse) or Mobile/Tablet (touch, landscape, full screen).
//
// One game, two ways to play. The mode only changes how the player gives orders and how the
// screens are laid out; the rules, the store and every action are the same. The touch controls
// send the same commands as the keyboard (see ui/touch/touch-controls.ts).
//
// - The mode lives in the options (options.platform) so every screen repaints when it changes.
// - A new session always starts on PC. The tab session (sessionStorage) keeps the choice
//   through a reload, so a phone that reloads does not fall back to keyboard controls.
// - Portrait on Mobile/Tablet shows a "turn your device" guide that blocks the game until the
//   screen is horizontal. Browsers that cannot lock the orientation (Safari on iOS) still get
//   the guide, so nothing depends on screen.orientation.lock().
// - Full screen is requested from the click that selects Mobile/Tablet (browsers only allow it
//   inside a user gesture). Where it is not available, a short tip explains how to get more room.
import type { AppContext, Options } from './context';
import type { I18nService } from './i18n';

export type Platform = Options['platform'];

const SESSION_KEY = 'ea.platform';

/** Full screen entered by the game itself, so switching back to PC only undoes our own request. */
let enteredFullscreen = false;

function readSession(): Platform | null {
  try {
    const value = sessionStorage.getItem(SESSION_KEY);
    return value === 'mobile' || value === 'pc' ? value : null;
  } catch {
    return null;
  }
}

function writeSession(platform: Platform): void {
  try { sessionStorage.setItem(SESSION_KEY, platform); } catch { /* storage unavailable */ }
}

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};
type FullscreenElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
type LockableOrientation = ScreenOrientation & { lock?: (orientation: string) => Promise<void> };

function fullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

/** True when this browser lets a page go full screen (not iPhone Safari, for example). */
export function canFullscreen(): boolean {
  const root = document.documentElement as FullscreenElement;
  return typeof root.requestFullscreen === 'function' || typeof root.webkitRequestFullscreen === 'function';
}

async function enterImmersive(): Promise<boolean> {
  const root = document.documentElement as FullscreenElement;
  try {
    if (!fullscreenElement()) {
      if (root.requestFullscreen) await root.requestFullscreen({ navigationUI: 'hide' });
      else if (root.webkitRequestFullscreen) await root.webkitRequestFullscreen();
      else return false;
      enteredFullscreen = true;
    }
  } catch {
    return false;
  }
  // Only works in full screen on some browsers (Android Chrome); a refusal is fine.
  try { await (screen.orientation as LockableOrientation | undefined)?.lock?.('landscape'); } catch { /* not allowed */ }
  return true;
}

async function leaveImmersive(): Promise<void> {
  try { screen.orientation?.unlock?.(); } catch { /* not supported */ }
  if (!enteredFullscreen || !fullscreenElement()) {
    enteredFullscreen = false;
    return;
  }
  enteredFullscreen = false;
  const doc = document as FullscreenDocument;
  try {
    if (doc.exitFullscreen) await doc.exitFullscreen();
    else await doc.webkitExitFullscreen?.();
  } catch { /* already out */ }
}

/**
 * Switches the mode. Call it from the click or tap that chose the mode: that is the only moment
 * a browser accepts a full-screen request.
 */
export function selectPlatform(ctx: AppContext, platform: Platform): void {
  const before = ctx.options.get().platform;
  if (before !== platform) ctx.options.set('platform', platform);
  if (platform === 'mobile') {
    void enterImmersive().then((ok) => {
      if (!ok && !canFullscreen()) showTip(ctx.t('ui.platform.fullscreenTip'));
    });
  } else {
    void leaveImmersive();
  }
}

function showTip(text: string): void {
  const stage = document.getElementById('stage') ?? document.body;
  stage.querySelector('.platform-tip')?.remove();
  const tip = document.createElement('p');
  tip.className = 'platform-tip';
  tip.setAttribute('role', 'status');
  tip.textContent = text;
  stage.append(tip);
  setTimeout(() => tip.remove(), 7000);
}

/** Portrait guide: shown by CSS only when Mobile/Tablet is on and the screen is vertical. */
function mountRotateGuide(ctx: AppContext): { paint(): void; destroy(): void } {
  const guide = document.createElement('div');
  guide.className = 'rotate-guide';
  guide.setAttribute('role', 'alertdialog');
  guide.setAttribute('aria-live', 'polite');
  const phone = document.createElement('div');
  phone.className = 'rotate-phone';
  phone.setAttribute('aria-hidden', 'true');
  const title = document.createElement('h2');
  const text = document.createElement('p');
  const sub = document.createElement('p');
  sub.className = 'rotate-sub';
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'btn';
  back.addEventListener('click', () => selectPlatform(ctx, 'pc'));
  guide.append(phone, title, text, sub, back);
  document.body.append(guide);
  const paint = (): void => {
    title.textContent = ctx.t('ui.platform.rotateTitle');
    text.textContent = ctx.t('ui.platform.rotate');
    sub.textContent = ctx.t('ui.platform.rotateSub');
    back.textContent = ctx.t('ui.platform.rotateBack');
  };
  paint();
  return { paint, destroy: () => guide.remove() };
}

/** Keeps the page, the texts and the guides in line with the selected mode. */
export function mountPlatform(ctx: AppContext, i18n: I18nService): () => void {
  // Restore the mode of this tab session (new sessions start on PC: see options.ts).
  const restored = readSession();
  if (restored && restored !== ctx.options.get().platform) ctx.options.set('platform', restored);

  const guide = mountRotateGuide(ctx);
  const root = document.documentElement;
  const portrait = typeof matchMedia === 'function' ? matchMedia('(orientation: portrait)') : null;

  const apply = (options: Options): void => {
    const mobile = options.platform === 'mobile';
    root.dataset.platform = options.platform;
    i18n.setVariant?.(mobile ? 'touch' : null);
    writeSession(options.platform);
    guide.paint();
    syncOrientation();
  };

  // The guide is CSS; this only flags the state for the stylesheet and assistive technology,
  // and drops a held key so the astronaut never keeps walking behind the guide.
  function syncOrientation(): void {
    const blocked = root.dataset.platform === 'mobile' && Boolean(portrait?.matches);
    root.toggleAttribute('data-rotate', blocked);
    if (blocked) window.dispatchEvent(new Event('blur'));
  }

  let last = ctx.options.get().platform;
  apply(ctx.options.get());
  const off = ctx.options.subscribe((options) => {
    if (options.platform !== last) {
      last = options.platform;
      showTip(ctx.t(options.platform === 'mobile' ? 'ui.platform.switched' : 'ui.platform.switchedPc'));
    }
    apply(options);
  });
  const onOrientation = (): void => syncOrientation();
  portrait?.addEventListener?.('change', onOrientation);
  window.addEventListener('orientationchange', onOrientation);
  const onFullscreen = (): void => { if (!fullscreenElement()) enteredFullscreen = false; };
  document.addEventListener('fullscreenchange', onFullscreen);
  return () => {
    off();
    portrait?.removeEventListener?.('change', onOrientation);
    window.removeEventListener('orientationchange', onOrientation);
    document.removeEventListener('fullscreenchange', onFullscreen);
    guide.destroy();
  };
}

// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
// Controls and subtitle layout updated with Codex.
import type { AppContext, Screen } from '../app-bridge';
import { button } from '../components/button';
import { bindChrome, press } from '../chrome';
import { cleaner, el } from '../dom';
import { mountPlayer } from '../cinematics/player';
import { getScript } from '../cinematics/scripts';

let cleanup: (() => void) | null = null;

export const cinematicScreen: Screen = {
  mount(root, ctx) {
    cleanup = mountCinematic(root, ctx);
  },
  unmount() {
    cleanup?.();
    cleanup = null;
  },
};

function mountCinematic(root: HTMLElement, ctx: AppContext): () => void {
  const bag = cleaner();
  const screen = el('section', 'screen cine');
  root.append(screen);
  bag.add(bindChrome(ctx));
  bag.add(() => screen.remove());
  const id = String(ctx.flow.current().params.id ?? 'intro');
  const script = getScript(id);
  const stage = el('div', 'cine-stage');
  const art = el('div', 'cine-art');
  art.append(stage);
  const dock = el('div', 'cine-dock');
  const caption = el('p', 'caption');
  caption.setAttribute('aria-live', 'polite');
  caption.setAttribute('aria-atomic', 'true');
  screen.append(art, dock);

  let done = false;
  let stopPlayer: (() => void) | undefined;
  const finish = (): void => {
    if (done || !screen.isConnected) return;
    done = true;
    stopPlayer?.();
    ctx.flow.completeCinematic(id);
  };
  const skip = button({
    label: ctx.t('ui.cine.skip'),
    className: 'skip',
    onClick: press(ctx, finish, 'sfx-confirm'),
  });
  skip.setAttribute('aria-keyshortcuts', 'Enter');
  dock.append(caption, skip);
  const bannerKey = id === 'wormhole' ? 'ui.cine.wormhole.banner' : id === 'earthVictory' ? 'ui.earth.fiction' : null;
  const banner = bannerKey ? el('p', 'banner', ctx.t(bannerKey)) : null;
  if (banner) art.append(banner);

  if (!script) {
    queueMicrotask(finish);
    return () => bag.run();
  }

  const campaign = ctx.store.getState()?.campaign;
  const manifest = id === 'moonToMars' ? campaign?.manifest : null;
  const bonus = manifest?.bonusDaysApplied ?? ctx.data.difficulty[campaign?.difficulty ?? 'media']?.bonusDays ?? 0;
  const start = (): void => {
    skip.focus();
    stopPlayer = mountPlayer(stage, caption, {
      script,
      reducedMotion: ctx.options.get().reducedMotion,
      showSubtitles: () => ctx.options.get().subtitles,
      caption: (key) => {
        const line = ctx.t(key, { bonus });
        return key === 'ui.cine.marsVictory.1' && campaign?.narrativeFlags.earthFailed
          ? `${line} ${ctx.t('ui.cine.marsVictory.earthFailed')}`
          : line;
      },
      onFinish: finish,
      playSfx: (sfx) => ctx.audio.playSfx(sfx),
    });
  };
  const openedAt = performance.now();
  let continueManifest: HTMLButtonElement | undefined;
  const onKey = (event: KeyboardEvent): void => {
    if (event.key !== 'Enter') return;
    if (event.repeat || performance.now() - openedAt < 300) {
      event.preventDefault();
      return;
    }
    if (event.target === continueManifest && continueManifest?.isConnected) return;
    event.preventDefault();
    skip.click();
  };
  window.addEventListener('keydown', onKey, true);
  bag.add(() => window.removeEventListener('keydown', onKey, true));
  bag.add(() => stopPlayer?.());
  ctx.audio.playMusic(script.music);
  if (manifest) {
    caption.hidden = true;
    continueManifest = showManifest(art, ctx, manifest, start);
    continueManifest.focus();
  } else start();
  bag.add(ctx.options.subscribe(() => {
    skip.textContent = ctx.t('ui.cine.skip');
    if (banner && bannerKey) banner.textContent = ctx.t(bannerKey);
  }));
  return () => bag.run();
}

type Manifest = NonNullable<NonNullable<ReturnType<AppContext['store']['getState']>>['campaign']['manifest']>;

function showManifest(art: HTMLElement, ctx: AppContext, manifest: Manifest, then: () => void): HTMLButtonElement {
  const briefing = el('div', 'cine-briefing');
  briefing.append(
    el('h1', undefined, ctx.t('ui.manifest.heading')),
    el('p', undefined, ctx.t('ui.manifest.crew', { n: manifest.crew.length })),
    el('p', undefined, ctx.t('ui.manifest.supplies', {
      power: manifest.supplies.energia,
      oxygen: manifest.supplies.oxigeno,
      water: manifest.supplies.agua,
      food: manifest.supplies.alimentos,
      materials: manifest.supplies.materiales,
    })),
    el('p', undefined, ctx.t('ui.manifest.bonus', { n: manifest.bonusDaysApplied })),
  );
  const go = button({
    label: ctx.t('ui.manifest.continue'),
    className: 'btn-primary',
    onClick: press(ctx, () => {
      briefing.remove();
      then();
    }, 'sfx-confirm'),
  });
  briefing.append(go);
  art.append(briefing);
  return go;
}

// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
// Controls and subtitle layout updated with Codex.
import type { AppContext, Screen } from '../app-bridge';
import { button } from '../components/button';
import { spaceAppsEntry } from '../components/space-apps';
import { drawLunarLander } from '../../map/art';
import { bindChrome, press } from '../chrome';
import { cleaner, el } from '../dom';
import { mountPlayer, type CinematicScene } from '../cinematics/player';
import { mountAnimatedCinematic } from '../cinematics/animated-cinematic';
import { mountBoarding } from '../cinematics/boarding';
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
  const skipKey = id === 'moonToMars' ? 'ui.cine.skipTravel'
    : id === 'marsVictory' ? 'ui.cine.skipEnding' : 'ui.cine.skip';
  const skip = button({
    label: ctx.t(skipKey),
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
  const playScript = (
    scenes: CinematicScene[],
    mount: typeof mountPlayer,
    onFinish = finish,
  ): void => {
    stopPlayer = mount(stage, caption, {
      script: { ...script, scenes },
      reducedMotion: ctx.options.get().reducedMotion,
      showSubtitles: () => ctx.options.get().subtitles,
      caption: (key) => {
        const line = ctx.t(key, { bonus });
        return key === 'ui.cine.marsVictory.1' && campaign?.narrativeFlags.earthFailed
          ? `${line} ${ctx.t('ui.cine.marsVictory.earthFailed')}`
          : line;
      },
      onFinish,
      playSfx: (sfx) => ctx.audio.playSfx(sfx),
    });
  };
  const start = (): void => {
    skip.focus();
    if (id !== 'moonToMars') {
      const mount = script.id === 'intro' || script.id === 'marsVictory' ? mountAnimatedCinematic : mountPlayer;
      playScript(script.scenes, mount);
      return;
    }
    const arrival = (): void => playScript(script.scenes.slice(4), mountAnimatedCinematic);
    if (ctx.options.get().reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      playScript(script.scenes.slice(0, 4), mountPlayer, arrival);
      return;
    }
    stopPlayer = mountBoarding(stage, (beat) => {
      caption.hidden = !ctx.options.get().subtitles;
      caption.textContent = ctx.t(`ui.cine.boarding.${beat}`);
      if (beat === 'launch') ctx.audio.playSfx('sfx-launch');
    }, () => playScript(script.scenes.slice(2, 4), mountPlayer, arrival));
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
    skip.textContent = ctx.t(skipKey);
    if (banner && bannerKey) banner.textContent = ctx.t(bannerKey);
  }));
  return () => bag.run();
}

type Manifest = NonNullable<NonNullable<ReturnType<AppContext['store']['getState']>>['campaign']['manifest']>;

function showManifest(art: HTMLElement, ctx: AppContext, manifest: Manifest, then: () => void): HTMLButtonElement {
  const briefing = el('div', 'cine-briefing');
  const eventBadge = spaceAppsEntry(ctx);
  const route = el('div', 'manifest-route');
  route.setAttribute('aria-hidden', 'true');
  const ship = el('canvas', 'manifest-ship');
  ship.width = 36;
  ship.height = 42;
  const g = ship.getContext('2d');
  if (g) {
    g.translate(6, 17);
    drawLunarLander(g, 0, 0);
  }
  route.append(el('span', 'manifest-moon'), el('span', 'manifest-mars'), ship);
  art.classList.add('manifest-sky');
  art.classList.toggle('manifest-still', ctx.options.get().reducedMotion);
  const cargo = el('div', 'manifest-stocks');
  const landed = ctx.store.getState()?.mission.resources;
  cargo.append(manifestResources(ctx, 'ui.manifest.cargo', manifest.supplies));
  if (landed) cargo.append(manifestResources(ctx, 'ui.manifest.landed', landed));
  const summary = el('p', 'manifest-summary');
  summary.textContent = [
    ctx.t('ui.manifest.crew', { n: manifest.crew.length }),
    ctx.t('ui.manifest.clues', { n: manifest.clues.length }),
    ctx.t('ui.manifest.bonus', { n: manifest.bonusDaysApplied }),
  ].join(' · ');
  briefing.append(
    route,
    el('h1', undefined, ctx.t('ui.manifest.heading')),
    summary,
    cargo,
    el('p', 'manifest-note', ctx.t('ui.manifest.arrivalNote')),
  );
  const go = button({
    label: ctx.t('ui.manifest.continue'),
    className: 'btn-primary',
    onClick: press(ctx, () => {
      briefing.remove();
      art.classList.remove('manifest-sky');
      then();
    }, 'sfx-confirm'),
  });
  briefing.append(go);
  art.append(briefing, eventBadge);
  return go;
}

function manifestResources(ctx: AppContext, titleKey: string, supplies: Manifest['supplies']): HTMLElement {
  const block = el('section', 'manifest-stock');
  const values = el('dl');
  for (const resource of ['energia', 'oxigeno', 'agua', 'alimentos', 'materiales'] as const) {
    const label = el('dt', undefined, ctx.t(`ui.resource.${resource}`));
    const icon = el('span', `icon icon-${resource === 'energia' ? 'energy' : resource}`);
    icon.setAttribute('aria-hidden', 'true');
    label.prepend(icon);
    values.append(label, el('dd', undefined, String(supplies[resource])));
  }
  block.append(el('h2', undefined, ctx.t(titleKey)), values);
  return block;
}

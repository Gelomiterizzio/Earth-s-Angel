// AI-assisted: Claude Code (claude-opus-5-5). Human review by C pending.
// Learning badges for the result screen. Each one names a space-science idea the player put
// into practice during the mission. Earned ones light up; the rest show what to try next time.
import type { AppContext } from '../app-bridge';
import type { GameState } from '../../core/types';
import { el } from '../dom';

export const BADGE_ORDER = ['power', 'waterLoop', 'airFromWater', 'greenThumb', 'stormSafe', 'explorer', 'prospector'] as const;
export type BadgeId = (typeof BADGE_ORDER)[number];

const ICON: Record<BadgeId, string> = {
  power: '⚡',
  waterLoop: '💧',
  airFromWater: '🫧',
  greenThumb: '🌱',
  stormSafe: '☢',
  explorer: '🧭',
  prospector: '⛏',
};

/** Tiles explored for the explorer badge. */
export const EXPLORER_TILES = 40;
/** Minerals collected for the prospector badge. */
export const PROSPECTOR_MINERALS = 3;

/** Which badges the mission in this state has earned. Pure, so it can be tested. */
export function earnedBadges(state: GameState): Set<BadgeId> {
  const { mission } = state;
  const working = (type: string): boolean =>
    mission.buildings.some((b) => b.type === type && b.operationalFromDay <= mission.day);
  const tiles = mission.map.tiles;
  const stormPassed = mission.schedule.some((event) => event.type === 'tormenta-solar'
    && event.startDay + event.durationDays <= mission.day);
  const crewSafe = mission.crew.every((member) => member.health > 0);
  const earned = new Set<BadgeId>();
  if (working('panel')) earned.add('power');
  if (working('reciclador')) earned.add('waterLoop');
  if (working('generador')) earned.add('airFromWater');
  if (mission.harvests > 0) earned.add('greenThumb');
  if (stormPassed && crewSafe && working('refugio')) earned.add('stormSafe');
  if (tiles.filter((tile) => tile.explored).length >= EXPLORER_TILES) earned.add('explorer');
  if (tiles.filter((tile) => tile.terrain === 'mineral' && tile.collected).length >= PROSPECTOR_MINERALS) {
    earned.add('prospector');
  }
  return earned;
}

export function badgeShelf(ctx: AppContext, state: GameState | null): HTMLElement | null {
  if (!state || state.earth) return null;
  const earned = earnedBadges(state);
  const shelf = el('section', 'badge-shelf');
  shelf.append(el('h2', 'badge-shelf-title', ctx.t('ui.badge.title', { n: earned.size, total: BADGE_ORDER.length })));
  const list = el('ul', 'badge-list');
  BADGE_ORDER.forEach((id, index) => {
    const got = earned.has(id);
    const item = el('li', got ? 'badge badge-earned' : 'badge badge-locked');
    item.style.setProperty('--badge-delay', `${index * 90}ms`);
    const icon = el('span', 'badge-icon', ICON[id]);
    icon.setAttribute('aria-hidden', 'true');
    const name = el('strong', 'badge-name', ctx.t(`ui.badge.${id}.name`));
    const desc = el('span', 'badge-desc', ctx.t(got ? `ui.badge.${id}.desc` : `ui.badge.${id}.hint`));
    item.setAttribute('aria-label', `${ctx.t(got ? 'ui.badge.earned' : 'ui.badge.locked')}: ${name.textContent}. ${desc.textContent}`);
    item.append(icon, name, desc);
    list.append(item);
  });
  shelf.append(list);
  return shelf;
}

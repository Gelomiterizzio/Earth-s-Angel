// AI-assisted: OpenAI Codex. Human review pending.
import assert from 'node:assert/strict';
import { MEDIA_PLAN } from '../core/plans/media.ts';
import { MARS_PLAN } from '../core/plans/mars.ts';
const url = process.argv[2] ?? 'http://127.0.0.1:5186/';
const targets = await (await fetch('http://127.0.0.1:' + (process.env.EA_CDP_PORT ?? '9227') + '/json')).json();
const socket = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});
const awaiting = new Map();
const errors = [];
const assets = [];
socket.onmessage = ({ data }) => {
  const msg = JSON.parse(data);
  if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails);
  if (msg.method === 'Network.responseReceived' && msg.params.response.url.includes('/assets/')) {
    assets.push([msg.params.response.status, msg.params.response.url]);
  }
  if (msg.id) {
    const { resolve, reject } = awaiting.get(msg.id);
    awaiting.delete(msg.id);
    if (msg.error) reject(msg.error);
    else resolve(msg.result);
  }
};
let id = 0;
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    awaiting.set(++id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function task(fn, ...args) {
  const expression = '(' + fn.toString() + ')(...' + JSON.stringify(args) + ')';
  const res = await send('Runtime.evaluate', { expression, userGesture: true, awaitPromise: true, returnByValue: true });
  if (res.exceptionDetails) throw new Error(res.exceptionDetails.exception?.description ?? res.exceptionDetails.text);
  return res.result.value;
}
await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');
const instrumentation = await send('Page.addScriptToEvaluateOnNewDocument', { source: '(' + String(function () {
  window.eaTracks = [];
  const start = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...args) {
    if (this.loop && this.buffer) window.eaTracks.push(this.buffer.duration);
    return start.apply(this, args);
  };
}) + ')()' });
async function navigate() {
  await send('Page.navigate', { url: new URL('?seed=demo', url).href });
  for (let i = 0; i < 40; i++) {
    await sleep(150);
    if (await task(() => Boolean(document.querySelector('.title-screen'))).catch(() => false)) return;
  }
  throw new Error('Title not loaded: ' + await task(() => document.body.innerText));
}
const click = (selector) => task((selector) => {
  const item = document.querySelector(selector);
  if (!item || item.disabled) throw new Error(selector + ' missing/disabled: ' + document.body.innerText.slice(0, 700));
  item.click();
}, selector);
const named = (name, optional = false) => task((name, optional) => {
  const button = [...document.querySelectorAll('#ui button')].find((item) => item.textContent.trim().startsWith(name));
  if (!button && optional) return;
  if (!button || button.disabled) throw new Error(name + ' missing/disabled: ' + document.body.innerText.slice(0, 700));
  button.click();
}, name, optional);
const saved = () => task(() => JSON.parse(localStorage.getItem('ea.save.v1')).state);
const trackPlayed = (tempo) => task((duration) =>
  window.eaTracks.some((played) => Math.abs(played - duration) < 0.01), 32 * 60 / tempo,
);
const load = async (state) => {
  await task((state) => localStorage.setItem('ea.save.v1', JSON.stringify({
    schema: 'earths-angel/save', version: 1, savedAtDay: state.mission.day, state,
  })), state);
  await navigate();
  await named('Continue');
};
const skip = () => click('.cine .skip');
const cell = (x, y) => '.map-cell[data-x="' + x + '"][data-y="' + y + '"]';
const action = async (act) => {
  const ap = (await saved()).mission.ap;
  let control;
  if (act.type === 'BUILD') control = 'build-' + act.building;
  if (act.type === 'EXPLORE') control = 'explore';
  if (act.type === 'COLLECT') control = 'collect';
  if (act.type === 'SCAN') control = 'scan';
  if (control) {
    await click('[data-hud-focus="' + control + '"]');
    await click(cell(act.x, act.y));
  } else if (act.type === 'CLEAN_PANELS') await click('[data-hud-focus="clean"]');
  else if (act.type === 'REPAIR') await click('[data-hud-focus="repair-' + act.buildingId + '"]');
  assert.ok((await saved()).mission.ap < ap, 'not applied: ' + JSON.stringify(act));
};
const secretMoon = [
  { type: 'EXPLORE', x: 8, y: 3 }, { type: 'EXPLORE', x: 10, y: 2 }, { type: 'SCAN', x: 10, y: 2 },
];
const secretMars = {
  4: [{ type: 'EXPLORE', x: 11, y: 15 }],
  15: [{ type: 'EXPLORE', x: 10, y: 17 }, { type: 'COLLECT', x: 10, y: 18 }],
  16: [{ type: 'BUILD', building: 'laboratorio', x: 11, y: 10 }, { type: 'EXPLORE', x: 14, y: 12 }],
  17: [{ type: 'EXPLORE', x: 16, y: 12 }, { type: 'SCAN', x: 17, y: 12 }],
};
async function lunarDay({ day, shelter, actions }) {
  if (shelter) await named('Shelter the crew');
  for (const act of actions) await action(act);
  await click('.end-day');
  const s = await saved();
  assert.equal(s.mission.lastReport.day, day);
  if (!s.mission.result) await named('Continue');
}
async function setup() {
  await navigate();
  await task(() => {
    localStorage.removeItem('ea.save.v1');
    localStorage.setItem('ea.options.v1', JSON.stringify({ language: 'en', tutorial: false, learningCheck: false }));
  });
  await navigate();
  await named('New game');
  await click('.diff-card:nth-child(2)');
  await skip();
  assert.equal((await saved()).campaign.difficulty, 'media');
  assert.equal(await task(() => document.querySelectorAll('.map-cell').length), 144);
  for (const day of MEDIA_PLAN) await lunarDay(day.day === 7 ? { ...day, actions: secretMoon } : day);
  const s = await saved();
  assert.equal(s.mission.result.outcome, 'victory');
  assert.equal(s.campaign.narrativeFlags.beaconMoon, true);
  await named('Depart for Mars');
  const before = await saved();
  assert.equal(before.campaign.earthDaysRemaining, 55);
  await skip();
  const after = await saved();
  assert.equal(after.mission.day, 1);
  assert.equal(await task(() => document.querySelectorAll('.map-cell').length), 400);
  await load(before);
  await click('.cine-briefing button');
  await sleep(180);
  assert.ok(await task(() => [...document.images].some((image) =>
    image.currentSrc.includes('moon-to-mars') && image.complete && image.naturalWidth > 0)));
  if (process.env.EA_NATURAL === '1') {
    for (let i = 0; i < 72; i++) {
      if (await task(() => Boolean(document.querySelector('.end-day')))) break;
      await sleep(500);
    }
  } else await skip();
  assert.deepEqual(await saved(), after);
  await navigate();
  await named('Continue');
  assert.deepEqual(await saved(), after);
  assert.ok(await trackPlayed(81), 'Mars music never started');
  console.log('Moon won through the map. Mars at sol 1, 55 days and 400 squares. Travel skip and reload verified.');
  return after;
}
async function mars() {
  for (let day = 1; day <= 55; day++) {
    const s = await saved();
    if (s.mission.result) break;
    assert.equal(s.mission.day, day);
    if (s.mission.phase === 'decision') await named('Shelter the crew');
    else {
      for (const act of MARS_PLAN[day] ?? []) await action(act);
      for (const b of s.mission.buildings) if (b.damaged) await action({ type: 'REPAIR', buildingId: b.id });
      for (const act of secretMars[day] ?? []) await action(act);
      if (!MARS_PLAN[day] && s.mission.dust > 0) await action({ type: 'CLEAN_PANELS' });
    }
    await click('.end-day');
    if (!(await saved()).mission.result) await named('Continue');
  }
  const s = await saved();
  assert.equal(s.mission.result.outcome, 'victory');
  assert.equal(s.campaign.narrativeFlags.beaconMars, true);
  console.log('Mars won on sol ' + s.mission.result.daysUsed + ' with both beacons.');
  return s;
}
async function earth(marsWon) {
  await named('Finish on Mars');
  await skip();
  assert.ok((await saved()).campaign.narrativeFlags.endingSeen);
  await load(marsWon);
  await named('Review the portal choice');
  await named('Enter the portal');
  await named('Yes');
  await skip();
  assert.equal((await saved()).earth.season, 1);
  assert.ok(await trackPlayed(86), 'Earth music never started');
  assert.equal(await task(() => document.querySelector('#map').hidden), true);
  for (let i = 1; i <= 8; i++) {
    await named('End season');
    if (i !== 8) await named('Plan the next season');
  }
  const lost = await saved();
  assert.equal(lost.earth.result.outcome, 'defeat');
  await named('Return to the Mars ending');
  assert.equal((await saved()).campaign.narrativeFlags.earthFailed, true);
  await skip();
  await load(lost);
  await named('Retry the Earth mission');
  assert.equal((await saved()).earth.season, 1);
  for (let i = 1; i <= 8; i++) {
    for (const line of ['energia', 'reciclaje', 'agua', 'restauracion']) {
      const selector = '[data-earth-focus="' + line + '"]';
      for (let n = 0; n < (line === 'energia' || line === 'restauracion' ? 3 : 2); n++) {
        if (!await task((selector) => Boolean(document.querySelector(selector) && !document.querySelector(selector).disabled), selector)) break;
        await click(selector);
      }
    }
    await named('End season');
    if (i !== 8) await named('Plan the next season');
  }
  assert.equal((await saved()).earth.result.outcome, 'victory');
  const earthWon = await saved();
  await click('.result-screen .btn-primary');
  await skip();
  assert.ok((await saved()).campaign.narrativeFlags.endingSeen);
  console.log('Earth played all eight seasons for defeat and victory. Final cinematic reached. Metrics: '
    + JSON.stringify(earthWon.earth.indicators));
}
async function loseMarsAndStartFresh(arrival) {
  await load(arrival);
  for (let day = 1; day <= 10 && !(await saved()).mission.result; day++) {
    await click('.end-day');
    if (!(await saved()).mission.result) await named('Continue');
  }
  assert.equal((await saved()).mission.result.outcome, 'defeat');
  await navigate();
  await named('New game');
  await named('Yes');
  await click('.diff-card:nth-child(1)');
  await skip();
  const fresh = await saved();
  assert.equal(fresh.mission.level, 'luna');
  assert.equal(fresh.mission.day, 1);
  assert.deepEqual(fresh.campaign.appliedTransitions, []);
  assert.deepEqual(fresh.campaign.clues, []);
  console.log('Mars defeat and new campaign verified.');
}

try {
  const arrival = await setup();
  const marsWon = await mars();
  await earth(marsWon);
  await loseMarsAndStartFresh(arrival);
  assert.deepEqual(errors, []);
  assert.ok(assets.length > 20);
  assert.deepEqual(assets.filter(([status]) => status >= 400), []);
  console.log('No runtime exceptions and ' + new Set(assets.map((a) => a[1])).size + ' unique assets loaded.');
} finally {
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: instrumentation.identifier });
  socket.close();
}

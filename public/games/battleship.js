// Giao diện Bắn tàu: giai đoạn xếp tàu và giai đoạn bắn.
const HIT = '<svg viewBox="0 0 100 100"><path d="M28 28 L72 72 M72 28 L28 72" stroke="currentColor" stroke-width="14" stroke-linecap="round"/></svg>';

let draft = null;  // tàu đang xếp dở: { key, ships: [{ x, y, len, dir }], dir }
let lastShotKey = null;

export function reset() {
  draft = null;
  lastShotKey = null;
}

export function status(state, you, t) {
  if (state.phase === 'place') return state.ready && state.ready[you] ? t('bs.waitPlace') : t('bs.place');
  if (state.over) return null;
  return state.turn === you ? t('bs.yourShot') : t('bs.oppShot');
}

function cellsOf({ x, y, len, dir }, size) {
  const cells = [];
  for (let k = 0; k < len; k++) {
    const cx = dir === 'h' ? x + k : x;
    const cy = dir === 'v' ? y + k : y;
    if (cx >= size || cy >= size) return null;
    cells.push(cy * size + cx);
  }
  return cells;
}

function remaining(fleet, ships) {
  const left = [...fleet];
  ships.forEach((s) => left.splice(left.indexOf(s.len), 1));
  return left;
}

function randomFleet(fleet, size) {
  for (;;) {
    const ships = [];
    const used = new Set();
    let ok = true;
    for (const len of fleet) {
      let placed = false;
      for (let tries = 0; tries < 100 && !placed; tries++) {
        const s = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size), len, dir: Math.random() < 0.5 ? 'h' : 'v' };
        const cells = cellsOf(s, size);
        if (cells && !cells.some((c) => used.has(c))) {
          cells.forEach((c) => used.add(c));
          ships.push(s);
          placed = true;
        }
      }
      if (!placed) { ok = false; break; }
    }
    if (ok) return ships;
  }
}

// Lấy vị trí, chiều dài, hướng của tàu từ danh sách ô (tàu từ server chỉ có cells).
function geom(ship, size) {
  if (ship.x !== undefined) return ship;
  const c = [...ship.cells].sort((a, b) => a - b);
  return { x: c[0] % size, y: Math.floor(c[0] / size), len: c.length, dir: c[1] - c[0] === 1 ? 'h' : 'v' };
}

// Hình tàu nhìn từ trên xuống, vẽ ngang rồi xoay nếu tàu dọc.
function shipSvg(len, dir, sunk) {
  const L = len * 100;
  const fill = sunk ? '#111' : '#fff';
  const ink = sunk ? '#fff' : '#111';
  const hull = `M14 16 H${L - 50} Q${L - 16} 24 ${L - 8} 50 Q${L - 16} 76 ${L - 50} 84 H14 Q4 50 14 16 Z`;
  const cabin = `<rect x="${L * 0.32}" y="34" width="${Math.max(40, L * 0.22)}" height="32" rx="5" fill="none" stroke="${ink}" stroke-width="6"/>`;
  let turrets = '';
  for (let k = 0; k < len; k++) {
    const cx = 50 + k * 100;
    if (cx > L * 0.3 && cx < L * 0.32 + Math.max(40, L * 0.22) + 10) continue;
    turrets += `<circle cx="${cx}" cy="50" r="11" fill="${ink}"/>`;
  }
  const body = `<path d="${hull}" fill="${fill}" stroke="#111" stroke-width="6"/>${cabin}${turrets}`;
  return dir === 'h'
    ? `<svg viewBox="0 0 ${L} 100" preserveAspectRatio="none">${body}</svg>`
    : `<svg viewBox="0 0 100 ${L}" preserveAspectRatio="none"><g transform="translate(100 0) rotate(90)">${body}</g></svg>`;
}

function shipsLayer(ships, size, isSunk = () => false) {
  return '<div class="ships">' + ships.map((ship) => {
    const g = geom(ship, size);
    const w = (g.dir === 'h' ? g.len : 1) * 100 / size;
    const h = (g.dir === 'v' ? g.len : 1) * 100 / size;
    const style = `left:${g.x * 100 / size}%;top:${g.y * 100 / size}%;width:${w}%;height:${h}%`;
    return `<div class="ship" style="${style}">${shipSvg(g.len, g.dir, isSunk(ship))}</div>`;
  }).join('') + '</div>';
}

function grid(size, cls, cellFn, layer = '') {
  let html = `<div class="sea ${cls}" style="grid-template-columns: repeat(${size}, 1fr); grid-template-rows: repeat(${size}, 1fr)">${layer}`;
  for (let i = 0; i < size * size; i++) html += cellFn(i);
  return html + '</div>';
}

function renderPlace(el, state, you, api, room) {
  const { t } = api;
  const { size, fleet } = state;

  if (state.ready && state.ready[you]) {
    el.innerHTML = `<p class="sea-title">${t('bs.yourSea')}</p>` +
      grid(size, 'small', () => '<div class="c"></div>', shipsLayer(state.myShips, size));
    return;
  }

  if (!draft || draft.key !== room.round) draft = { key: room.round, ships: [], dir: 'h' };
  const left = remaining(fleet, draft.ships);
  const owner = new Map();
  draft.ships.forEach((s, k) => cellsOf(s, size).forEach((c) => owner.set(c, k)));

  el.innerHTML = `
    <p class="hint">${left.length ? t('bs.next', { n: left[0] }) : t('bs.allPlaced')}</p>
    ${grid(size, 'place', (i) => `<button class="c" data-i="${i}"></button>`, shipsLayer(draft.ships, size))}
    <div class="tools">
      <button class="small" data-act="dir">${draft.dir === 'h' ? '⇆ ' + t('bs.horizontal') : '⇅ ' + t('bs.vertical')}</button>
      <button class="small" data-act="random">${t('bs.random')}</button>
      <button class="small" data-act="clear">${t('bs.clear')}</button>
      <button data-act="ready" ${left.length || you < 0 ? 'disabled' : ''}>${t('bs.ready')}</button>
    </div>`;

  const redraw = () => renderPlace(el, state, you, api, room);
  el.querySelectorAll('.sea .c').forEach((b) => (b.onclick = () => {
    const i = +b.dataset.i;
    if (owner.has(i)) {
      draft.ships.splice(owner.get(i), 1);
    } else if (left.length) {
      const s = { x: i % size, y: Math.floor(i / size), len: left[0], dir: draft.dir };
      const cells = cellsOf(s, size);
      if (!cells || cells.some((c) => owner.has(c))) return;
      draft.ships.push(s);
    }
    redraw();
  }));
  el.querySelector('[data-act="dir"]').onclick = () => { draft.dir = draft.dir === 'h' ? 'v' : 'h'; redraw(); };
  el.querySelector('[data-act="random"]').onclick = () => { draft.ships = randomFleet(fleet, size); redraw(); };
  el.querySelector('[data-act="clear"]').onclick = () => { draft.ships = []; redraw(); };
  el.querySelector('[data-act="ready"]').onclick = () => api.send({ ships: draft.ships });
}

function caption(last, you, t) {
  if (!last) return '';
  if (last.by === you) return last.sunk ? t('bs.sunk', { n: last.sunk }) : last.hit ? t('bs.hit') : t('bs.miss');
  return last.sunk ? t('bs.oppSunk', { n: last.sunk }) : last.hit ? t('bs.oppHit') : t('bs.oppMiss');
}

function renderBattle(el, state, you, api, room) {
  const { t } = api;
  const { size } = state;
  const me = you < 0 ? 0 : you;
  const shotKey = state.last ? `${room.round}:${state.last.by}:${state.last.i}` : null;
  const fresh = shotKey && shotKey !== lastShotKey && lastShotKey !== null;
  lastShotKey = shotKey || lastShotKey || 'start';

  const myShots = new Map(state.myShots.map((s) => [s.i, s.hit]));
  const sunk = new Set(state.oppShips.flatMap((s) => s.cells));
  const own = new Set(state.myShips.flatMap((s) => s.cells));
  const oppSunkCells = new Set(state.oppShips.filter((sh) => sh.cells.every((c) => myShots.get(c))).flatMap((sh) => sh.cells));
  const oppShots = new Map(state.oppShots.map((s) => [s.i, s.hit]));
  const mySunkCells = new Set(state.myShips.filter((sh) => sh.cells.every((c) => oppShots.get(c))).flatMap((sh) => sh.cells));
  const canShoot = !state.over && state.turn === me && you >= 0;
  const popOn = (i, mine) => (fresh && state.last.i === i && (state.last.by === me) === mine ? ' pop' : '');

  el.innerHTML = `
    <p class="sea-title">${t('bs.enemySea')} · ${t('bs.left', { n: state.left[1] })}</p>
    ${grid(size, 'enemy' + (canShoot ? ' active' : ''), (i) => {
      const shot = myShots.has(i);
      let cls = shot ? (myShots.get(i) ? 'hit' : 'miss') : '';
      if (sunk.has(i)) cls += oppSunkCells.has(i) ? ' onship dark' : ' onship';
      return `<button class="c ${cls}${popOn(i, true)}" data-i="${i}" ${!canShoot || shot ? 'disabled' : ''}>${shot && myShots.get(i) ? HIT : ''}</button>`;
    }, shipsLayer(state.oppShips, size, (ship) => ship.cells.every((c) => myShots.get(c))))}
    <p class="caption">${caption(state.last, me, t)}</p>
    <p class="sea-title">${t('bs.yourSea')} · ${t('bs.left', { n: state.left[0] })}</p>
    ${grid(size, 'small', (i) => {
      const shot = oppShots.has(i);
      const cls = (own.has(i) ? (mySunkCells.has(i) ? 'onship dark' : 'onship') : '') + (shot ? (oppShots.get(i) ? ' hit' : ' miss') : '');
      return `<div class="c ${cls}${popOn(i, false)}">${shot && oppShots.get(i) ? HIT : ''}</div>`;
    }, shipsLayer(state.myShips, size, (ship) => ship.cells.every((c) => oppShots.get(c))))}`;

  el.querySelectorAll('.sea.enemy .c').forEach((b) => (b.onclick = () => api.send({ shot: +b.dataset.i })));
}

export function render(el, state, you, api, room) {
  if (state.phase === 'place') renderPlace(el, state, you, api, room);
  else renderBattle(el, state, you, api, room);
}

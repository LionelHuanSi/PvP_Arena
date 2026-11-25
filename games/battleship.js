// Bắn tàu trên biển 8x8. Hai giai đoạn:
//   place  : mỗi người xếp tàu bí mật, gửi { ships: [{ x, y, len, dir: 'h'|'v' }] }
//   battle : lần lượt bắn, gửi { shot: chỉ số ô }. Bắn trúng thì được bắn tiếp, trượt thì mất lượt.
//            Ai bắn chìm hết tàu đối thủ trước thì thắng.
// Server chỉ gửi cho mỗi người phần họ được thấy: vị trí tàu đối thủ được giữ kín.
const SIZE = 8;
const FLEET = [4, 3, 3, 2];

function shipCells({ x, y, len, dir }) {
  const cells = [];
  for (let k = 0; k < len; k++) {
    const cx = dir === 'h' ? x + k : x;
    const cy = dir === 'v' ? y + k : y;
    if (cx < 0 || cy < 0 || cx >= SIZE || cy >= SIZE) return null;
    cells.push(cy * SIZE + cx);
  }
  return cells;
}

function validFleet(list) {
  if (!Array.isArray(list) || list.length !== FLEET.length) return null;
  const lens = list.map((s) => s && s.len).sort((a, b) => b - a);
  if (lens.join() !== [...FLEET].sort((a, b) => b - a).join()) return null;
  const used = new Set();
  const ships = [];
  for (const s of list) {
    if (!Number.isInteger(s.x) || !Number.isInteger(s.y) || !['h', 'v'].includes(s.dir)) return null;
    const cells = shipCells(s);
    if (!cells || cells.some((c) => used.has(c))) return null;
    cells.forEach((c) => used.add(c));
    ships.push({ len: s.len, cells });
  }
  return ships;
}

const occupied = (ships, i) => ships.some((s) => s.cells.includes(i));
const isSunk = (ship, shots) => ship.cells.every((c) => shots.includes(c));

module.exports = {
  id: 'battleship',
  players: 2,

  init(first = 0) {
    return {
      phase: 'place',
      size: SIZE,
      fleet: FLEET,
      ships: [null, null],
      shots: [[], []],
      first,
      turn: null,
      over: false,
      winner: null,
      last: null,
    };
  },

  move(state, p, move) {
    if (state.over) return 'over';
    const o = 1 - p;

    if (state.phase === 'place') {
      if (!move || !move.ships) return 'placing';
      if (state.ships[p]) return 'chosen';
      const ships = validFleet(move.ships);
      if (!ships) return 'badPlace';
      state.ships[p] = ships;
      if (state.ships[o]) {
        state.phase = 'battle';
        state.turn = state.first;
      }
      return null;
    }

    if (state.turn !== p) return 'notTurn';
    const i = move && move.shot;
    if (!Number.isInteger(i) || i < 0 || i >= SIZE * SIZE) return 'badCell';
    if (state.shots[p].includes(i)) return 'shot';
    state.shots[p].push(i);

    const target = state.ships[o].find((s) => s.cells.includes(i));
    const sunk = target && isSunk(target, state.shots[p]) ? target.len : 0;
    state.last = { by: p, i, hit: !!target, sunk };

    if (state.ships[o].every((s) => isSunk(s, state.shots[p]))) {
      state.over = true;
      state.winner = p;
      return null;
    }
    // Trúng thì được bắn tiếp, trượt thì mất lượt.
    if (!target) state.turn = o;
    return null;
  },

  view(state, p) {
    const o = 1 - p;
    const mine = state.ships[p] || [];
    const theirs = state.ships[o] || [];
    const result = (ships, shots) => shots.map((i) => ({ i, hit: occupied(ships, i) }));
    return {
      phase: state.phase,
      size: state.size,
      fleet: state.fleet,
      turn: state.turn,
      over: state.over,
      winner: state.winner,
      last: state.last,
      ready: state.phase === 'place' ? state.ships.map(Boolean) : undefined,
      myShips: mine,
      myShots: result(theirs, state.shots[p]),
      oppShots: result(mine, state.shots[o]),
      // Tàu đối thủ chỉ lộ ra khi đã bị bắn chìm, hoặc khi ván kết thúc.
      oppShips: state.over ? theirs : theirs.filter((s) => isSunk(s, state.shots[p])),
      left: [
        mine.filter((s) => !isSunk(s, state.shots[o])).length,
        theirs.filter((s) => !isSunk(s, state.shots[p])).length,
      ],
    };
  },
};

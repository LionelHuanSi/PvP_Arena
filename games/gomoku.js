// Caro 15x15: ai có 5 quân liên tiếp trước thì thắng.
// Tùy chọn "chặn hai đầu": hàng 5 bị quân đối thủ chặn cả hai đầu thì không tính thắng.
const SIZE = 15;
const DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];

module.exports = {
  id: 'gomoku',
  players: 2,
  options: { blockTwoEnds: { type: 'bool', default: false } },

  init(first = 0, prev, options = {}) {
    return {
      size: SIZE,
      board: Array(SIZE * SIZE).fill(null),
      turn: first,
      over: false,
      winner: null,
      line: null,
      last: null,
      block: !!options.blockTwoEnds,
    };
  },

  move(state, p, move) {
    if (state.over) return 'over';
    if (state.turn !== p) return 'notTurn';
    const i = move && move.cell;
    if (!Number.isInteger(i) || i < 0 || i >= SIZE * SIZE) return 'badCell';
    if (state.board[i] !== null) return 'taken';

    state.board[i] = p;
    state.last = i;
    const x0 = i % SIZE;
    const y0 = Math.floor(i / SIZE);
    const at = (x, y) => (x < 0 || y < 0 || x >= SIZE || y >= SIZE ? undefined : state.board[y * SIZE + x]);

    for (const [dx, dy] of DIRS) {
      const line = [i];
      let x = x0 + dx, y = y0 + dy;
      while (at(x, y) === p) { line.push(y * SIZE + x); x += dx; y += dy; }
      const endA = at(x, y);
      x = x0 - dx; y = y0 - dy;
      while (at(x, y) === p) { line.unshift(y * SIZE + x); x -= dx; y -= dy; }
      const endB = at(x, y);
      if (line.length < 5) continue;
      const opp = 1 - p;
      if (state.block && endA === opp && endB === opp) continue;
      state.over = true;
      state.winner = p;
      state.line = line;
      return null;
    }
    if (state.board.every((c) => c !== null)) {
      state.over = true;
      return null;
    }
    state.turn = 1 - p;
    return null;
  },
};

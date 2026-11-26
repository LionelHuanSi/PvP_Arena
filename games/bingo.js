// Bingo 5x5 đối kháng. Mỗi người tự sắp xếp các số 1-25 trước khi chơi.
// Bảng của đối phương chỉ được gửi sau khi ván đấu kết thúc.
const SIZE = 5;
const NUMBERS = SIZE * SIZE;
const WIN_LINES = [
  [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24], [4, 8, 12, 16, 20],
];

function validBoard(board) {
  if (!Array.isArray(board) || board.length !== NUMBERS) return 'badBoard';
  const seen = new Set();
  for (const n of board) {
    if (!Number.isInteger(n) || n < 1 || n > NUMBERS) return 'badBoardNumber';
    if (seen.has(n)) return 'duplicateBoardNumber';
    seen.add(n);
  }
  return null;
}

function completedLines(board, marked) {
  const markedSet = new Set(marked);
  return WIN_LINES.reduce((done, line, i) => {
    if (line.every((cell) => markedSet.has(board[cell]))) done.push(i);
    return done;
  }, []);
}

module.exports = {
  id: 'bingo',
  players: 2,

  init(first = 0, prev, options) {
    return {
      phase: 'prepare',
      boards: [null, null],
      ready: [false, false],
      marked: [],
      completedLines: [[], []],
      bingoCounts: [0, 0],
      history: [],
      lastMove: null,
      first,
      turn: null,
      over: false,
      winner: null,
    };
  },

  move(state, player, move) {
    if (state.over) return 'over';
    if (state.phase === 'prepare') {
      if (state.ready[player]) return 'chosen';
      const board = move && move.board;
      const error = validBoard(board);
      if (error) return error;
      state.boards[player] = [...board];
      state.ready[player] = true;
      if (state.ready.every(Boolean)) {
        state.phase = 'playing';
        state.turn = state.first;
      }
      return null;
    }

    if (state.phase !== 'playing') return 'badMove';
    if (state.turn !== player) return 'notTurn';
    const number = move && move.number;
    if (!Number.isInteger(number) || number < 1 || number > NUMBERS) return 'badNumber';
    if (state.marked.includes(number)) return 'takenNumber';

    state.marked.push(number);
    state.history.push(number);
    state.lastMove = { by: player, number };
    for (const p of [0, 1]) {
      state.completedLines[p] = completedLines(state.boards[p], state.marked);
      state.bingoCounts[p] = state.completedLines[p].length;
    }

    const reached = state.bingoCounts.map((count) => count >= 5);
    if (reached[0] || reached[1]) {
      state.over = true;
      state.winner = reached[0] && reached[1] ? null : reached.findIndex(Boolean);
      return null;
    }

    state.turn = 1 - player;
    return null;
  },

  view(state, player) {
    const opponent = 1 - player;
    return {
      phase: state.phase,
      board: state.boards[player],
      opponentBoard: state.over ? state.boards[opponent] : null,
      ready: [...state.ready],
      marked: [...state.marked],
      completedLines: [...state.completedLines[player]],
      opponentCompletedLines: state.over ? [...state.completedLines[opponent]] : [],
      bingoCounts: [...state.bingoCounts],
      history: [...state.history],
      lastMove: state.lastMove,
      first: state.first,
      turn: state.turn,
      over: state.over,
      winner: state.winner,
    };
  },

  // Exported for focused tests and for consumers that need the immutable line map.
  lines: WIN_LINES,
};

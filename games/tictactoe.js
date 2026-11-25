// Caro 3x3. Mỗi trò là một module:
//   id, players          : thông tin
//   autoNext             : true nếu server tự bắt đầu ván mới sau khi ván kết thúc
//   options              : tùy chọn khi tạo phòng { key: { type: 'bool', default } }
//   init(first, prev, options) : trạng thái ván mới (prev là ván trước, null nếu trận mới)
//   move(state, player, move)  : áp dụng nước đi, trả về mã lỗi nếu không hợp lệ
//   view(state, player, options) (tùy chọn) : phần trạng thái người chơi được thấy
// Trạng thái luôn có: turn (null nếu ra tay cùng lúc), over, winner (null nếu hòa).

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

module.exports = {
  id: 'tictactoe',
  players: 2,

  init(first = 0) {
    return { board: Array(9).fill(null), turn: first, over: false, winner: null, line: null };
  },

  move(state, player, move) {
    if (state.over) return 'over';
    if (state.turn !== player) return 'notTurn';
    const i = move && move.cell;
    if (!Number.isInteger(i) || i < 0 || i > 8) return 'badCell';
    if (state.board[i] !== null) return 'taken';

    state.board[i] = player;
    for (const line of LINES) {
      if (line.every((c) => state.board[c] === player)) {
        state.over = true;
        state.winner = player;
        state.line = line;
        return null;
      }
    }
    if (state.board.every((c) => c !== null)) {
      state.over = true;
      return null;
    }
    state.turn = 1 - player;
    return null;
  },
};

// Luật cờ caro 3x3. Mỗi trò chơi là một module có cùng khuôn mẫu:
//   id, name, players  : thông tin trò chơi
//   init(firstPlayer)  : trả về trạng thái ban đầu
//   move(state, player, move) : áp dụng nước đi, trả về chuỗi lỗi nếu không hợp lệ
// Trạng thái phải có: turn (lượt của người chơi số mấy), over (đã kết thúc chưa),
// winner (số người thắng, hoặc null nếu hòa).

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

module.exports = {
  id: 'tictactoe',
  name: 'Caro 3x3',
  players: 2,

  init(firstPlayer = 0) {
    return { board: Array(9).fill(null), turn: firstPlayer, over: false, winner: null, line: null };
  },

  move(state, player, move) {
    if (state.over) return 'Ván đã kết thúc';
    if (state.turn !== player) return 'Chưa tới lượt bạn';
    const i = move && move.cell;
    if (!Number.isInteger(i) || i < 0 || i > 8) return 'Ô không hợp lệ';
    if (state.board[i] !== null) return 'Ô đã có quân';

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

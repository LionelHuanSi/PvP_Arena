// Nạp đạn - Khiên - Bắn. Mỗi lượt hai người ra tay cùng lúc:
//   load   : thêm 1 viên đạn
//   shield : đỡ mọi phát bắn trong lượt này
//   shoot  : tốn 1 viên đạn, trúng nếu đối thủ đang nạp đạn
// Hai người cùng bắn thì đạn va nhau, cả hai mất đạn. Ai trúng đạn thì thua ván.
const MOVES = ['load', 'shield', 'shoot'];

module.exports = {
  id: 'bang',
  players: 2,
  autoNext: true,

  init() {
    return { turn: null, choice: [null, null], ammo: [0, 0], over: false, winner: null, reveal: null, n: 0 };
  },

  move(state, p, move) {
    if (state.over) return 'over';
    const c = move && move.choice;
    if (!MOVES.includes(c)) return 'badMove';
    if (state.choice[p]) return 'chosen';
    if (c === 'shoot' && state.ammo[p] < 1) return 'noAmmo';
    state.choice[p] = c;
    if (state.choice.includes(null)) return null;

    const choices = [...state.choice];
    const hit = [false, false];
    choices.forEach((c, i) => {
      if (c === 'load') state.ammo[i]++;
      if (c === 'shoot') state.ammo[i]--;
    });
    if (choices[0] === 'shoot' && choices[1] === 'load') hit[1] = true;
    if (choices[1] === 'shoot' && choices[0] === 'load') hit[0] = true;

    state.n++;
    state.choice = [null, null];
    state.winner = hit[1] ? 0 : hit[0] ? 1 : null;
    state.over = state.winner !== null;
    state.reveal = { n: state.n, choices, hit, winner: state.winner };
    return null;
  },

  view(state, p) {
    const { choice, ...rest } = state;
    return { ...rest, mine: choice[p], ready: choice.map(Boolean) };
  },
};

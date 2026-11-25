// Nạp đạn - Khiên - Bắn. Mỗi lượt hai người ra tay cùng lúc:
//   load   : thêm 1 viên đạn
//   shield : đỡ phát bắn thường trong lượt này
//   shoot  : tốn 1 viên đạn, trúng nếu đối thủ đang nạp đạn
//   kame   : Kamehameha, cần 5 viên đạn, khiên không đỡ được, thắng ngay
// Hai người cùng bắn, hoặc cùng Kamehameha, thì hòa và sang ván mới.
const MOVES = ['load', 'shield', 'shoot', 'kame'];
const KAME_COST = 5;

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
    if (c === 'kame' && state.ammo[p] < KAME_COST) return 'noKame';
    state.choice[p] = c;
    if (state.choice.includes(null)) return null;

    const choices = [...state.choice];
    const [a, b] = choices;
    const hit = [false, false];
    choices.forEach((c, i) => {
      if (c === 'load') state.ammo[i]++;
      if (c === 'shoot') state.ammo[i]--;
      if (c === 'kame') state.ammo[i] -= KAME_COST;
    });

    let draw = false;
    if (a === b && (a === 'kame' || a === 'shoot')) draw = true;
    else if (a === 'kame') hit[1] = true;
    else if (b === 'kame') hit[0] = true;
    else if (a === 'shoot' && b === 'load') hit[1] = true;
    else if (b === 'shoot' && a === 'load') hit[0] = true;

    state.n++;
    state.choice = [null, null];
    state.winner = hit[1] ? 0 : hit[0] ? 1 : null;
    state.over = draw || state.winner !== null;
    state.reveal = { n: state.n, choices, hit, winner: state.winner };
    return null;
  },

  view(state, p) {
    const { choice, ...rest } = state;
    return { ...rest, mine: choice[p], ready: choice.map(Boolean) };
  },
};

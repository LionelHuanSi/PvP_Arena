// Oẳn tù tì. Hai người ra tay cùng lúc, server giữ kín lựa chọn tới khi cả hai đã chọn.
const BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

module.exports = {
  id: 'rps',
  players: 2,
  autoNext: true,
  options: { showHistory: { type: 'bool', default: true } },

  init(first, prev) {
    return {
      turn: null,
      choice: [null, null],
      over: false,
      winner: null,
      reveal: null,
      history: prev ? prev.history : [],
    };
  },

  move(state, p, move) {
    if (state.over) return 'over';
    const c = move && move.choice;
    if (!BEATS[c]) return 'badMove';
    if (state.choice[p]) return 'chosen';
    state.choice[p] = c;
    if (state.choice.includes(null)) return null;

    const [a, b] = state.choice;
    const winner = a === b ? null : BEATS[a] === b ? 0 : 1;
    state.over = true;
    state.winner = winner;
    state.reveal = { n: 1, choices: [a, b], winner };
    state.history = [...state.history, { choices: [a, b], winner }].slice(-20);
    return null;
  },

  view(state, p, options) {
    const { choice, ...rest } = state;
    return {
      ...rest,
      mine: choice[p],
      ready: choice.map(Boolean),
      history: options.showHistory ? state.history : [],
    };
  },
};

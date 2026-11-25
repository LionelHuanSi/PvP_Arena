// Giao diện cờ caro 3x3.
//   piece(player) : hình quân của người chơi, hiện trên thẻ người chơi
//   render(container, state, you, api, room) : vẽ bàn cờ
const X = '<svg viewBox="0 0 100 100"><path d="M22 22 L78 78 M78 22 L22 78" stroke="currentColor" stroke-width="12" stroke-linecap="square"/></svg>';
const O = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="12"/></svg>';

let prevBoard = null;

export function reset() {
  prevBoard = null;
}

export function piece(player) {
  return player === 0 ? X : O;
}

export function render(el, state, you, api) {
  el.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'ttt';
  state.board.forEach((cell, i) => {
    const b = document.createElement('button');
    b.innerHTML = cell === null ? '' : piece(cell);
    b.disabled = state.over || cell !== null || state.turn !== you;
    if (state.line && state.line.includes(i)) b.classList.add('win');
    if (prevBoard && cell !== null && prevBoard[i] === null) b.classList.add('pop');
    b.onclick = () => api.send({ cell: i });
    grid.appendChild(b);
  });
  el.appendChild(grid);
  prevBoard = [...state.board];
}

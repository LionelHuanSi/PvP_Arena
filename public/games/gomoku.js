// Giao diện caro 15x15. Dùng chung hình quân X/O với caro 3x3.
import { piece } from './tictactoe.js';

export { piece };

let prevBoard = null;

export function reset() {
  prevBoard = null;
}

export function render(el, state, you, api) {
  el.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'gomoku';
  grid.style.gridTemplateColumns = `repeat(${state.size}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${state.size}, 1fr)`;
  state.board.forEach((cell, i) => {
    const b = document.createElement('button');
    b.innerHTML = cell === null ? '' : piece(cell);
    b.disabled = state.over || cell !== null || state.turn !== you;
    if (state.line && state.line.includes(i)) b.classList.add('win');
    if (state.last === i) b.classList.add('last');
    if (prevBoard && cell !== null && prevBoard[i] === null) b.classList.add('pop');
    b.onclick = () => api.send({ cell: i });
    grid.appendChild(b);
  });
  el.appendChild(grid);
  prevBoard = [...state.board];
}

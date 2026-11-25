// Giao diện cờ caro 3x3. Mỗi trò chơi có một file giao diện riêng, xuất ra:
//   piece(player) : hình quân của người chơi (SVG), dùng cho thẻ người chơi
//   render(container, state, you, sendMove) : vẽ bàn cờ
const X = '<svg viewBox="0 0 100 100"><path d="M22 22 L78 78 M78 22 L22 78" stroke="currentColor" stroke-width="12" stroke-linecap="square"/></svg>';
const O = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="12"/></svg>';

export function piece(player) {
  return player === 0 ? X : O;
}

export function render(el, state, you, sendMove) {
  el.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'ttt';
  state.board.forEach((cell, i) => {
    const b = document.createElement('button');
    b.innerHTML = cell === null ? '' : piece(cell);
    b.disabled = state.over || cell !== null || state.turn !== you;
    if (state.line && state.line.includes(i)) b.classList.add('win');
    b.onclick = () => sendMove({ cell: i });
    grid.appendChild(b);
  });
  el.appendChild(grid);
}

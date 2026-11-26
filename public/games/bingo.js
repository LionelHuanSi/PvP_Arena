// Giao diện Bingo 5x5: người chơi tự điền bảng rồi lần lượt chọn số.
const SIZE = 5;
const TOTAL = SIZE * SIZE;
const LETTERS = ['B', 'I', 'N', 'G', 'O'];
const LINES = [
  [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24], [4, 8, 12, 16, 20],
];

let draft = null;

export function reset() {
  draft = null;
}

function draftKey(room) {
  return `${room.code}:${room.round}`;
}

function ensureDraft(room) {
  const key = draftKey(room);
  if (!draft || draft.key !== key) draft = { key, values: Array(TOTAL).fill('') };
  return draft;
}

function valueOf(raw) {
  if (!/^\d{1,2}$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= TOTAL ? n : null;
}

function escapeAttr(value) {
  return String(value).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function validation(values) {
  const numbers = values.map(valueOf);
  const counts = new Map();
  numbers.filter((n) => n !== null).forEach((n) => counts.set(n, (counts.get(n) || 0) + 1));
  const duplicate = new Set([...counts].filter(([, count]) => count > 1).map(([n]) => n));
  const valid = numbers.every((n) => n !== null) && duplicate.size === 0;
  return { numbers, duplicate, valid };
}

function refreshPreparation(el, state, you, t) {
  const current = ensureDraft({ code: el.dataset.room, round: el.dataset.round });
  const result = validation(current.values);
  const filled = current.values.filter((v) => v !== '').length;
  const used = new Set(result.numbers.filter((n) => n !== null));

  const counter = el.querySelector('[data-bingo-count]');
  if (counter) counter.textContent = `${t('bingo.filled')}: ${filled}/${TOTAL}`;
  const unused = el.querySelector('[data-bingo-unused]');
  if (unused) {
    unused.textContent = `${t('bingo.unused')}: ${Array.from({ length: TOTAL }, (_, i) => i + 1).filter((n) => !used.has(n)).join(', ') || t('bingo.none')}`;
  }
  el.querySelectorAll('[data-cell]').forEach((input) => {
    const i = +input.dataset.cell;
    const n = valueOf(current.values[i]);
    input.classList.toggle('invalid', current.values[i] !== '' && (n === null || result.duplicate.has(n)));
    input.setAttribute('aria-invalid', input.classList.contains('invalid') ? 'true' : 'false');
  });
  const ready = el.querySelector('[data-act="ready"]');
  if (ready) ready.disabled = !result.valid || you < 0 || state.ready[you];
  const message = el.querySelector('[data-bingo-validation]');
  if (message) {
    message.textContent = result.valid ? t('bingo.validBoard') : t('bingo.fillHint');
    message.classList.toggle('ok', result.valid);
  }
}

function renderPreparation(el, state, you, api, room) {
  const { t } = api;
  const current = ensureDraft(room);
  const locked = you >= 0 && state.ready[you] && Array.isArray(state.board);
  if (locked) {
    el.innerHTML = `<p class="hint">${t('bingo.waitReady')}</p>${boardHtml(state.board, [], new Set(), false, false, t('bingo.yourBoard'))}`;
    return;
  }

  el.dataset.room = room.code;
  el.dataset.round = room.round;
  el.innerHTML = `
    <div class="bingo-prepare">
      <p class="hint">${t('bingo.prepareHint')}</p>
      <div class="bingo-meta"><strong data-bingo-count></strong><span data-bingo-unused></span></div>
      <div class="bingo-grid bingo-input-grid">
        ${current.values.map((value, i) => `<input data-cell="${i}" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" aria-label="${escapeAttr(t('bingo.cell', { n: i + 1 }))}" value="${escapeAttr(value)}">`).join('')}
      </div>
      <p class="bingo-validation" data-bingo-validation></p>
      <div class="tools">
        <button class="small" data-act="clear" ${you < 0 ? 'disabled' : ''}>${t('bingo.clear')}</button>
        <button data-act="ready" disabled>${t('bingo.ready')}</button>
      </div>
    </div>`;

  const redraw = () => refreshPreparation(el, state, you, t);
  el.querySelectorAll('[data-cell]').forEach((input) => {
    input.addEventListener('input', () => {
      clearTimeout(input.advanceTimer);
      current.values[+input.dataset.cell] = input.value.trim();
      redraw();
      const n = valueOf(input.value.trim());
      const focusNext = () => {
        const next = el.querySelector(`[data-cell="${+input.dataset.cell + 1}"]`);
        if (next) next.focus();
      };
      if (n !== null && input.value.length === 2) focusNext();
      else if (n !== null && input.value.length === 1) input.advanceTimer = setTimeout(focusNext, 550);
    });
    input.addEventListener('keydown', (event) => {
      const i = +input.dataset.cell;
      if (event.key === 'Enter' || event.key === 'ArrowRight' || event.key === 'Tab') {
        if (event.key !== 'Tab') event.preventDefault();
        el.querySelector(`[data-cell="${Math.min(TOTAL - 1, i + 1)}"]`)?.focus();
      } else if (event.key === 'Backspace' && input.value === '' && i > 0) {
        el.querySelector(`[data-cell="${i - 1}"]`)?.focus();
      }
    });
  });
  el.querySelector('[data-act="clear"]').onclick = () => {
    current.values.fill('');
    el.querySelectorAll('[data-cell]').forEach((input) => (input.value = ''));
    redraw();
  };
  el.querySelector('[data-act="ready"]').onclick = () => {
    const result = validation(current.values);
    if (result.valid && you >= 0 && !state.ready[you]) api.send({ board: result.numbers });
  };
  redraw();
}

function progress(count, t) {
  return `<div class="bingo-progress" aria-label="${t('bingo.progress', { n: count })}">
    ${LETTERS.map((letter, i) => `<span class="${i < count ? 'done' : ''}">${letter}</span>`).join('')}
  </div>`;
}

function boardHtml(board, completedLines, marked, canChoose, reveal, title, lastNumber, api) {
  const lineCells = new Set(completedLines.flatMap((line) => LINES[line] || []));
  return `<section class="bingo-panel">
    <p class="sea-title">${title}</p>
    <div class="bingo-grid bingo-board" aria-label="${title}">
      ${board.map((number, i) => {
        const isMarked = marked.has(number);
        const classes = [
          isMarked ? 'marked' : '',
          lineCells.has(i) ? 'complete' : '',
          lastNumber === number ? 'pop last' : '',
        ].filter(Boolean).join(' ');
        const tag = canChoose ? 'button' : 'div';
        return `<${tag} class="bingo-cell ${classes}" data-number="${number}" ${tag === 'button' ? `type="button" ${isMarked ? 'disabled' : ''}` : ''}>${number}</${tag}>`;
      }).join('')}
    </div>
  </section>`;
}

function historyHtml(history, t) {
  return `<section class="bingo-history"><p class="hist-title">${t('bingo.history')}</p>${history.length
    ? `<div class="bingo-history-list">${history.map((number, i) => `<span>${i + 1}. ${number}</span>`).join('')}</div>`
    : `<p class="muted">${t('bingo.noHistory')}</p>`}</section>`;
}

function renderPlaying(el, state, you, api) {
  const { t } = api;
  const me = you >= 0 ? you : 0;
  const opponent = 1 - me;
  const marked = new Set(state.marked);
  const canChoose = you >= 0 && !state.over && state.turn === you;
  const ownTitle = `${t('bingo.yourBoard')} · ${t('bingo.progress', { n: state.bingoCounts[me] })}`;
  const last = state.lastMove
    ? (state.lastMove.by === me ? t('bingo.lastYou', { n: state.lastMove.number }) : t('bingo.lastOpponent', { n: state.lastMove.number }))
    : t('bingo.lastNone');
  let html = `<div class="bingo-scoreboard">
      <div><span>${t('you')}</span>${progress(state.bingoCounts[me], t)}</div>
      <div><span>${t('opponent')}</span>${progress(state.bingoCounts[opponent], t)}</div>
    </div><p class="caption bingo-last">${last}</p>`;
  html += boardHtml(state.board, state.completedLines, marked, canChoose, false, ownTitle, state.lastMove?.number, api);
  if (state.over && state.opponentBoard) {
    html += boardHtml(state.opponentBoard, state.opponentCompletedLines, marked, false, true,
      `${t('bingo.opponentBoard')} · ${t('bingo.progress', { n: state.bingoCounts[opponent] })}`, state.lastMove?.number, api);
  } else {
    html += `<p class="bingo-private">${t('bingo.privateBoard')}</p>`;
  }
  html += historyHtml(state.history, t);
  el.innerHTML = html;
  el.querySelectorAll('.bingo-board button').forEach((button) => {
    button.onclick = () => api.send({ number: Number(button.dataset.number) });
  });
}

export function status(state, you, t) {
  if (state.phase === 'prepare') return state.ready[you] ? t('bingo.waitReady') : t('bingo.prepare');
  if (state.over) return null;
  return state.turn === you ? t('bingo.yourTurn') : t('bingo.oppTurn');
}

export function render(el, state, you, api, room) {
  if (state.phase === 'prepare') renderPreparation(el, state, you, api, room);
  else renderPlaying(el, state, you, api);
}

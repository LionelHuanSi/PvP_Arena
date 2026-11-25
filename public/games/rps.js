// Giao diện oẳn tù tì.
import { rpsHand } from './hands.js';
import { createRevealer } from './reveal.js';

const MOVES = ['rock', 'paper', 'scissors'];
const R = createRevealer();

export const reset = R.reset;
export const busy = R.busy;

export function status(state, you, t) {
  if (state.mine) return t('waitingChoice');
  return state.ready[1 - you] ? t('oppReady') : t('chooseMove');
}

function historyHtml(history, me, t) {
  if (!history.length) return '';
  const items = history.slice(-12).map((h) => {
    const cls = h.winner === null ? 'tie' : h.winner === me ? 'won' : 'lost';
    return `<div class="hist-item ${cls}">${rpsHand(h.choices[me])}${rpsHand(h.choices[1 - me])}</div>`;
  }).join('');
  return `<div class="hist">
    <div class="hist-title">${t('history')}</div>
    <div class="hist-body">
      <div class="hist-labels"><span>${t('you')}</span><span>${t('opponent')}</span></div>
      <div class="hist-items">${items}</div>
    </div>
  </div>`;
}

export function render(el, state, you, api, room) {
  if (R.busy()) return;
  const { t } = api;
  const me = you < 0 ? 0 : you;
  const opp = 1 - me;
  const rev = state.reveal;
  const animate = R.isNew(rev ? `${room.round}:${rev.n}` : null);
  const shown = rev && !animate;
  const shapes = shown ? [rev.choices[me], rev.choices[opp]] : ['rock', 'rock'];
  const loseCls = (i) => (shown && rev.winner !== null && rev.winner !== i ? 'lose' : '');
  const disabled = you < 0 || state.over || !!state.mine || animate;
  const history = animate ? state.history.slice(0, -1) : state.history;

  el.innerHTML = `
    <div class="arena ${animate ? 'shake' : ''}">
      <div class="side ${loseCls(me)}"><div class="hand">${rpsHand(shapes[0])}</div></div>
      <div class="vs">VS</div>
      <div class="side ${loseCls(opp)}"><div class="hand mirror">${rpsHand(shapes[1])}</div></div>
    </div>
    <div class="choices">
      ${MOVES.map((m) => `<button class="choice ${state.mine === m ? 'picked' : ''}" data-m="${m}" ${disabled ? 'disabled' : ''}>
        ${rpsHand(m)}<span>${t('rps.' + m)}</span></button>`).join('')}
    </div>
    ${historyHtml(history, me, t)}`;

  el.querySelectorAll('.choice').forEach((b) => (b.onclick = () => api.send({ choice: b.dataset.m })));

  if (animate) {
    R.run(api, () => {
      const arena = el.querySelector('.arena');
      arena.classList.remove('shake');
      arena.classList.add('revealed');
      const sides = arena.querySelectorAll('.side');
      sides[0].querySelector('.hand').innerHTML = rpsHand(rev.choices[me]);
      sides[1].querySelector('.hand').innerHTML = rpsHand(rev.choices[opp]);
      if (rev.winner !== null) sides[rev.winner === me ? 1 : 0].classList.add('lose');
    });
  }
}

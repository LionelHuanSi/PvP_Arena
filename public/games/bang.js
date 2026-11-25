// Giao diện Nạp đạn - Khiên - Bắn.
import { bangHands, BURST } from './hands.js';
import { createRevealer } from './reveal.js';

const MOVES = ['load', 'shield', 'shoot'];
const R = createRevealer();
let lastAmmo = [0, 0];

export const busy = R.busy;
export function reset() {
  R.reset();
  lastAmmo = [0, 0];
}

export function status(state, you, t) {
  if (state.mine) return t('waitingChoice');
  return state.ready[1 - you] ? t('oppReady') : t('chooseMove');
}

function caption(rev, t) {
  const [a, b] = rev.choices;
  if (rev.hit[0] || rev.hit[1]) return t('bang.hit');
  if (a === 'shoot' && b === 'shoot') return t('bang.clash');
  if ((a === 'shoot' && b === 'shield') || (b === 'shoot' && a === 'shield')) return t('bang.blocked');
  return '';
}

function ammoHtml(n, t) {
  const pips = n > 0 ? '<i></i>'.repeat(Math.min(n, 8)) + (n > 8 ? ` +${n - 8}` : '') : '0';
  return `<div class="ammo">${t('bang.ammo')}: ${pips}</div>`;
}

export function render(el, state, you, api, room) {
  if (R.busy()) return;
  const { t } = api;
  const me = you < 0 ? 0 : you;
  const opp = 1 - me;
  const rev = state.reveal;
  const animate = R.isNew(rev ? `${room.round}:${rev.n}` : null);
  const shown = rev && !animate;
  const shapes = shown ? [rev.choices[me], rev.choices[opp]] : ['fist', 'fist'];
  const ammo = animate ? lastAmmo : state.ammo;
  const hitCls = (i) => (shown && rev.hit[i] ? 'hit' : '');
  const disabled = you < 0 || state.over || !!state.mine || animate;

  el.innerHTML = `
    <div class="arena bang ${animate ? 'shake' : ''}">
      <div class="side ${hitCls(me)}"><div class="hand">${bangHands(shapes[0])}</div><div class="fx">${BURST}</div>${ammoHtml(ammo[me], t)}</div>
      <div class="side ${hitCls(opp)}"><div class="hand mirror">${bangHands(shapes[1])}</div><div class="fx">${BURST}</div>${ammoHtml(ammo[opp], t)}</div>
    </div>
    <p class="caption">${shown ? caption(rev, t) : ''}</p>
    <div class="choices">
      ${MOVES.map((m) => {
        const off = disabled || (m === 'shoot' && state.ammo[me] < 1);
        return `<button class="choice wide ${state.mine === m ? 'picked' : ''}" data-m="${m}" ${off ? 'disabled' : ''}>
          ${bangHands(m)}<span>${t('bang.' + m)}</span></button>`;
      }).join('')}
    </div>`;

  el.querySelectorAll('.choice').forEach((b) => (b.onclick = () => api.send({ choice: b.dataset.m })));

  if (animate) {
    R.run(api, () => {
      const arena = el.querySelector('.arena');
      arena.classList.remove('shake');
      arena.classList.add('revealed');
      const sides = arena.querySelectorAll('.side');
      sides[0].querySelector('.hand').innerHTML = bangHands(rev.choices[me]);
      sides[1].querySelector('.hand').innerHTML = bangHands(rev.choices[opp]);
      if (rev.hit[me]) sides[0].classList.add('hit');
      if (rev.hit[opp]) sides[1].classList.add('hit');
      el.querySelector('.caption').textContent = caption(rev, t);
    });
  } else {
    lastAmmo = [...state.ammo];
  }
}

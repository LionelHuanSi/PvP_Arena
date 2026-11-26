import { t, LANGS, getLang, setLang, applyI18n } from '/i18n.js';

const $ = (id) => document.getElementById(id);
const show = (id) => ['lobby', 'room'].forEach((s) => ($(s).hidden = s !== id));

let ws;
let gamesList = [];
let current = null;     // trạng thái phòng gần nhất từ server
let gameUI = null;      // module giao diện của trò đang chơi
let gameUIKey = null;   // trò + mã phòng của module đang dùng
let shownScore = null;  // tỉ số đang hiển thị (giữ nguyên khi hiệu ứng chưa chạy xong)

// ---------- Ngôn ngữ ----------
function renderLang() {
  $('lang').innerHTML = LANGS.map(([code, name]) =>
    `<button class="${code === getLang() ? 'on' : ''}" data-lang="${code}" title="${name}">${code.toUpperCase()}</button>`
  ).join('');
}
$('lang').onclick = (e) => {
  const code = e.target.dataset.lang;
  if (!code) return;
  setLang(code);
  renderLang();
  renderGameSelect();
  if (current) renderRoom();
};
renderLang();
applyI18n();

// ---------- Sảnh ----------
$('name').value = localStorage.getItem('name') || '';
const urlRoom = new URLSearchParams(location.search).get('room');
if (urlRoom) $('code').value = urlRoom.toUpperCase();

function myName() {
  const n = $('name').value.trim();
  localStorage.setItem('name', n);
  return n;
}

function renderGameSelect() {
  const selected = $('game').value || localStorage.getItem('game');
  $('game').innerHTML = gamesList.map((g) => `<option value="${g.id}">${t('game.' + g.id)}</option>`).join('');
  if (gamesList.some((g) => g.id === selected)) $('game').value = selected;
  renderOptions();
}

function renderOptions() {
  const game = gamesList.find((g) => g.id === $('game').value);
  const opts = game ? Object.entries(game.options) : [];
  $('options').innerHTML = opts.map(([key, def]) =>
    `<label class="check"><input type="checkbox" data-opt="${key}" ${def.default ? 'checked' : ''}> ${t('opt.' + key)}</label>`
  ).join('');
}

function oddBo(v) {
  let n = Math.min(99, Math.max(1, parseInt(v, 10) || 3));
  if (n % 2 === 0) n += 1;
  return Math.min(n, 99);
}
$('bo').addEventListener('change', () => ($('bo').value = oddBo($('bo').value)));

$('game').onchange = () => {
  localStorage.setItem('game', $('game').value);
  renderOptions();
};

// ---------- Kết nối ----------
function sendMsg(msg) {
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
}

function connect() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(`${proto}://${location.host}`);

  ws.onopen = () => {
    $('conn').hidden = true;
    sendMsg({ type: 'hello' });
    // Kết nối lại sau khi rớt mạng: vào lại phòng cũ.
    if (current) sendMsg({ type: 'join', code: current.code, name: myName() });
    else show('lobby');
  };

  ws.onclose = () => {
    $('conn').textContent = t('lost');
    $('conn').hidden = false;
    setTimeout(connect, 2000);
  };

  ws.onmessage = async (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === 'games') {
      gamesList = msg.games;
      renderGameSelect();
    } else if (msg.type === 'error') {
      $('error').textContent = t('err.' + msg.code);
      clearTimeout(ws.errTimer);
      ws.errTimer = setTimeout(() => ($('error').textContent = ''), 3000);
    } else if (msg.type === 'state') {
      const key = msg.game + ':' + msg.code;
      if (gameUIKey !== key) {
        gameUI = await import(`/games/${msg.game}.js`);
        gameUI.reset?.();
        gameUIKey = key;
        shownScore = null;
      }
      current = msg;
      history.replaceState(null, '', `?room=${msg.code}`);
      renderRoom();
    }
  };
}

// ---------- Phòng chơi ----------
function nameOf(i) {
  return current.names[i] || t('player', { n: i + 1 });
}

const api = {
  t,
  send: (move) => sendMsg({ type: 'move', move }),
  rerender: () => current && renderRoom(),
};

function esc(s) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function renderPlayers(busy) {
  const { state, you, connected } = current;
  const waiting = connected.includes(false);
  // Thẻ của mình luôn đứng đầu, khớp với bàn tay của mình bên trái.
  const order = current.names.map((_, i) => i);
  if (you > 0) order.unshift(...order.splice(you, 1));
  $('players').innerHTML = order.map((i) => {
    const cls = ['player'];
    if (!connected[i]) cls.push('away');
    if (!busy && !waiting && !state.over && state.turn === i) cls.push('turn');
    if (!busy && state.over && state.winner === i) cls.push('turn');
    let tag = !connected[i] ? t('waiting') : i === you ? t('you') : t('opponent');
    if (connected[i] && !state.over && state.ready && state.ready[i]) tag += ' · ' + t('ready');
    return `<div class="${cls.join(' ')}">
      ${gameUI.piece ? `<div class="piece">${gameUI.piece(i)}</div>` : ''}
      <div class="info"><div class="pname">${esc(connected[i] ? nameOf(i) : '—')}</div><div class="tag">${tag}</div></div>
      <div class="score">${shownScore[i]}</div>
    </div>`;
  }).join('');
}

function renderRoom() {
  const { state, you, connected, score, target } = current;
  const waiting = connected.includes(false);
  show('room');
  $('room-code').textContent = current.code;
  $('room-game').textContent = t('game.' + current.game);
  $('room-bo').textContent = 'BO' + current.bo;

  // Vẽ bàn chơi trước: module có thể bắt đầu hiệu ứng ra tay (busy).
  gameUI.render($('board'), state, waiting ? -1 : you, api, current);
  const busy = gameUI.busy ? gameUI.busy() : false;
  if (!busy || !shownScore) shownScore = [...score];

  renderPlayers(busy);

  let status;
  if (waiting) status = t('waitOpp');
  else if (busy) status = t('revealing');
  else if (current.matchOver) status = score[you] >= target ? t('winMatch') : t('loseMatch');
  else if (state.over) {
    status = state.winner === null ? t('draw') : state.winner === you ? t('winRound') : t('loseRound');
    if (current.autoNext) status += ' ' + t('nextSoon');
  } else {
    status = gameUI.status ? gameUI.status(state, you, t) : null;
    if (!status) status = state.turn === you ? t('yourTurn') : t('turnOf', { name: nameOf(state.turn) });
  }
  $('status').textContent = status;

  const canRematch = !busy && state.over && (current.matchOver || !current.autoNext);
  $('rematch').hidden = !canRematch;
  $('rematch').textContent = current.matchOver ? t('newMatch') : t('nextRound');
}

$('create').onclick = () => {
  const options = {};
  document.querySelectorAll('[data-opt]').forEach((el) => (options[el.dataset.opt] = el.checked));
  sendMsg({ type: 'create', game: $('game').value, name: myName(), bo: oddBo($('bo').value), options });
};
$('join').onclick = () => sendMsg({ type: 'join', code: $('code').value.trim().toUpperCase(), name: myName() });
$('code').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') $('join').click();
});
$('rematch').onclick = () => sendMsg({ type: 'rematch' });
$('leave').onclick = () => {
  sendMsg({ type: 'leave' });
  current = null;
  gameUIKey = null;
  history.replaceState(null, '', '/');
  show('lobby');
};
$('copy').onclick = async () => {
  const link = `${location.origin}/?room=${current.code}`;
  const text = t('shareText', { game: t('game.' + current.game) });
  // Trên điện thoại: mở bảng chia sẻ (Messenger, Zalo...). Trên máy tính: sao chép link.
  if (navigator.share && matchMedia('(pointer: coarse)').matches) {
    try { await navigator.share({ title: 'PvP Arena', text, url: link }); } catch {}
    return;
  }
  try {
    await navigator.clipboard.writeText(link);
    $('copy').textContent = t('copied');
  } catch {
    prompt(t('copyPrompt'), link);
  }
  setTimeout(() => ($('copy').textContent = t('copyLink')), 1500);
};

connect();

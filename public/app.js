const $ = (id) => document.getElementById(id);
const show = (id) => ['lobby', 'room'].forEach((s) => ($(s).hidden = s !== id));

let ws;
let current = null;      // trạng thái phòng gần nhất từ server
let gameUI = null;       // module giao diện của trò đang chơi
let gameUIId = null;

$('name').value = localStorage.getItem('name') || '';
const urlRoom = new URLSearchParams(location.search).get('room');
if (urlRoom) $('code').value = urlRoom.toUpperCase();

function myName() {
  const n = $('name').value.trim();
  localStorage.setItem('name', n);
  return n;
}

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
    $('conn').textContent = 'Mất kết nối, đang thử lại...';
    $('conn').hidden = false;
    setTimeout(connect, 2000);
  };

  ws.onmessage = async (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === 'games') {
      $('game').innerHTML = msg.games.map((g) => `<option value="${g.id}">${g.name}</option>`).join('');
    } else if (msg.type === 'error') {
      $('error').textContent = msg.msg;
      setTimeout(() => ($('error').textContent = ''), 3000);
    } else if (msg.type === 'state') {
      current = msg;
      if (gameUIId !== msg.game) {
        gameUI = await import(`/games/${msg.game}.js`);
        gameUIId = msg.game;
      }
      history.replaceState(null, '', `?room=${msg.code}`);
      renderRoom();
    }
  };
}

function label(i) {
  return current.names[i] || 'Đối thủ';
}

function esc(t) {
  return t.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function renderPlayers() {
  const { state, you, connected, score } = current;
  const waiting = connected.includes(false);
  $('players').innerHTML = current.names.map((_, i) => {
    const cls = ['player'];
    if (!connected[i]) cls.push('away');
    if (!waiting && !state.over && state.turn === i) cls.push('turn');
    if (state.over && state.winner === i) cls.push('turn');
    const tag = !connected[i] ? 'Đang chờ...' : i === you ? 'Bạn' : 'Đối thủ';
    return `<div class="${cls.join(' ')}">
      <div class="piece">${gameUI.piece ? gameUI.piece(i) : ''}</div>
      <div class="info"><div class="pname">${esc(connected[i] ? label(i) : 'Chưa có người')}</div><div class="tag">${tag}</div></div>
      <div class="score">${score[i]}</div>
    </div>`;
  }).join('');
}

function renderRoom() {
  const { state, you, connected, score } = current;
  show('room');
  $('room-code').textContent = current.code;

  renderPlayers();

  let status;
  if (connected.includes(false)) status = 'Đang chờ đối thủ vào phòng...';
  else if (state.over && state.winner === null) status = 'Hòa!';
  else if (state.over) status = state.winner === you ? 'Bạn thắng!' : 'Bạn thua!';
  else status = state.turn === you ? 'Tới lượt bạn' : `Lượt của ${label(state.turn)}`;
  $('status').textContent = status;

  $('rematch').hidden = !state.over;
  gameUI.render($('board'), state, connected.includes(false) ? -1 : you, (move) => sendMsg({ type: 'move', move }));
}

$('create').onclick = () => sendMsg({ type: 'create', game: $('game').value, name: myName() });
$('join').onclick = () => sendMsg({ type: 'join', code: $('code').value.trim().toUpperCase(), name: myName() });
$('code').onkeydown = (e) => e.key === 'Enter' && $('join').click();
$('rematch').onclick = () => sendMsg({ type: 'rematch' });
$('leave').onclick = () => {
  sendMsg({ type: 'leave' });
  current = null;
  history.replaceState(null, '', '/');
  show('lobby');
};
$('copy').onclick = async () => {
  const link = `${location.origin}/?room=${current.code}`;
  try {
    await navigator.clipboard.writeText(link);
    $('copy').textContent = 'Đã sao chép!';
  } catch {
    prompt('Sao chép link này:', link);
  }
  setTimeout(() => ($('copy').textContent = 'Sao chép link mời'), 1500);
};

connect();

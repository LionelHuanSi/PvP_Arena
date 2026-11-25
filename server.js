const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const games = require('./games');

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

// ---------- Phục vụ file tĩnh ----------
const server = http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') url = '/index.html';
  const file = path.join(PUBLIC, path.normalize(url));
  if (!file.startsWith(PUBLIC)) return res.writeHead(403).end();
  fs.readFile(file, (err, data) => {
    if (err) return res.writeHead(404).end('Not found');
    res.writeHead(200, { 'Content-Type': (TYPES[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8' });
    res.end(data);
  });
});

// ---------- Phòng chơi ----------
// room = { code, game, players: [ws|null, ...], names: [], state, starter, score: [] }
const rooms = new Map();

function newCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function send(ws, msg) {
  if (ws && ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
}

function broadcast(room) {
  room.players.forEach((ws, i) => send(ws, {
    type: 'state',
    you: i,
    game: room.game.id,
    code: room.code,
    names: room.names,
    connected: room.players.map((p) => p !== null),
    score: room.score,
    state: room.state,
  }));
}

function leave(ws) {
  const room = ws.room;
  if (!room) return;
  const i = room.players.indexOf(ws);
  if (i !== -1) room.players[i] = null;
  ws.room = null;
  if (room.players.every((p) => p === null)) {
    rooms.delete(room.code);
    console.log(`Đóng phòng ${room.code}`);
  } else {
    broadcast(room);
  }
}

const handlers = {
  hello(ws) {
    send(ws, { type: 'games', games: Object.values(games).map((g) => ({ id: g.id, name: g.name })) });
  },

  create(ws, msg) {
    const game = games[msg.game];
    if (!game) return send(ws, { type: 'error', msg: 'Trò chơi không tồn tại' });
    leave(ws);
    const room = {
      code: newCode(),
      game,
      players: Array(game.players).fill(null),
      names: Array(game.players).fill(''),
      score: Array(game.players).fill(0),
      starter: 0,
      state: game.init(0),
    };
    room.players[0] = ws;
    room.names[0] = String(msg.name || 'Người chơi 1').slice(0, 20);
    rooms.set(room.code, room);
    ws.room = room;
    console.log(`Tạo phòng ${room.code} (${game.name})`);
    broadcast(room);
  },

  join(ws, msg) {
    const room = rooms.get(String(msg.code || '').toUpperCase());
    if (!room) return send(ws, { type: 'error', msg: 'Không tìm thấy phòng' });
    if (room === ws.room) return;
    const slot = room.players.indexOf(null);
    if (slot === -1) return send(ws, { type: 'error', msg: 'Phòng đã đủ người' });
    leave(ws);
    room.players[slot] = ws;
    room.names[slot] = String(msg.name || `Người chơi ${slot + 1}`).slice(0, 20);
    ws.room = room;
    console.log(`Vào phòng ${room.code}: ${room.names[slot]}`);
    broadcast(room);
  },

  move(ws, msg) {
    const room = ws.room;
    if (!room) return;
    if (room.players.includes(null)) return send(ws, { type: 'error', msg: 'Đang chờ đối thủ' });
    const err = room.game.move(room.state, room.players.indexOf(ws), msg.move);
    if (err) return send(ws, { type: 'error', msg: err });
    if (room.state.over && room.state.winner !== null) room.score[room.state.winner]++;
    broadcast(room);
  },

  rematch(ws) {
    const room = ws.room;
    if (!room || !room.state.over) return;
    room.starter = (room.starter + 1) % room.players.length; // đổi người đi trước
    room.state = room.game.init(room.starter);
    broadcast(room);
  },

  leave(ws) {
    leave(ws);
  },
};

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.alive = true;
  ws.on('pong', () => (ws.alive = true));
  ws.on('message', (data) => {
    let msg;
    try { msg = JSON.parse(data); } catch { return; }
    const handler = handlers[msg.type];
    if (handler) handler(ws, msg);
  });
  ws.on('close', () => leave(ws));
});

// Ping định kỳ để phát hiện kết nối chết và giữ tunnel không bị ngắt.
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.alive) return ws.terminate();
    ws.alive = false;
    ws.ping();
  });
}, 25000);

server.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));

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
// room = { code, game, options, target, players: [ws|null], names, score, starter,
//          round, state, matchOver, timer }
const rooms = new Map();
const NEXT_DELAY = 3000; // ms chờ trước khi tự bắt đầu ván mới, đủ để client chạy hiệu ứng

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

function error(ws, code) {
  send(ws, { type: 'error', code });
}

function broadcast(room) {
  const { game } = room;
  room.players.forEach((ws, i) => send(ws, {
    type: 'state',
    you: i,
    game: game.id,
    code: room.code,
    names: room.names,
    connected: room.players.map((p) => p !== null),
    score: room.score,
    bo: room.bo,
    target: room.target,
    options: room.options,
    autoNext: !!game.autoNext,
    matchOver: room.matchOver,
    round: room.round,
    state: game.view ? game.view(room.state, i, room.options) : room.state,
  }));
}

function startRound(room, keepHistory) {
  clearTimeout(room.timer);
  room.starter = (room.starter + 1) % room.players.length; // đổi người đi trước
  room.round++;
  room.state = room.game.init(room.starter, keepHistory ? room.state : null, room.options);
}

function leave(ws) {
  const room = ws.room;
  if (!room) return;
  const i = room.players.indexOf(ws);
  if (i !== -1) room.players[i] = null;
  ws.room = null;
  if (room.players.every((p) => p === null)) {
    clearTimeout(room.timer);
    rooms.delete(room.code);
    console.log(`Đóng phòng ${room.code}`);
  } else {
    broadcast(room);
  }
}

function readOptions(game, input = {}) {
  const out = {};
  for (const [key, def] of Object.entries(game.options || {})) {
    out[key] = def.type === 'bool' ? (key in input ? !!input[key] : def.default) : def.default;
  }
  return out;
}

const handlers = {
  hello(ws) {
    send(ws, {
      type: 'games',
      games: Object.values(games).map((g) => ({ id: g.id, options: g.options || {} })),
    });
  },

  create(ws, msg) {
    const game = games[msg.game];
    if (!game) return error(ws, 'noGame');
    leave(ws);
    // BOn: thắng khi đạt quá nửa số ván, ví dụ BO5 thì cần 3 điểm.
    const bo = Math.min(99, Math.max(1, parseInt(msg.bo, 10) || 3));
    const target = Math.floor(bo / 2) + 1;
    const options = readOptions(game, msg.options);
    const room = {
      code: newCode(),
      game,
      options,
      bo,
      target,
      players: Array(game.players).fill(null),
      names: Array(game.players).fill(''),
      score: Array(game.players).fill(0),
      starter: 0,
      round: 1,
      state: game.init(0, null, options),
      matchOver: false,
      timer: null,
    };
    room.players[0] = ws;
    room.names[0] = String(msg.name || '').slice(0, 20);
    rooms.set(room.code, room);
    ws.room = room;
    console.log(`Tạo phòng ${room.code} (${game.id}, BO${bo})`);
    broadcast(room);
  },

  join(ws, msg) {
    const room = rooms.get(String(msg.code || '').toUpperCase());
    if (!room) return error(ws, 'noRoom');
    if (room === ws.room) return;
    const slot = room.players.indexOf(null);
    if (slot === -1) return error(ws, 'full');
    leave(ws);
    room.players[slot] = ws;
    room.names[slot] = String(msg.name || '').slice(0, 20);
    ws.room = room;
    console.log(`Vào phòng ${room.code}: ${room.names[slot] || '(không tên)'}`);
    broadcast(room);
  },

  move(ws, msg) {
    const room = ws.room;
    if (!room) return;
    if (room.players.includes(null)) return error(ws, 'waitOpp');
    if (room.matchOver) return error(ws, 'over');
    const err = room.game.move(room.state, room.players.indexOf(ws), msg.move);
    if (err) return error(ws, err);

    const { state } = room;
    if (state.over) {
      if (state.winner !== null && ++room.score[state.winner] >= room.target) room.matchOver = true;
      if (!room.matchOver && room.game.autoNext) {
        room.timer = setTimeout(() => {
          if (rooms.get(room.code) !== room) return;
          startRound(room, true);
          broadcast(room);
        }, NEXT_DELAY);
      }
    }
    broadcast(room);
  },

  rematch(ws) {
    const room = ws.room;
    if (!room || !room.state.over) return;
    if (room.matchOver) {
      room.score.fill(0);
      room.matchOver = false;
      startRound(room, false);
    } else {
      startRound(room, true);
    }
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

function onListenError(err) {
  if (err.code === 'EADDRINUSE') {
    console.error(`Cổng ${PORT} đang bị chiếm, có thể do server cũ vẫn chạy.`);
    console.error(`Tắt nó bằng: kill $(lsof -ti :${PORT})   hoặc chạy cổng khác: PORT=3001 npm start`);
    process.exit(1);
  }
  throw err;
}
server.on('error', onListenError);
wss.on('error', onListenError);

server.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));

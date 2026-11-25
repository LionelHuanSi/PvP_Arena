// Đăng ký trò chơi ở đây. Thêm trò mới: tạo file luật trong games/,
// tạo file giao diện trong public/games/, rồi thêm một dòng require bên dưới.
const list = [
  require('./tictactoe'),
];

module.exports = Object.fromEntries(list.map((g) => [g.id, g]));

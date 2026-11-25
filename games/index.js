// Danh sách trò chơi. Thêm trò mới: tạo file luật ở đây,
// file giao diện cùng tên trong public/games/, rồi thêm một dòng require.
const list = [
  require('./tictactoe'),
  require('./rps'),
  require('./bang'),
];

module.exports = Object.fromEntries(list.map((g) => [g.id, g]));

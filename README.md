# NetChess

Chơi game đối kháng online với bạn bè, khác mạng vẫn chơi được.

## Chơi với bạn

```bash
npm install          # chỉ cần lần đầu
npm start            # chạy server ở http://localhost:3000
```

Mở terminal thứ hai để tạo link công khai:

```bash
brew install cloudflared                        # chỉ cần lần đầu
cloudflared tunnel --url http://localhost:3000
```

Terminal sẽ in ra link dạng `https://xxx.trycloudflare.com`.
Bạn mở link đó, tạo phòng, bấm "Sao chép link mời" rồi gửi cho bạn của bạn.

## Thêm trò chơi mới

1. Tạo `games/<ten-tro>.js` chứa luật: `id`, `name`, `players`, `init(firstPlayer)`, `move(state, player, move)`.
   Trạng thái phải có `turn`, `over`, `winner`. Xem `games/tictactoe.js` làm mẫu.
2. Tạo `public/games/<ten-tro>.js` chứa giao diện: hàm `render(container, state, you, sendMove)`.
3. Thêm `require('./<ten-tro>')` vào `games/index.js`.

Phần mạng và phòng chơi không cần sửa.

## Giao thức

Client và server trao đổi JSON qua WebSocket.

| Client gửi | Ý nghĩa |
|---|---|
| `{type:"create", game, name}` | Tạo phòng |
| `{type:"join", code, name}` | Vào phòng |
| `{type:"move", move}` | Đi một nước |
| `{type:"rematch"}` | Ván mới, đổi người đi trước |
| `{type:"leave"}` | Rời phòng |

Server gửi `{type:"state", ...}` cho mọi người trong phòng sau mỗi thay đổi,
và `{type:"error", msg}` khi nước đi không hợp lệ.
Server kiểm tra mọi nước đi nên không ai gian lận được từ trình duyệt.

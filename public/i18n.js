// Bản dịch giao diện. Thêm ngôn ngữ: thêm một khối vào DICT và một dòng vào LANGS.
export const LANGS = [
  ['vi', 'Tiếng Việt'],
  ['en', 'English'],
  ['ja', '日本語'],
  ['ko', '한국어'],
  ['zh', '中文'],
];

const DICT = {
  vi: {
    yourName: 'Tên của bạn', namePh: 'Nhập tên', create: 'Tạo phòng', game: 'Trò chơi',
    format: 'Thể thức', join: 'Vào phòng', roomCode: 'Mã phòng', codePh: 'VD: AB3K',
    room: 'Phòng', copyLink: 'Sao chép link mời', copied: 'Đã sao chép!', copyPrompt: 'Sao chép link này:',
    leave: 'Rời phòng', nextRound: 'Ván tiếp', newMatch: 'Trận mới', you: 'Bạn', opponent: 'Đối thủ',
    waiting: 'Đang chờ...', player: 'Người chơi {n}', ready: 'Đã chọn', lost: 'Mất kết nối, đang thử lại...',
    waitOpp: 'Đang chờ đối thủ vào phòng...', yourTurn: 'Tới lượt bạn', turnOf: 'Lượt của {name}',
    draw: 'Hòa!', winRound: 'Bạn thắng ván này!', loseRound: 'Bạn thua ván này!',
    winMatch: 'Bạn thắng cả trận!', loseMatch: 'Bạn thua cả trận!', nextSoon: 'Ván mới sắp bắt đầu...', revealing: 'Một, hai, ba...', chooseMove: 'Chọn nước đi',
    waitingChoice: 'Đã chọn, chờ đối thủ...', oppReady: 'Đối thủ đã chọn xong, tới bạn!',
    history: 'Lịch sử', round: 'Ván',
    'err.noGame': 'Trò chơi không tồn tại', 'err.noRoom': 'Không tìm thấy phòng', 'err.full': 'Phòng đã đủ người',
    'err.waitOpp': 'Đang chờ đối thủ', 'err.over': 'Ván đã kết thúc', 'err.notTurn': 'Chưa tới lượt bạn',
    'err.badCell': 'Ô không hợp lệ', 'err.taken': 'Ô đã có quân', 'err.badMove': 'Nước đi không hợp lệ',
    'err.noAmmo': 'Hết đạn rồi, nạp đạn trước!', 'err.chosen': 'Bạn đã chọn rồi',
    'game.tictactoe': 'Caro 3x3', 'game.rps': 'Oẳn tù tì', 'game.bang': 'Nạp đạn - Khiên - Bắn',
    'opt.showHistory': 'Hiện lịch sử ra tay của đối phương',
    'rps.rock': 'Búa', 'rps.paper': 'Bao', 'rps.scissors': 'Kéo',
    'bang.load': 'Nạp đạn', 'bang.shield': 'Khiên', 'bang.shoot': 'Bắn', 'bang.ammo': 'Đạn',
    'bang.blocked': 'Đỡ được!', 'bang.clash': 'Hai viên đạn va nhau!', 'bang.hit': 'Trúng đạn!',
  },
  en: {
    yourName: 'Your name', namePh: 'Enter your name', create: 'Create room', game: 'Game',
    format: 'Format', join: 'Join room', roomCode: 'Room code', codePh: 'e.g. AB3K',
    room: 'Room', copyLink: 'Copy invite link', copied: 'Copied!', copyPrompt: 'Copy this link:',
    leave: 'Leave', nextRound: 'Next round', newMatch: 'New match', you: 'You', opponent: 'Opponent',
    waiting: 'Waiting...', player: 'Player {n}', ready: 'Ready', lost: 'Connection lost, retrying...',
    waitOpp: 'Waiting for an opponent to join...', yourTurn: 'Your turn', turnOf: "{name}'s turn",
    draw: 'Draw!', winRound: 'You won this round!', loseRound: 'You lost this round!',
    winMatch: 'You won the match!', loseMatch: 'You lost the match!', nextSoon: 'Next round starting...', revealing: 'One, two, three...', chooseMove: 'Make your move',
    waitingChoice: 'Locked in, waiting for opponent...', oppReady: 'Opponent is ready, your move!',
    history: 'History', round: 'Round',
    'err.noGame': 'Game not found', 'err.noRoom': 'Room not found', 'err.full': 'Room is full',
    'err.waitOpp': 'Waiting for opponent', 'err.over': 'This round is over', 'err.notTurn': 'Not your turn',
    'err.badCell': 'Invalid cell', 'err.taken': 'That cell is taken', 'err.badMove': 'Invalid move',
    'err.noAmmo': 'Out of ammo, load first!', 'err.chosen': 'You already chose',
    'game.tictactoe': 'Tic-tac-toe', 'game.rps': 'Rock Paper Scissors', 'game.bang': 'Load, Shield, Shoot',
    'opt.showHistory': "Show opponent's move history",
    'rps.rock': 'Rock', 'rps.paper': 'Paper', 'rps.scissors': 'Scissors',
    'bang.load': 'Load', 'bang.shield': 'Shield', 'bang.shoot': 'Shoot', 'bang.ammo': 'Ammo',
    'bang.blocked': 'Blocked!', 'bang.clash': 'Bullets collided!', 'bang.hit': 'Hit!',
  },
  ja: {
    yourName: 'あなたの名前', namePh: '名前を入力', create: 'ルームを作成', game: 'ゲーム',
    format: '形式', join: 'ルームに参加', roomCode: 'ルームコード', codePh: '例: AB3K',
    room: 'ルーム', copyLink: '招待リンクをコピー', copied: 'コピーしました!', copyPrompt: 'このリンクをコピー:',
    leave: '退出', nextRound: '次のラウンド', newMatch: '新しい試合', you: 'あなた', opponent: '相手',
    waiting: '待機中...', player: 'プレイヤー{n}', ready: '選択済み', lost: '接続が切れました。再接続中...',
    waitOpp: '相手の参加を待っています...', yourTurn: 'あなたの番です', turnOf: '{name}の番です',
    draw: '引き分け!', winRound: 'このラウンドはあなたの勝ち!', loseRound: 'このラウンドはあなたの負け!',
    winMatch: '試合に勝利!', loseMatch: '試合に敗北...', nextSoon: 'まもなく次のラウンド...', revealing: 'せーの…', chooseMove: '手を選んでください',
    waitingChoice: '選択済み。相手を待っています...', oppReady: '相手は選択済み。あなたの番!',
    history: '履歴', round: 'ラウンド',
    'err.noGame': 'ゲームが見つかりません', 'err.noRoom': 'ルームが見つかりません', 'err.full': 'ルームは満員です',
    'err.waitOpp': '相手を待っています', 'err.over': 'このラウンドは終了しました', 'err.notTurn': 'あなたの番ではありません',
    'err.badCell': '無効なマスです', 'err.taken': 'そのマスは埋まっています', 'err.badMove': '無効な手です',
    'err.noAmmo': '弾がありません。先にチャージ!', 'err.chosen': 'もう選択済みです',
    'game.tictactoe': '三目並べ', 'game.rps': 'じゃんけん', 'game.bang': 'チャージ・ガード・バン',
    'opt.showHistory': '相手の手の履歴を表示',
    'rps.rock': 'グー', 'rps.paper': 'パー', 'rps.scissors': 'チョキ',
    'bang.load': 'チャージ', 'bang.shield': 'ガード', 'bang.shoot': 'バン', 'bang.ammo': '弾',
    'bang.blocked': 'ガード成功!', 'bang.clash': '弾がぶつかった!', 'bang.hit': '命中!',
  },
  ko: {
    yourName: '이름', namePh: '이름 입력', create: '방 만들기', game: '게임',
    format: '형식', join: '방 참가', roomCode: '방 코드', codePh: '예: AB3K',
    room: '방', copyLink: '초대 링크 복사', copied: '복사됨!', copyPrompt: '이 링크를 복사하세요:',
    leave: '나가기', nextRound: '다음 라운드', newMatch: '새 경기', you: '나', opponent: '상대',
    waiting: '대기 중...', player: '플레이어 {n}', ready: '선택 완료', lost: '연결이 끊겼습니다. 재연결 중...',
    waitOpp: '상대가 들어오길 기다리는 중...', yourTurn: '내 차례', turnOf: '{name}의 차례',
    draw: '무승부!', winRound: '이번 라운드 승리!', loseRound: '이번 라운드 패배!',
    winMatch: '경기 승리!', loseMatch: '경기 패배!', nextSoon: '곧 다음 라운드가 시작됩니다...', revealing: '하나, 둘, 셋...', chooseMove: '수를 선택하세요',
    waitingChoice: '선택 완료. 상대를 기다리는 중...', oppReady: '상대가 선택했어요. 내 차례!',
    history: '기록', round: '라운드',
    'err.noGame': '게임을 찾을 수 없습니다', 'err.noRoom': '방을 찾을 수 없습니다', 'err.full': '방이 가득 찼습니다',
    'err.waitOpp': '상대를 기다리는 중', 'err.over': '라운드가 끝났습니다', 'err.notTurn': '내 차례가 아닙니다',
    'err.badCell': '잘못된 칸입니다', 'err.taken': '이미 놓인 칸입니다', 'err.badMove': '잘못된 수입니다',
    'err.noAmmo': '총알이 없습니다. 먼저 장전하세요!', 'err.chosen': '이미 선택했습니다',
    'game.tictactoe': '틱택토', 'game.rps': '가위바위보', 'game.bang': '장전·방어·발사',
    'opt.showHistory': '상대의 이전 수 기록 표시',
    'rps.rock': '바위', 'rps.paper': '보', 'rps.scissors': '가위',
    'bang.load': '장전', 'bang.shield': '방어', 'bang.shoot': '발사', 'bang.ammo': '총알',
    'bang.blocked': '막았다!', 'bang.clash': '총알끼리 부딪쳤다!', 'bang.hit': '명중!',
  },
  zh: {
    yourName: '你的名字', namePh: '输入名字', create: '创建房间', game: '游戏',
    format: '赛制', join: '加入房间', roomCode: '房间号', codePh: '例如 AB3K',
    room: '房间', copyLink: '复制邀请链接', copied: '已复制!', copyPrompt: '复制此链接:',
    leave: '离开', nextRound: '下一局', newMatch: '新比赛', you: '你', opponent: '对手',
    waiting: '等待中...', player: '玩家{n}', ready: '已出招', lost: '连接断开，正在重连...',
    waitOpp: '等待对手加入...', yourTurn: '轮到你了', turnOf: '轮到{name}',
    draw: '平局!', winRound: '你赢了这一局!', loseRound: '你输了这一局!',
    winMatch: '你赢得了比赛!', loseMatch: '你输掉了比赛!', nextSoon: '下一局即将开始...', revealing: '一、二、三……', chooseMove: '请出招',
    waitingChoice: '已出招，等待对手...', oppReady: '对手已出招，轮到你!',
    history: '历史', round: '局',
    'err.noGame': '游戏不存在', 'err.noRoom': '找不到房间', 'err.full': '房间已满',
    'err.waitOpp': '等待对手', 'err.over': '本局已结束', 'err.notTurn': '还没轮到你',
    'err.badCell': '无效的格子', 'err.taken': '格子已被占用', 'err.badMove': '无效的操作',
    'err.noAmmo': '没有子弹了，先装弹!', 'err.chosen': '你已经出过招了',
    'game.tictactoe': '井字棋', 'game.rps': '石头剪刀布', 'game.bang': '装弹·盾牌·射击',
    'opt.showHistory': '显示对手的出招历史',
    'rps.rock': '石头', 'rps.paper': '布', 'rps.scissors': '剪刀',
    'bang.load': '装弹', 'bang.shield': '盾牌', 'bang.shoot': '射击', 'bang.ammo': '子弹',
    'bang.blocked': '挡住了!', 'bang.clash': '子弹相撞!', 'bang.hit': '命中!',
  },
};

function detect() {
  const nav = (navigator.language || 'en').slice(0, 2);
  return DICT[nav] ? nav : 'en';
}

let current = localStorage.getItem('lang');
if (!DICT[current]) current = detect();

export function getLang() {
  return current;
}

export function setLang(lang) {
  if (!DICT[lang]) return;
  current = lang;
  localStorage.setItem('lang', lang);
  applyI18n();
}

export function t(key, vars = {}) {
  const s = DICT[current][key] ?? DICT.en[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

// Dịch các phần tử có thuộc tính data-i18n (nội dung) và data-i18n-ph (placeholder).
export function applyI18n() {
  document.documentElement.lang = current;
  document.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
}

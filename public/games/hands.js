// Bàn tay vẽ bằng SVG, đen trắng. Mỗi hàm trả về chuỗi <svg>.
const ST = 'fill="#fff" stroke="#111" stroke-width="3.5" stroke-linejoin="round"';
const LINE = 'fill="none" stroke="#111" stroke-width="3.5" stroke-linecap="round"';
const r = (x, y, w, h, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(w, h) / 2}" ${extra}/>`;

// ---------- Oẳn tù tì: tay dựng đứng, nhìn từ phía trước ----------
const WRIST = `<path d="M36 120 V98 M64 120 V98" ${LINE}/>`;

const RPS = {
  rock: `
    <rect x="22" y="42" width="56" height="58" rx="16"/>
    ${r(23, 34, 14, 32)}${r(36, 32, 14, 34)}${r(49, 33, 14, 33)}${r(62, 36, 14, 30)}
    ${r(14, 64, 46, 15, 'transform="rotate(-8 37 71)"')}`,
  paper: `
    ${r(25, 22, 12, 52)}${r(38, 10, 12, 64)}${r(51, 14, 12, 60)}${r(64, 28, 11, 46)}
    ${r(16, 58, 12, 36, 'transform="rotate(-34 22 92)"')}
    <rect x="22" y="58" width="56" height="42" rx="15"/>`,
  scissors: `
    ${r(31, 6, 12, 62, 'transform="rotate(-15 37 66)"')}${r(46, 6, 12, 62, 'transform="rotate(12 52 66)"')}
    <rect x="22" y="50" width="56" height="50" rx="16"/>
    ${r(49, 44, 14, 30)}${r(62, 46, 14, 28)}
    ${r(14, 70, 44, 15, 'transform="rotate(-8 36 77)"')}`,
};

export function rpsHand(shape) {
  return `<svg viewBox="0 0 100 120"><g ${ST}>${RPS[shape] || RPS.rock}</g>${WRIST}</svg>`;
}

// ---------- Nạp đạn - Khiên - Bắn: nhìn ngang, hướng sang phải ----------
// Tay trái luôn xòe ngửa ở dưới, tay phải đặt lên trên.
const BASE = `
  ${r(62, 84, 64, 15)}
  <rect x="-20" y="80" width="96" height="22" rx="11"/>`;

const FIST = `
  <rect x="-30" y="52" width="72" height="22"/>
  <rect x="24" y="42" width="48" height="38" rx="14"/>
  ${r(56, 46, 20, 11)}${r(56, 56, 20, 11)}${r(55, 66, 19, 11)}`;

const RIGHT = {
  fist: FIST,
  load: `${r(36, 14, 15, 38)}${FIST}`,
  shoot: `
    ${r(36, 20, 14, 34)}
    ${r(58, 44, 66, 13)}
    <rect x="-30" y="52" width="72" height="22"/>
    <rect x="24" y="42" width="44" height="38" rx="14"/>
    ${r(54, 57, 18, 11)}${r(53, 67, 17, 11)}`,
  shield: `
    ${r(34, 46, 13, 32, 'transform="rotate(-18 40 76)"')}
    <rect x="46" y="4" width="22" height="80" rx="11"/>
    <path d="M80 14 Q98 44 80 74 M90 22 Q104 44 90 66" ${LINE}/>`,
};

export function bangHands(right) {
  return `<svg viewBox="-6 0 140 110"><g ${ST}>${BASE}<g class="rh">${RIGHT[right] || FIST}</g></g></svg>`;
}

export const BURST = `<svg viewBox="0 0 100 100" class="burst"><polygon points="50,2 60,34 94,22 70,48 98,64 62,66 70,98 50,72 30,98 38,66 2,64 30,48 6,22 40,34" fill="#111"/><text x="50" y="58" text-anchor="middle" font-size="16" font-weight="800" fill="#fff" font-family="system-ui">BANG</text></svg>`;

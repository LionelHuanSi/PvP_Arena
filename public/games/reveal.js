// Hiệu ứng "giấu tay rồi lộ ra" dùng chung cho các trò ra tay cùng lúc.
// Tay lắc ba nhịp trong SHAKE ms, lộ ra, giữ HOLD ms rồi mới cập nhật điểm và trạng thái.
const SHAKE = 1050;
const HOLD = 700;

export function createRevealer() {
  let initialized = false;
  let lastKey = null;
  let animating = false;

  return {
    busy: () => animating,
    reset() {
      initialized = false;
      lastKey = null;
      animating = false;
    },
    // Trả về true nếu đây là lượt ra tay mới cần chạy hiệu ứng.
    isNew(key) {
      const fresh = initialized && key !== null && key !== lastKey;
      lastKey = key;
      initialized = true;
      return fresh;
    },
    run(api, onReveal) {
      animating = true;
      setTimeout(() => {
        onReveal();
        setTimeout(() => {
          animating = false;
          api.rerender();
        }, HOLD);
      }, SHAKE);
    },
  };
}

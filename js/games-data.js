// Dữ liệu trò chơi.
import { EN_VOCAB } from './subjects/tienganh.js';
import { ANTONYMS } from './subjects/tiengviet.js';

// ĐUỔI HÌNH BẮT CHỮ – mỗi hình là một tiếng, ghép lại thành từ / câu.
export const REBUS_WORDS = [
  [['👕', '🌧️'], 'áo mưa'], [['🍯', '🐝'], 'mật ong'], [['⭐', '🌊'], 'sao biển'],
  [['🐟', '🐴'], 'cá ngựa'], [['🚗', '🔥'], 'xe lửa'], [['🏠', '📚'], 'nhà sách'],
  [['🥛', '🐄'], 'sữa bò'], [['👓', '👁️'], 'kính mắt'], [['🥚', '🐔'], 'trứng gà'],
  [['⛰️', '🔥'], 'núi lửa'], [['🐻', '🎋'], 'gấu trúc'], [['🐟', '📦'], 'cá hộp'],
  [['💡', '🔋'], 'đèn pin'], [['🚪', '📒'], 'cửa sổ'], [['🌳', '🍎'], 'cây táo'],
  [['🚗', '🦶'], 'xe đạp'], [['⚽', '💡'], 'bóng đèn'], [['🐟', '🟡'], 'cá vàng'],
  [['🌙', '⭕'], 'trăng tròn'], [['🍞', '🚗'], 'bánh xe'], [['😊', '⛅'], 'mặt trời'],
  [['🍦', '👊', '🦷'], 'kem đánh răng'],
];
export const REBUS_IDIOMS = [
  [['💧', '➡️', '🪨', '📉'], 'Nước chảy đá mòn'],
  [['🍎', '🧠', '👨‍🌾', '🌳'], 'Ăn quả nhớ kẻ trồng cây'],
  [['🥤', '🧠', '⛲'], 'Uống nước nhớ nguồn'],
  [['🍃', '🤗', '🍂'], 'Lá lành đùm lá rách'],
  [['👧', '⬇️', '👦', '🫴'], 'Chị ngã em nâng'],
  [['🔨', '⚙️', '➡️', '🪡'], 'Có công mài sắt, có ngày nên kim'],
  [['🐜', '🔁', '🏠', '📈'], 'Kiến tha lâu cũng đầy tổ'],
  [['🐢', '✅', '💪'], 'Chậm mà chắc'],
  [['🖋️', '⚫', '💡', '⚪'], 'Gần mực thì đen, gần đèn thì rạng'],
  [['🪵', '👍', '🎨', '👎'], 'Tốt gỗ hơn tốt nước sơn'],
  [['🚶', '1️⃣', '☀️', '🧠'], 'Đi một ngày đàng, học một sàng khôn'],
  [['🍚', '🦷', '💬', '🧠'], 'Ăn có nhai, nói có nghĩ'],
  [['🏆', '🙅', '😤', '💔', '🙅', '😞'], 'Thắng không kiêu, bại không nản'],
  [['🌳', '➕', '🌳', '➕', '🌳', '➡️', '⛰️'], 'Một cây làm chẳng nên non, ba cây chụm lại nên hòn núi cao'],
];
export function rebusPool(band) {
  return band === 'l35' ? [...REBUS_IDIOMS, ...REBUS_WORDS.slice(0, 8)] : REBUS_WORDS;
}

// Ô CHỮ – xếp các chữ cái thành từ đúng.
export const WORDS_YOUNG = [
  ['🐟', 'CÁ'], ['🐔', 'GÀ'], ['🐱', 'MÈO'], ['🐘', 'VOI'], ['🌸', 'HOA'], ['⭐', 'SAO'],
  ['🍎', 'TÁO'], ['🥥', 'DỪA'], ['🍦', 'KEM'], ['🐝', 'ONG'], ['🐻', 'GẤU'], ['🦐', 'TÔM'],
  ['🐢', 'RÙA'], ['🦀', 'CUA'], ['🦆', 'VỊT'], ['✏️', 'BÚT'], ['🍄', 'NẤM'],
];
export const WORDS_MID = [
  ['☀️', 'MẶT TRỜI'], ['🌈', 'CẦU VỒNG'], ['🚲', 'XE ĐẠP'], ['🏫', 'TRƯỜNG HỌC'],
  ['📚', 'QUYỂN SÁCH'], ['🌙', 'MẶT TRĂNG'], ['🐘', 'CON VOI'], ['🌳', 'CÂY XANH'],
  ['🦋', 'CON BƯỚM'], ['🍉', 'DƯA HẤU'],
];
export const WORDS_CLUES = [
  ['Thủ đô của Việt Nam', 'HÀ NỘI'], ['Bộ phận giúp cơ thể hít thở', 'PHỔI'],
  ['Cậu bé cưỡi ngựa sắt đánh giặc Ân', 'THÁNH GIÓNG'], ['Nước ở thể rắn', 'NƯỚC ĐÁ'],
  ['Hành tinh chúng ta đang sống', 'TRÁI ĐẤT'], ['Vị vua dời đô về Thăng Long', 'LÝ THÁI TỔ'],
  ['Mặt Trời mọc ở hướng này', 'ĐÔNG'], ['Châu lục rộng lớn nhất', 'CHÂU Á'],
  ['Con sông lớn chảy qua Hà Nội', 'SÔNG HỒNG'], ['Cây trồng nhiều nhất ở Tây Nguyên', 'CÀ PHÊ'],
  ['Tên cũ của Thành phố Hồ Chí Minh', 'SÀI GÒN'], ['Người viết “Bình Ngô đại cáo”', 'NGUYỄN TRÃI'],
  ['Từ trái nghĩa với “chăm chỉ”', 'LƯỜI BIẾNG'], ['“Con mèo” trong tiếng Anh', 'CAT'],
  ['“Trường học” trong tiếng Anh', 'SCHOOL'], ['Cơ quan bơm máu đi khắp cơ thể', 'TIM'],
];
export function wordPool(grade) {
  if (grade === 'mn1' || grade === 'mn2' || grade === 'l1') return WORDS_YOUNG.map(([e, w]) => ({ clue: e, emoji: true, word: w }));
  if (grade === 'l2') return [...WORDS_YOUNG, ...WORDS_MID].map(([e, w]) => ({ clue: e, emoji: true, word: w }));
  return [...WORDS_MID.map(([e, w]) => ({ clue: e, emoji: true, word: w })), ...WORDS_CLUES.map(([c, w]) => ({ clue: c, word: w }))];
}

// NỐI CẶP – mỗi bộ gồm nhiều cặp [trái, phải].
const COLORS = [['Màu đỏ', '🍎'], ['Màu vàng', '🍌'], ['Màu xanh lá', '🥦'], ['Màu tím', '🍇'], ['Màu cam', '🥕']];
const SOUNDS = [['🐱', 'meo meo'], ['🐶', 'gâu gâu'], ['🦆', 'cạp cạp'], ['🐸', 'ộp ộp'], ['🐓', 'ò ó o'], ['🐷', 'ụt ịt']];
const DOTS = [1, 2, 3, 4, 5].map((n) => [String(n), '●'.repeat(n)]);
const HEROES = [
  ['Ngô Quyền', 'Chiến thắng Bạch Đằng (938)'], ['Lý Công Uẩn', 'Dời đô về Thăng Long (1010)'],
  ['Lê Lợi', 'Khởi nghĩa Lam Sơn'], ['Quang Trung', 'Đại phá quân Thanh (1789)'],
  ['Trần Hưng Đạo', 'Đánh thắng quân Nguyên'], ['Lý Thường Kiệt', 'Chống quân Tống'],
  ['Hai Bà Trưng', 'Khởi nghĩa năm 40'], ['Võ Nguyên Giáp', 'Chiến thắng Điện Biên Phủ (1954)'],
];
const WONDERS = [
  ['Kim tự tháp', 'Ai Cập'], ['Vạn Lý Trường Thành', 'Trung Quốc'], ['Tháp Ép-phen', 'Pháp'],
  ['Đền Ăng-co Vát', 'Cam-pu-chia'], ['Lăng Ta-giơ Ma-han', 'Ấn Độ'], ['Tượng Nữ thần Tự do', 'Mỹ'],
];
const enPairs = (grade) => EN_VOCAB[grade].map(([w, , e]) => [w, e]);
const enMeaning = (grade) => EN_VOCAB[grade].map(([w, m]) => [w, m]);

export function matchSets(grade) {
  const sets = {
    mn1: [['Nối con vật với tiếng kêu', SOUNDS], ['Nối số với số chấm', DOTS.slice(0, 3)], ['Nối màu với đồ vật', COLORS]],
    mn2: [['Nối con vật với tiếng kêu', SOUNDS], ['Nối số với số chấm', DOTS], ['Nối từ tiếng Anh với hình', enPairs('mn1')]],
    l1: [['Nối từ tiếng Anh với hình', enPairs('l1')], ['Nối từ tiếng Anh với hình', enPairs('mn2')]],
    l2: [['Nối từ tiếng Anh với hình', enPairs('l2')], ['Nối cặp từ trái nghĩa', ANTONYMS]],
    l3: [['Nối từ tiếng Anh với nghĩa', enMeaning('l3')], ['Nối cặp từ trái nghĩa', ANTONYMS], ['Nối kì quan với đất nước', WONDERS]],
    l4: [['Nối từ tiếng Anh với nghĩa', enMeaning('l4')], ['Nối nhân vật với sự kiện', HEROES], ['Nối kì quan với đất nước', WONDERS]],
    l5: [['Nối từ tiếng Anh với nghĩa', enMeaning('l5')], ['Nối nhân vật với sự kiện', HEROES], ['Nối kì quan với đất nước', WONDERS]],
  };
  return sets[grade];
}
export const MATCH_PAIRS = { mn1: 3, mn2: 3, l1: 4, l2: 4, l3: 4, l4: 5, l5: 5 };

// LẬT THẺ
export const MEMORY_EMOJI = ['🐃', '🏮', '🥭', '🐟', '🌾', '🛵', '🍜', '🐉', '🥥', '🍉', '🪁', '🐓'];
export const MEMORY_PAIRS = { mn1: 3, mn2: 4, l1: 6, l2: 6, l3: 8, l4: 8, l5: 8 };

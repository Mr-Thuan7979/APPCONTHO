// TIẾNG VIỆT – theo lớp × mức độ (mạch kiến thức GDPT 2018).
import { pick, withChoices, txt, parseBank, bankQuestion, fromGenerator } from '../core.js';

export const LETTERS = [
  'a', 'ă', 'â', 'b', 'c', 'd', 'đ', 'e', 'ê', 'g', 'h', 'i', 'k', 'l', 'm',
  'n', 'o', 'ô', 'ơ', 'p', 'q', 'r', 's', 't', 'u', 'ư', 'v', 'x', 'y',
];
const EASY_LETTERS = ['a', 'o', 'ô', 'e', 'i', 'u', 'b', 'c', 'm', 'h', 'l', 'n', 't', 'x'];
// Cách đọc tên chữ cái theo âm (như ở trường tiểu học).
export const LETTER_SAY = {
  a: 'a', ă: 'á', â: 'ớ', b: 'bờ', c: 'cờ', d: 'dờ', đ: 'đờ', e: 'e', ê: 'ê',
  g: 'gờ', h: 'hờ', i: 'i', k: 'ca', l: 'lờ', m: 'mờ', n: 'nờ', o: 'o', ô: 'ô',
  ơ: 'ơ', p: 'pờ', q: 'quờ', r: 'rờ', s: 'sờ', t: 'tờ', u: 'u', ư: 'ư', v: 'vờ',
  x: 'xờ', y: 'i dài',
};
const up = (l) => l.toUpperCase();
const letterChoice = (l, cased = up) => ({ text: cased(l), say: LETTER_SAY[l] });

// Chữ cái gốc (bỏ dấu thanh, giữ dấu mũ/móc/trăng): 'ế' -> 'ê'.
export function baseLetter(ch) {
  return ch.normalize('NFD').replace(/[̣̀́̃̉]/g, '').normalize('NFC');
}

// Từ có hình, phụ âm đầu là 1 chữ cái.
export const PICTURE_WORDS = [
  { w: 'cá', e: '🐟' }, { w: 'gà', e: '🐔' }, { w: 'mèo', e: '🐱' }, { w: 'bò', e: '🐄' },
  { w: 'voi', e: '🐘' }, { w: 'hoa', e: '🌸' }, { w: 'xe', e: '🚗' }, { w: 'sao', e: '⭐' },
  { w: 'táo', e: '🍎' }, { w: 'dừa', e: '🥥' }, { w: 'kem', e: '🍦' }, { w: 'lá', e: '🍃' },
  { w: 'ong', e: '🐝' }, { w: 'ếch', e: '🐸' }, { w: 'ô', e: '☂️' }, { w: 'nơ', e: '🎀' },
  { w: 'gấu', e: '🐻' }, { w: 'tôm', e: '🦐' }, { w: 'rùa', e: '🐢' }, { w: 'cua', e: '🦀' },
  { w: 'vịt', e: '🦆' }, { w: 'heo', e: '🐷' }, { w: 'sữa', e: '🥛' }, { w: 'bút', e: '✏️' },
  { w: 'lửa', e: '🔥' }, { w: 'mưa', e: '🌧️' }, { w: 'dê', e: '🐐' }, { w: 'nấm', e: '🍄' },
];

export const TONE_WORDS = [
  { e: '🐟', w: 'cá', x: ['ca', 'cà', 'cả'] },
  { e: '🐔', w: 'gà', x: ['ga', 'gá', 'gạ'] },
  { e: '🐄', w: 'bò', x: ['bo', 'bó', 'bỏ'] },
  { e: '🐱', w: 'mèo', x: ['meo', 'méo', 'mẹo'] },
  { e: '🍃', w: 'lá', x: ['la', 'là', 'lả'] },
  { e: '🐻', w: 'gấu', x: ['gâu', 'gầu', 'gậu'] },
  { e: '🦆', w: 'vịt', x: ['vit', 'vít', 'vìt'] },
  { e: '🥛', w: 'sữa', x: ['sưa', 'sứa', 'sửa'] },
  { e: '🐢', w: 'rùa', x: ['rua', 'rúa', 'rủa'] },
  { e: '🥥', w: 'dừa', x: ['dưa', 'dứa', 'dửa'] },
  { e: '🍄', w: 'nấm', x: ['nâm', 'nầm', 'nậm'] },
  { e: '📚', w: 'sách', x: ['sach', 'sạch', 'sạc'] },
];

const CV_CONS = ['b', 'd', 'đ', 'h', 'l', 'm', 'n', 't', 'v', 'x'];
const CV_VOWELS = ['a', 'o', 'ô', 'ơ', 'u', 'ư', 'e', 'ê', 'i'];

// [đúng, sai]
export const SPELLING = [
  ['chăm chỉ', 'trăm chỉ'], ['xinh xắn', 'sinh sắn'], ['rửa tay', 'dửa tay'],
  ['giữ gìn', 'dữ gìn'], ['sạch sẽ', 'xạch sẽ'], ['nghỉ ngơi', 'ngỉ ngơi'],
  ['cái ghế', 'cái gế'], ['kiên nhẫn', 'kiêng nhẫn'], ['trường học', 'chường học'],
  ['quả xoài', 'quả soài'], ['con kiến', 'con ciến'], ['nghe giảng', 'nge giảng'],
  ['sáng sủa', 'sáng xủa'], ['xe đạp', 'se đạp'], ['lo lắng', 'no lắng'],
  ['nắng nóng', 'lắng nóng'], ['trái đất', 'chái đất'],
];

export const ANTONYMS = [
  ['cao', 'thấp'], ['nóng', 'lạnh'], ['vui', 'buồn'], ['to', 'nhỏ'], ['nhanh', 'chậm'],
  ['sáng', 'tối'], ['dài', 'ngắn'], ['mới', 'cũ'], ['khô', 'ướt'], ['đầy', 'vơi'],
  ['chăm chỉ', 'lười biếng'], ['dũng cảm', 'hèn nhát'], ['gần', 'xa'], ['trên', 'dưới'],
];
export const SYNONYMS = [
  ['chăm chỉ', 'siêng năng'], ['dũng cảm', 'can đảm'], ['trẻ em', 'thiếu nhi'],
  ['đất nước', 'tổ quốc'], ['thông minh', 'sáng dạ'], ['to lớn', 'khổng lồ'],
  ['nhanh', 'mau'], ['hiền lành', 'hiền hậu'], ['im lặng', 'yên lặng'], ['xinh đẹp', 'xinh xắn'],
];

export const WORD_TYPES_L2 = {
  'sự vật': ['bàn', 'ghế', 'cây', 'quyển sách', 'con mèo', 'cái bút', 'ngôi nhà'],
  'hoạt động': ['chạy', 'đọc', 'viết', 'hát', 'nhảy', 'bơi', 'quét nhà'],
  'đặc điểm': ['đỏ', 'cao', 'xinh', 'chăm chỉ', 'ngọt', 'thơm', 'nhanh nhẹn'],
};
export const WORD_TYPES_L4 = {
  'danh từ': ['học sinh', 'dòng sông', 'cơn mưa', 'quyển vở', 'bác sĩ', 'con đường', 'ngôi trường'],
  'động từ': ['chạy', 'đọc', 'suy nghĩ', 'ngủ', 'bơi', 'viết', 'nhảy'],
  'tính từ': ['xanh', 'cao', 'chăm chỉ', 'ngọt', 'dịu dàng', 'nhanh nhẹn', 'thông minh'],
};

// ---------- Bộ sinh ----------
function findLetter(rng, pool, n) {
  const t = pick(rng, pool);
  return withChoices(
    rng,
    { prompt: `Bé hãy tìm chữ ${up(t)}`, say: `Bé hãy tìm chữ ${LETTER_SAY[t]}`, visual: { big: up(t) } },
    letterChoice(t), pool.filter((l) => l !== t).map((l) => letterChoice(l)), n - 1,
  );
}
function matchCase(rng) {
  const t = pick(rng, LETTERS);
  return withChoices(
    rng,
    { prompt: `Chữ ${up(t)} viết thường là chữ nào?`, say: `Chữ ${LETTER_SAY[t]} viết thường là chữ nào?`, visual: { big: up(t) } },
    letterChoice(t, (l) => l), LETTERS.filter((l) => l !== t).map((l) => letterChoice(l, (x) => x)), 3,
  );
}
function firstLetter(rng, n) {
  const pw = pick(rng, PICTURE_WORDS);
  const f = baseLetter(pw.w[0]);
  return withChoices(
    rng,
    { prompt: `“${pw.w}” bắt đầu bằng chữ nào?`, say: `${pw.w}. ${pw.w} bắt đầu bằng chữ nào?`, visual: { emoji: pw.e } },
    letterChoice(f), LETTERS.filter((l) => l !== f).map((l) => letterChoice(l)), n - 1,
  );
}
function fillMissing(rng) {
  const pw = pick(rng, PICTURE_WORDS.filter((p) => p.w.length > 1 && baseLetter(p.w[0]) === p.w[0]));
  const f = pw.w[0];
  return withChoices(
    rng,
    { prompt: `Điền chữ còn thiếu: _${pw.w.slice(1)}`, say: `Hình này là ${pw.w}. Chữ nào còn thiếu?`, visual: { emoji: pw.e } },
    letterChoice(f, (l) => l), LETTERS.filter((l) => l !== f).map((l) => letterChoice(l, (x) => x)),
  );
}
function tone(rng) {
  const t = pick(rng, TONE_WORDS);
  return withChoices(rng, { prompt: 'Chọn chữ viết đúng cho hình', say: 'Chọn chữ viết đúng cho hình', visual: { emoji: t.e } }, txt(t.w), t.x.map((x) => txt(x)));
}
function cv(rng) {
  const c = pick(rng, CV_CONS), v = pick(rng, CV_VOWELS);
  const others = [
    ...CV_VOWELS.filter((x) => x !== v).map((x) => txt(c + x)),
    ...CV_CONS.filter((x) => x !== c).map((x) => txt(x + v)),
  ];
  return withChoices(
    rng,
    { prompt: `Ghép vần: ${c} + ${v} = ?`, say: `${LETTER_SAY[c]}, ${LETTER_SAY[v]}, ghép lại đọc là gì?`, visual: { big: `${c} + ${v}` } },
    txt(c + v), others,
  );
}
function wordType(rng, types) {
  const names = Object.keys(types);
  const type = pick(rng, names);
  const ok = pick(rng, types[type]);
  const others = names.filter((t) => t !== type).flatMap((t) => types[t]);
  return withChoices(rng, { prompt: `Từ nào là ${type.toUpperCase()}?`, say: `Từ nào là ${type}?`, visual: { emoji: '🔤' } }, txt(ok), others.map((x) => txt(x)));
}
function spelling(rng) {
  const [ok, bad] = pick(rng, SPELLING);
  const more = SPELLING.filter(([o]) => o !== ok).map(([, b]) => txt(b));
  return withChoices(rng, { prompt: 'Từ nào viết ĐÚNG chính tả?', say: 'Từ nào viết đúng chính tả?', visual: { emoji: '✍️' } }, txt(ok), [txt(bad), ...pickN(rng, more, 2)], 3);
}
const pickN = (rng, arr, n) => {
  const a = arr.slice();
  const out = [];
  while (out.length < n && a.length) out.push(a.splice(Math.floor(rng() * a.length), 1)[0]);
  return out;
};
function pairWord(rng, pairs, kind) {
  const [a, b] = pick(rng, pairs);
  const [w, ans] = rng() < 0.5 ? [a, b] : [b, a];
  const pool = pairs.flat().filter((x) => x !== a && x !== b);
  return withChoices(
    rng,
    { prompt: `Từ ${kind} với “${w}” là?`, say: `Từ ${kind} với ${w} là từ nào?`, visual: { big: w } },
    txt(ans), pool.map((x) => txt(x)),
  );
}

// ---------- Ngân hàng câu hỏi ----------
const BANK = {
  l1nc: parseBank([
    '🪑|Chọn từ viết đúng|ghế|gế|ghé',
    '🐃|Chọn từ viết đúng (con trâu nhỏ)|nghé|ngé|nghè',
    '😴|Chọn từ viết đúng|ngủ|nghủ|ngũ',
    '🍬|Chọn từ viết đúng|kẹo|cẹo|kẽo',
    '👓|Chọn từ viết đúng|kính|cính|kín',
    '🐟|Chọn từ viết đúng|cá|ká|kà',
    '🐔|Chọn từ viết đúng|gà|ghà|gá',
    '👂|Chọn từ viết đúng|nghe|nge|nhe',
    '🛌|Chọn từ viết đúng|nghỉ|ngỉ|nhỉ',
    '🐜|Chọn từ viết đúng|con kiến|con ciến|con kiếng',
    '🐊|Chọn từ viết đúng|cá sấu|ká sấu|cá xấu',
    '🍐|Chọn từ viết đúng|quả lê|qủa lê|cuả lê',
    '🏡|Chọn từ viết đúng|ngôi nhà|nghôi nhà|ngôi nha',
    '🧺|Chọn từ viết đúng|cái giỏ|cái dỏ|cái giõ',
    '🌙|Chọn từ viết đúng|trăng|chăng|trang',
    '🦶|Chọn từ viết đúng|bàn chân|bàn trân|bàn chăn',
  ]),
  l2nc: parseBank([
    '❓|Câu nào là câu hỏi?|Bạn tên là gì?|Em thích đọc sách.|Hoa hồng rất đẹp.',
    '❗|Câu nào thể hiện cảm xúc?|Ôi, bông hoa đẹp quá!|Bông hoa màu đỏ.|Bông hoa ở trong vườn.',
    '👪|Từ nào chỉ tình cảm gia đình?|yêu thương|chạy nhảy|xanh biếc',
    '🏫|Từ nào chỉ đồ dùng học tập?|thước kẻ|cái chảo|cái gối',
    '🐦|Từ nào chỉ đặc điểm của con chim?|nhanh nhẹn|cái tổ|hạt thóc',
    '🌳|Câu “Cây phượng rất cao.” trả lời câu hỏi nào?|Cây phượng thế nào?|Cây phượng là gì?|Cây phượng làm gì?',
    '🧑‍🎓|Câu “Em là học sinh lớp 2.” là câu gì?|Câu giới thiệu|Câu nêu hoạt động|Câu nêu đặc điểm',
    '🏃|Câu “Các bạn đang chạy thi.” là câu gì?|Câu nêu hoạt động|Câu giới thiệu|Câu nêu đặc điểm',
    '🌼|Câu “Hoa cúc vàng tươi.” là câu gì?|Câu nêu đặc điểm|Câu giới thiệu|Câu nêu hoạt động',
    '✍️|Tên riêng nào viết đúng?|Hà Nội|hà Nội|Hà nội',
    '✍️|Tên người nào viết đúng?|Nguyễn Văn An|nguyễn văn an|Nguyễn văn An',
    '🔤|Từ nào có vần “oan”?|hoa xoan|hoa hồng|hoa cúc',
    '🔤|Từ nào có vần “uyên”?|chiếc thuyền|chiếc ghế|chiếc lá',
    '🔤|Từ nào có vần “oai”?|quả xoài|quả cam|quả na',
    '🐓|Từ “gáy” trong “gà trống gáy” là từ chỉ gì?|Hoạt động|Sự vật|Đặc điểm',
    '💬|Khi được bạn giúp đỡ, em nói gì?|Cảm ơn bạn!|Đi đi!|Kệ bạn!',
  ]),
  l3kha: parseBank([
    '🌕|Câu nào có hình ảnh so sánh?|Trăng tròn như cái đĩa.|Trăng sáng quá.|Trăng lên cao.',
    '☀️|Câu nào có hình ảnh so sánh?|Mặt trời đỏ như quả cầu lửa.|Mặt trời mọc rồi.|Trời nắng to.',
    '👶|Trong câu “Mắt bé tròn như hai hòn bi.”, sự vật nào được so sánh?|Mắt bé|Hòn bi|Bé',
    '🚩|Từ nào dùng để so sánh trong câu “Lá cờ đỏ như son.”?|như|đỏ|lá cờ',
    '🧒|Trong câu “Bạn Lan đang đọc sách.”, bộ phận trả lời câu hỏi “Ai?” là:|Bạn Lan|đang đọc sách|sách',
    '🐃|Trong câu “Đàn trâu đang gặm cỏ.”, bộ phận trả lời câu hỏi “Làm gì?” là:|đang gặm cỏ|Đàn trâu|cỏ',
    '🐱|Trong câu “Chú mèo rất tinh nghịch.”, bộ phận trả lời câu hỏi “Thế nào?” là:|rất tinh nghịch|Chú mèo|mèo',
    '🌧️|Trong câu “Mưa rơi lộp độp.”, từ nào tả âm thanh?|lộp độp|mưa|rơi',
    '🐓|Từ nào là từ chỉ âm thanh?|ò ó o|đỏ rực|chạy nhảy',
    '🏠|Từ nào chỉ đặc điểm?|rộng rãi|ngôi nhà|xây dựng',
    '🎒|Từ nào chỉ hoạt động?|học bài|cặp sách|chăm chỉ',
    '✏️|Câu “Em vẽ một bức tranh.” thuộc kiểu câu nào?|Ai làm gì?|Ai là gì?|Ai thế nào?',
    '👩‍🏫|Câu “Mẹ em là giáo viên.” thuộc kiểu câu nào?|Ai là gì?|Ai làm gì?|Ai thế nào?',
    '🌻|Câu “Hoa hướng dương vàng rực.” thuộc kiểu câu nào?|Ai thế nào?|Ai là gì?|Ai làm gì?',
    '🦚|Câu nào có hình ảnh so sánh?|Đuôi công xòe ra như cái quạt.|Con công đang múa.|Con công rất đẹp.',
    '⛰️|Câu nào có hình ảnh so sánh?|Dãy núi cao như bức tường khổng lồ.|Dãy núi rất cao.|Em leo núi.',
  ]),
  l3nc: parseBank([
    '🍎|“Ăn quả nhớ kẻ trồng cây” khuyên chúng ta điều gì?|Biết ơn người đã giúp mình|Ăn nhiều hoa quả|Chăm trồng cây',
    '💧|“Uống nước nhớ nguồn” nghĩa là gì?|Nhớ ơn nguồn cội, người đi trước|Uống nhiều nước|Đi tìm nguồn nước',
    '🌳|“Một cây làm chẳng nên non, ba cây chụm lại nên hòn núi cao” khuyên điều gì?|Đoàn kết sẽ tạo nên sức mạnh|Phải trồng nhiều cây|Nên leo núi cao',
    '🍃|“Lá lành đùm lá rách” nói về điều gì?|Giúp đỡ, đùm bọc người gặp khó khăn|Lá cây bị rách|Gói bánh bằng lá',
    '🪡|“Có công mài sắt, có ngày nên kim” khuyên điều gì?|Kiên trì sẽ thành công|Nên mài dao|Kim làm bằng sắt',
    '✍️|Câu nào dùng dấu phẩy đúng?|Nhà em nuôi gà, vịt, ngan.|Nhà em, nuôi gà vịt ngan.|Nhà em nuôi, gà vịt ngan.',
    '✍️|Câu “Em học bài” cần thêm dấu gì ở cuối?|Dấu chấm|Dấu chấm hỏi|Dấu phẩy',
    '✍️|Câu “Bạn đã làm bài tập chưa” cần dấu gì ở cuối?|Dấu chấm hỏi|Dấu chấm|Dấu phẩy',
    '❗|Câu “Ôi, đẹp quá” nên kết thúc bằng dấu gì?|Dấu chấm than|Dấu chấm hỏi|Dấu phẩy',
    '👴|“Kính già, yêu trẻ” khuyên điều gì?|Kính trọng người già, yêu thương trẻ nhỏ|Chỉ cần yêu trẻ nhỏ|Không cần lễ phép',
    '🐦|“Chim có tổ, người có tông” nói về điều gì?|Ai cũng có nguồn gốc, tổ tiên|Chim biết làm tổ|Người nuôi chim',
    '🔥|“Thất bại là mẹ thành công” nghĩa là gì?|Thất bại giúp ta rút kinh nghiệm để thành công|Thất bại là xấu|Không nên cố gắng',
    '🎃|“Bầu ơi thương lấy bí cùng” khuyên điều gì?|Người cùng quê hương, đất nước phải thương yêu nhau|Trồng bầu cạnh bí|Bầu và bí là rau',
    '🌾|“Gần mực thì đen, gần đèn thì rạng” nói về điều gì?|Bạn bè, môi trường ảnh hưởng đến mỗi người|Mực có màu đen|Đèn rất sáng',
    '🐢|“Chậm mà chắc” nghĩa là gì?|Làm từ từ nhưng chắc chắn|Làm thật nhanh|Không làm gì',
    '🎓|“Không thầy đố mày làm nên” nói về điều gì?|Vai trò quan trọng của thầy cô|Không cần đi học|Tự học là đủ',
  ]),
  l4kha: parseBank([
    '🏙️|Từ nào là danh từ riêng?|Hà Nội|thành phố|dòng sông',
    '🏞️|Từ nào là tên riêng?|sông Hồng|con sông|cây cầu',
    '👦|Trong câu “Minh chạy rất nhanh.”, từ nào là động từ?|chạy|Minh|nhanh',
    '🌺|Trong câu “Bông hoa rất thơm.”, từ nào là tính từ?|thơm|bông hoa|rất',
    '🐕|Trong câu “Con chó sủa vang.”, chủ ngữ là:|Con chó|sủa vang|vang',
    '🎶|Trong câu “Các bạn hát rất hay.”, vị ngữ là:|hát rất hay|Các bạn|bạn',
    '🌅|Trong câu “Sáng nay, em đi học sớm.”, trạng ngữ là:|Sáng nay|em|đi học sớm',
    '🌳|Trong câu “Ngoài vườn, hoa nở rộ.”, trạng ngữ chỉ gì?|Nơi chốn|Thời gian|Nguyên nhân',
    '🦗|Trong câu “Mùa hè, ve kêu râm ran.”, trạng ngữ chỉ gì?|Thời gian|Nơi chốn|Mục đích',
    '☀️|Câu nào có biện pháp nhân hóa?|Ông mặt trời thức dậy, mỉm cười.|Mặt trời mọc lúc sáu giờ.|Trời nắng to.',
    '🌾|Câu nào có biện pháp nhân hóa?|Chị lúa phất phơ bím tóc.|Cây lúa đã chín vàng.|Lúa được trồng ở ruộng.',
    '📝|Danh từ chung là gì?|Tên gọi chung của một loại sự vật|Tên riêng của người, nơi chốn|Từ chỉ hoạt động',
    '🏃|Động từ là từ chỉ gì?|Hoạt động, trạng thái|Đặc điểm, tính chất|Tên sự vật',
    '🎨|Tính từ là từ chỉ gì?|Đặc điểm, tính chất|Hoạt động, trạng thái|Tên sự vật',
    '🐟|Từ nào là động từ?|bơi|con cá|nhỏ xíu',
    '💬|Trong đoạn hội thoại, dấu gạch ngang đặt ở đầu dòng để làm gì?|Đánh dấu lời nói của nhân vật|Kết thúc câu|Ngăn cách các từ cùng loại',
  ]),
  l4nc: parseBank([
    '🏆|“Thắng không kiêu, bại không nản” khuyên điều gì?|Thắng thì không kiêu ngạo, thua thì không nản lòng|Phải luôn luôn thắng|Thua thì bỏ cuộc',
    '🔨|“Có chí thì nên” nghĩa là gì?|Có ý chí, quyết tâm thì sẽ thành công|Có tiền sẽ thành công|Không cần cố gắng',
    '🌊|“Nước chảy đá mòn” nghĩa là gì?|Kiên trì bền bỉ thì việc khó cũng làm được|Đá rất mềm|Nước chảy rất mạnh',
    '🪵|“Tốt gỗ hơn tốt nước sơn” khuyên điều gì?|Phẩm chất bên trong quan trọng hơn vẻ bề ngoài|Nên sơn gỗ thật đẹp|Gỗ đắt hơn sơn',
    '🗣️|“Lời nói chẳng mất tiền mua, lựa lời mà nói cho vừa lòng nhau” khuyên điều gì?|Nói năng lịch sự, tế nhị|Nói càng nhiều càng tốt|Không nên nói chuyện',
    '🤲|“Thương người như thể thương thân” nghĩa là gì?|Thương yêu người khác như thương chính mình|Chỉ thương bản thân|Không quan tâm đến ai',
    '🐜|“Kiến tha lâu cũng đầy tổ” nghĩa là gì?|Chăm chỉ góp nhặt dần sẽ được nhiều|Kiến rất khỏe|Tổ kiến rất to',
    '📖|Trong câu: Cô giáo dặn: “Các em nhớ làm bài tập nhé!”, dấu ngoặc kép dùng để làm gì?|Đánh dấu lời nói trực tiếp|Kết thúc câu|Ngăn cách các vế câu',
    '☁️|Câu nào có biện pháp nhân hóa?|Chị Mây kéo đến che kín bầu trời.|Mây đen kéo đến.|Trời sắp mưa.',
    '✏️|Câu “Bạn có thể cho mình mượn bút được không?” dùng để làm gì?|Đề nghị một cách lịch sự|Kể lại một việc|Khen ngợi',
    '🎒|Câu nào là câu khiến?|Em hãy giữ trật tự!|Em đang học bài.|Em học lớp bốn.',
    '✨|Từ nào là từ láy?|lấp lánh|học sinh|bàn ghế',
    '🧩|Từ nào là từ ghép?|bàn ghế|lấp lánh|long lanh',
    '🚂|“Đi một ngày đàng, học một sàng khôn” nghĩa là gì?|Đi nhiều nơi sẽ học hỏi được nhiều điều|Đi bộ cả ngày|Sàng gạo cho khéo',
    '👂|“Ăn có nhai, nói có nghĩ” khuyên điều gì?|Suy nghĩ cẩn thận trước khi nói|Ăn thật nhanh|Nói thật nhiều',
  ]),
  l5tb: parseBank([
    '🇻🇳|Từ nào đồng nghĩa với “tổ quốc”?|đất nước|trường học|gia đình',
    '🦁|Từ nào đồng nghĩa với “dũng cảm”?|can đảm|nhút nhát|hiền lành',
    '🏗️|Từ nào đồng nghĩa với “xây dựng”?|kiến thiết|phá hủy|nghỉ ngơi',
    '🕊️|Từ nào trái nghĩa với “chiến tranh”?|hòa bình|xung đột|chiến đấu',
    '🙂|Từ nào trái nghĩa với “lạc quan”?|bi quan|vui vẻ|yêu đời',
    '🧠|Từ nào đồng nghĩa với “thông minh”?|sáng dạ|chậm chạp|cẩu thả',
    '🧹|Từ nào trái nghĩa với “cẩn thận”?|cẩu thả|chu đáo|kĩ càng',
    '🎁|Từ nào đồng nghĩa với “biếu”?|tặng|lấy|mượn',
    '💪|Từ nào trái nghĩa với “khỏe mạnh”?|ốm yếu|cường tráng|vạm vỡ',
    '🤝|Từ nào đồng nghĩa với “đoàn kết”?|đồng lòng|chia rẽ|ích kỉ',
    '🌄|Từ nào trái nghĩa với “xuất hiện”?|biến mất|hiện ra|ló dạng',
    '🌸|Từ nào đồng nghĩa với “xinh đẹp”?|xinh xắn|xấu xí|thô kệch',
    '📏|Từ nào trái nghĩa với “rộng rãi”?|chật hẹp|thênh thang|bao la',
    '🎓|Từ nào đồng nghĩa với “học sinh”?|học trò|giáo viên|phụ huynh',
    '🌞|Từ nào trái nghĩa với “siêng năng”?|lười biếng|chăm chỉ|cần cù',
  ]),
  l5kha: parseBank([
    '🦵|Trong câu nào, từ “chân” mang nghĩa gốc?|Bé bị đau chân.|Chân núi phủ đầy mây.|Chân bàn bị gãy.',
    '🏔️|Trong câu nào, từ “chân” mang nghĩa chuyển?|Đàn bò gặm cỏ dưới chân đồi.|Em xỏ giày vào chân.|Chân em bị muỗi đốt.',
    '👁️|Trong câu nào, từ “mắt” mang nghĩa gốc?|Mắt em bé rất to.|Quả na đã mở mắt.|Mắt lưới rất nhỏ.',
    '🍬|“Đường” trong “mua một cân đường” và “con đường làng” là:|Từ đồng âm|Từ đồng nghĩa|Từ trái nghĩa',
    '🪑|“Bàn” trong “cái bàn” và “bàn bạc” là:|Từ đồng âm|Từ trái nghĩa|Từ đồng nghĩa',
    '🥣|Trong câu nào, từ “miệng” mang nghĩa chuyển?|Miệng bát bị sứt.|Bé cười toe toét miệng.|Em há miệng ra.',
    '🙋|Trong đoạn “Lan học giỏi. Bạn ấy rất chăm.”, từ ngữ nào là đại từ?|Bạn ấy|học giỏi|rất chăm',
    '👫|Từ nào là đại từ xưng hô?|chúng tôi|học sinh|bạn bè',
    '🐦|Trong “Con chim đậu trên cành. Nó hót líu lo.”, từ “nó” thay cho từ ngữ nào?|Con chim|cành|hót',
    '🍯|Từ “ngọt” trong “Cô ấy nói ngọt.” mang nghĩa gì?|Nghĩa chuyển (dịu dàng, dễ nghe)|Nghĩa gốc (vị như đường)|Không có nghĩa',
    '🔪|Trong “lưỡi dao” và “lưỡi người”, từ nào là từ nhiều nghĩa?|lưỡi|dao|người',
    '🎣|“Câu” trong “câu cá” và “câu văn” là:|Từ đồng âm|Từ đồng nghĩa|Từ trái nghĩa',
    '🏃|Trong câu nào, từ “chạy” mang nghĩa gốc?|Em chạy thi trên sân trường.|Đồng hồ chạy đúng giờ.|Máy chạy rất êm.',
    '🧑‍🤝‍🧑|Trong câu nào, từ “đầu” mang nghĩa chuyển?|Em đứng đầu hàng.|Em đội mũ lên đầu.|Bé gật đầu chào.',
    '🗣️|Đại từ dùng để làm gì?|Xưng hô hoặc thay thế cho từ ngữ khác|Chỉ hoạt động|Chỉ đặc điểm',
  ]),
  l5nc: parseBank([
    '🔗|Từ nào là kết từ?|và|bàn|đẹp',
    '🌧️|Trong câu “Vì trời mưa nên em ở nhà.”, cặp kết từ là:|Vì … nên|trời … mưa|em … nhà',
    '🔗|Cặp kết từ “Tuy … nhưng” biểu thị quan hệ gì?|Tương phản|Nguyên nhân – kết quả|Điều kiện – kết quả',
    '🔗|Cặp kết từ “Nếu … thì” biểu thị quan hệ gì?|Điều kiện – kết quả|Tương phản|Tăng tiến',
    '📝|Câu nào là câu ghép?|Trời mưa, đường trơn.|Em đi học.|Những bông hoa rất đẹp.',
    '📝|Câu ghép là câu như thế nào?|Câu do nhiều vế câu ghép lại|Câu chỉ có một từ|Câu không có vị ngữ',
    '🍚|Câu nào là câu ghép?|Mẹ nấu cơm, chị quét nhà.|Mẹ và chị ở nhà.|Mẹ nấu cơm rất ngon.',
    '🔁|“Lan rất chăm học. Lan luôn đạt điểm cao.” Hai câu liên kết bằng cách nào?|Lặp từ ngữ|Thay thế từ ngữ|Dùng từ nối',
    '🔁|“Nam là học sinh giỏi. Bạn ấy rất chăm chỉ.” Hai câu liên kết bằng cách nào?|Thay thế từ ngữ|Lặp từ ngữ|Dùng từ nối',
    '🔁|Trong “Trời mưa to. Vì vậy, em ở nhà.”, từ ngữ nối hai câu là:|Vì vậy|Trời mưa|ở nhà',
    '🎵|Lặp lại một từ ngữ để nhấn mạnh gọi là biện pháp gì?|Điệp từ, điệp ngữ|So sánh|Nhân hóa',
    '📜|Câu “Không chỉ học giỏi, Lan còn hát hay.” biểu thị quan hệ gì?|Tăng tiến|Tương phản|Nguyên nhân – kết quả',
    '🚆|Dấu gạch ngang nối các từ trong một liên danh ở trường hợp nào?|Chuyến tàu Hà Nội – Hải Phòng|Em đi – học về|Ôi – đẹp quá',
    '📚|Câu “Vì chăm chỉ nên Nam học giỏi.” có quan hệ gì?|Nguyên nhân – kết quả|Tương phản|Điều kiện – kết quả',
    '🍊|Dấu hai chấm trong câu “Vườn có nhiều cây: cam, bưởi, xoài.” dùng để làm gì?|Báo hiệu phần liệt kê|Kết thúc câu|Đánh dấu câu hỏi',
  ]),
};
export const TV_BANKS = BANK;

const fromB = (key) => (rng) => bankQuestion(rng, pick(rng, BANK[key]));

const G = {
  mn1: { tb: [(r) => findLetter(r, EASY_LETTERS, 2)], kha: [(r) => findLetter(r, LETTERS, 3)], nc: [(r) => firstLetter(r, 3)] },
  mn2: { tb: [(r) => firstLetter(r, 3)], kha: [matchCase], nc: [fillMissing] },
  l1: { tb: [cv], kha: [tone], nc: [fromB('l1nc'), fillMissing] },
  l2: { tb: [(r) => wordType(r, WORD_TYPES_L2)], kha: [spelling], nc: [fromB('l2nc'), (r) => pairWord(r, ANTONYMS, 'trái nghĩa')] },
  l3: { tb: [(r) => pairWord(r, SYNONYMS, 'cùng nghĩa'), (r) => pairWord(r, ANTONYMS, 'trái nghĩa')], kha: [fromB('l3kha')], nc: [fromB('l3nc')] },
  l4: { tb: [(r) => wordType(r, WORD_TYPES_L4)], kha: [fromB('l4kha')], nc: [fromB('l4nc')] },
  l5: { tb: [fromB('l5tb')], kha: [fromB('l5kha')], nc: [fromB('l5nc')] },
};

export function tvLesson(grade, level, rng, n) {
  const gens = G[grade][level];
  return fromGenerator(rng, (r) => pick(r, gens)(r), n);
}
export const TV_GRADES = G;

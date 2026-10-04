// TIẾNG ANH – từ vựng theo chủ đề cho từng lớp; lớp 3–5 có thêm mẫu câu.
import { pick, withChoices, parseBank, fromGenerator } from '../core.js';

const EN = 'en-US';
// [tiếng Anh, nghĩa tiếng Việt, hình]
const V = {
  mn1: [['cat', 'con mèo', '🐱'], ['dog', 'con chó', '🐶'], ['fish', 'con cá', '🐟'], ['bird', 'con chim', '🐦'], ['duck', 'con vịt', '🦆'], ['cow', 'con bò', '🐄'], ['pig', 'con lợn', '🐷'], ['apple', 'quả táo', '🍎'], ['banana', 'quả chuối', '🍌'], ['ball', 'quả bóng', '⚽'], ['car', 'ô tô', '🚗'], ['sun', 'mặt trời', '☀️'], ['egg', 'quả trứng', '🥚'], ['milk', 'sữa', '🥛']],
  mn2: [['red', 'màu đỏ', '🟥'], ['blue', 'màu xanh dương', '🟦'], ['green', 'màu xanh lá', '🟩'], ['yellow', 'màu vàng', '🟨'], ['one', 'số một', '1️⃣'], ['two', 'số hai', '2️⃣'], ['three', 'số ba', '3️⃣'], ['four', 'số bốn', '4️⃣'], ['five', 'số năm', '5️⃣'], ['eye', 'con mắt', '👁️'], ['nose', 'cái mũi', '👃'], ['hand', 'bàn tay', '✋'], ['ear', 'cái tai', '👂'], ['mother', 'mẹ', '👩'], ['father', 'bố', '👨'], ['baby', 'em bé', '👶']],
  l1: [['book', 'quyển sách', '📕'], ['pen', 'bút mực', '🖊️'], ['pencil', 'bút chì', '✏️'], ['bag', 'cặp sách', '🎒'], ['ruler', 'thước kẻ', '📏'], ['teddy bear', 'gấu bông', '🧸'], ['kite', 'cái diều', '🪁'], ['robot', 'người máy', '🤖'], ['elephant', 'con voi', '🐘'], ['monkey', 'con khỉ', '🐒'], ['tiger', 'con hổ', '🐯'], ['lion', 'con sư tử', '🦁'], ['six', 'số sáu', '6️⃣'], ['seven', 'số bảy', '7️⃣'], ['eight', 'số tám', '8️⃣'], ['nine', 'số chín', '9️⃣'], ['ten', 'số mười', '🔟']],
  l2: [['bread', 'bánh mì', '🍞'], ['rice', 'cơm', '🍚'], ['cake', 'bánh ngọt', '🍰'], ['water', 'nước', '💧'], ['orange', 'quả cam', '🍊'], ['grapes', 'quả nho', '🍇'], ['bed', 'cái giường', '🛏️'], ['chair', 'cái ghế', '🪑'], ['door', 'cái cửa', '🚪'], ['window', 'cửa sổ', '🪟'], ['clock', 'đồng hồ', '⏰'], ['hat', 'cái mũ', '👒'], ['shoes', 'đôi giày', '👟'], ['T-shirt', 'áo phông', '👕'], ['dress', 'váy liền', '👗'], ['socks', 'đôi tất', '🧦']],
  l3: [['doctor', 'bác sĩ', '🧑‍⚕️'], ['teacher', 'giáo viên', '🧑‍🏫'], ['farmer', 'nông dân', '🧑‍🌾'], ['cook', 'đầu bếp', '🧑‍🍳'], ['police officer', 'công an', '👮'], ['sunny', 'trời nắng', '☀️'], ['rainy', 'trời mưa', '🌧️'], ['cloudy', 'nhiều mây', '☁️'], ['windy', 'trời có gió', '🌬️'], ['snowy', 'có tuyết', '❄️'], ['bus', 'xe buýt', '🚌'], ['train', 'tàu hỏa', '🚆'], ['plane', 'máy bay', '✈️'], ['bike', 'xe đạp', '🚲'], ['boat', 'con thuyền', '⛵'], ['school', 'trường học', '🏫'], ['hospital', 'bệnh viện', '🏥']],
  l4: [['swim', 'bơi', '🏊'], ['dance', 'nhảy múa', '💃'], ['sing', 'hát', '🎤'], ['read', 'đọc', '📖'], ['draw', 'vẽ', '🎨'], ['morning', 'buổi sáng', '🌅'], ['night', 'ban đêm', '🌙'], ['river', 'dòng sông', '🏞️'], ['mountain', 'ngọn núi', '⛰️'], ['sea', 'biển', '🌊'], ['forest', 'khu rừng', '🌲'], ['flower', 'bông hoa', '🌸'], ['happy', 'vui', '😊'], ['sad', 'buồn', '😢'], ['angry', 'tức giận', '😠'], ['tired', 'mệt', '😫']],
  l5: [['headache', 'đau đầu', '🤕'], ['toothache', 'đau răng', '🦷'], ['supermarket', 'siêu thị', '🛒'], ['cinema', 'rạp chiếu phim', '🎬'], ['zoo', 'sở thú', '🦓'], ['museum', 'bảo tàng', '🏛️'], ['library', 'thư viện', '📚'], ['post office', 'bưu điện', '🏤'], ['summer', 'mùa hè', '🏖️'], ['winter', 'mùa đông', '⛄'], ['autumn', 'mùa thu', '🍂'], ['badminton', 'cầu lông', '🏸'], ['basketball', 'bóng rổ', '🏀'], ['table tennis', 'bóng bàn', '🏓'], ['volleyball', 'bóng chuyền', '🏐']],
};
export const EN_VOCAB = V;

const isVi = (s) => /[À-ỹđĐ]/.test(s) || /^(Đ|Bạn|Tôi|Chúng|Những|Mùa|Thứ|Thời|Nơi|Tuổi|Khoảng|Giá|Môn|Món|Màu|Cảm|Xin|Tạm)/.test(s);
const en = (t) => ({ text: t, say: t, lang: EN });
const vi = (t) => ({ text: t, say: t });
const auto = (t) => (isVi(t) ? vi(t) : en(t));

// Đọc câu hỏi: phần trong ngoặc kép đọc bằng giọng Anh, phần còn lại giọng Việt.
export function sayParts(prompt) {
  const parts = [];
  prompt.split(/[“”"]/).forEach((seg, i) => {
    const s = seg.trim();
    if (s) parts.push([s, i % 2 ? EN : 'vi-VN']);
  });
  return parts;
}

function listen(rng, pool) {
  const [w, , e] = pick(rng, pool);
  return withChoices(
    rng,
    { prompt: 'Nghe và chọn hình đúng', say: [['Nghe và chọn hình đúng.', 'vi-VN'], [w, EN]], visual: { listen: true } },
    { text: e, say: w, lang: EN }, pool.filter((x) => x[0] !== w).map(([ww, , ee]) => ({ text: ee, say: ww, lang: EN })),
  );
}
function pictureToWord(rng, pool) {
  const [w, , e] = pick(rng, pool);
  return withChoices(rng, { prompt: 'Hình này tiếng Anh là gì?', say: 'Hình này tiếng Anh là gì?', visual: { emoji: e } }, en(w), pool.filter((x) => x[0] !== w).map((x) => en(x[0])));
}
function meaning(rng, pool) {
  const [w, m, e] = pick(rng, pool);
  if (rng() < 0.5) {
    return withChoices(rng, { prompt: `“${m}” tiếng Anh là gì?`, say: `${m}, tiếng Anh là gì?`, visual: { emoji: e } }, en(w), pool.filter((x) => x[0] !== w).map((x) => en(x[0])));
  }
  return withChoices(rng, { prompt: `“${w}” nghĩa là gì?`, say: [[w, EN], ['nghĩa là gì?', 'vi-VN']], visual: { big: w } }, vi(m), pool.filter((x) => x[0] !== w).map((x) => vi(x[1])));
}

const S = {
  l3: parseBank([
    '👋|Chọn câu chào buổi sáng|Good morning!|Good night!|Goodbye!',
    '🙋|“What\'s your name?” nghĩa là gì?|Bạn tên là gì?|Bạn bao nhiêu tuổi?|Bạn sống ở đâu?',
    '🎂|“How old are you?” nghĩa là gì?|Bạn bao nhiêu tuổi?|Bạn tên là gì?|Bạn có khỏe không?',
    '😊|Câu trả lời đúng cho “How are you?”|I\'m fine, thank you.|I\'m eight.|My name is Nam.',
    '🐶|Điền từ: “It ___ a dog.”|is|are|am',
    '👦|Điền từ: “I ___ a student.”|am|is|are',
    '🐱|Điền từ: “They ___ cats.”|are|is|am',
    '🏫|“This is my school.” nghĩa là gì?|Đây là trường của tôi.|Đây là nhà của tôi.|Đây là bạn của tôi.',
    '🖊️|Điền từ: “This is ___ pen.”|a|an|two',
    '🍎|Điền từ: “This is ___ apple.”|an|a|two',
    '🌧️|“What\'s the weather like?” hỏi về điều gì?|Thời tiết|Thời gian|Món ăn',
    '🚌|Điền từ: “I go to school by ___.”|bus|apple|teacher',
    '🧑‍⚕️|Điền từ: “My mother is a ___.”|doctor|sunny|bike',
    '👋|Chọn câu chào tạm biệt|Goodbye!|Hello!|Thank you!',
    '🙏|“Thank you.” nghĩa là gì?|Cảm ơn|Xin lỗi|Xin chào',
    '😔|“Sorry.” nghĩa là gì?|Xin lỗi|Cảm ơn|Tạm biệt',
  ]),
  l4: parseBank([
    '🏊|“Can you swim?” – “Yes, I ___.”|can|do|am',
    '🎤|Điền từ: “She ___ sing very well.”|can|cans|is',
    '📅|“What day is it today?” hỏi về điều gì?|Thứ trong tuần|Thời tiết|Tuổi',
    '🌅|“I get up at six o\'clock.” nghĩa là gì?|Tôi thức dậy lúc 6 giờ.|Tôi đi ngủ lúc 6 giờ.|Tôi ăn tối lúc 6 giờ.',
    '📖|Điền từ: “He ___ reading a book now.”|is|are|am',
    '🎨|“What are you doing?” – “I\'m ___.”|drawing|draw|draws',
    '😊|“How do you feel?” – “I feel ___.”|happy|swim|sunny',
    '🌳|Điền từ: “There ___ many trees in the park.”|are|is|am',
    '⛵|Điền từ: “There ___ a boat on the river.”|is|are|am',
    '🕖|“What time is it?” – “It\'s ___.”|seven o\'clock|Monday|sunny',
    '🎂|“When is your birthday?” – “It\'s in ___.”|May|Monday|morning',
    '🥛|Câu trả lời lịch sự cho “Would you like some milk?”|Yes, please.|No, I am.|Yes, I can.',
    '🐘|“Elephants are big.” nghĩa là gì?|Những con voi thì to lớn.|Những con voi thì nhỏ bé.|Những con khỉ thì to lớn.',
    '🎒|“Where is my bag?” – “It\'s ___ the table.”|on|at|of',
    '🏠|“Where do you live?” hỏi về điều gì?|Nơi ở|Tuổi|Nghề nghiệp',
  ]),
  l5: parseBank([
    '🤕|“What\'s the matter with you?” – “I have a ___.”|headache|happy|swim',
    '⚽|“What did you do yesterday?” – “I ___ football.”|played|play|playing',
    '🏖️|Điền từ: “Last summer, I ___ to the beach.”|went|go|goes',
    '🛒|“Where is the supermarket?” – “It\'s ___ the cinema.”|next to|happy|yesterday',
    '🦓|“Let\'s go to the zoo!” nghĩa là gì?|Chúng ta hãy đi sở thú!|Tôi không thích sở thú!|Sở thú ở đâu?',
    '🏀|“What\'s your favourite sport?” hỏi về điều gì?|Môn thể thao yêu thích|Món ăn yêu thích|Màu sắc yêu thích',
    '🍎|Điền từ: “How many ___ do you have?”|apples|apple|an apple',
    '🥛|Điền từ: “How much ___ do you want?”|milk|apples|bananas',
    '⛄|“It\'s cold in winter.” nghĩa là gì?|Mùa đông trời lạnh.|Mùa hè trời nóng.|Mùa đông trời nóng.',
    '📚|Điền từ: “I will ___ a book tomorrow.”|read|reads|reading',
    '🧑‍🏫|“What would you like to be?” – “I\'d like to be a ___.”|teacher|cinema|winter',
    '🐘|Điền từ: “An elephant is ___ than a cat.”|bigger|big|biggest',
    '🏔️|Điền từ: “Mount Everest is the ___ mountain in the world.”|highest|higher|high',
    '🪥|“You should brush your teeth.” nghĩa là gì?|Bạn nên đánh răng.|Bạn nên đi ngủ.|Bạn không được đánh răng.',
    '🗺️|“How far is it from Ha Noi to Hai Phong?” hỏi về điều gì?|Khoảng cách|Thời tiết|Giá tiền',
  ]),
};
export const EN_SENTENCES = S;

function sentence(rng, bank) {
  const it = pick(rng, bank);
  return withChoices(rng, { prompt: it.prompt, say: sayParts(it.prompt), visual: { emoji: it.emoji } }, auto(it.ok), it.bad.map(auto), it.bad.length);
}

// Mức: TB = nghe chọn hình; Khá = nhìn hình chọn từ; NC = nghĩa / mẫu câu.
export function enLesson(grade, level, rng, n) {
  const pool = V[grade];
  const gens = {
    tb: [listen],
    kha: [pictureToWord, listen],
    nc: S[grade] ? [meaning, (r) => sentence(r, S[grade]), (r) => sentence(r, S[grade])] : [meaning, pictureToWord],
  }[level];
  return fromGenerator(rng, (r) => pick(r, gens)(r, pool), n);
}


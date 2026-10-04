// Nội dung học và bộ sinh câu hỏi.
// Mỗi câu hỏi: { prompt, say, visual?, choices: [{ text | html, say? }], answer }
// visual: { emoji } | { html }

export const AGE_GROUPS = [
  { id: 'mam', label: '3–5 tuổi', sub: 'Mầm non', emoji: '🐣' },
  { id: 'l12', label: '6–7 tuổi', sub: 'Lớp 1–2', emoji: '🐥' },
  { id: 'l35', label: '8–10 tuổi', sub: 'Lớp 3–5', emoji: '🦉' },
];

export const SUBJECTS = [
  { id: 'tv', name: 'Tiếng Việt', emoji: '📖', color: 'var(--red)' },
  { id: 'toan', name: 'Toán', emoji: '🔢', color: 'var(--blue)' },
  { id: 'kp', name: 'Khám phá', emoji: '🌏', color: 'var(--green)' },
];

export const QUESTIONS_PER_LESSON = 5;

// ---------- Tiện ích ngẫu nhiên ----------
export function makeRng(seed) {
  if (seed === undefined) return Math.random;
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const int = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
function shuffle(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sample(rng, arr, n) {
  return shuffle(rng, arr).slice(0, n);
}

// Trộn đáp án đúng với các phương án nhiễu (đã loại trùng).
function withChoices(rng, q, correct, distractors, n = 3) {
  const key = (c) => c.text ?? c.html;
  const seen = new Set([key(correct)]);
  const uniq = [];
  for (const d of distractors) {
    if (!seen.has(key(d))) {
      seen.add(key(d));
      uniq.push(d);
    }
  }
  const choices = shuffle(rng, [correct, ...sample(rng, uniq, n)]);
  return { ...q, choices, answer: choices.indexOf(correct) };
}

function numberChoices(rng, q, correct, spread = 3) {
  const pool = [];
  for (let d = -spread; d <= spread; d++) if (d && correct + d >= 0) pool.push(correct + d);
  if (correct >= 10) pool.push(correct + 10, Math.max(0, correct - 10));
  return withChoices(
    rng,
    q,
    { text: String(correct) },
    pool.map((v) => ({ text: String(v) })),
  );
}

// ---------- TIẾNG VIỆT ----------
export const LETTERS = [
  'a', 'ă', 'â', 'b', 'c', 'd', 'đ', 'e', 'ê', 'g', 'h', 'i', 'k', 'l', 'm',
  'n', 'o', 'ô', 'ơ', 'p', 'q', 'r', 's', 't', 'u', 'ư', 'v', 'x', 'y',
];
// Cách đọc tên chữ cái theo âm (như ở trường tiểu học).
export const LETTER_SAY = {
  a: 'a', ă: 'á', â: 'ớ', b: 'bờ', c: 'cờ', d: 'dờ', đ: 'đờ', e: 'e', ê: 'ê',
  g: 'gờ', h: 'hờ', i: 'i', k: 'ca', l: 'lờ', m: 'mờ', n: 'nờ', o: 'o', ô: 'ô',
  ơ: 'ơ', p: 'pờ', q: 'quờ', r: 'rờ', s: 'sờ', t: 'tờ', u: 'u', ư: 'ư', v: 'vờ',
  x: 'xờ', y: 'i dài',
};
const upper = (l) => l.toUpperCase();

// Chữ cái gốc (bỏ dấu thanh, giữ dấu mũ/móc/trăng): 'ế' -> 'ê', 'ừ' -> 'ư'.
export function baseLetter(ch) {
  return ch.normalize('NFD').replace(/[\u0300\u0301\u0303\u0309\u0323]/g, '').normalize('NFC');
}

// Từ có hình minh họa, phụ âm đầu là 1 chữ cái (tránh ch, ng, nh, th...).
export const PICTURE_WORDS = [
  { w: 'cá', e: '🐟' }, { w: 'gà', e: '🐔' }, { w: 'mèo', e: '🐱' }, { w: 'bò', e: '🐄' },
  { w: 'voi', e: '🐘' }, { w: 'hoa', e: '🌸' }, { w: 'xe', e: '🚗' }, { w: 'sao', e: '⭐' },
  { w: 'táo', e: '🍎' }, { w: 'dừa', e: '🥥' }, { w: 'kem', e: '🍦' }, { w: 'lá', e: '🍃' },
  { w: 'ong', e: '🐝' }, { w: 'ếch', e: '🐸' }, { w: 'ô', e: '☂️' }, { w: 'nơ', e: '🎀' },
  { w: 'gấu', e: '🐻' }, { w: 'tôm', e: '🦐' }, { w: 'rùa', e: '🐢' }, { w: 'cua', e: '🦀' },
  { w: 'vịt', e: '🦆' }, { w: 'heo', e: '🐷' }, { w: 'sữa', e: '🥛' }, { w: 'bút', e: '✏️' },
  { w: 'lửa', e: '🔥' }, { w: 'mưa', e: '🌧️' }, { w: 'dê', e: '🐐' }, { w: 'nấm', e: '🍄' },
];

// Chọn từ viết đúng dấu thanh cho hình.
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

// Chính tả: [đúng, sai]
export const SPELLING = [
  ['chăm chỉ', 'trăm chỉ'], ['xinh xắn', 'sinh sắn'], ['rửa tay', 'dửa tay'],
  ['giữ gìn', 'dữ gìn'], ['sạch sẽ', 'xạch sẽ'], ['nghỉ ngơi', 'ngỉ ngơi'],
  ['cái ghế', 'cái gế'], ['kiên nhẫn', 'kiêng nhẫn'], ['trường học', 'chường học'],
  ['quả xoài', 'quả soài'], ['con kiến', 'con ciến'], ['nghe giảng', 'nge giảng'],
];

export const ANTONYMS = [
  ['cao', 'thấp'], ['nóng', 'lạnh'], ['vui', 'buồn'], ['to', 'nhỏ'], ['nhanh', 'chậm'],
  ['sáng', 'tối'], ['dài', 'ngắn'], ['mới', 'cũ'], ['khô', 'ướt'], ['đầy', 'vơi'],
];

export const WORD_TYPES = {
  'sự vật': ['bàn', 'ghế', 'cây', 'quyển sách', 'con mèo', 'cái bút', 'ngôi nhà'],
  'hoạt động': ['chạy', 'đọc', 'viết', 'hát', 'nhảy', 'bơi', 'quét nhà'],
  'đặc điểm': ['đỏ', 'cao', 'xinh', 'chăm chỉ', 'ngọt', 'thơm', 'nhanh nhẹn'],
};

function tvQuestion(age, rng) {
  if (age === 'mam') {
    if (rng() < 0.5) {
      const target = pick(rng, LETTERS);
      return withChoices(
        rng,
        {
          prompt: `Bé hãy tìm chữ ${upper(target)}`,
          say: `Bé hãy tìm chữ ${LETTER_SAY[target]}`,
          visual: { big: upper(target) },
        },
        { text: upper(target), say: LETTER_SAY[target] },
        LETTERS.filter((l) => l !== target).map((l) => ({ text: upper(l), say: LETTER_SAY[l] })),
        2,
      );
    }
    const pw = pick(rng, PICTURE_WORDS);
    const first = baseLetter(pw.w[0]);
    return withChoices(
      rng,
      {
        prompt: `“${pw.w}” bắt đầu bằng chữ nào?`,
        say: `${pw.w}. ${pw.w} bắt đầu bằng chữ nào?`,
        visual: { emoji: pw.e },
      },
      { text: upper(first), say: LETTER_SAY[first] },
      LETTERS.filter((l) => l !== first).map((l) => ({ text: upper(l), say: LETTER_SAY[l] })),
      2,
    );
  }

  if (age === 'l12') {
    const kind = int(rng, 0, 2);
    if (kind === 0) {
      const t = pick(rng, TONE_WORDS);
      return withChoices(
        rng,
        { prompt: 'Chọn chữ viết đúng cho hình', say: 'Chọn chữ viết đúng cho hình', visual: { emoji: t.e } },
        { text: t.w, say: t.w },
        t.x.map((x) => ({ text: x, say: x })),
      );
    }
    if (kind === 1) {
      const c = pick(rng, CV_CONS);
      const v = pick(rng, CV_VOWELS);
      const correct = { text: c + v, say: c + v };
      const others = [
        ...CV_VOWELS.filter((x) => x !== v).map((x) => ({ text: c + x, say: c + x })),
        ...CV_CONS.filter((x) => x !== c).map((x) => ({ text: x + v, say: x + v })),
      ];
      return withChoices(
        rng,
        {
          prompt: `Ghép vần: ${c} + ${v} = ?`,
          say: `${LETTER_SAY[c]}, ${LETTER_SAY[v] ?? v}, ghép lại đọc là gì?`,
          visual: { big: `${c} + ${v}` },
        },
        correct,
        others,
      );
    }
    // Chỉ dùng từ mà chữ đầu không mang dấu thanh, để phần còn lại đọc được.
    const pw = pick(rng, PICTURE_WORDS.filter((p) => p.w.length > 1 && baseLetter(p.w[0]) === p.w[0]));
    const first = pw.w[0];
    return withChoices(
      rng,
      {
        prompt: `Điền chữ còn thiếu: _${pw.w.slice(1)}`,
        say: `Hình này là ${pw.w}. Chữ nào còn thiếu?`,
        visual: { emoji: pw.e },
      },
      { text: first, say: LETTER_SAY[first] },
      LETTERS.filter((l) => l !== first).map((l) => ({ text: l, say: LETTER_SAY[l] })),
    );
  }

  // l35
  const kind = int(rng, 0, 2);
  if (kind === 0) {
    const [ok, bad] = pick(rng, SPELLING);
    const others = SPELLING.filter(([o]) => o !== ok);
    const pairs = sample(rng, others, 2).map(([, b]) => ({ text: b, say: b }));
    const q = withChoices(
      rng,
      { prompt: 'Từ nào viết ĐÚNG chính tả?', say: 'Từ nào viết đúng chính tả?', visual: { emoji: '✍️' } },
      { text: ok, say: ok },
      [{ text: bad, say: bad }, ...pairs],
      3,
    );
    return q;
  }
  if (kind === 1) {
    const [a, b] = pick(rng, ANTONYMS);
    const [w, ans] = rng() < 0.5 ? [a, b] : [b, a];
    const pool = ANTONYMS.flat().filter((x) => x !== a && x !== b);
    return withChoices(
      rng,
      { prompt: `Từ trái nghĩa với “${w}” là?`, say: `Từ trái nghĩa với ${w} là gì?`, visual: { big: w } },
      { text: ans, say: ans },
      pool.map((x) => ({ text: x, say: x })),
    );
  }
  const types = Object.keys(WORD_TYPES);
  const type = pick(rng, types);
  const correct = pick(rng, WORD_TYPES[type]);
  const others = types.filter((t) => t !== type).flatMap((t) => WORD_TYPES[t]);
  return withChoices(
    rng,
    { prompt: `Từ nào chỉ ${type.toUpperCase()}?`, say: `Từ nào chỉ ${type}?`, visual: { emoji: '🔤' } },
    { text: correct, say: correct },
    others.map((x) => ({ text: x, say: x })),
  );
}

// ---------- TOÁN ----------
const COUNT_EMOJI = ['🍎', '🐟', '⭐', '🌸', '🐥', '🍌', '🎈', '🐞', '🥭', '🏮'];

export const SHAPES = {
  'hình tròn': '<circle cx="50" cy="50" r="40"/>',
  'hình vuông': '<rect x="12" y="12" width="76" height="76" rx="4"/>',
  'hình tam giác': '<polygon points="50,8 92,88 8,88"/>',
  'hình chữ nhật': '<rect x="4" y="24" width="92" height="52" rx="4"/>',
};
const shapeSvg = (name, color) =>
  `<svg viewBox="0 0 100 100" width="72" height="72" aria-label="${name}" fill="${color}">${SHAPES[name]}</svg>`;

const opSay = { '+': 'cộng', '-': 'trừ', '×': 'nhân', ':': 'chia' };
function arith(rng, a, op, b, result) {
  return numberChoices(
    rng,
    {
      prompt: `${a} ${op} ${b} = ?`,
      say: `${a} ${opSay[op]} ${b} bằng mấy?`,
      visual: { big: `${a} ${op} ${b}` },
    },
    result,
  );
}

const WORD_PROBLEMS = [
  (rng) => {
    const a = int(rng, 12, 60), b = int(rng, 5, 30);
    return { t: `Lan có ${a} quyển vở, mẹ mua thêm ${b} quyển. Lan có tất cả bao nhiêu quyển vở?`, r: a + b, e: '📒' };
  },
  (rng) => {
    const a = int(rng, 3, 9), b = int(rng, 2, 9);
    return { t: `Mỗi hộp có ${a} cái bánh. ${b} hộp như thế có bao nhiêu cái bánh?`, r: a * b, e: '🥮' };
  },
  (rng) => {
    const a = int(rng, 2, 9), b = int(rng, 2, 9);
    return { t: `Có ${a * b} quả cam chia đều vào ${b} đĩa. Mỗi đĩa có mấy quả cam?`, r: a, e: '🍊' };
  },
  (rng) => {
    const a = int(rng, 50, 200), b = int(rng, 10, a - 10);
    return { t: `Cửa hàng có ${a} kg gạo, đã bán ${b} kg. Cửa hàng còn lại bao nhiêu ki-lô-gam gạo?`, r: a - b, e: '🌾' };
  },
];

function toanQuestion(age, rng) {
  if (age === 'mam') {
    const kind = int(rng, 0, 2);
    if (kind === 0) {
      const n = int(rng, 1, 10);
      const e = pick(rng, COUNT_EMOJI);
      return numberChoices(
        rng,
        { prompt: 'Có bao nhiêu hình?', say: 'Bé hãy đếm xem có bao nhiêu hình?', visual: { emoji: e, count: n } },
        n,
        2,
      );
    }
    if (kind === 1) {
      const e = pick(rng, COUNT_EMOJI);
      let a = int(rng, 1, 8), b = int(rng, 1, 8);
      if (a === b) b = a + int(rng, 1, 2);
      const correct = { html: `<span class="grp">${e.repeat(Math.max(a, b))}</span>`, say: 'nhóm này' };
      const other = { html: `<span class="grp">${e.repeat(Math.min(a, b))}</span>`, say: 'nhóm này' };
      return withChoices(rng, { prompt: 'Nhóm nào NHIỀU hơn?', say: 'Nhóm nào nhiều hơn?' }, correct, [other], 1);
    }
    const names = Object.keys(SHAPES);
    const target = pick(rng, names);
    const colors = ['#e85d3f', '#2f7fd8', '#2e9b5f', '#f2a81d'];
    const col = shuffle(rng, colors);
    const choices = names.map((n, i) => ({ html: shapeSvg(n, col[i]), say: n }));
    const correct = choices[names.indexOf(target)];
    return withChoices(
      rng,
      { prompt: `Đâu là ${target}?`, say: `Đâu là ${target}?` },
      correct,
      choices.filter((c) => c !== correct),
    );
  }

  if (age === 'l12') {
    const kind = int(rng, 0, 4);
    if (kind === 0) {
      const a = int(rng, 1, 10), b = int(rng, 0, 10);
      return arith(rng, a, '+', b, a + b);
    }
    if (kind === 1) {
      const a = int(rng, 5, 20), b = int(rng, 0, a);
      return arith(rng, a, '-', b, a - b);
    }
    if (kind === 2) {
      const a = int(rng, 10, 89), b = int(rng, 1, 99 - a);
      return rng() < 0.5 ? arith(rng, a, '+', b, a + b) : arith(rng, a + b, '-', b, a);
    }
    if (kind === 3) {
      const a = int(rng, 0, 99);
      let b = int(rng, 0, 99);
      if (rng() < 0.2) b = a;
      const sign = a > b ? '>' : a < b ? '<' : '=';
      const word = { '>': 'lớn hơn', '<': 'bé hơn', '=': 'bằng' };
      return withChoices(
        rng,
        { prompt: `${a} ☐ ${b}`, say: `Điền dấu thích hợp: ${a} và ${b}`, visual: { big: `${a} ☐ ${b}` } },
        { text: sign, say: word[sign] },
        ['>', '<', '='].filter((s) => s !== sign).map((s) => ({ text: s, say: word[s] })),
        2,
      );
    }
    const n = int(rng, 1, 98);
    const after = rng() < 0.5;
    return numberChoices(
      rng,
      {
        prompt: `Số liền ${after ? 'sau' : 'trước'} của ${n} là?`,
        say: `Số liền ${after ? 'sau' : 'trước'} của ${n} là số nào?`,
        visual: { big: String(n) },
      },
      after ? n + 1 : n - 1,
      2,
    );
  }

  // l35
  const kind = int(rng, 0, 3);
  if (kind === 0) {
    const a = int(rng, 2, 9), b = int(rng, 2, 9);
    return arith(rng, a, '×', b, a * b);
  }
  if (kind === 1) {
    const a = int(rng, 2, 9), b = int(rng, 2, 9);
    return arith(rng, a * b, ':', b, a);
  }
  if (kind === 2) {
    const a = int(rng, 100, 899), b = int(rng, 10, 999 - a);
    return rng() < 0.5 ? arith(rng, a, '+', b, a + b) : arith(rng, a + b, '-', b, a);
  }
  const p = pick(rng, WORD_PROBLEMS)(rng);
  return numberChoices(rng, { prompt: p.t, say: p.t, visual: { emoji: p.e } }, p.r, 3);
}

// ---------- KHÁM PHÁ: kỹ năng sống & văn hóa Việt ----------
// [câu hỏi, hình, đáp án đúng, ...đáp án sai]
export const DISCOVER = {
  mam: [
    ['Trước khi ăn, bé cần làm gì?', '🍚', 'Rửa tay 🧼', 'Xem ti vi 📺', 'Chạy nhảy 🏃'],
    ['Sau khi đi vệ sinh, bé cần làm gì?', '🚽', 'Rửa tay 🧼', 'Đi ngủ 😴', 'Ăn kẹo 🍬'],
    ['Đèn màu nào nghĩa là DỪNG LẠI?', '🚦', 'Đỏ 🔴', 'Xanh 🟢', 'Vàng 🟡'],
    ['Bạn nhỏ này đang cảm thấy thế nào?', '😢', 'Buồn', 'Vui', 'Giận'],
    ['Bạn nhỏ này đang cảm thấy thế nào?', '😄', 'Vui', 'Buồn', 'Sợ'],
    ['Con gì kêu “meo meo”?', '🔊', 'Con mèo 🐱', 'Con chó 🐶', 'Con bò 🐄'],
    ['Con gì kêu “gâu gâu”?', '🔊', 'Con chó 🐶', 'Con mèo 🐱', 'Con vịt 🦆'],
    ['Tết đến, nhà mình thường gói bánh gì?', '🧧', 'Bánh chưng', 'Bánh kem 🎂', 'Bánh mì 🥖'],
    ['Tết Trung thu, bé thường rước gì?', '🌕', 'Đèn ông sao ⭐', 'Cái ô ☂️', 'Quả bóng ⚽'],
    ['Người lạ cho kẹo và rủ đi chơi, bé làm gì?', '🍬', 'Không đi, chạy về với bố mẹ', 'Đi theo người lạ', 'Nhận kẹo rồi đi'],
    ['Bé đánh răng khi nào?', '🪥', 'Buổi sáng và trước khi ngủ', 'Chỉ khi đói bụng', 'Không cần đánh răng'],
    ['Quả nào có màu vàng?', '🎨', 'Quả chuối 🍌', 'Quả táo 🍎', 'Quả nho 🍇'],
  ],
  l12: [
    ['Khi ngồi xe máy, bé phải đội gì?', '🛵', 'Mũ bảo hiểm ⛑️', 'Mũ len 🧶', 'Không cần đội'],
    ['Khi đi bộ ngoài đường, bé đi ở đâu?', '🚶', 'Trên vỉa hè', 'Giữa lòng đường', 'Chạy chéo qua đường'],
    ['Khi thấy đám cháy, bé làm gì trước tiên?', '🔥', 'Chạy ra chỗ an toàn và gọi người lớn', 'Trốn vào gầm giường', 'Một mình lấy nước dập lửa'],
    ['Bạn bị ngã, bé nên làm gì?', '🤕', 'Đỡ bạn dậy và hỏi thăm', 'Cười bạn', 'Bỏ đi chỗ khác'],
    ['Mỗi ngày bé nên uống gì nhiều nhất?', '💧', 'Nước lọc', 'Nước ngọt có ga', 'Trà sữa'],
    ['Chơi đồ chơi xong, bé làm gì?', '🧸', 'Cất gọn vào chỗ cũ', 'Để bừa ra nhà', 'Ném đi'],
    ['Lá cờ Việt Nam có màu gì?', '🇻🇳', 'Nền đỏ, ngôi sao vàng', 'Nền xanh, ngôi sao trắng', 'Nền vàng, ngôi sao đỏ'],
    ['Thủ đô của Việt Nam là thành phố nào?', '🏛️', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ'],
    ['Áo dài là trang phục truyền thống của nước nào?', '👘', 'Việt Nam', 'Nhật Bản', 'Hàn Quốc'],
    ['Ở gần ao, hồ, sông, suối, bé cần nhớ gì?', '🌊', 'Chỉ chơi khi có người lớn trông', 'Tự xuống nước tắm một mình', 'Đùa đẩy bạn xuống nước'],
    ['Đèn giao thông màu vàng nghĩa là gì?', '🚦', 'Chậm lại, chuẩn bị dừng', 'Đi thật nhanh', 'Quay đầu lại'],
    ['Cây xanh cần gì để lớn lên?', '🌱', 'Nước, ánh sáng và đất', 'Kẹo ngọt', 'Bóng tối hoàn toàn'],
  ],
  l35: [
    ['Số điện thoại gọi CẤP CỨU (xe cứu thương) là?', '🚑', '115', '113', '114'],
    ['Khi có CHÁY, cần gọi số nào?', '🚒', '114', '115', '113'],
    ['Số điện thoại gọi CÔNG AN khi khẩn cấp là?', '🚓', '113', '114', '115'],
    ['Trên mạng, người lạ hỏi địa chỉ nhà bé. Bé làm gì?', '💻', 'Không trả lời và báo bố mẹ', 'Gửi địa chỉ cho họ', 'Hẹn gặp người đó'],
    ['Sự tích bánh chưng, bánh giầy gắn với nhân vật nào?', '📜', 'Lang Liêu', 'Thánh Gióng', 'Sơn Tinh'],
    ['Ai cưỡi ngựa sắt đánh giặc Ân trong truyền thuyết?', '🐎', 'Thánh Gióng', 'Lang Liêu', 'Thạch Sanh'],
    ['Hồ Gươm (hồ Hoàn Kiếm) ở thành phố nào?', '🐢', 'Hà Nội', 'Huế', 'Đà Lạt'],
    ['Vịnh Hạ Long thuộc tỉnh nào?', '⛰️', 'Quảng Ninh', 'Nghệ An', 'Khánh Hòa'],
    ['Bộ phận nào giúp cơ thể hít thở?', '🫁', 'Phổi', 'Dạ dày', 'Xương'],
    ['Để giữ mắt khỏe khi học, bé nên làm gì?', '👀', 'Ngồi thẳng, đủ ánh sáng, thỉnh thoảng nghỉ mắt', 'Đọc sách trong bóng tối', 'Dí sát mắt vào màn hình'],
    ['Chai nhựa đã dùng xong nên xử lý thế nào?', '♻️', 'Phân loại để tái chế', 'Vứt xuống sông', 'Đốt đi'],
    ['Khi bị bạn bắt nạt, bé nên làm gì?', '🛡️', 'Nói với thầy cô, bố mẹ', 'Im lặng chịu đựng', 'Đánh lại thật mạnh'],
    ['Mặt Trời mọc ở hướng nào?', '🌅', 'Hướng Đông', 'Hướng Tây', 'Hướng Bắc'],
  ],
};

function kpLesson(age, rng, n) {
  const bank = sample(rng, DISCOVER[age], n);
  return bank.map(([prompt, emoji, ok, ...bad]) =>
    withChoices(
      rng,
      { prompt, say: prompt, visual: { emoji } },
      { text: ok, say: ok },
      bad.map((b) => ({ text: b, say: b })),
      bad.length,
    ),
  );
}

// ---------- API ----------
export function generateLesson(subject, age, rng = Math.random, n = QUESTIONS_PER_LESSON) {
  if (subject === 'kp') return kpLesson(age, rng, n);
  const gen = subject === 'tv' ? tvQuestion : toanQuestion;
  const out = [];
  const seen = new Set();
  let guard = 0;
  while (out.length < n && guard++ < 200) {
    const q = gen(age, rng);
    const key = q.prompt + (q.visual?.emoji ?? '') + (q.visual?.count ?? '');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}

// Thẻ cho trò Lật thẻ.
export const MEMORY_EMOJI = ['🐃', '🏮', '🥭', '🐟', '🌾', '🛵', '🍜', '🐉', '🥥', '🍉', '🪁', '🐓'];
export const MEMORY_PAIRS = { mam: 3, l12: 6, l35: 8 };

export function starsFor(correctFirstTry, total) {
  const r = correctFirstTry / total;
  if (r >= 1) return 3;
  if (r >= 0.6) return 2;
  return 1; // luôn khích lệ: hoàn thành bài = ít nhất 1 sao
}

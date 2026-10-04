// TOÁN – câu hỏi sinh tự động theo lớp × mức độ (bám mạch kiến thức GDPT 2018).
import { int, pick, shuffle, withChoices, numberChoices, fmtNum, txt, fromGenerator } from '../core.js';

const COUNT_EMOJI = ['🍎', '🐟', '⭐', '🌸', '🐥', '🍌', '🎈', '🐞', '🥭', '🏮'];
export const SHAPES = {
  'hình tròn': '<circle cx="50" cy="50" r="40"/>',
  'hình vuông': '<rect x="12" y="12" width="76" height="76" rx="4"/>',
  'hình tam giác': '<polygon points="50,8 92,88 8,88"/>',
  'hình chữ nhật': '<rect x="4" y="24" width="92" height="52" rx="4"/>',
};
const COLORS = ['#e85d3f', '#2f7fd8', '#2e9b5f', '#f2a81d'];
const shapeSvg = (name, color) =>
  `<svg viewBox="0 0 100 100" width="72" height="72" aria-label="${name}" fill="${color}">${SHAPES[name]}</svg>`;

const opSay = { '+': 'cộng', '-': 'trừ', '×': 'nhân', ':': 'chia' };
// Phép tính dạng "a op b = ?" (a, b đã là chuỗi hoặc số)
function arith(rng, a, op, b, result, step = 1) {
  const A = fmtNum(a), B = fmtNum(b);
  return numberChoices(
    rng,
    { prompt: `${A} ${op} ${B} = ?`, say: `${A} ${opSay[op]} ${B} bằng bao nhiêu?`, visual: { big: `${A} ${op} ${B}` } },
    result,
    3,
    step,
  );
}
const r1 = (x) => Math.round(x * 10) / 10;

// ---------- Mầm non ----------
function count(rng, max, choicesN = 3) {
  const n = int(rng, 1, max);
  const e = pick(rng, COUNT_EMOJI);
  const pool = [];
  for (let v = Math.max(1, n - 2); v <= n + 2; v++) if (v !== n) pool.push(txt(String(v)));
  return withChoices(
    rng,
    { prompt: 'Có bao nhiêu hình?', say: 'Bé hãy đếm xem có bao nhiêu hình?', visual: { emoji: e, count: n } },
    txt(String(n)),
    pool,
    choicesN - 1,
  );
}

function shape(rng, names) {
  const target = pick(rng, names);
  const col = shuffle(rng, COLORS);
  const choices = names.map((n, i) => ({ html: shapeSvg(n, col[i]), say: n }));
  const correct = choices[names.indexOf(target)];
  return withChoices(rng, { prompt: `Đâu là ${target}?`, say: `Đâu là ${target}?` }, correct, choices.filter((c) => c !== correct), names.length - 1);
}

function compareGroups(rng, max, fewer = false) {
  const e = pick(rng, COUNT_EMOJI);
  let a = int(rng, 1, max - 1);
  let b = int(rng, a + 1, max);
  const big = { html: `<span class="grp">${e.repeat(b)}</span>`, say: 'nhóm này' };
  const small = { html: `<span class="grp">${e.repeat(a)}</span>`, say: 'nhóm này' };
  const word = fewer ? 'ÍT' : 'NHIỀU';
  return withChoices(rng, { prompt: `Nhóm nào ${word} hơn?`, say: `Nhóm nào ${word.toLowerCase()} hơn?` }, fewer ? small : big, [fewer ? big : small], 1);
}

function biggerNumber(rng, max) {
  const [a, b] = shuffle(rng, [int(rng, 0, max), int(rng, 0, max)]);
  if (a === b) return biggerNumber(rng, max);
  const big = Math.max(a, b);
  return withChoices(rng, { prompt: 'Số nào LỚN hơn?', say: 'Số nào lớn hơn?' }, txt(String(big)), [txt(String(Math.min(a, b)))], 1);
}

function pictureAdd(rng) {
  const e = pick(rng, COUNT_EMOJI);
  if (rng() < 0.5) {
    const a = int(rng, 1, 3), b = int(rng, 1, 5 - a);
    return numberChoices(
      rng,
      { prompt: `Có ${a}, thêm ${b}. Tất cả là mấy?`, say: `Có ${a} ${'hình'}, thêm ${b} hình nữa. Tất cả là mấy hình?`, visual: { html: `<span class="grp">${e.repeat(a)}</span> <b>+</b> <span class="grp">${e.repeat(b)}</span>` } },
      a + b, 2,
    );
  }
  const a = int(rng, 2, 5), b = int(rng, 1, a - 1);
  return numberChoices(
    rng,
    { prompt: `Có ${a}, bớt đi ${b}. Còn lại mấy?`, say: `Có ${a} hình, bớt đi ${b} hình. Còn lại mấy hình?`, visual: { html: `<span class="grp">${e.repeat(a - b)}<span class="gone">${e.repeat(b)}</span></span>` } },
    a - b, 2,
  );
}

// ---------- Tiểu học ----------
function addSub(rng, max, { carry = 'any', min = 0 } = {}) {
  for (;;) {
    const a = int(rng, min, max), b = int(rng, 0, max);
    if (rng() < 0.5) {
      if (a + b > max) continue;
      if (carry === 'none' && (a % 10) + (b % 10) >= 10) continue;
      if (carry === 'must' && (a % 10) + (b % 10) < 10) continue;
      return arith(rng, a, '+', b, a + b);
    }
    const [x, y] = a >= b ? [a, b] : [b, a];
    if (carry === 'none' && x % 10 < y % 10) continue;
    if (carry === 'must' && x % 10 >= y % 10) continue;
    return arith(rng, x, '-', y, x - y);
  }
}

function compareSign(rng, max) {
  const a = int(rng, 0, max);
  const b = rng() < 0.2 ? a : int(rng, 0, max);
  const sign = a > b ? '>' : a < b ? '<' : '=';
  const word = { '>': 'lớn hơn', '<': 'bé hơn', '=': 'bằng' };
  return withChoices(
    rng,
    { prompt: `${fmtNum(a)} ☐ ${fmtNum(b)}`, say: `Điền dấu thích hợp vào ô trống: ${fmtNum(a)} và ${fmtNum(b)}`, visual: { big: `${fmtNum(a)} ☐ ${fmtNum(b)}` } },
    { text: sign, say: word[sign] },
    ['>', '<', '='].filter((s) => s !== sign).map((s) => ({ text: s, say: word[s] })),
    2,
  );
}

function neighbor(rng, max) {
  const n = int(rng, 1, max - 1);
  const after = rng() < 0.5;
  return numberChoices(
    rng,
    { prompt: `Số liền ${after ? 'sau' : 'trước'} của ${fmtNum(n)} là?`, say: `Số liền ${after ? 'sau' : 'trước'} của ${fmtNum(n)} là số nào?`, visual: { big: fmtNum(n) } },
    after ? n + 1 : n - 1,
    2,
  );
}

function table(rng, nums, maxB = 10) {
  const a = pick(rng, nums), b = int(rng, 1, maxB);
  return rng() < 0.6 ? arith(rng, a, '×', b, a * b) : arith(rng, a * b, ':', a, b);
}

function word(rng, t, r, emoji, step = 1) {
  return numberChoices(rng, { prompt: t, say: t, visual: { emoji } }, r, 3, step);
}

const WORD = {
  l1: [
    (rng) => { const a = int(rng, 2, 6), b = int(rng, 1, 9 - a); return word(rng, `Lan có ${a} bông hoa, mẹ cho thêm ${b} bông. Lan có tất cả mấy bông hoa?`, a + b, '🌸'); },
    (rng) => { const a = int(rng, 5, 10), b = int(rng, 1, a - 1); return word(rng, `Trên cành có ${a} con chim, ${b} con bay đi. Còn lại mấy con chim?`, a - b, '🐦'); },
    (rng) => { const a = int(rng, 1, 5) * 10, b = int(rng, 1, 4) * 10; return word(rng, `Lớp 1A có ${a} quyển truyện, lớp 1B có ${b} quyển. Cả hai lớp có bao nhiêu quyển?`, a + b, '📚'); },
  ],
  l2: [
    (rng) => { const a = int(rng, 25, 60), b = int(rng, 15, 39); return word(rng, `Thùng thứ nhất có ${a} lít nước, thùng thứ hai có ${b} lít. Cả hai thùng có bao nhiêu lít nước?`, a + b, '🪣'); },
    (rng) => { const b = int(rng, 2, 10); return word(rng, `Mỗi con gà có 2 chân. ${b} con gà có bao nhiêu chân?`, 2 * b, '🐔'); },
    (rng) => { const b = int(rng, 2, 10); return word(rng, `Mỗi bàn tay có 5 ngón. ${b} bàn tay có bao nhiêu ngón?`, 5 * b, '✋'); },
    (rng) => { const a = int(rng, 2, 10); return word(rng, `Có ${a * 5} cái kẹo chia đều cho 5 bạn. Mỗi bạn được mấy cái kẹo?`, a, '🍬'); },
    (rng) => { const a = int(rng, 200, 600), b = int(rng, 100, a - 50); return word(rng, `Bao gạo to nặng ${a} kg, bao gạo nhỏ nhẹ hơn bao to ${b} kg. Bao nhỏ nặng bao nhiêu ki-lô-gam?`, a - b, '🌾'); },
    (rng) => { const m = int(rng, 1, 9); return word(rng, `${m} mét bằng bao nhiêu đề-xi-mét?`, m * 10, '📏'); },
  ],
  l3: [
    (rng) => { const a = int(rng, 3, 15), b = int(rng, 3, 15); return word(rng, `Hình chữ nhật có chiều dài ${Math.max(a, b) + 1} cm, chiều rộng ${Math.min(a, b)} cm. Chu vi hình chữ nhật là bao nhiêu xăng-ti-mét?`, 2 * (Math.max(a, b) + 1 + Math.min(a, b)), '▭'); },
    (rng) => { const a = int(rng, 2, 25); return word(rng, `Hình vuông có cạnh ${a} cm. Chu vi hình vuông là bao nhiêu xăng-ti-mét?`, 4 * a, '⬜'); },
    (rng) => { const a = int(rng, 4, 12), k = int(rng, 2, 5); return word(rng, `Em có ${a} viên bi, anh có gấp ${k} lần số bi của em. Anh có bao nhiêu viên bi?`, a * k, '🔵'); },
    (rng) => { const k = pick(rng, [2, 3, 4, 5]), a = int(rng, 2, 10) * k; return word(rng, `1/${k} của ${a} là bao nhiêu?`, a / k, '🍰'); },
    (rng) => { const n = int(rng, 3, 9), b = int(rng, 4, 9); return word(rng, `Mỗi xe chở ${b} bao xi măng. ${n} xe như thế chở được bao nhiêu bao?`, n * b, '🚚'); },
  ],
  l4: [
    (rng) => { const a = int(rng, 3, 30), b = int(rng, 3, 30); return word(rng, `Hình chữ nhật có chiều dài ${Math.max(a, b) + 2} m, chiều rộng ${Math.min(a, b)} m. Diện tích là bao nhiêu mét vuông?`, (Math.max(a, b) + 2) * Math.min(a, b), '🟩'); },
    (rng) => { const avg = int(rng, 20, 60), d = int(rng, 1, 9); return word(rng, `Ba bạn cân nặng ${avg - d} kg, ${avg} kg và ${avg + d} kg. Trung bình mỗi bạn nặng bao nhiêu ki-lô-gam?`, avg, '⚖️'); },
    (rng) => { const small = int(rng, 10, 50), diff = int(rng, 2, 20) ; const big = small + diff; return word(rng, `Tổng hai số là ${big + small}, hiệu hai số là ${diff}. Số lớn là bao nhiêu?`, big, '🧮'); },
    (rng) => { const small = int(rng, 10, 50), diff = int(rng, 2, 20) ; const big = small + diff; return word(rng, `Tổng hai số là ${big + small}, hiệu hai số là ${diff}. Số bé là bao nhiêu?`, small, '🧮'); },
    (rng) => { const y = int(rng, 1, 9); return word(rng, `${y} thế kỉ bằng bao nhiêu năm?`, y * 100, '⏳'); },
  ],
  l5: [
    (rng) => { const v = int(rng, 4, 12) * 5, t = int(rng, 2, 5); return word(rng, `Một ô tô đi với vận tốc ${v} km/giờ. Sau ${t} giờ ô tô đi được bao nhiêu ki-lô-mét?`, v * t, '🚗'); },
    (rng) => { const v = int(rng, 3, 15) * 4, t = int(rng, 2, 5); return word(rng, `Một xe máy đi ${v * t} km trong ${t} giờ. Vận tốc của xe máy là bao nhiêu km/giờ?`, v, '🛵'); },
    (rng) => { const a = int(rng, 2, 20), h = int(rng, 1, 10) * 2; return word(rng, `Hình tam giác có đáy ${a} cm, chiều cao ${h} cm. Diện tích là bao nhiêu xăng-ti-mét vuông?`, (a * h) / 2, '🔺'); },
    (rng) => { const a = int(rng, 4, 12), b = int(rng, 2, a - 1), h = int(rng, 1, 6) * 2; return word(rng, `Hình thang có hai đáy ${a} cm và ${b} cm, chiều cao ${h} cm. Diện tích là bao nhiêu xăng-ti-mét vuông?`, ((a + b) * h) / 2, '⏢'); },
    (rng) => { const a = int(rng, 2, 9), b = int(rng, 2, 9), c = int(rng, 2, 9); return word(rng, `Hình hộp chữ nhật dài ${a} cm, rộng ${b} cm, cao ${c} cm. Thể tích là bao nhiêu xăng-ti-mét khối?`, a * b * c, '📦'); },
    (rng) => { const p = pick(rng, [10, 20, 25, 50]), n = int(rng, 2, 20) * 20; return word(rng, `Một cửa hàng có ${n} kg gạo, đã bán được ${p}% số gạo đó. Cửa hàng đã bán bao nhiêu ki-lô-gam gạo?`, (n * p) / 100, '🏪'); },
  ],
};

// ---------- Phân số & số thập phân ----------
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
function fracSameDen(rng) {
  const d = pick(rng, [5, 7, 9, 11]);
  for (;;) {
    const a = int(rng, 1, d - 2), b = int(rng, 1, d - 1 - a);
    if (gcd(a + b, d) !== 1) continue;
    const ok = `${a + b}/${d}`;
    const bad = [`${a + b}/${2 * d}`, `${a * b}/${d}`, `${Math.abs(a - b) || 1}/${d}`, `${a + b + 1}/${d}`].filter((x) => x !== ok);
    return withChoices(
      rng,
      { prompt: `${a}/${d} + ${b}/${d} = ?`, say: `${a} phần ${d} cộng ${b} phần ${d} bằng bao nhiêu?`, visual: { big: `${a}/${d} + ${b}/${d}` } },
      txt(ok), bad.map((x) => txt(x)),
    );
  }
}
function fracOf(rng) {
  const d = pick(rng, [2, 3, 4, 5]), n = int(rng, 1, d - 1), x = int(rng, 2, 10) * d;
  return numberChoices(rng, { prompt: `${n}/${d} của ${x} là bao nhiêu?`, say: `${n} phần ${d} của ${x} là bao nhiêu?`, visual: { big: `${n}/${d} × ${x}` } }, (x * n) / d, 3);
}
function decAddSub(rng) {
  const a = int(rng, 11, 999) / 10, b = int(rng, 11, 999) / 10;
  return rng() < 0.5 ? arith(rng, a, '+', b, r1(a + b), 0.1) : arith(rng, Math.max(a, b), '-', Math.min(a, b), r1(Math.abs(a - b)), 0.1);
}
function decMul(rng) {
  const a = int(rng, 11, 99) / 10, b = int(rng, 2, 9);
  return arith(rng, a, '×', b, r1(a * b), 0.1);
}
function decShift(rng) {
  // Nhân/chia nhẩm với 10, 100: phương án nhiễu là dời dấu phẩy sai chỗ.
  const a100 = int(rng, 101, 9999); // a = a100 / 100
  const shifts = { '×10': a100 * 10, '×100': a100 * 100, ':10': a100 / 10, ':100': a100 / 100 }; // đơn vị: 1/100
  const ops = ['×10', '×100', ':10'];
  const op = pick(rng, ops);
  const show = (v) => fmtNum(Number((v / 100).toFixed(4)));
  const a = show(a100);
  const ok = show(shifts[op]);
  const bad = Object.values(shifts).map(show).filter((x) => x !== ok);
  const [sym, k] = [op[0], op.slice(1)];
  return withChoices(
    rng,
    { prompt: `${a} ${sym} ${k} = ?`, say: `${a} ${opSay[sym]} ${k} bằng bao nhiêu?`, visual: { big: `${a} ${sym} ${k}` } },
    txt(ok), bad.map((x) => txt(x)),
  );
}
function percent(rng) {
  const p = pick(rng, [10, 20, 25, 50, 75]), x = int(rng, 1, 20) * 20;
  return numberChoices(rng, { prompt: `${p}% của ${x} là bao nhiêu?`, say: `${p} phần trăm của ${x} là bao nhiêu?`, visual: { big: `${p}% × ${x}` } }, (x * p) / 100, 3);
}

// ---------- Bảng: lớp × mức → các bộ sinh ----------
const G = {
  mn1: {
    tb: [(r) => count(r, 3, 2)],
    kha: [(r) => count(r, 5), (r) => shape(r, ['hình tròn', 'hình vuông', 'hình tam giác'])],
    nc: [(r) => count(r, 10), (r) => compareGroups(r, 6)],
  },
  mn2: {
    tb: [(r) => count(r, 10), (r) => shape(r, Object.keys(SHAPES))],
    kha: [(r) => compareGroups(r, 9), (r) => compareGroups(r, 9, true), (r) => biggerNumber(r, 10)],
    nc: [pictureAdd],
  },
  l1: {
    tb: [(r) => addSub(r, 10)],
    kha: [(r) => addSub(r, 20, { carry: 'none' }), (r) => compareSign(r, 100), (r) => neighbor(r, 100)],
    nc: [(r) => addSub(r, 99, { carry: 'none', min: 10 }), ...WORD.l1],
  },
  l2: {
    tb: [(r) => addSub(r, 100, { carry: 'must', min: 10 })],
    kha: [(r) => table(r, [2, 5]), (r) => compareSign(r, 1000)],
    nc: [(r) => addSub(r, 1000, { min: 100 }), ...WORD.l2],
  },
  l3: {
    tb: [(r) => table(r, [2, 3, 4, 5, 6, 7, 8, 9])],
    kha: [
      (r) => { const a = int(r, 12, 300), b = int(r, 2, 9); return arith(r, a, '×', b, a * b); },
      (r) => { const q = int(r, 11, 120), b = int(r, 2, 9); return arith(r, q * b, ':', b, q); },
      (r) => addSub(r, 10000, { min: 1000 }),
    ],
    nc: WORD.l3,
  },
  l4: {
    tb: [(r) => addSub(r, 999999, { min: 10000 }), (r) => compareSign(r, 999999)],
    kha: [
      (r) => { const a = int(r, 12, 999), b = int(r, 11, 99); return arith(r, a, '×', b, a * b); },
      (r) => { const q = int(r, 101, 9999), b = int(r, 2, 9); return arith(r, q * b, ':', b, q); },
    ],
    nc: [fracSameDen, fracOf, ...WORD.l4],
  },
  l5: {
    tb: [decAddSub],
    kha: [decMul, decShift, percent],
    nc: WORD.l5,
  },
};

export function toanLesson(grade, level, rng, n) {
  const gens = G[grade][level];
  return fromGenerator(rng, (r) => pick(r, gens)(r), n);
}
export const TOAN_GRADES = G;

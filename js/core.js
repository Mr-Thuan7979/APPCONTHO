// Khung chương trình + tiện ích dùng chung cho mọi môn.

export const GRADES = [
  { id: 'mn1', label: 'Mầm non nhỏ', sub: '3–4 tuổi', emoji: '🐣', band: 'mam' },
  { id: 'mn2', label: 'Mầm non lớn', sub: '5 tuổi', emoji: '🐥', band: 'mam' },
  { id: 'l1', label: 'Lớp 1', sub: '6 tuổi', emoji: '1️⃣', band: 'l12' },
  { id: 'l2', label: 'Lớp 2', sub: '7 tuổi', emoji: '2️⃣', band: 'l12' },
  { id: 'l3', label: 'Lớp 3', sub: '8 tuổi', emoji: '3️⃣', band: 'l35' },
  { id: 'l4', label: 'Lớp 4', sub: '9 tuổi', emoji: '4️⃣', band: 'l35' },
  { id: 'l5', label: 'Lớp 5', sub: '10 tuổi', emoji: '5️⃣', band: 'l35' },
];
export const gradeOf = (id) => GRADES.find((g) => g.id === id) || GRADES[0];

export const LEVELS = [
  { id: 'tb', label: 'Trung bình', emoji: '🌱', mult: 1 },
  { id: 'kha', label: 'Khá', emoji: '🌿', mult: 2 },
  { id: 'nc', label: 'Nâng cao', emoji: '🌳', mult: 3 },
];
export const levelOf = (id) => LEVELS.find((l) => l.id === id) || LEVELS[0];

// Mở mức kế tiếp khi trung bình 3 bài gần nhất ở mức hiện tại đạt ngưỡng này.
export const UNLOCK_RATIO = 0.8;
export const UNLOCK_LESSONS = 3;
export const QUESTIONS_PER_LESSON = 5;

// ---------- Ngẫu nhiên ----------
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
export const int = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
export const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
export function shuffle(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const sample = (rng, arr, n) => shuffle(rng, arr).slice(0, n);

// ---------- Dựng câu hỏi ----------
// Câu hỏi: { prompt, say, lang?, visual?, choices: [{ text|html, say?, lang? }], answer }
const ckey = (c) => c.text ?? c.html;

export function withChoices(rng, q, correct, distractors, n = 3) {
  const seen = new Set([ckey(correct)]);
  const uniq = [];
  for (const d of distractors) {
    if (!seen.has(ckey(d))) {
      seen.add(ckey(d));
      uniq.push(d);
    }
  }
  const choices = shuffle(rng, [correct, ...sample(rng, uniq, n)]);
  return { ...q, choices, answer: choices.indexOf(correct) };
}

export const txt = (t, lang) => (lang ? { text: t, say: t, lang } : { text: t, say: t });

// Số hiển thị kiểu Việt Nam: 1.234.567 và 2,5
export function fmtNum(n) {
  const [i, d] = String(n).split('.');
  const int_ = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return d ? `${int_},${d}` : int_;
}

export function numberChoices(rng, q, correct, spread = 3, step = 1) {
  const pool = [];
  for (let d = -spread; d <= spread; d++) {
    const v = round(correct + d * step);
    if (d && v >= 0) pool.push(v);
  }
  if (correct >= 10 && step === 1) pool.push(correct + 10, correct - 10);
  return withChoices(
    rng,
    q,
    { text: fmtNum(correct), say: fmtNum(correct) },
    pool.filter((v) => v >= 0).map((v) => ({ text: fmtNum(v), say: fmtNum(v) })),
  );
}
export const round = (x) => Math.round(x * 1000) / 1000;

// Ngân hàng câu hỏi viết gọn: "hình|câu hỏi|đáp án đúng|sai 1|sai 2|sai 3"
export function parseBank(lines) {
  return lines.map((line) => {
    const [emoji, prompt, ok, ...bad] = line.split('|').map((s) => s.trim());
    return { emoji, prompt, ok, bad };
  });
}

export function bankQuestion(rng, item, lang) {
  return withChoices(
    rng,
    { prompt: item.prompt, say: item.prompt, visual: item.emoji ? { emoji: item.emoji } : undefined },
    txt(item.ok, lang),
    item.bad.map((b) => txt(b, lang)),
    item.bad.length,
  );
}

// Lấy n câu khác nhau từ ngân hàng.
export function fromBank(rng, bank, n, lang) {
  return sample(rng, bank, n).map((it) => bankQuestion(rng, it, lang));
}

// Gọi bộ sinh nhiều lần, bỏ câu trùng.
export function fromGenerator(rng, gen, n) {
  const out = [];
  const seen = new Set();
  for (let guard = 0; out.length < n && guard < 300; guard++) {
    const q = gen(rng);
    const a = q.choices[q.answer];
    const k = q.prompt + '|' + (q.visual?.emoji ?? '') + (q.visual?.count ?? '') + (q.visual?.big ?? '') + '|' + (a.text ?? a.html);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(q);
  }
  return out;
}

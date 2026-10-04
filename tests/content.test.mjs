// Kiểm tra tự động: chạy `npm test`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GRADES, LEVELS, SUBJECTS, generateLesson, mixedQuiz, makeRng, starsFor, QUESTIONS_PER_LESSON } from '../js/content.js';
import { LETTERS, LETTER_SAY, PICTURE_WORDS, TONE_WORDS, TV_BANKS, baseLetter } from '../js/subjects/tiengviet.js';
import { EN_VOCAB, EN_SENTENCES } from '../js/subjects/tienganh.js';
import { KHOAHOC } from '../js/subjects/khoahoc.js';
import { LICHSU } from '../js/subjects/lichsu.js';
import { KYNANG } from '../js/subjects/kynang.js';
import { CLIPS, CLIPS_BY } from '../js/clips.js';
import { REBUS_WORDS, REBUS_IDIOMS, wordPool, matchSets, MATCH_PAIRS } from '../js/games-data.js';

const key = (c) => c.text ?? c.html;
const MIN_BANK = 15;

test('mọi môn × lớp × mức đều sinh đủ 5 câu hợp lệ (300 bài mỗi tổ hợp)', () => {
  for (const s of SUBJECTS) for (const g of GRADES) for (const l of LEVELS) {
    for (let seed = 0; seed < 300; seed++) {
      const qs = generateLesson(s.id, g.id, l.id, makeRng(seed));
      const where = `${s.id}/${g.id}/${l.id}/seed${seed}`;
      assert.equal(qs.length, QUESTIONS_PER_LESSON, where);
      for (const q of qs) {
        assert.ok(q.prompt && q.say, `thiếu đề bài ${where}`);
        assert.ok(q.choices.length >= 2 && q.choices.length <= 4, `số phương án ${where}`);
        assert.ok(q.answer >= 0 && q.answer < q.choices.length, `đáp án ngoài phương án ${where}`);
        const keys = q.choices.map(key);
        assert.equal(new Set(keys).size, keys.length, `phương án trùng: ${q.prompt} ${keys} (${where})`);
      }
    }
  }
});

// "1.234,5" -> 1234.5
const num = (s) => Number(s.replace(/\./g, '').replace(',', '.'));
const near = (a, b) => Math.abs(a - b) < 1e-9;

test('đáp án Toán luôn đúng (phép tính, phần trăm, phân số)', () => {
  let checked = 0;
  for (const g of GRADES) for (const l of LEVELS) for (let seed = 0; seed < 400; seed++) {
    for (const q of generateLesson('toan', g.id, l.id, makeRng(seed))) {
      const ans = q.choices[q.answer].text;
      assert.ok(!(ans ?? '').startsWith('-') && q.choices.every((c) => !(c.text ?? '').startsWith('-')), `có số âm: ${q.prompt}`);
      let m = q.prompt.match(/^([\d.,]+) ([+\-×:]) ([\d.,]+) = \?$/);
      if (m) {
        const [x, op, y] = [num(m[1]), m[2], num(m[3])];
        const r = { '+': x + y, '-': x - y, '×': x * y, ':': x / y }[op];
        assert.ok(near(num(ans), r), `${q.prompt} → ${ans} (đúng: ${r})`);
        assert.ok(r >= 0, `kết quả âm: ${q.prompt}`);
        checked++;
        continue;
      }
      m = q.prompt.match(/^(\d+)% của (\d+) là/);
      if (m) { assert.ok(near(num(ans), (m[1] * m[2]) / 100), q.prompt); checked++; continue; }
      m = q.prompt.match(/^(\d+)\/(\d+) của (\d+) là/);
      if (m) { assert.ok(near(num(ans), (m[1] * m[3]) / m[2]), q.prompt); checked++; continue; }
      m = q.prompt.match(/^(\d+)\/(\d+) \+ (\d+)\/\2 = \?$/);
      if (m) { assert.equal(ans, `${Number(m[1]) + Number(m[3])}/${m[2]}`, q.prompt); checked++; continue; }
      if (q.visual?.count) { assert.equal(ans, String(q.visual.count)); checked++; }
    }
  }
  assert.ok(checked > 5000, `kiểm được ${checked} câu`);
});

test('chữ cái và từ có hình', () => {
  assert.equal(LETTERS.length, 29, 'bảng chữ cái tiếng Việt có 29 chữ');
  for (const l of LETTERS) assert.ok(LETTER_SAY[l], `thiếu cách đọc chữ ${l}`);
  for (const p of PICTURE_WORDS) assert.ok(LETTERS.includes(baseLetter(p.w[0])), `chữ đầu của ${p.w}`);
  assert.equal(baseLetter('ế'), 'ê');
  for (const t of TONE_WORDS) assert.ok(!t.x.includes(t.w), `phương án sai trùng đáp án: ${t.w}`);
});

function checkBank(bank, where) {
  assert.ok(bank.length >= MIN_BANK, `${where}: chỉ có ${bank.length} câu (cần ≥ ${MIN_BANK})`);
  const seen = new Set();
  for (const it of bank) {
    assert.ok(it.prompt && it.ok, `${where}: dòng thiếu dữ liệu`);
    assert.ok(it.bad.length >= 2, `${where}: “${it.prompt}” cần ≥ 2 phương án sai`);
    assert.ok(!it.bad.includes(it.ok), `${where}: đáp án đúng nằm trong phương án sai – ${it.prompt}`);
    assert.equal(new Set(it.bad).size, it.bad.length, `${where}: phương án sai trùng – ${it.prompt}`);
    const k = it.emoji + it.prompt;
    assert.ok(!seen.has(k), `${where}: câu trùng – ${it.prompt}`);
    seen.add(k);
  }
}

test('ngân hàng câu hỏi đủ số lượng, không lỗi dữ liệu', () => {
  for (const g of GRADES) for (const l of LEVELS) {
    checkBank(KHOAHOC[g.id][l.id], `Khoa học ${g.id}/${l.id}`);
    checkBank(LICHSU[g.id][l.id], `Lịch sử ${g.id}/${l.id}`);
  }
  for (const band of ['mam', 'l12', 'l35']) for (const l of LEVELS) checkBank(KYNANG[band][l.id], `Kỹ năng ${band}/${l.id}`);
  for (const [k, bank] of Object.entries(TV_BANKS)) checkBank(bank, `Tiếng Việt ${k}`);
  for (const [k, bank] of Object.entries(EN_SENTENCES)) checkBank(bank, `Tiếng Anh câu ${k}`);
});

test('tổng số câu soạn sẵn ≥ 950 (chưa tính Toán, từ vựng sinh tự động)', () => {
  let total = 0;
  for (const g of GRADES) for (const l of LEVELS) total += KHOAHOC[g.id][l.id].length + LICHSU[g.id][l.id].length;
  for (const band of Object.values(KYNANG)) for (const b of Object.values(band)) total += b.length;
  for (const b of Object.values(TV_BANKS)) total += b.length;
  for (const b of Object.values(EN_SENTENCES)) total += b.length;
  assert.ok(total >= 950, `hiện có ${total} câu`);
});

test('từ vựng tiếng Anh: đủ từ, hình không trùng trong cùng lớp', () => {
  for (const g of GRADES) {
    const v = EN_VOCAB[g.id];
    assert.ok(v.length >= 12, `${g.id} cần ≥ 12 từ`);
    assert.equal(new Set(v.map((x) => x[2])).size, v.length, `${g.id}: hình trùng`);
    assert.equal(new Set(v.map((x) => x[0])).size, v.length, `${g.id}: từ trùng`);
  }
});

test('Rung chuông vàng: 10 câu trộn nhiều môn', () => {
  for (const g of GRADES) {
    const qs = mixedQuiz(g.id, {}, makeRng(7));
    assert.equal(qs.length, 10, g.id);
  }
});

test('clip: đủ cảnh, có lời đọc; danh sách theo lớp trỏ đúng clip', () => {
  for (const [id, c] of Object.entries(CLIPS)) {
    assert.ok(c.title && c.scenes.length >= 4, id);
    for (const s of c.scenes) assert.ok(s.say && s.items.length && s.bg, `${id}: cảnh thiếu dữ liệu`);
  }
  for (const by of Object.values(CLIPS_BY)) for (const ids of Object.values(by)) for (const id of ids) assert.ok(CLIPS[id], `clip không tồn tại: ${id}`);
});

test('dữ liệu trò chơi hợp lệ', () => {
  const answers = [...REBUS_WORDS, ...REBUS_IDIOMS].map(([, a]) => a);
  assert.equal(new Set(answers).size, answers.length, 'đáp án đuổi hình bắt chữ trùng');
  for (const g of GRADES) {
    for (const w of wordPool(g.id)) assert.match(w.word, /^[A-ZÀ-Ỹ ]+$/u, `ô chữ có kí tự lạ: ${w.word}`);
    for (const [title, pairs] of matchSets(g.id)) {
      assert.ok(pairs.length >= MATCH_PAIRS[g.id] || pairs.length >= 3, `${g.id}: “${title}” thiếu cặp`);
      assert.equal(new Set(pairs.map((p) => p[0])).size, pairs.length, `${title}: vế trái trùng`);
      assert.equal(new Set(pairs.map((p) => p[1])).size, pairs.length, `${title}: vế phải trùng`);
    }
  }
});

test('chấm sao luôn khích lệ (1–3 sao)', () => {
  assert.equal(starsFor(5, 5), 3);
  assert.equal(starsFor(3, 5), 2);
  assert.equal(starsFor(0, 5), 1);
});

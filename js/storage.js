// Lưu toàn bộ dữ liệu trên máy (localStorage). Không gửi đi đâu.
import { LEVELS, UNLOCK_LESSONS, UNLOCK_RATIO, levelOf } from './core.js';

const KEY = 'appcontho.v1';
const RECENT = UNLOCK_LESSONS;

export const DEFAULT_SETTINGS = {
  dailyMinutes: 30, // giới hạn mỗi bé mỗi ngày; 0 = không giới hạn
  breakEvery: 15, // nhắc nghỉ mắt sau mỗi N phút liên tục; 0 = tắt
  speechRate: 0.9,
  sound: true,
};

function blank() {
  return { version: 2, profiles: [], activeId: null, prog: {}, usage: {}, settings: { ...DEFAULT_SETTINGS } };
}

// Bản 1 dùng 3 nhóm tuổi; bản 2 dùng 7 cấp lớp.
const AGE_TO_GRADE = { mam: 'mn1', l12: 'l1', l35: 'l3' };
function migrate(s) {
  if (s.version === 2) return s;
  s.profiles = (s.profiles || []).map((p) => ({
    id: p.id, name: p.name, avatar: p.avatar, stars: p.stars || 0,
    grade: p.grade || AGE_TO_GRADE[p.age] || 'mn1', tickets: p.tickets ?? 1, unlockAll: false,
  }));
  delete s.progress;
  s.prog = {};
  s.version = 2;
  return s;
}

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const s = migrate(JSON.parse(raw));
    return { ...blank(), ...s, settings: { ...DEFAULT_SETTINGS, ...(s.settings || {}) } };
  } catch {
    return blank();
  }
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* bộ nhớ đầy hoặc bị chặn: app vẫn chạy, chỉ không lưu */
  }
}

export const getState = () => state;
export const today = () => new Date().toLocaleDateString('sv'); // YYYY-MM-DD theo giờ máy
const profile = (id) => state.profiles.find((x) => x.id === id);

export function addProfile({ name, avatar, grade }) {
  const p = { id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, avatar, grade, stars: 0, tickets: 1, unlockAll: false };
  state.profiles.push(p);
  state.activeId = p.id;
  save();
  return p;
}

export function updateProfile(id, patch) {
  const p = profile(id);
  if (p) Object.assign(p, patch);
  save();
}

export function removeProfile(id) {
  state.profiles = state.profiles.filter((p) => p.id !== id);
  delete state.prog[id];
  delete state.usage[id];
  if (state.activeId === id) state.activeId = null;
  save();
}

export function setActive(id) {
  state.activeId = id;
  save();
}

export const activeProfile = () => profile(state.activeId) || null;

// ---------- Tiến độ theo môn × lớp × mức ----------
function cell(pid, subject, grade, level) {
  const s = ((state.prog[pid] ??= {})[subject] ??= {});
  return ((s[grade] ??= {})[level] ??= { lessons: 0, correct: 0, total: 0, recent: [] });
}
const peek = (pid, subject, grade, level) => state.prog[pid]?.[subject]?.[grade]?.[level];

function passed(c) {
  if (!c || c.recent.length < RECENT) return false;
  // trừ sai số dấu phẩy động: (1 + 1 + 0,4) / 3 phải được tính là đạt 80%
  return c.recent.reduce((a, b) => a + b, 0) / c.recent.length >= UNLOCK_RATIO - 1e-9;
}

// Trạng thái các mức của một môn ở một lớp.
export function levelStatus(pid, subject, grade) {
  const p = profile(pid);
  const out = {};
  LEVELS.forEach((lv, i) => {
    const c = peek(pid, subject, grade, lv.id);
    const prev = i ? peek(pid, subject, grade, LEVELS[i - 1].id) : null;
    const unlocked = i === 0 || !!p?.unlockAll || passed(prev) || (c?.lessons ?? 0) > 0;
    const recentAvg = c?.recent.length ? c.recent.reduce((a, b) => a + b, 0) / c.recent.length : null;
    out[lv.id] = {
      unlocked,
      lessons: c?.lessons ?? 0,
      accuracy: c?.total ? c.correct / c.total : null,
      recentAvg,
      recentCount: c?.recent.length ?? 0,
      mastered: passed(c),
    };
  });
  return out;
}

export function unlockedLevels(pid, subject, grade) {
  const st = levelStatus(pid, subject, grade);
  return LEVELS.filter((l) => st[l.id].unlocked).map((l) => l.id);
}

// Ghi kết quả bài học. Trả về số sao nhận được và mức vừa được mở (nếu có).
export function recordLesson(pid, subject, grade, level, { correct, total, stars }) {
  const before = unlockedLevels(pid, subject, grade);
  const c = cell(pid, subject, grade, level);
  c.lessons += 1;
  c.correct += correct;
  c.total += total;
  c.recent = [...c.recent, correct / total].slice(-RECENT);
  const earned = stars * levelOf(level).mult;
  const p = profile(pid);
  if (p) {
    p.stars += earned;
    p.tickets = (p.tickets ?? 0) + 1;
  }
  save();
  const after = unlockedLevels(pid, subject, grade);
  const newly = after.find((l) => !before.includes(l)) || null;
  return { earned, newlyUnlocked: newly };
}

export function addStars(pid, n) {
  const p = profile(pid);
  if (p) p.stars += n;
  save();
}

export function useTicket(pid) {
  const p = profile(pid);
  if (!p || (p.tickets ?? 0) < 1) return false;
  p.tickets -= 1;
  save();
  return true;
}

export function addTickets(pid, n) {
  const p = profile(pid);
  if (p) p.tickets = (p.tickets ?? 0) + n;
  save();
}

// Tổng hợp cho khu phụ huynh: mỗi môn ở lớp hiện tại.
export function subjectSummary(pid, subject, grade) {
  const st = levelStatus(pid, subject, grade);
  let lessons = 0, correct = 0, total = 0;
  for (const lv of LEVELS) {
    const c = peek(pid, subject, grade, lv.id);
    if (c) { lessons += c.lessons; correct += c.correct; total += c.total; }
  }
  const top = [...LEVELS].reverse().find((l) => st[l.id].unlocked);
  return { lessons, accuracy: total ? correct / total : null, topLevel: top.id };
}

// ---------- Thời gian sử dụng ----------
export function usageToday(pid) {
  const u = state.usage[pid];
  if (!u || u.date !== today()) return { date: today(), seconds: 0, bonusMin: 0 };
  return u;
}

export function addUsage(pid, seconds) {
  const u = usageToday(pid);
  u.seconds += seconds;
  state.usage[pid] = u;
  save();
}

export function grantBonus(pid, minutes) {
  const u = usageToday(pid);
  u.bonusMin += minutes;
  state.usage[pid] = u;
  save();
}

export function updateSettings(patch) {
  Object.assign(state.settings, patch);
  save();
}

export function resetAll() {
  state = blank();
  save();
}

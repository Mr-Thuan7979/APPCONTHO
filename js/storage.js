// Lưu toàn bộ dữ liệu trên máy (localStorage). Không gửi đi đâu.
const KEY = 'appcontho.v1';

export const DEFAULT_SETTINGS = {
  dailyMinutes: 30, // giới hạn mỗi bé mỗi ngày; 0 = không giới hạn
  breakEvery: 15, // nhắc nghỉ mắt sau mỗi N phút liên tục; 0 = tắt
  speechRate: 0.9,
  sound: true,
};

function blank() {
  return { profiles: [], activeId: null, progress: {}, usage: {}, settings: { ...DEFAULT_SETTINGS } };
}

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const s = JSON.parse(raw);
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

export function addProfile({ name, avatar, age }) {
  const p = { id: 'p' + Date.now().toString(36), name, avatar, age, stars: 0 };
  state.profiles.push(p);
  state.activeId = p.id;
  save();
  return p;
}

export function updateProfile(id, patch) {
  const p = state.profiles.find((x) => x.id === id);
  if (p) Object.assign(p, patch);
  save();
}

export function removeProfile(id) {
  state.profiles = state.profiles.filter((p) => p.id !== id);
  delete state.progress[id];
  delete state.usage[id];
  if (state.activeId === id) state.activeId = null;
  save();
}

export function setActive(id) {
  state.activeId = id;
  save();
}

export const activeProfile = () => state.profiles.find((p) => p.id === state.activeId) || null;

export function recordLesson(pid, subject, { correct, total, stars }) {
  const pr = (state.progress[pid] ??= {});
  const s = (pr[subject] ??= { lessons: 0, correct: 0, total: 0, stars: 0 });
  s.lessons += 1;
  s.correct += correct;
  s.total += total;
  s.stars += stars;
  const p = state.profiles.find((x) => x.id === pid);
  if (p) p.stars += stars;
  save();
}

export function addStars(pid, n) {
  const p = state.profiles.find((x) => x.id === pid);
  if (p) p.stars += n;
  save();
}

// Thời gian dùng trong ngày (giây) + phút được phụ huynh gia hạn thêm.
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

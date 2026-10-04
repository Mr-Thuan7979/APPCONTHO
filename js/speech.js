// Giọng đọc tiếng Việt + tiếng Anh.
// Giai đoạn 1: dùng giọng đọc có sẵn của máy (Web Speech API).
// Giai đoạn 2: thu âm giọng người thật, bỏ file vào thư mục audio/ và khai báo
// trong audio/manifest.json dạng { "câu cần đọc": "ten-file.mp3" }.
// Câu nào có file thu âm sẽ phát file đó; câu chưa có vẫn dùng giọng máy.

let recorded = {};
const voices = { vi: null, en: null };
let settings = { sound: true, speechRate: 0.9 };
let current = null;
let queueToken = 0;

export function configureSpeech(s) {
  settings = s;
}

function pickVoices() {
  if (!('speechSynthesis' in window)) return;
  const all = speechSynthesis.getVoices();
  const best = (prefix) =>
    all.find((v) => v.lang?.toLowerCase().startsWith(prefix) && /google|natural|online|siri/i.test(v.name)) ||
    all.find((v) => v.lang?.toLowerCase().startsWith(prefix)) ||
    null;
  voices.vi = best('vi');
  voices.en = best('en-us') || best('en');
}

export async function initSpeech() {
  if ('speechSynthesis' in window) {
    pickVoices();
    speechSynthesis.addEventListener?.('voiceschanged', pickVoices);
  }
  try {
    const res = await fetch('audio/manifest.json');
    if (res.ok) recorded = await res.json();
  } catch {
    recorded = {};
  }
}

export const hasVietnameseVoice = () => !!voices.vi;
export const hasEnglishVoice = () => !!voices.en;
export const speechSupported = () => 'speechSynthesis' in window;

export function stopSpeech() {
  queueToken++;
  if (current) {
    current.pause();
    current = null;
  }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

// Đọc một đoạn; gọi done() khi xong (kể cả khi không đọc được).
function speakOne(text, lang, done) {
  const file = recorded[text];
  if (file) {
    current = new Audio('audio/' + file);
    current.onended = done;
    current.onerror = done;
    current.play().catch(done);
    return;
  }
  if (!('speechSynthesis' in window)) return done();
  const u = new SpeechSynthesisUtterance(text);
  const en = lang?.startsWith('en');
  u.lang = en ? 'en-US' : 'vi-VN';
  const v = en ? voices.en : voices.vi;
  if (v) u.voice = v;
  u.rate = en ? Math.max(0.7, settings.speechRate - 0.1) : settings.speechRate;
  u.pitch = 1.1;
  u.onend = done;
  u.onerror = done;
  speechSynthesis.speak(u);
}

// text: chuỗi, hoặc mảng [[đoạn, ngôn ngữ], ...]. onDone gọi khi đọc xong toàn bộ.
export function speak(text, lang, onDone) {
  stopSpeech();
  const parts = Array.isArray(text) ? text : [[text, lang || 'vi-VN']];
  const token = queueToken;
  let i = 0;
  const next = () => {
    if (token !== queueToken) return;
    if (i >= parts.length || !settings.sound) return onDone?.();
    const [t, l] = parts[i++];
    if (!t) return next();
    speakOne(t, l, next);
  };
  if (!settings.sound) return onDone?.();
  next();
}

// Âm báo đúng/sai ngắn, tạo bằng WebAudio (không cần file).
let ctx;
export function chime(ok) {
  if (!settings.sound) return;
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    const notes = ok === 'bell' ? [784, 988, 1175, 1568] : ok ? [523, 659, 784] : [330, 262];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      const t = ctx.currentTime + i * 0.12;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.35);
    });
  } catch {
    /* không hỗ trợ âm thanh */
  }
}

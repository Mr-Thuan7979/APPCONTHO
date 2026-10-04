// Giọng đọc tiếng Việt.
// Giai đoạn 1: dùng giọng đọc có sẵn của máy (Web Speech API, vi-VN).
// Giai đoạn 2: thu âm giọng người thật, bỏ file vào thư mục audio/ và khai báo
// trong audio/manifest.json dạng { "câu cần đọc": "ten-file.mp3" }.
// Câu nào có file thu âm sẽ phát file đó; câu chưa có vẫn dùng giọng máy.

let recorded = {};
let viVoice = null;
let settings = { sound: true, speechRate: 0.9 };
let current = null;

export function configureSpeech(s) {
  settings = s;
}

function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices();
  viVoice =
    voices.find((v) => v.lang?.toLowerCase().startsWith('vi') && /google|natural|online/i.test(v.name)) ||
    voices.find((v) => v.lang?.toLowerCase().startsWith('vi')) ||
    null;
}

export async function initSpeech() {
  if ('speechSynthesis' in window) {
    pickVoice();
    speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
  }
  try {
    const res = await fetch('audio/manifest.json');
    if (res.ok) recorded = await res.json();
  } catch {
    recorded = {};
  }
}

export const hasVietnameseVoice = () => !!viVoice;
export const speechSupported = () => 'speechSynthesis' in window;

export function stopSpeech() {
  if (current) {
    current.pause();
    current = null;
  }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

export function speak(text) {
  if (!settings.sound || !text) return;
  stopSpeech();
  const file = recorded[text];
  if (file) {
    current = new Audio('audio/' + file);
    current.play().catch(() => {});
    return;
  }
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'vi-VN';
  if (viVoice) u.voice = viVoice;
  u.rate = settings.speechRate;
  u.pitch = 1.1;
  speechSynthesis.speak(u);
}

// Âm báo đúng/sai ngắn, tạo bằng WebAudio (không cần file).
let ctx;
export function chime(ok) {
  if (!settings.sound) return;
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    const notes = ok ? [523, 659, 784] : [330, 262];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      const t = ctx.currentTime + i * 0.12;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.3);
    });
  } catch {
    /* không hỗ trợ âm thanh */
  }
}

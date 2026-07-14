const CHORD_DEFS = {
  C: { pc: [0, 4, 7], keys: [12, 16, 19], label: "C", color: [255, 255, 200] },
  G: { pc: [7, 11, 2], keys: [19, 23, 26], label: "G", color: [255, 255, 200] },
  Am: { pc: [9, 0, 4], keys: [21, 24, 28], label: "Am", color: [100, 160, 255] },
  F: { pc: [5, 9, 0], keys: [17, 21, 24], label: "F", color: [255, 255, 200] },
  Em: { pc: [4, 7, 11], keys: [16, 19, 23], label: "Em", color: [100, 160, 255] },
  Dm: { pc: [2, 5, 9], keys: [14, 17, 21], label: "Dm", color: [100, 160, 255] }
};

const chords = [
  { id: "C", shortcut: "1", uiColor: "#74a8d5", ...CHORD_DEFS.C },
  { id: "G", shortcut: "2", uiColor: "#6aa35d", ...CHORD_DEFS.G },
  { id: "Am", shortcut: "3", uiColor: "#ef6f67", ...CHORD_DEFS.Am },
  { id: "F", shortcut: "4", uiColor: "#ffd267", ...CHORD_DEFS.F },
  { id: "Em", shortcut: "5", uiColor: "#a98de8", ...CHORD_DEFS.Em },
  { id: "Dm", shortcut: "6", uiColor: "#ef9b55", ...CHORD_DEFS.Dm }
];

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const keyLabels = Array.from({ length: 36 }, (_, index) => `${NOTE_NAMES[index % 12]}${Math.floor(index / 12) + 3}`);
const DEFAULT_COLORS = [
  "#FF9D02", "#FB8A02", "#F87D01", "#F57200", "#F36500", "#EF5500",
  "#F14A00", "#F33F00", "#F53400", "#F82800", "#FA1E00", "#FC1200",
  "#FC0B17", "#FC0A32", "#FC094B", "#FB0768", "#FB0582", "#F902A7",
  "#EA02B3", "#D502B7", "#BC01BD", "#A301C2", "#8B01C8", "#7400CC",
  "#5901CB", "#4B03BC", "#3F04AF", "#3206A0", "#230790", "#150981",
  "#161C80", "#1E3387", "#264C8F", "#306797", "#38809E", "#47ABAB"
];
const fruitTypes = ["watermelon", "pineapple", "apple", "banana", "orange"];
const fruitEmoji = {
  watermelon: "🍉",
  pineapple: "🍍",
  apple: "🍎",
  banana: "🍌",
  orange: "🍊"
};
const fruitLedColors = {
  watermelon: [255, 70, 92],
  pineapple: [255, 190, 45],
  apple: [255, 55, 48],
  banana: [255, 225, 70],
  orange: [255, 135, 35]
};
const shortcutToChord = new Map(chords.map((chord) => [chord.shortcut, chord]));
const chordById = new Map(chords.map((chord) => [chord.id, chord]));
let midiOut = null;
let midiIn = null;
let midiAccess = null;
let flashTimer = null;
let ledSwitchTimer = null;
let ledSwitchToken = 0;
let ledState = Array.from({ length: 36 }, () => [0, 0, 0]);
const allKeyIndexes = Array.from({ length: 36 }, (_, index) => index);
const heldNotes = new Set();
let audioContext = null;
let musicTimer = null;
let musicStep = 0;

const gameCanvas = document.querySelector("#gameCanvas");
const ctx = gameCanvas.getContext("2d");
const waveCanvas = document.querySelector("#waveCanvas");
const waveCtx = waveCanvas.getContext("2d");
const keyboardPreview = document.querySelector("#keyboardPreview");
const scoreValue = document.querySelector("#scoreValue");
const targetChord = document.querySelector("#targetChord");
const targetNotes = document.querySelector("#targetNotes");
const livesValue = document.querySelector("#livesValue");
const timerValue = document.querySelector("#timerValue");
const detectedChord = document.querySelector("#detectedChord");
const matchValue = document.querySelector("#matchValue");
const listenState = document.querySelector("#listenState");
const startOverlay = document.querySelector("#startOverlay");
const endOverlay = document.querySelector("#endOverlay");
const endTitle = document.querySelector("#endTitle");
const endStats = document.querySelector("#endStats");
const gamePanel = document.querySelector(".game-panel");
const targetCard = document.querySelector("#targetCard");
const targetPulse = document.querySelector(".target-pulse");
const deviceDot = document.querySelector("#deviceDot");
const deviceLabel = document.querySelector("#deviceLabel");
const connectButton = document.querySelector("#connectButton");

const state = {
  score: 0,
  lives: 3,
  combo: 0,
  bestCombo: 0,
  perfect: 0,
  missed: 0,
  status: "idle",
  currentChord: chords[0],
  fruits: [],
  particles: [],
  pressedKeys: new Set(),
  lastSpawn: 0,
  spawnEvery: 1450,
  lastTime: 0,
  autoDemo: false,
  muted: false,
  partyKeysReady: false,
  currentFruitType: "watermelon",
  currentLedColor: fruitLedColors.watermelon,
  timeLeft: 45,
  slashes: [],
  hitEffectKeys: new Map(),
  missEffectKeys: new Map()
};

function createKeyboard() {
  keyboardPreview.innerHTML = "";
  keyLabels.forEach((label, index) => {
    const key = document.createElement("div");
    key.className = "key";
    key.dataset.key = String(index);
    key.textContent = label;
    keyboardPreview.appendChild(key);
  });
}

function resizeCanvas() {
  const rect = gameCanvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  gameCanvas.width = Math.max(1, Math.floor(rect.width * ratio));
  gameCanvas.height = Math.max(1, Math.floor(rect.height * ratio));
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function getGameSize() {
  return {
    width: gameCanvas.clientWidth,
    height: gameCanvas.clientHeight
  };
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];
}

function encodeMidiChannelValue(value) {
  return [Math.floor(value / 128), value % 128];
}

function buildLedColorCommand(groups) {
  const header = [0xf0, 0x05, 0x30, 0x7f, 0x7f, 0x20, 0x00, 0x15, groups.length];
  const body = [];
  for (const group of groups) {
    body.push(
      ...encodeMidiChannelValue(group.r),
      ...encodeMidiChannelValue(group.g),
      ...encodeMidiChannelValue(group.b),
      group.keys.length,
      ...group.keys
    );
  }
  return new Uint8Array([...header, ...body, 0xf7]);
}

function ledEnterMode() {
  if (!midiOut) return;
  midiOut.send([0xf0, 0x05, 0x30, 0x7f, 0x7f, 0x20, 0x00, 0x0f, 0x01, 0xf7]);
}

function ledAllOff() {
  if (midiOut) midiOut.send([0xf0, 0x05, 0x30, 0x7f, 0x7f, 0x20, 0x00, 0x71, 0x00, 0xf7]);
  ledState = Array.from({ length: 36 }, () => [0, 0, 0]);
}

function ledCancelAndAllOff() {
  if (flashTimer) clearTimeout(flashTimer);
  if (ledSwitchTimer) clearTimeout(ledSwitchTimer);
  ledSwitchToken += 1;
  ledAllOff();
}

function ledSendDefault() {
  const groups = DEFAULT_COLORS.map((hex, index) => {
    const [r, g, b] = hexToRgb(hex);
    return { r, g, b, keys: [index] };
  });
  if (midiOut) midiOut.send(buildLedColorCommand(groups));
  ledState = DEFAULT_COLORS.map(hexToRgb);
}

function ledHighlightChord(chord, color = state.currentLedColor) {
  if (!chord) return;
  if (flashTimer) clearTimeout(flashTimer);
  if (ledSwitchTimer) clearTimeout(ledSwitchTimer);
  ledSwitchToken += 1;
  const [r, g, b] = color || chord.color;
  const offKeys = allKeyIndexes.filter((keyIndex) => !chord.keys.includes(keyIndex));
  ledState = ledState.map((_, index) => chord.keys.includes(index) ? [r, g, b] : [0, 0, 0]);
  if (midiOut) {
    midiOut.send(buildLedColorCommand([
      { r: 0, g: 0, b: 0, keys: offKeys },
      { r, g, b, keys: chord.keys }
    ]));
  }
}

function ledFlash(r, g, b, onDone) {
  if (flashTimer) clearTimeout(flashTimer);
  const keys = Array.from({ length: 36 }, (_, index) => index);
  if (midiOut) midiOut.send(buildLedColorCommand([{ r, g, b, keys }]));
  ledState = keys.map(() => [r, g, b]);
  flashTimer = window.setTimeout(() => {
    ledHighlightChord(state.currentChord);
    if (onDone) onDone();
  }, 350);
}

function ensureAudio() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) audioContext = new AudioCtx();
  }
  if (audioContext?.state === "suspended") audioContext.resume();
  return audioContext;
}

function playTone(frequency, duration = 0.12, type = "triangle", volume = 0.04, when = 0) {
  if (state.muted) return;
  const audio = ensureAudio();
  if (!audio) return;
  const startAt = audio.currentTime + when;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.04);
}

function noteToFrequency(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function playChordSound(chord, style = "input") {
  if (state.muted || !chord) return;
  const baseVolume = style === "hit" ? 0.052 : 0.036;
  const duration = style === "hit" ? 0.42 : 0.28;
  chord.keys.forEach((keyIndex, index) => {
    const midi = 48 + keyIndex;
    playTone(noteToFrequency(midi), duration, "triangle", baseVolume, index * 0.018);
    if (style === "hit") playTone(noteToFrequency(midi) * 2, 0.22, "sine", 0.018, 0.04 + index * 0.014);
  });
  if (style === "hit") playTone(noteToFrequency(48 + chord.keys[0] - 12), 0.36, "sine", 0.03);
}

function playNoise(duration = 0.045, volume = 0.018, when = 0) {
  if (state.muted) return;
  const audio = ensureAudio();
  if (!audio) return;
  const samples = Math.floor(audio.sampleRate * duration);
  const buffer = audio.createBuffer(1, samples, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < samples; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / samples);
  const source = audio.createBufferSource();
  const gain = audio.createGain();
  const startAt = audio.currentTime + when;
  gain.gain.setValueAtTime(volume, startAt);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  source.buffer = buffer;
  source.connect(gain).connect(audio.destination);
  source.start(startAt);
}

function startBackgroundMusic() {
  if (state.muted || musicTimer || state.status !== "playing") return;
  ensureAudio();
  const bass = [110, 0, 146.83, 0, 130.81, 0, 98, 0];
  const pluck = [440, 0, 392, 0, 523.25, 0, 392, 329.63];
  musicStep = 0;
  musicTimer = window.setInterval(() => {
    if (state.status !== "playing" || state.muted) return;
    if (musicStep % 4 === 0) playNoise(0.035, 0.012);
    if (musicStep % 4 === 2) playNoise(0.025, 0.007);
    const bassNote = bass[musicStep % bass.length];
    if (bassNote) playTone(bassNote, 0.2, "sine", 0.012);
    const note = pluck[musicStep % pluck.length];
    if (note) playTone(note, 0.08, "sine", 0.008);
    musicStep += 1;
  }, 180);
}

function stopBackgroundMusic() {
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
}

function setDeviceStatus(text, connected = false, error = false) {
  deviceLabel.textContent = text;
  deviceDot.classList.toggle("connected", connected);
  deviceDot.classList.toggle("error", error);
  if (connectButton) connectButton.textContent = connected ? "PartyKeys Ready" : "Connect PartyKeys";
}

function nextChord() {
  const options = chords.filter((chord) => chord.id !== state.currentChord.id);
  state.currentChord = options[Math.floor(Math.random() * options.length)];
  targetChord.textContent = state.currentChord.label;
  targetNotes.textContent = getChordKeyLabels(state.currentChord).join(" ");
  targetCard.style.borderColor = state.currentChord.uiColor;
}

function getChordKeyLabels(chord) {
  return chord.keys.map((keyIndex) => keyLabels[keyIndex]);
}

function spawnFruit(chord = state.currentChord) {
  const { width, height } = getGameSize();
  const type = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
  state.currentFruitType = type;
  state.currentLedColor = fruitLedColors[type] || chord.color;
  const startY = height - 70;
  const apexY = Math.max(320, height * 0.42);
  const gravity = randomBetween(390, 450);
  const launchVelocity = -Math.sqrt(Math.max(0, 2 * gravity * (startY - apexY)));
  const fruit = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(performance.now() + Math.random()),
    type,
    chord,
    x: randomBetween(width * 0.22, width * 0.78),
    y: startY,
    vx: randomBetween(-95, 95),
    vy: launchVelocity * randomBetween(0.96, 1.02),
    ay: gravity,
    size: randomBetween(132, 168),
    rotation: randomBetween(-0.18, 0.18),
    spin: randomBetween(-1.2, 1.2),
    sliced: false
  };
  state.fruits.push(fruit);
}

function showNextTarget() {
  nextChord();
  state.fruits = [];
  spawnFruit(state.currentChord);
  ledHighlightChord(state.currentChord, state.currentLedColor);
  window.__partyKeysFruitFrenzy = {
    target: state.currentChord.label,
    targetNotes: getChordKeyLabels(state.currentChord),
    targetKeys: [...state.currentChord.keys],
    ledColor: [...state.currentLedColor]
  };
  const [r, g, b] = state.currentLedColor;
  targetCard.style.borderColor = `rgb(${r}, ${g}, ${b})`;
  targetPulse.style.background = `rgb(${r}, ${g}, ${b})`;
  targetPulse.style.boxShadow = `0 0 24px rgba(${r}, ${g}, ${b}, 0.9)`;
}

function drawGrid(width, height) {
  ctx.save();
  ctx.globalAlpha = 0.46;
  ctx.strokeStyle = "rgba(20, 7, 2, 0.42)";
  ctx.lineWidth = 4;
  for (let x = 120; x < width; x += 180) {
    ctx.beginPath();
    ctx.moveTo(x + Math.sin(x) * 8, 0);
    ctx.lineTo(x - Math.cos(x) * 10, height);
    ctx.stroke();
  }
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 214, 121, 0.07)";
  for (let y = 90; y < height; y += 95) {
    ctx.beginPath();
    ctx.moveTo(0, y + Math.sin(y) * 9);
    ctx.lineTo(width, y - Math.cos(y) * 7);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.34;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.55)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 18; i += 1) {
    const x = (i * 173 + 70) % width;
    const y = (i * 97 + 130) % height;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + randomScratch(i, 70), y + randomScratch(i + 4, 24));
    ctx.stroke();
  }
  const glow = ctx.createRadialGradient(width * 0.52, height * 0.46, 20, width * 0.52, height * 0.46, width * 0.42);
  glow.addColorStop(0, "rgba(255, 230, 150, 0.16)");
  glow.addColorStop(1, "rgba(255, 230, 150, 0)");
  ctx.globalAlpha = 1;
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function randomScratch(seed, scale) {
  return (Math.sin(seed * 999) * 0.5 + 0.5) * scale - scale / 2;
}

function drawFruit(fruit) {
  drawChordLabel(fruit);
  ctx.save();
  ctx.translate(fruit.x, fruit.y);
  ctx.rotate(fruit.rotation);
  const s = fruit.size;
  ctx.shadowColor = "rgba(72, 64, 54, 0.18)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 10;
  ctx.font = `${Math.round(s)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(fruitEmoji[fruit.type], 0, 0);
  ctx.restore();
}

function drawChordLabel(fruit) {
  ctx.save();
  const labelSize = Math.max(26, Math.round(fruit.size * 0.27));
  ctx.font = `900 ${labelSize}px Inter, Arial`;
  const label = fruit.chord.label;
  const metrics = ctx.measureText(label);
  const w = Math.max(72, metrics.width + 34);
  const h = Math.max(44, labelSize + 18);
  const x = fruit.x - w / 2;
  const y = fruit.y - fruit.size * 0.78;
  ctx.shadowColor = "rgba(72, 64, 54, 0.12)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = "rgba(255, 253, 248, 0.94)";
  ctx.strokeStyle = "#67625e";
  ctx.lineWidth = 3;
  roundedRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.stroke();
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#4b4844";
  ctx.textBaseline = "middle";
  ctx.fillText(label, fruit.x - metrics.width / 2, y + h / 2 + 1);
  ctx.restore();
}

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function updateGame(dt, now) {
  if (state.status !== "playing") return;

  state.timeLeft = Math.max(0, state.timeLeft - dt);
  if (state.timeLeft <= 0) {
    endGame();
    return;
  }

  if (state.fruits.length === 0) showNextTarget();

  const { height } = getGameSize();
  state.fruits.forEach((fruit) => {
    fruit.x += fruit.vx * dt;
    fruit.vy += fruit.ay * dt;
    fruit.y += fruit.vy * dt;
    fruit.rotation += fruit.spin * dt;
  });

  const missedFruit = state.fruits.find((fruit) => fruit.vy > 0 && fruit.y - fruit.size * 0.9 > height + 110);
  if (missedFruit) {
    missFruit(missedFruit);
    return;
  }

  state.particles.forEach((particle) => {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 120 * dt;
    particle.life -= dt;
  });
  state.particles = state.particles.filter((particle) => particle.life > 0);
  state.slashes.forEach((slash) => {
    slash.life -= dt;
  });
  state.slashes = state.slashes.filter((slash) => slash.life > 0);

  if (state.autoDemo && now % 1800 < 20) {
    resolveChord(state.currentChord);
  }
}

function renderGame() {
  const { width, height } = getGameSize();
  ctx.clearRect(0, 0, width, height);
  drawGrid(width, height);
  state.fruits.forEach(drawFruit);
  drawSlashes();
  drawParticles();
  if (state.status === "paused") {
    ctx.save();
    ctx.fillStyle = "rgba(251,247,239,0.62)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#4b4844";
    ctx.font = "900 54px Inter, Arial";
    ctx.textAlign = "center";
    ctx.fillText("Paused", width / 2, height / 2);
    ctx.restore();
  }
}

function drawParticles() {
  ctx.save();
  state.particles.forEach((particle) => {
    ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawSlashes() {
  ctx.save();
  state.slashes.forEach((slash) => {
    const alpha = Math.max(0, slash.life / slash.maxLife);
    ctx.globalAlpha = alpha;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const grad = ctx.createLinearGradient(slash.x1, slash.y1, slash.x2, slash.y2);
    grad.addColorStop(0, "rgba(255, 255, 255, 0)");
    grad.addColorStop(0.28, "rgba(180, 225, 255, 0.95)");
    grad.addColorStop(0.52, "rgba(255, 255, 255, 1)");
    grad.addColorStop(0.78, "rgba(125, 195, 255, 0.95)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.shadowColor = "rgba(160, 210, 255, 0.95)";
    ctx.shadowBlur = 34;
    ctx.strokeStyle = grad;
    ctx.lineWidth = slash.width;
    ctx.beginPath();
    ctx.moveTo(slash.x1, slash.y1);
    ctx.quadraticCurveTo(slash.cx, slash.cy, slash.x2, slash.y2);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
    ctx.lineWidth = Math.max(3, slash.width * 0.35);
    ctx.beginPath();
    ctx.moveTo(slash.x1, slash.y1);
    ctx.quadraticCurveTo(slash.cx, slash.cy, slash.x2, slash.y2);
    ctx.stroke();
  });
  ctx.restore();
}

function loop(now) {
  const dt = Math.min(0.033, (now - state.lastTime) / 1000 || 0);
  state.lastTime = now;
  updateGame(dt, now);
  renderGame();
  drawWave(now);
  updateHud();
  requestAnimationFrame(loop);
}

function drawWave(now) {
  const width = waveCanvas.width;
  const height = waveCanvas.height;
  waveCtx.clearRect(0, 0, width, height);
  waveCtx.fillStyle = "#fffdf8";
  waveCtx.fillRect(0, 0, width, height);
  waveCtx.strokeStyle = "#aab79e";
  waveCtx.lineWidth = 4;
  waveCtx.beginPath();
  const activity = state.status === "playing" ? 1 : 0.35;
  for (let x = 22; x < width - 22; x += 5) {
    const t = x * 0.026 + now * 0.005;
    const envelope = Math.sin((x / width) * Math.PI);
    const amp = (Math.sin(t) * 18 + Math.sin(t * 2.1) * 9 + Math.sin(t * 3.7) * 5) * envelope * activity;
    const y = height / 2 + amp;
    if (x === 22) waveCtx.moveTo(x, y);
    else waveCtx.lineTo(x, y);
  }
  waveCtx.stroke();
}

function resolveChord(chord) {
  if (state.status !== "playing") return;
  const fruitIndex = state.fruits.findIndex((fruit) => fruit.chord.id === chord.id);
  const required = state.currentChord;
  const requiredHits = required.keys.filter((key) => chord.keys.includes(key)).length;
  const extraKeys = chord.keys.filter((key) => !required.keys.includes(key)).length;
  const match = Math.max(0, Math.min(100, Math.round((requiredHits / required.keys.length - extraKeys * 0.12) * 100)));
  detectedChord.textContent = chord.label;
  matchValue.textContent = `${match}%`;
  playChordSound(chord, fruitIndex >= 0 && match >= 80 ? "hit" : "input");

  if (fruitIndex >= 0 && match >= 80) {
    hitFruit(fruitIndex, match);
  } else {
    state.combo = 0;
    listenState.textContent = "wrong chord";
    flashKeys(chord.keys, "miss");
    ledHighlightChord(state.currentChord, state.currentLedColor);
    beep(150, 0.08, "sawtooth", 0.03);
  }

  updateHud();
}

function hitFruit(index, match) {
  const [fruit] = state.fruits.splice(index, 1);
  state.score += match >= 95 ? 15 : 10;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  if (match >= 95) state.perfect += 1;
  if (state.combo > 0 && state.combo % 5 === 0) state.score += 20;
  listenState.textContent = match >= 95 ? "perfect slice!" : "hit!";
  spawnSlash(fruit);
  sliceParticles(fruit);
  flashKeys(fruit.chord.keys, "hit");
  gamePanel.classList.remove("combo");
  window.setTimeout(() => gamePanel.classList.add("combo"), 0);
  beep(match >= 95 ? 740 : 520, 0.08, "triangle", 0.05);
  showNextTarget();
}

function spawnSlash(fruit) {
  const angle = randomBetween(-0.72, -0.34);
  const length = fruit.size * 2.1;
  const dx = Math.cos(angle) * length;
  const dy = Math.sin(angle) * length;
  state.slashes.push({
    x1: fruit.x - dx * 0.5,
    y1: fruit.y - dy * 0.5,
    x2: fruit.x + dx * 0.5,
    y2: fruit.y + dy * 0.5,
    cx: fruit.x + randomBetween(-30, 30),
    cy: fruit.y + randomBetween(-40, 40),
    width: randomBetween(18, 28),
    life: 0.42,
    maxLife: 0.42
  });
}

function missFruit(fruit) {
  state.lives -= 1;
  state.combo = 0;
  state.missed += 1;
  listenState.textContent = "missed fruit";
  flashKeys(fruit.chord.keys, "miss");
  beep(120, 0.12, "square", 0.035);
  showNextTarget();
  updateHud();
  if (state.lives <= 0) endGame();
}

function sliceParticles(fruit) {
  const palette = {
    watermelon: ["#f05f67", "#65b95f", "#ffffff"],
    pineapple: ["#e4a947", "#6ab05f", "#ffd267"],
    apple: ["#ef6f67", "#ffffff", "#6aa35d"],
    banana: ["#ffd267", "#d6982e", "#ffffff"],
    orange: ["#f6a94d", "#ffd5a6", "#ffffff"]
  }[fruit.type];
  for (let i = 0; i < 34; i += 1) {
    state.particles.push({
      x: fruit.x + randomBetween(-20, 20),
      y: fruit.y + randomBetween(-20, 20),
      vx: randomBetween(-170, 170),
      vy: randomBetween(-220, 60),
      size: randomBetween(3, 8),
      color: palette[Math.floor(Math.random() * palette.length)],
      life: randomBetween(0.45, 0.9),
      maxLife: 0.9
    });
  }
}

function updateHud() {
  scoreValue.textContent = state.score;
  livesValue.textContent = "♥ ".repeat(Math.max(0, state.lives)) + "♡ ".repeat(Math.max(0, 3 - state.lives));
  const seconds = Math.ceil(state.timeLeft);
  timerValue.textContent = `0:${String(seconds).padStart(2, "0")}`;
}

function renderKeyboard() {
  const now = performance.now();
  document.querySelectorAll(".key").forEach((key) => {
    const id = Number(key.dataset.key);
    const [r, g, b] = ledState[id] || [0, 0, 0];
    key.style.setProperty("--led-rgb", `${r}, ${g}, ${b}`);
    key.classList.toggle("led-on", r + g + b > 0);
    key.classList.toggle("target", state.currentChord.keys.includes(id));
    key.classList.toggle("pressed", state.pressedKeys.has(id));
    key.classList.toggle("hit", (state.hitEffectKeys.get(id) || 0) > now);
    key.classList.toggle("miss", (state.missEffectKeys.get(id) || 0) > now);
  });
  requestAnimationFrame(renderKeyboard);
}

function flashKeys(keys, type) {
  const until = performance.now() + 420;
  const map = type === "hit" ? state.hitEffectKeys : state.missEffectKeys;
  keys.forEach((key) => map.set(key, until));
}

function startGame(autoDemo = false) {
  if (!autoDemo && !state.partyKeysReady) {
    setDeviceStatus("Connect PartyKeys first", false, true);
    return;
  }
  state.score = 0;
  state.lives = 3;
  state.combo = 0;
  state.bestCombo = 0;
  state.perfect = 0;
  state.missed = 0;
  state.fruits = [];
  state.particles = [];
  state.slashes = [];
  state.timeLeft = 45;
  state.status = "playing";
  state.autoDemo = autoDemo;
  state.lastSpawn = 0;
  startOverlay.classList.add("hidden");
  endOverlay.classList.add("hidden");
  listenState.textContent = autoDemo ? "auto demo" : "listening...";
  showNextTarget();
  startBackgroundMusic();
  updateHud();
}

function endGame() {
  state.status = "ended";
  state.autoDemo = false;
  stopBackgroundMusic();
  ledCancelAndAllOff();
  endTitle.textContent = state.score >= 100 ? "Great slicing" : "Nice run";
  endStats.textContent = `Score ${state.score} · Combo ${state.bestCombo} · Perfect ${state.perfect} · Missed ${state.missed}`;
  endOverlay.classList.remove("hidden");
}

function pauseGame() {
  if (state.status === "playing") {
    state.status = "paused";
    stopBackgroundMusic();
    document.querySelector("#pauseButton").textContent = "▶";
  } else if (state.status === "paused") {
    state.status = "playing";
    startBackgroundMusic();
    document.querySelector("#pauseButton").textContent = "Ⅱ";
  }
}

function beep(frequency, duration, type, volume) {
  if (state.muted) return;
  playTone(frequency, duration, type, volume);
}

async function connectPartyKeys() {
  setDeviceStatus("Looking for PartyKeys...");
  state.partyKeysReady = false;
  if (!navigator.requestMIDIAccess) {
    setDeviceStatus("Web MIDI not supported", false, true);
    return;
  }
  try {
    midiAccess = await navigator.requestMIDIAccess({ sysex: true });
    setupMidiPorts(midiAccess);
    midiAccess.onstatechange = () => setupMidiPorts(midiAccess);
  } catch {
    setDeviceStatus("MIDI access denied", false, true);
  }
}

function setupMidiPorts(access) {
  midiOut = null;
  midiIn = null;
  for (const port of access.outputs.values()) {
    if (port.name.toLowerCase().includes("partykeys") || !midiOut) midiOut = port;
  }
  for (const port of access.inputs.values()) {
    if (port.name.toLowerCase().includes("partykeys") || !midiIn) midiIn = port;
  }

  if (midiOut) {
    state.partyKeysReady = true;
    setDeviceStatus(midiIn ? "PartyKeys ready" : "Lights ready · no input", true);
    ledEnterMode();
    window.setTimeout(() => {
      if (state.status === "playing") ledHighlightChord(state.currentChord, state.currentLedColor);
      else ledCancelAndAllOff();
    }, 80);
  } else {
    state.partyKeysReady = false;
    setDeviceStatus("No PartyKeys output", false, true);
  }

  if (midiIn) {
    midiIn.onmidimessage = onMidiMessage;
  }
}

function onMidiMessage(event) {
  const [status, note, velocity] = event.data;
  const type = status & 0xf0;
  const keyIndex = note - 48;

  if (type === 0x90 && velocity > 0) {
    heldNotes.add(note);
    if (keyIndex >= 0 && keyIndex < 36) state.pressedKeys.add(keyIndex);
    const chord = detectChordFromHeldNotes();
    if (chord) resolveChord(chord);
  } else if (type === 0x80 || (type === 0x90 && velocity === 0)) {
    heldNotes.delete(note);
    if (keyIndex >= 0 && keyIndex < 36) state.pressedKeys.delete(keyIndex);
  }
}

function detectChordFromHeldNotes() {
  if (state.status !== "playing") return null;
  const targetNotesForChord = state.currentChord.keys.map((keyIndex) => 48 + keyIndex);
  return targetNotesForChord.every((note) => heldNotes.has(note)) ? state.currentChord : null;
}

document.querySelector("#startButton").addEventListener("click", () => startGame(false));
document.querySelector("#demoButton").addEventListener("click", () => startGame(true));
document.querySelector("#restartButton").addEventListener("click", () => startGame(false));
document.querySelector("#pauseButton").addEventListener("click", pauseGame);
document.querySelector("#muteButton").addEventListener("click", () => {
  state.muted = !state.muted;
  document.querySelector("#muteButton").textContent = state.muted ? "×" : "♪";
  if (state.muted) stopBackgroundMusic();
  else startBackgroundMusic();
});
connectButton.addEventListener("click", connectPartyKeys);

window.addEventListener("keydown", (event) => {
  const chord = shortcutToChord.get(event.key);
  if (!chord) return;
  event.preventDefault();
  state.pressedKeys = new Set(chord.keys);
  resolveChord(chord);
});

window.addEventListener("keyup", (event) => {
  if (shortcutToChord.has(event.key)) state.pressedKeys.clear();
});

window.addEventListener("resize", resizeCanvas);

createKeyboard();
resizeCanvas();
updateHud();
nextChord();
renderKeyboard();
requestAnimationFrame(loop);

const MELODIES = [
  { name: "Twinkle Twinkle", notes: ["C4","C4","G4","G4","A4","A4","G4","F4","F4","E4","E4","D4","D4","C4","C4"] },
  { name: "Frere Jacques", notes: ["C4","D4","E4","C4","C4","D4","E4","C4","E4","F4","G4","E4","F4","G4","C4"] },
  { name: "Ode to Joy", notes: ["E4","E4","F4","G4","G4","F4","E4","D4","C4","C4","D4","E4","E4","D4","D4"] },
  { name: "Mary Had a Little Lamb", notes: ["E4","D4","C4","D4","E4","E4","E4","D4","D4","D4","E4","G4","G4","E4","D4"] },
  { name: "Jingle Bells", notes: ["E4","E4","E4","E4","E4","E4","E4","G4","C4","D4","E4","F4","F4","F4","F4"] },
  { name: "Happy Birthday", notes: ["C4","C4","D4","C4","F4","E4","C4","C4","D4","C4","G4","F4","C4","C4","C5"] },
];

const SCENES = [
  {
    id: "school",
    enabled: true,
    name: "Hallway Dash",
    chaser: "Principal",
    runner: "Student",
    finish: "Exit Doors",
    story: "A student raided the snack drawer during class!",
    combo4: "Turbo Mode!",
    combo8: "Full Sprint!",
    background: "./assets/school/background.png?v=20260714-3",
    labels: { chaser: "Principal", runner: "Snack Sneaker" },
    result: {
      winTitle: "Caught!",
      winCopy: "The principal catches the snack sneaker, and chips scatter everywhere!",
      winClass: "school-win",
      loseTitle: "They Got Away!",
      loseCopy: "The student hops on a bike and coasts out while the principal catches their breath!",
      loseClass: "school-lose",
    },
  },
  { id: "kitchen", enabled: true, name: "Kitchen Caper", chaser: "Chef Cat", runner: "Mouse", finish: "Mouse Hole", story: "The mouse snatched the last slice of cheese!", combo4: "Chef Cat Locks In!", combo8: "Mouse Patrol!", background: "./assets/kitchen/background.png?v=20260714-3", labels: { chaser: "Chef Cat", runner: "Cheese Bandit" }, result: { winTitle: "Gotcha!", winCopy: "Chef Cat blocks the mouse hole, and the cheese bandit waves a tiny white flag.", winClass: "kitchen-win", loseTitle: "Down the Hole!", loseCopy: "The mouse dives into the hole with only a tail peeking out.", loseClass: "kitchen-lose" } },
  { id: "restaurant", enabled: false, name: "Burger Stand Run", chaser: "Cook", runner: "Customer", finish: "Front Door", story: "A customer grabbed the last burger!", combo4: "Griddle Power!", combo8: "Kitchen Hero!", result: { winTitle: "Burger Launch!", winCopy: "The burger pops into the air as the customer spins in place.", winClass: "restaurant-win", loseTitle: "Out the Door!", loseCopy: "The customer escapes with the burger.", loseClass: "restaurant-lose" } },
  { id: "grandma", enabled: false, name: "Grandma vs. Playground Menace", chaser: "Grandma", runner: "Playground Menace", finish: "Slide", story: "The kid kicked the ball into the flower bed again!", combo4: "Slipper Locked!", combo8: "Slipper Power!", result: { winTitle: "Not the Slipper!", winCopy: "The kid ducks while the soccer ball rolls away.", winClass: "grandma-win", loseTitle: "Slide Escape!", loseCopy: "The kid takes the slide and gets away.", loseClass: "grandma-lose" } },
  { id: "park", enabled: false, name: "Park Patrol", chaser: "Park Ranger", runner: "Husky", finish: "Fence Gap", story: "The husky dismantled the park bench again!", combo4: "Whistle Boost!", combo8: "Scooter Sprint!", result: { winTitle: "Wrapped Up!", winCopy: "The ranger scoops up the husky, who looks completely innocent.", winClass: "park-win", loseTitle: "Through the Gap!", loseCopy: "The husky slips through the fence gap and escapes.", loseClass: "park-lose" } },
];

const DIFFICULTIES = {
  easy: { label: "EASY", level: 1, escapeSpeed: 420 },
  normal: { label: "NORMAL", level: 2, escapeSpeed: 560 },
  hard: { label: "HARD", level: 3, escapeSpeed: 760 },
  extreme: { label: "EXTREME", level: 4, escapeSpeed: 1100 },
};
const ESCAPE_SPEED_SCALE = 0.0032;
const RUNNER_TRACK_START = 45;
const RUNNER_TRACK_FINISH = 86;
const SCENE_SPRITE_SHEETS = {
  school: {
    chaser: {
      url: "./assets/school/chaser-sheet.png?v=20260623-6",
      columns: 4,
      rows: 3,
      frames: { idle: [0, 1], run: [2, 3], combo_4: [4, 5], combo_8: [6, 7], win: [8], lose: [9], miss: [0] },
    },
    runner: {
      url: "./assets/school/runner-sheet.png?v=20260623-6",
      columns: 4,
      rows: 2,
      frames: { idle: [0, 1], run: [2, 3], walk: [0, 1], panic: [4, 5], caught: [6], escape: [7] },
    },
  },
  kitchen: {
    chaser: {
      url: "./assets/kitchen/chaser-sheet.png?v=20260623-6",
      columns: 4,
      rows: 3,
      frames: { idle: [0, 1], run: [2, 3], combo_4: [4, 5], combo_8: [6, 7], win: [8], lose: [9], miss: [9] },
    },
    runner: {
      url: "./assets/kitchen/runner-sheet.png?v=20260623-6",
      columns: 4,
      rows: 3,
      frames: { idle: [0, 1], run: [2, 3], walk: [0, 1], panic: [4, 5], escape: [8], caught: [9] },
    },
  },
};

const MIDI_NAMES = ["C","C♯","D","D♯","E","F","F♯","G","G♯","A","A♯","B"];
const KEYBOARD_NOTES = { a:"C4", w:"C#4", s:"D4", e:"D#4", d:"E4", f:"F4", t:"F#4", g:"G4", y:"G#4", h:"A4", u:"A#4", j:"B4", k:"C5" };
const PARTYKEYS_HEADER = [0xF0, 0x05, 0x30, 0x7F, 0x7F, 0x20, 0x00];
const LED_COLORS = {
  current: [255, 190, 0],
  correct: [0, 255, 72],
  wrong: [255, 20, 24],
  off: [0, 0, 0],
};
const audioState = {
  context: null,
  master: null,
  musicGain: null,
  sfxGain: null,
  musicTimer: null,
  musicStep: 0,
};
const state = {
  screen: "menu",
  phase: "preview",
  difficulty: "normal",
  selectedSceneId: "kitchen",
  scene: SCENES.find((scene) => scene.id === "kitchen") || SCENES[0],
  melody: MELODIES[0],
  noteIndex: 0,
  combo: 0,
  maxCombo: 0,
  score: 0,
  chaserPosition: 7,
  runnerPosition: 45,
  runnerFrame: null,
  lastFrameTime: 0,
  midiAccess: null,
  midiConnected: false,
  midiOutputs: [],
  partyKeysOutputs: [],
  genericOutputs: [],
  sysexEnabled: false,
  litMidiNote: null,
  ledRevision: 0,
  chaserActionRevision: 0,
  spriteFrameTimers: new Map(),
  inputLocked: false,
};

const $ = (id) => document.getElementById(id);
const menuScreen = $("menu-screen");
const gameScreen = $("game-screen");
const noteTrack = $("note-track");
const chaser = $("chaser");
const runner = $("runner");
const judgement = $("judgement");
const comboBurst = $("combo-burst");
const chaseStage = $("chase-stage");
const spriteCharacters = [
  { element: chaser, type: "chaser" },
  { element: runner, type: "runner" },
];

function ensureAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioState.context) {
    const context = new AudioContextClass();
    const master = context.createGain();
    const musicGain = context.createGain();
    const sfxGain = context.createGain();
    const compressor = context.createDynamicsCompressor();

    master.gain.value = 0.78;
    musicGain.gain.value = 0.18;
    sfxGain.gain.value = 0.50;

    musicGain.connect(master);
    sfxGain.connect(master);
    master.connect(compressor);
    compressor.connect(context.destination);

    audioState.context = context;
    audioState.master = master;
    audioState.musicGain = musicGain;
    audioState.sfxGain = sfxGain;
  }
  if (audioState.context.state === "suspended") audioState.context.resume();
  return audioState.context;
}

function noteFrequency(note) {
  const midiNumber = noteToMidiNumber(note);
  if (midiNumber === null) return 261.63;
  return 440 * 2 ** ((midiNumber - 69) / 12);
}

function playTone(frequency, start, duration, destination, options = {}) {
  const context = audioState.context;
  if (!context || !destination) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  oscillator.type = options.type || "triangle";
  oscillator.frequency.setValueAtTime(frequency, start);
  if (options.slideTo) oscillator.frequency.exponentialRampToValueAtTime(options.slideTo, start + duration);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(options.filter || 2800, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(options.gain || 0.16, start + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.025);
}

function playInputSound(note, correct) {
  const context = ensureAudio();
  if (!context) return;
  const now = context.currentTime;
  const root = noteFrequency(note);
  if (correct) {
    [1, 1.25, 1.5].forEach((ratio, index) => {
      playTone(root * ratio, now + index * 0.012, 0.28, audioState.sfxGain, {
        gain: 0.12 - index * 0.018,
        filter: 3600,
        type: index === 0 ? "triangle" : "sine",
      });
    });
    playTone(root / 2, now, 0.18, audioState.sfxGain, { gain: 0.08, filter: 900, type: "sine" });
  } else {
    playTone(root, now, 0.14, audioState.sfxGain, { gain: 0.10, filter: 1800, type: "sawtooth", slideTo: root * 0.86 });
    playTone(root * 1.06, now, 0.12, audioState.sfxGain, { gain: 0.055, filter: 1300, type: "square" });
  }
}

function playMissSound() {
  const context = ensureAudio();
  if (!context) return;
  const now = context.currentTime;
  playTone(174.61, now, 0.12, audioState.sfxGain, { gain: 0.08, filter: 900, type: "sawtooth", slideTo: 116.54 });
}

function scheduleMusicStep() {
  const context = audioState.context;
  if (!context || !audioState.musicGain) return;
  const now = context.currentTime + 0.035;
  const step = audioState.musicStep % 16;
  const bassPattern = [130.81, null, 196.00, null, 174.61, null, 196.00, null, 146.83, null, 220.00, null, 196.00, null, 174.61, null];
  const leadPattern = [523.25, 587.33, 659.25, null, 783.99, null, 659.25, 587.33, 523.25, null, 659.25, 698.46, 783.99, null, 698.46, 659.25];
  const bass = bassPattern[step];
  const lead = leadPattern[step];

  if (bass) playTone(bass, now, 0.16, audioState.musicGain, { gain: step % 4 === 0 ? 0.16 : 0.10, filter: 700, type: "sine" });
  if (lead && step % 2 === 0) playTone(lead, now + 0.015, 0.10, audioState.musicGain, { gain: 0.045, filter: 2400, type: "triangle" });
  if (step % 4 === 2) playTone(880, now, 0.045, audioState.musicGain, { gain: 0.035, filter: 5200, type: "square", slideTo: 1320 });

  audioState.musicStep += 1;
}

function startBackgroundMusic() {
  const context = ensureAudio();
  if (!context || audioState.musicTimer) return;
  audioState.musicStep = 0;
  scheduleMusicStep();
  audioState.musicTimer = setInterval(scheduleMusicStep, 185);
}

function stopBackgroundMusic() {
  if (audioState.musicTimer) {
    clearInterval(audioState.musicTimer);
    audioState.musicTimer = null;
  }
}

function getActiveSpriteSheets() {
  return SCENE_SPRITE_SHEETS[state.scene.id] || SCENE_SPRITE_SHEETS.school;
}

async function loadSpriteSheets() {
  const sceneId = state.scene.id;
  const sheets = getActiveSpriteSheets();
  await Promise.all(spriteCharacters.map(async ({ element, type }) => {
    const config = sheets[type];
    const image = new Image();
    try {
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = config.url;
      });
      const processedUrl = await processSpriteSheet(image, config);
      if (state.scene.id !== sceneId) return;
      config.processedUrl = processedUrl;
      element.classList.add("sprite-ready");
      document.documentElement.classList.add(`sprite-${type}-ready`);
      element.style.setProperty("--sprite-url", `url("${processedUrl}")`);
      element.style.setProperty("--sprite-columns", config.columns);
      element.style.setProperty("--sprite-rows", config.rows);
      setCharacterSpriteFrame(element, type, element.dataset.action || "idle", true);
    } catch {
      element.classList.remove("sprite-ready");
      document.documentElement.classList.remove(`sprite-${type}-ready`);
    }
  }));
}

function processSpriteSheet(image, config) {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return Promise.reject(new Error("Canvas unavailable"));
  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  const cellWidth = Math.floor(canvas.width / config.columns);
  const cellHeight = Math.floor(canvas.height / config.rows);

  for (let row = 0; row < config.rows; row += 1) {
    for (let column = 0; column < config.columns; column += 1) {
      removeConnectedSpriteBackground(
        pixels,
        canvas.width,
        canvas.height,
        column * cellWidth,
        row * cellHeight,
        column === config.columns - 1 ? canvas.width : (column + 1) * cellWidth,
        row === config.rows - 1 ? canvas.height : (row + 1) * cellHeight,
      );
    }
  }

  context.putImageData(imageData, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Sprite processing failed"));
        return;
      }
      resolve(URL.createObjectURL(blob));
    }, "image/png");
  });
}

function removeConnectedSpriteBackground(pixels, width, height, left, top, right, bottom) {
  const cellWidth = right - left;
  const cellHeight = bottom - top;
  const visited = new Uint8Array(cellWidth * cellHeight);
  const queueX = [];
  const queueY = [];
  let head = 0;

  const isBackground = (x, y) => {
    const index = (y * width + x) * 4;
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const alpha = pixels[index + 3];
    const nearGreen = green > 220 && red < 55 && blue < 55;
    const nearWhite = red > 232 && green > 232 && blue > 232;
    return alpha < 12 || nearGreen || nearWhite;
  };

  const enqueue = (x, y) => {
    if (x < left || x >= right || y < top || y >= bottom) return;
    const localIndex = (y - top) * cellWidth + (x - left);
    if (visited[localIndex] || !isBackground(x, y)) return;
    visited[localIndex] = 1;
    queueX.push(x);
    queueY.push(y);
  };

  for (let x = left; x < right; x += 1) {
    enqueue(x, top);
    enqueue(x, bottom - 1);
  }
  for (let y = top; y < bottom; y += 1) {
    enqueue(left, y);
    enqueue(right - 1, y);
  }

  while (head < queueX.length) {
    const x = queueX[head];
    const y = queueY[head];
    head += 1;
    const pixelIndex = (y * width + x) * 4;
    pixels[pixelIndex + 3] = 0;
    enqueue(x - 1, y);
    enqueue(x + 1, y);
    enqueue(x, y - 1);
    enqueue(x, y + 1);
  }
}

function chooseRound() {
  const enabledScenes = SCENES.filter((scene) => scene.enabled);
  state.scene = enabledScenes.find((scene) => scene.id === state.selectedSceneId) || enabledScenes[0];
  state.melody = MELODIES[Math.floor(Math.random() * MELODIES.length)];
}

function openGame() {
  startBackgroundMusic();
  chooseRound();
  state.screen = "game";
  menuScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  resetRound();
  updateRoundText();
}

function resetRound() {
  cancelAnimationFrame(state.runnerFrame);
  allMidiLightsOff();
  state.phase = "preview";
  state.noteIndex = 0;
  state.combo = 0;
  state.maxCombo = 0;
  state.score = 0;
  state.chaserPosition = 7;
  state.runnerPosition = RUNNER_TRACK_START;
  state.lastFrameTime = 0;
  state.inputLocked = false;
  setCharacterAction(chaser, "idle");
  setCharacterAction(runner, "idle");
  chaseStage.className = "chase-stage combo-normal";
  $("final-chase-alert").classList.remove("show");
  $("ready-button").classList.remove("hidden");
  $("playing-help").classList.add("hidden");
  $("result-overlay").classList.add("hidden");
  updateCharacterPositions();
  updateCombo();
  renderNotes();
}

function updateRoundText() {
  const diff = DIFFICULTIES[state.difficulty];
  $("scene-name").textContent = state.scene.name;
  $("melody-name").textContent = state.melody.name;
  $("game-difficulty").textContent = `${diff.label} · LEVEL ${diff.level}`;
  $("countdown-scene").textContent = state.scene.name;
  $("countdown-versus").innerHTML = `${state.scene.chaser} <em>VS</em> ${state.scene.runner}`;
  $("countdown-story").textContent = state.scene.story;
  $("chaser-label").textContent = state.scene.labels.chaser;
  $("runner-label").textContent = state.scene.labels.runner;
  chaser.setAttribute("aria-label", state.scene.chaser);
  runner.setAttribute("aria-label", state.scene.runner);
  chaseStage.classList.remove("scene-school", "scene-kitchen");
  chaseStage.classList.add(`scene-${state.scene.id}`);
  chaseStage.style.setProperty("--scene-background", `url("${state.scene.background}")`);
  loadSpriteSheets();
}

function renderNotes() {
  noteTrack.innerHTML = "";
  state.melody.notes.forEach((note, index) => {
    const item = document.createElement("span");
    item.className = "note";
    if (index < state.noteIndex) {
      item.classList.add("done");
      item.textContent = `✓${note}`;
    } else if (index === state.noteIndex && state.phase !== "result") {
      item.classList.add("current");
      item.textContent = `[${note}]`;
    } else {
      item.textContent = note;
    }
    noteTrack.appendChild(item);
  });
  $("progress-label").textContent = `${state.noteIndex} / ${state.melody.notes.length}`;
}

async function runCountdown() {
  if (state.phase !== "preview") return;
  state.phase = "countdown";
  $("ready-button").classList.add("hidden");
  const overlay = $("countdown-overlay");
  const number = $("countdown-number");
  overlay.classList.remove("hidden");
  for (const text of ["3", "2", "1", "GO!"]) {
    number.textContent = text;
    number.style.animation = "none";
    void number.offsetWidth;
    number.style.animation = "";
    await wait(text === "GO!" ? 650 : 720);
  }
  overlay.classList.add("hidden");
  startChase();
}

function startChase() {
  state.phase = "playing";
  const isFinalChase = DIFFICULTIES[state.difficulty].level === 4;
  chaseStage.classList.toggle("final-chase", isFinalChase);
  updateRunnerJourneyAction();
  if (isFinalChase) {
    const alert = $("final-chase-alert");
    alert.classList.remove("show");
    void alert.offsetWidth;
    alert.classList.add("show");
  }
  $("playing-help").classList.remove("hidden");
  $("input-help").textContent = state.midiConnected ? "MIDI ready · play the yellow note" : "A S D F G H J K · play the yellow note";
  if (state.partyKeysOutputs.length) {
    preparePartyKeysLights(true);
  }
  if (state.genericOutputs.length) {
    syncCurrentMidiLight();
  }
  state.lastFrameTime = performance.now();
  state.runnerFrame = requestAnimationFrame(updateRunner);
}

function updateRunner(timestamp) {
  if (state.phase !== "playing") return;
  const dt = Math.min((timestamp - state.lastFrameTime) / 1000, 0.05);
  state.lastFrameTime = timestamp;
  const escapeSpeed = DIFFICULTIES[state.difficulty].escapeSpeed;
  state.runnerPosition += escapeSpeed * ESCAPE_SPEED_SCALE * dt;
  updateRunnerJourneyAction();
  updateCharacterPositions();
  if (state.runnerPosition >= RUNNER_TRACK_FINISH) {
    finishGame(false);
    return;
  }
  if (state.chaserPosition + 8.2 >= state.runnerPosition) {
    finishGame(true);
    return;
  }
  state.runnerFrame = requestAnimationFrame(updateRunner);
}

function updateRunnerJourneyAction() {
  if (state.phase !== "playing") return;
  const progress = Math.max(
    0,
    Math.min(1, (state.runnerPosition - RUNNER_TRACK_START) / (RUNNER_TRACK_FINISH - RUNNER_TRACK_START)),
  );
  const nextAction = progress < 1 / 3 ? "walk" : progress < 2 / 3 ? "run" : "panic";
  if (runner.dataset.action !== nextAction) setCharacterAction(runner, nextAction);
}

function handleNote(note) {
  if (state.phase !== "playing" || state.inputLocked) return;
  const expected = state.melody.notes[state.noteIndex];
  if (!expected) return;
  if (normalizeNote(note) === normalizeNote(expected)) {
    playInputSound(expected, true);
    state.inputLocked = true;
    flashMidiLight(expected, "correct", 90, () => {
      state.noteIndex += 1;
      state.combo += 1;
      state.maxCombo = Math.max(state.maxCombo, state.combo);
      state.score += 100 + Math.min(state.combo, 15) * 10;
      showJudgement("Perfect", true);
      sprintChaser();
      renderNotes();
      updateCombo();
      state.inputLocked = false;
      if (state.noteIndex < state.melody.notes.length) {
        syncCurrentMidiLight();
      }
      if (state.noteIndex >= state.melody.notes.length) {
        allMidiLightsOff();
        // A clean 15-note run always earns a dramatic final lunge.
        state.chaserPosition = Math.max(state.chaserPosition, state.runnerPosition - 7.8);
        updateCharacterPositions();
        setTimeout(() => {
          if (state.phase === "playing") finishGame(true);
        }, 380);
      }
    });
  } else {
    playInputSound(note, false);
    state.combo = 0;
    showJudgement("Miss", false);
    playMiss();
    updateCombo();
    flashMidiLight(expected, "wrong", 120, syncCurrentMidiLight);
  }
}

function sprintChaser() {
  const boost = state.combo >= 8 ? 3.25 : state.combo >= 4 ? 2.60 : 2.05;
  const action = state.combo >= 8 ? "combo_8" : state.combo >= 4 ? "combo_4" : "run";
  const revision = ++state.chaserActionRevision;
  state.chaserPosition = Math.min(state.chaserPosition + boost, 84);
  setCharacterAction(chaser, action, true);
  updateCharacterPositions();
  // In normal mode the chaser lunges once; Combo 4/8 keeps the powered chase pose until a miss resets it.
  if (action !== "run") return;
  setTimeout(() => {
    if (state.phase === "playing" && revision === state.chaserActionRevision) {
      setCharacterAction(chaser, "idle");
    }
  }, 310);
}

function playMiss() {
  playMissSound();
  const revision = ++state.chaserActionRevision;
  setCharacterAction(chaser, "miss", true);
  setTimeout(() => {
    if (state.phase === "playing" && revision === state.chaserActionRevision) {
      setCharacterAction(chaser, "idle");
    }
  }, 300);
}

function setCharacterAction(character, action, restart = false) {
  [...character.classList]
    .filter((className) => className.startsWith("action-"))
    .forEach((className) => character.classList.remove(className));
  character.dataset.action = action;
  if (restart) void character.offsetWidth;
  character.classList.add(`action-${action}`);
  const type = character === chaser ? "chaser" : "runner";
  setCharacterSpriteFrame(character, type, action, restart);
}

function setCharacterSpriteFrame(character, type, action, restart = false) {
  const config = getActiveSpriteSheets()[type];
  const frames = config.frames[action] || config.frames.idle;
  const previousTimer = state.spriteFrameTimers.get(character);
  if (previousTimer) clearInterval(previousTimer);
  state.spriteFrameTimers.delete(character);
  setSpriteFrame(character, config, frames[0]);
  if (frames.length < 2) return;
  let frameIndex = restart ? 0 : Number(character.dataset.spriteCycleIndex || 0);
  character.dataset.spriteCycleIndex = frameIndex;
  const interval = action === "panic" ? 105 : action === "run" ? 130 : action.startsWith("combo_") ? 145 : 360;
  const timer = setInterval(() => {
    frameIndex = (frameIndex + 1) % frames.length;
    character.dataset.spriteCycleIndex = frameIndex;
    setSpriteFrame(character, config, frames[frameIndex]);
  }, interval);
  state.spriteFrameTimers.set(character, timer);
}

function setSpriteFrame(character, config, frame) {
  const column = frame % config.columns;
  const row = Math.floor(frame / config.columns);
  const x = config.columns === 1 ? 0 : (column / (config.columns - 1)) * 100;
  const y = config.rows === 1 ? 0 : (row / (config.rows - 1)) * 100;
  character.style.setProperty("--sprite-x", `${x}%`);
  character.style.setProperty("--sprite-y", `${y}%`);
}

function updateCombo() {
  $("combo-value").textContent = state.combo;
  $("header-combo-value").textContent = state.combo;
  $("score-value").textContent = state.score;
  let mode = "Normal";
  let stageClass = "combo-normal";
  if (state.combo >= 8) {
    mode = "Full Sprint";
    stageClass = "combo-rage";
  } else if (state.combo >= 4) {
    mode = "Turbo";
    stageClass = "combo-hot";
  }
  chaseStage.classList.remove("combo-normal", "combo-hot", "combo-rage");
  chaseStage.classList.add(stageClass);
  $("combo-state").textContent = mode;
  if (state.combo === 4) showComboBurst(state.scene.combo4);
  if (state.combo === 8) showComboBurst(state.scene.combo8);
}

function showJudgement(text, correct) {
  judgement.textContent = text;
  judgement.classList.remove("show", "miss-word");
  if (!correct) judgement.classList.add("miss-word");
  void judgement.offsetWidth;
  judgement.classList.add("show");
}

function showComboBurst(text) {
  comboBurst.textContent = text;
  comboBurst.classList.remove("show");
  void comboBurst.offsetWidth;
  comboBurst.classList.add("show");
}

function updateCharacterPositions() {
  chaser.style.setProperty("--x", `${state.chaserPosition}%`);
  runner.style.setProperty("--x", `${state.runnerPosition}%`);
}

function finishGame(won) {
  if (state.phase === "result") return;
  state.phase = "result";
  cancelAnimationFrame(state.runnerFrame);
  allMidiLightsOff();
  state.inputLocked = true;
  state.chaserActionRevision += 1;
  setCharacterAction(chaser, won ? "win" : "lose");
  setCharacterAction(runner, won ? "caught" : "escape");
  const card = $("result-card");
  const result = state.scene.result;
  card.classList.toggle("loss", !won);
  $("result-visual").className = `result-visual ${won ? result.winClass : result.loseClass}`;
  const activeSheets = getActiveSpriteSheets();
  setResultSpriteFrame($("result-chaser"), activeSheets.chaser, won ? "win" : "lose");
  setResultSpriteFrame($("result-runner"), activeSheets.runner, won ? "caught" : "escape");
  $("result-kicker").textContent = won ? "Caught" : "Escaped";
  $("result-title").textContent = won ? result.winTitle : result.loseTitle;
  $("result-copy").textContent = won
    ? `${result.winCopy} Best combo: ${state.maxCombo}.`
    : `${result.loseCopy} Stay steady and do not miss a yellow note.`;
  setTimeout(() => $("result-overlay").classList.remove("hidden"), 360);
}

function setResultSpriteFrame(element, config, action) {
  const frame = config.frames[action][0];
  const column = frame % config.columns;
  const row = Math.floor(frame / config.columns);
  element.style.setProperty("--result-sprite-url", `url("${config.processedUrl || config.url}")`);
  element.style.setProperty("--result-sprite-columns", config.columns);
  element.style.setProperty("--result-sprite-rows", config.rows);
  element.style.setProperty("--result-sprite-x", `${config.columns === 1 ? 0 : (column / (config.columns - 1)) * 100}%`);
  element.style.setProperty("--result-sprite-y", `${config.rows === 1 ? 0 : (row / (config.rows - 1)) * 100}%`);
}

function showSceneSelection() {
  const options = $("scene-options");
  options.innerHTML = "";
  SCENES.filter((scene) => scene.enabled).forEach((scene) => {
    const button = document.createElement("button");
    button.className = `difficulty-option${scene.id === state.selectedSceneId ? " selected" : ""}`;
    button.innerHTML = `${scene.name}<span>${scene.chaser} VS ${scene.runner}</span>`;
    button.addEventListener("click", () => {
      state.selectedSceneId = scene.id;
      $("scene-label").textContent = scene.name;
      $("scene-modal").classList.add("hidden");
    });
    options.appendChild(button);
  });
  $("scene-modal").classList.remove("hidden");
}

function normalizeNote(note) {
  return note.replace("♯", "#");
}

function midiNumberToNote(number) {
  const octave = Math.floor(number / 12) - 1;
  return `${MIDI_NAMES[number % 12]}${octave}`;
}

function noteToMidiNumber(note) {
  const match = normalizeNote(note).match(/^([A-G])(#?)(-?\d+)$/);
  if (!match) return null;
  const semitones = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
  return (Number(match[3]) + 1) * 12 + semitones[match[1]] + (match[2] ? 1 : 0);
}

function encodePartyKeysColor(value) {
  return [Math.floor(value / 128), value % 128];
}

function enterPartyKeysLedMode(output) {
  if (!state.sysexEnabled || output.state !== "connected") return;
  output.send([...PARTYKEYS_HEADER, 0x0F, 0x01, 0xF7]);
}

function sendPartyKeysAllOff(output) {
  if (!state.sysexEnabled || output.state !== "connected") return;
  output.send([
    ...PARTYKEYS_HEADER,
    0x15,
    0x01,
    ...encodePartyKeysColor(0),
    ...encodePartyKeysColor(0),
    ...encodePartyKeysColor(0),
    36,
    ...Array.from({ length: 36 }, (_, index) => index),
    0xF7,
  ]);
}

function preparePartyKeysLights(shouldSyncCurrent = false) {
  state.partyKeysOutputs.forEach(enterPartyKeysLedMode);
  setTimeout(() => {
    state.partyKeysOutputs.forEach(sendPartyKeysAllOff);
    state.litMidiNote = null;
    if (shouldSyncCurrent && state.phase === "playing") syncCurrentMidiLight();
  }, 50);
}

function sendPartyKeysColor(output, midiNote, rgb) {
  if (!state.sysexEnabled || midiNote < 48 || midiNote > 83 || output.state !== "connected") return;
  const keyIndex = midiNote - 48;
  output.send([
    ...PARTYKEYS_HEADER,
    0x15,
    0x01,
    ...encodePartyKeysColor(rgb[0]),
    ...encodePartyKeysColor(rgb[1]),
    ...encodePartyKeysColor(rgb[2]),
    0x01,
    keyIndex,
    0xF7,
  ]);
}

function setMidiLight(note, colorName = "current") {
  const midiNote = noteToMidiNumber(note);
  if (midiNote === null) return;
  const previous = state.litMidiNote;
  const rgb = LED_COLORS[colorName] || LED_COLORS.current;

  state.partyKeysOutputs.forEach((output) => {
    if (previous !== null && previous !== midiNote) sendPartyKeysColor(output, previous, LED_COLORS.off);
    sendPartyKeysColor(output, midiNote, rgb);
  });

  state.genericOutputs.forEach((output) => {
    if (output.state !== "connected") return;
    if (previous !== null && previous !== midiNote) output.send([0x80, previous, 0]);
    const velocity = colorName === "correct" ? 127 : colorName === "wrong" ? 32 : 96;
    output.send([0x90, midiNote, velocity]);
  });
  state.litMidiNote = midiNote;
}

function syncCurrentMidiLight() {
  if (state.phase !== "playing") return;
  const note = state.melody.notes[state.noteIndex];
  if (note) setMidiLight(note, "current");
}

function flashMidiLight(note, colorName, duration, afterFlash) {
  const revision = ++state.ledRevision;
  setMidiLight(note, colorName);
  setTimeout(() => {
    if (revision !== state.ledRevision || state.phase !== "playing") return;
    afterFlash?.();
  }, duration);
}

function allMidiLightsOff() {
  state.ledRevision += 1;
  const previous = state.litMidiNote;
  state.partyKeysOutputs.forEach(sendPartyKeysAllOff);
  state.genericOutputs.forEach((output) => {
    if (output.state !== "connected") return;
    if (previous !== null) output.send([0x80, previous, 0]);
  });
  state.litMidiNote = null;
}

async function connectMidi() {
  if (!navigator.requestMIDIAccess) {
    toast("This browser does not support Web MIDI. Please use Chrome or Edge.");
    return;
  }
  try {
    try {
      state.midiAccess = await navigator.requestMIDIAccess({ sysex: true });
      state.sysexEnabled = true;
    } catch {
      state.midiAccess = await navigator.requestMIDIAccess();
      state.sysexEnabled = false;
    }
    bindMidiInputs();
    state.midiAccess.onstatechange = bindMidiInputs;
    const inputs = [...state.midiAccess.inputs.values()];
    state.midiConnected = inputs.length > 0;
    updateMidiStatus(inputs);
    if (state.partyKeysOutputs.length && !state.sysexEnabled) {
      toast("MIDI connected. Allow SysEx permission to enable keyboard lights.");
    } else {
      toast(state.midiConnected ? "MIDI Connected！" : "Permission granted. Plug in a MIDI keyboard.");
    }
  } catch {
    toast("MIDI permission was not granted.");
  }
}

function bindMidiInputs() {
  if (!state.midiAccess) return;
  const inputs = [...state.midiAccess.inputs.values()];
  const outputs = [...state.midiAccess.outputs.values()];
  inputs.forEach((input) => {
    input.onmidimessage = (event) => {
      const [status, note, velocity] = event.data;
      if ((status & 0xf0) === 0x90 && velocity > 0) handleNote(midiNumberToNote(note));
    };
  });
  state.midiOutputs = outputs.filter((output) => output.state === "connected");
  const hasPartyKeysInput = inputs.some((input) => /party[\s_-]*keys?/i.test(input.name || ""));
  state.partyKeysOutputs = state.midiOutputs.filter((output) => /party[\s_-]*keys?/i.test(output.name || ""));
  if (hasPartyKeysInput && state.partyKeysOutputs.length === 0 && state.midiOutputs.length === 1) {
    state.partyKeysOutputs = [...state.midiOutputs];
  }
  state.genericOutputs = state.midiOutputs.filter((output) => !/party[\s_-]*keys?/i.test(output.name || ""));
  state.genericOutputs = state.genericOutputs.filter((output) => !state.partyKeysOutputs.includes(output));
  state.midiConnected = inputs.some((input) => input.state === "connected");
  updateMidiStatus(inputs);
  if (state.phase === "playing") {
    preparePartyKeysLights(true);
    if (state.genericOutputs.length) syncCurrentMidiLight();
  } else {
    allMidiLightsOff();
    preparePartyKeysLights(false);
  }
}

function updateMidiStatus(inputs = []) {
  const status = $("midi-status");
  if (state.midiConnected) {
    const partyKeys = inputs.some((input) => /party[\s_-]*keys?/i.test(input.name || ""));
    status.textContent = partyKeys ? "PartyKeys Connected" : "MIDI Connected";
    status.classList.remove("muted");
    status.classList.add("connected");
  } else {
    status.textContent = "Offline";
    status.classList.add("muted");
    status.classList.remove("connected");
  }
}

function showDifficulty() {
  const options = $("difficulty-options");
  options.innerHTML = "";
  Object.entries(DIFFICULTIES).forEach(([key, diff]) => {
    const button = document.createElement("button");
    button.className = `difficulty-option${key === state.difficulty ? " selected" : ""}`;
    button.innerHTML = `${diff.label}<span>Level ${diff.level} · speed ${diff.escapeSpeed}</span>`;
    button.addEventListener("click", () => {
      state.difficulty = key;
      $("difficulty-label").textContent = diff.label;
      $("difficulty-modal").classList.add("hidden");
    });
    options.appendChild(button);
  });
  $("difficulty-modal").classList.remove("hidden");
}

function returnToMenu() {
  cancelAnimationFrame(state.runnerFrame);
  stopBackgroundMusic();
  allMidiLightsOff();
  state.screen = "menu";
  state.phase = "preview";
  gameScreen.classList.add("hidden");
  menuScreen.classList.remove("hidden");
  $("result-overlay").classList.add("hidden");
  $("countdown-overlay").classList.add("hidden");
}

let toastTimer;
function toast(message) {
  const element = $("toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("show"), 2200);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

$("start-button").addEventListener("click", openGame);
$("difficulty-button").addEventListener("click", showDifficulty);
$("scene-button").addEventListener("click", showSceneSelection);
$("close-scene").addEventListener("click", () => $("scene-modal").classList.add("hidden"));
$("scene-modal").addEventListener("click", (event) => {
  if (event.target === $("scene-modal")) $("scene-modal").classList.add("hidden");
});
$("close-difficulty").addEventListener("click", () => $("difficulty-modal").classList.add("hidden"));
$("difficulty-modal").addEventListener("click", (event) => {
  if (event.target === $("difficulty-modal")) $("difficulty-modal").classList.add("hidden");
});
$("midi-button").addEventListener("click", connectMidi);
$("ready-button").addEventListener("click", runCountdown);
$("back-button").addEventListener("click", returnToMenu);
$("menu-button").addEventListener("click", returnToMenu);
$("retry-button").addEventListener("click", () => {
  chooseRound();
  resetRound();
  updateRoundText();
});

window.addEventListener("keydown", (event) => {
  if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
  const note = KEYBOARD_NOTES[event.key.toLowerCase()];
  if (note) {
    event.preventDefault();
    handleNote(note);
  }
});

window.addEventListener("beforeunload", allMidiLightsOff);
window.addEventListener("error", () => {
  toast("Game script error. Try a hard refresh with Command + Shift + R.");
});
loadSpriteSheets();

window.__CHASE_GAME__ = {
  state,
  handleNote,
  start: openGame,
  countdown: runCountdown,
  finish: finishGame,
};

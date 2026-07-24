let audioCtx = null;
let masterGain = null;
let musicSource = null;
let currentMusic = null;
let isMusicPlaying = false;

const NOTE_FREQS = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77
};

const AudioSystem = {
  init() {
    if (audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.3;
      masterGain.connect(audioCtx.destination);
    } catch (e) {
      console.warn('Audio not available');
    }
  },

  resume() {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  },

  playNote(freq, duration = 0.3, gain = 0.2, type = 'sine', delay = 0) {
    if (!audioCtx || !masterGain) return;
    try {
      const osc = audioCtx.createOscillator();
      const noteGain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      noteGain.gain.value = gain;
      noteGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
      osc.connect(noteGain);
      noteGain.connect(masterGain);
      osc.start(audioCtx.currentTime + delay);
      osc.stop(audioCtx.currentTime + delay + duration + 0.05);
    } catch (e) {}
  },

  playMelody(notes, bpm = 120, type = 'sine') {
    const noteDuration = 60 / bpm;
    notes.forEach((note, i) => {
      if (note === 0) return;
      this.playNote(note, noteDuration * 0.9, 0.15, type, i * noteDuration);
    });
  },

  playSfx(name) {
    if (!audioCtx) return;
    switch (name) {
      case 'hit':
        this.playNote(150, 0.1, 0.2, 'sawtooth');
        this.playNote(100, 0.1, 0.15, 'square', 0.05);
        break;
      case 'spell':
        this.playNote(600, 0.15, 0.15, 'sine');
        this.playNote(800, 0.2, 0.12, 'sine', 0.1);
        this.playNote(1000, 0.15, 0.1, 'sine', 0.2);
        break;
      case 'heal':
        this.playNote(500, 0.2, 0.15, 'sine');
        this.playNote(700, 0.25, 0.12, 'sine', 0.15);
        this.playNote(900, 0.3, 0.1, 'sine', 0.3);
        break;
      case 'coin':
        this.playNote(800, 0.08, 0.12, 'sine');
        this.playNote(1200, 0.08, 0.1, 'sine', 0.06);
        break;
      case 'levelup':
        this.playNote(400, 0.15, 0.15, 'sine');
        this.playNote(500, 0.15, 0.12, 'sine', 0.15);
        this.playNote(600, 0.15, 0.1, 'sine', 0.3);
        this.playNote(800, 0.3, 0.15, 'sine', 0.45);
        break;
      case 'error':
        this.playNote(200, 0.15, 0.15, 'square');
        this.playNote(150, 0.2, 0.12, 'square', 0.12);
        break;
      case 'step':
        this.playNote(rand(60, 80), 0.05, 0.05, 'sine');
        break;
      case 'chest':
        this.playNote(400, 0.1, 0.12, 'sine');
        this.playNote(600, 0.12, 0.1, 'sine', 0.1);
        this.playNote(800, 0.15, 0.08, 'sine', 0.22);
        break;
      case 'boss':
        this.playNote(100, 0.3, 0.3, 'sawtooth');
        this.playNote(80, 0.4, 0.25, 'sawtooth', 0.3);
        break;
      default:
        break;
    }
  },

  playMusic(themeName) {
    if (currentMusic === themeName) return;
    currentMusic = themeName;
  },

  stopMusic() {
    currentMusic = null;
  },

  setVolume(v) {
    if (masterGain) masterGain.gain.value = clamp(v, 0, 1);
  }
};
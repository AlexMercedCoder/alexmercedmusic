const QUALITY_INTERVALS = {
  '': [0, 4, 7],
  m: [0, 3, 7],
  '7': [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  maj7: [0, 4, 7, 11],
  'm7 flat 5': [0, 3, 6, 10],
  slash: [0, 4, 7],
};

const INSTRUMENTS = {
  synth: { program: 80, waves: [['sawtooth', 0, 1]], attack: 0.015, decay: 0.18, sustain: 0.55, release: 0.35, cutoff: 1800 },
  keys: { program: 4, waves: [['sine', 0, 1], ['triangle', 1200, 0.22]], attack: 0.008, decay: 0.55, sustain: 0.28, release: 0.65, cutoff: 4200 },
  organ: { program: 16, waves: [['sine', 0, 1], ['sine', 1200, 0.34], ['sine', 1902, 0.16]], attack: 0.03, decay: 0.08, sustain: 0.84, release: 0.3, cutoff: 5200 },
  pad: { program: 89, waves: [['sawtooth', -8, 0.5], ['sawtooth', 8, 0.5]], attack: 0.48, decay: 0.4, sustain: 0.62, release: 1.2, cutoff: 1250 },
  pluck: { program: 24, waves: [['triangle', 0, 1], ['sine', 1200, 0.18]], attack: 0.004, decay: 0.42, sustain: 0.07, release: 0.3, cutoff: 3000 },
};

const invert = (notes, count) => {
  const result = [...notes];
  for (let index = 0; index < count; index += 1) result.push(result.shift() + 12);
  return result;
};

const voiceDistance = (notes, previous) => {
  if (!previous?.length) return notes.reduce((score, note) => score + Math.abs(note - 64), 0);
  return notes.reduce((score, note) => score + Math.min(...previous.map((prior) => Math.abs(note - prior))), 0);
};

const voiceChord = (baseNotes, voicing, previous) => {
  if (voicing === 'first') return invert(baseNotes, 1);
  if (voicing === 'second') return invert(baseNotes, Math.min(2, baseNotes.length - 1));
  if (voicing !== 'voice-led') return baseNotes;
  const candidates = [];
  for (let inversion = 0; inversion < baseNotes.length; inversion += 1) {
    for (const shift of [-24, -12, 0, 12]) candidates.push(invert(baseNotes, inversion).map((note) => note + shift));
  }
  return candidates.sort((a, b) => {
    const rangePenalty = (notes) => notes.reduce((score, note) => score + (note < 45 || note > 84 ? 20 : 0), 0);
    return voiceDistance(a, previous) + rangePenalty(a) - voiceDistance(b, previous) - rangePenalty(b);
  })[0];
};

export const makeProgressionPlan = ({ tonicMidi, specs, voicing = 'voice-led' }) => {
  let previous;
  return specs.map(([rootOffset, quality = '', bassOffset]) => {
    const intervals = QUALITY_INTERVALS[quality] ?? QUALITY_INTERVALS[''];
    const chordRoot = tonicMidi + rootOffset;
    const upperNotes = voiceChord(intervals.map((interval) => chordRoot + interval), voicing, previous);
    previous = upperNotes;
    const bass = Number.isFinite(bassOffset) ? tonicMidi + bassOffset - 12 : null;
    return bass === null ? upperNotes : [bass, ...upperNotes.filter((note) => note !== bass)];
  });
};

const scheduleVoice = (context, destination, midi, start, duration, instrument, chordSize, pan) => {
  const profile = INSTRUMENTS[instrument] ?? INSTRUMENTS.keys;
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(profile.cutoff, start);
  if (typeof context.createStereoPanner === 'function') {
    const panner = context.createStereoPanner();
    panner.pan.setValueAtTime(pan, start);
    filter.connect(panner).connect(destination);
  } else filter.connect(destination);
  const frequency = 440 * (2 ** ((midi - 69) / 12));
  const releaseStart = start + Math.max(profile.attack + profile.decay, duration - profile.release);
  profile.waves.forEach(([type, cents, relativeLevel]) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const peak = (0.34 * relativeLevel) / Math.sqrt(chordSize * profile.waves.length);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.detune.setValueAtTime(cents, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(peak, start + profile.attack);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * profile.sustain), start + profile.attack + profile.decay);
    gain.gain.setValueAtTime(Math.max(0.0001, peak * profile.sustain), releaseStart);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(filter);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  });
};

export const renderProgression = async ({ plan, bpm = 100, beatsPerChord = 4, repeats = 2, instrument = 'keys', sampleRate = 44100 }) => {
  const OfflineContext = globalThis.OfflineAudioContext ?? globalThis.webkitOfflineAudioContext;
  if (!OfflineContext) throw new Error('Offline audio rendering is not supported in this browser.');
  const chordSeconds = (60 / bpm) * beatsPerChord;
  const releaseTail = instrument === 'pad' ? 1.4 : 0.8;
  const duration = (plan.length * repeats * chordSeconds) + releaseTail;
  if (duration > 120) throw new Error('This render is longer than two minutes. Raise the tempo or reduce beats and repeats.');
  const context = new OfflineContext(2, Math.ceil(duration * sampleRate), sampleRate);
  const master = context.createGain();
  const compressor = context.createDynamicsCompressor();
  master.gain.value = 0.72;
  compressor.threshold.value = -14;
  compressor.knee.value = 18;
  compressor.ratio.value = 5;
  master.connect(compressor).connect(context.destination);
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    plan.forEach((notes, chordIndex) => {
      const start = ((repeat * plan.length) + chordIndex) * chordSeconds;
      notes.forEach((midi, noteIndex) => {
        const pan = notes.length === 1 ? 0 : ((noteIndex / (notes.length - 1)) * 0.44) - 0.22;
        scheduleVoice(context, master, midi, start, chordSeconds + releaseTail, instrument, notes.length, pan);
      });
    });
  }
  return context.startRendering();
};

export const encodeWavFromChannels = (channels, sampleRate = 44100) => {
  const channelCount = Math.min(2, channels.length);
  const frameCount = channels[0]?.length ?? 0;
  const bytesPerSample = 2;
  const dataLength = frameCount * channelCount * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);
  const text = (offset, value) => [...value].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
  text(0, 'RIFF'); view.setUint32(4, 36 + dataLength, true); text(8, 'WAVE'); text(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * channelCount * bytesPerSample, true);
  view.setUint16(32, channelCount * bytesPerSample, true); view.setUint16(34, 16, true); text(36, 'data'); view.setUint32(40, dataLength, true);
  let offset = 44;
  for (let frame = 0; frame < frameCount; frame += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channels[channel][frame]));
      view.setInt16(offset, sample < 0 ? sample * 32768 : sample * 32767, true);
      offset += 2;
    }
  }
  return new Uint8Array(buffer);
};

export const encodeWav = (audioBuffer) => encodeWavFromChannels(
  Array.from({ length: audioBuffer.numberOfChannels }, (_, index) => audioBuffer.getChannelData(index)),
  audioBuffer.sampleRate,
);

const variableLength = (value) => {
  const bytes = [value & 0x7f];
  for (let remaining = value >> 7; remaining; remaining >>= 7) bytes.unshift((remaining & 0x7f) | 0x80);
  return bytes;
};

const uint32 = (value) => [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
const uint16 = (value) => [(value >>> 8) & 255, value & 255];

export const encodeMidi = ({ plan, bpm = 100, beatsPerChord = 4, repeats = 2, instrument = 'keys' }) => {
  const ticksPerBeat = 480;
  const chordTicks = Math.round(ticksPerBeat * beatsPerChord);
  const microseconds = Math.round(60000000 / bpm);
  const track = [0, 0xff, 0x51, 3, (microseconds >>> 16) & 255, (microseconds >>> 8) & 255, microseconds & 255];
  track.push(0, 0xc0, (INSTRUMENTS[instrument] ?? INSTRUMENTS.keys).program);
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    plan.forEach((notes) => {
      notes.forEach((note) => track.push(0, 0x90, Math.max(0, Math.min(127, note)), 78));
      notes.forEach((note, index) => track.push(...variableLength(index === 0 ? chordTicks : 0), 0x80, Math.max(0, Math.min(127, note)), 0));
    });
  }
  track.push(0, 0xff, 0x2f, 0);
  return new Uint8Array([
    ...[77, 84, 104, 100], ...uint32(6), ...uint16(0), ...uint16(1), ...uint16(ticksPerBeat),
    ...[77, 84, 114, 107], ...uint32(track.length), ...track,
  ]);
};

export const instrumentNames = Object.keys(INSTRUMENTS);

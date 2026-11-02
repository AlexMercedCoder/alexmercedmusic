// Shared helpers for the Melody and Drum Sample Makers. Synthesis, scheduling
// and offline rendering use the vendored Tone.js build; file encoding is plain
// JavaScript so the validator can test it in Node without a browser.
import { encodeWavFromChannels } from './theory-audio.js';

export { encodeWavFromChannels };
export const TONE_SRC = '/scripts/vendor/tone-15.1.22.js';
export const SAMPLE_RATE = 44100;
export const PPQ = 480;

let tonePromise;
let boundContext;

// Tone creates a context of its own when its script loads, so the page creates
// and resumes the real AudioContext inside the click handler, then hands it to
// Tone here. That keeps Safari and iOS happy about the user-gesture rule.
export const loadTone = (audioContext) => {
  tonePromise ??= window.Tone ? Promise.resolve(window.Tone) : new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TONE_SRC;
    script.async = true;
    script.onload = () => (window.Tone ? resolve(window.Tone) : reject(new Error('Tone.js did not initialise.')));
    script.onerror = () => { tonePromise = undefined; reject(new Error('Could not load the audio engine.')); };
    document.head.append(script);
  });
  return tonePromise.then((Tone) => {
    if (audioContext && boundContext !== audioContext) {
      Tone.setContext(audioContext, !boundContext);
      boundContext = audioContext;
    }
    return Tone;
  });
};

export const frameCount = (seconds, sampleRate = SAMPLE_RATE) => Math.round(seconds * sampleRate);

// Length of a loop in seconds: bars of beatsPerBar quarter notes at bpm.
export const loopSeconds = ({ bpm, bars, beatsPerBar = 4, repeats = 1 }) => (bars * beatsPerBar * repeats * 60) / bpm;

// Trim a rendered buffer to an exact loop length. "wrap" folds the release tail
// back onto the start so the file loops without a click, "cut" drops it and
// "keep" leaves the tail on the end of the file.
export const shapeTail = (channels, frames, mode = 'wrap') => channels.map((source) => {
  if (mode === 'keep') return Float32Array.from(source);
  const out = new Float32Array(frames);
  out.set(source.subarray(0, Math.min(frames, source.length)));
  if (mode === 'wrap') for (let index = frames; index < source.length; index += 1) out[(index - frames) % frames] += source[index];
  return out;
});

export const measureLevels = (channels) => {
  let peak = 0;
  let sum = 0;
  let count = 0;
  for (const channel of channels) {
    for (let index = 0; index < channel.length; index += 1) {
      const value = Math.abs(channel[index]);
      if (value > peak) peak = value;
      sum += value * value;
    }
    count += channel.length;
  }
  return { peak, rms: count ? Math.sqrt(sum / count) : 0 };
};

export const toDbfs = (value) => (value > 0 ? 20 * Math.log10(value) : -Infinity);

// Render with Tone.Offline, then return channel data trimmed to the loop length.
export const renderOffline = async (Tone, schedule, { seconds, tail = 1, mode = 'wrap', sampleRate = SAMPLE_RATE }) => {
  const rendered = await Tone.Offline((context) => schedule(context), seconds + tail, 2, sampleRate);
  const buffer = rendered.get();
  const raw = Array.from({ length: buffer.numberOfChannels }, (_, index) => buffer.getChannelData(index));
  const channels = shapeTail(raw, frameCount(seconds, sampleRate), mode);
  return { channels, sampleRate, levels: measureLevels(channels) };
};

const variableLength = (value) => {
  const bytes = [value & 0x7f];
  for (let remaining = value >>> 7; remaining; remaining >>>= 7) bytes.unshift((remaining & 0x7f) | 0x80);
  return bytes;
};
const uint32 = (value) => [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
const ascii = (value) => [...value].map((character) => character.charCodeAt(0) & 0x7f);

// Standard MIDI File, format 0, one channel. Notes are { pitch, start, duration,
// velocity } with start and duration in ticks at the given PPQ.
export const encodeMidi = ({ notes, bpm = 120, beatsPerBar = 4, ppq = PPQ, name = 'Melody', program = 81 }) => {
  const microseconds = Math.round(60000000 / bpm);
  const title = ascii(name).slice(0, 64);
  const track = [
    0, 0xff, 0x03, title.length, ...title,
    0, 0xff, 0x51, 3, (microseconds >>> 16) & 255, (microseconds >>> 8) & 255, microseconds & 255,
    0, 0xff, 0x58, 4, beatsPerBar, 2, 24, 8,
    0, 0xc0, program & 0x7f,
  ];
  const events = [];
  for (const note of notes) {
    const pitch = Math.max(0, Math.min(127, Math.round(note.pitch)));
    const velocity = Math.max(1, Math.min(127, Math.round((note.velocity ?? 0.8) * 127)));
    const start = Math.max(0, Math.round(note.start));
    const end = start + Math.max(1, Math.round(note.duration));
    events.push({ tick: start, order: 1, bytes: [0x90, pitch, velocity] }, { tick: end, order: 0, bytes: [0x80, pitch, 0] });
  }
  events.sort((a, b) => a.tick - b.tick || a.order - b.order);
  let previous = 0;
  for (const event of events) {
    track.push(...variableLength(event.tick - previous), ...event.bytes);
    previous = event.tick;
  }
  track.push(0, 0xff, 0x2f, 0);
  return new Uint8Array([...ascii('MThd'), ...uint32(6), 0, 0, 0, 1, (ppq >>> 8) & 255, ppq & 255, ...ascii('MTrk'), ...uint32(track.length), ...track]);
};

// Small reader used to check exports: tempo, meter and paired notes.
export const parseMidi = (input) => {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const text = (offset) => String.fromCharCode(...bytes.slice(offset, offset + 4));
  const u32 = (offset) => ((bytes[offset] << 24) >>> 0) + (bytes[offset + 1] << 16) + (bytes[offset + 2] << 8) + bytes[offset + 3];
  if (text(0) !== 'MThd') throw new Error('Missing MThd header.');
  const format = (bytes[8] << 8) | bytes[9];
  const trackCount = (bytes[10] << 8) | bytes[11];
  const ppq = (bytes[12] << 8) | bytes[13];
  const result = { format, trackCount, ppq, bpm: undefined, timeSignature: undefined, notes: [] };
  let offset = 8 + u32(4);
  for (let trackIndex = 0; trackIndex < trackCount; trackIndex += 1) {
    if (text(offset) !== 'MTrk') throw new Error(`Track ${trackIndex} is missing its MTrk header.`);
    const end = offset + 8 + u32(offset + 4);
    let position = offset + 8;
    let tick = 0;
    let status = 0;
    const open = new Map();
    const readLength = () => {
      let value = 0;
      let byte;
      do { byte = bytes[position]; position += 1; value = (value << 7) | (byte & 0x7f); } while (byte & 0x80);
      return value;
    };
    while (position < end) {
      tick += readLength();
      if (bytes[position] & 0x80) { status = bytes[position]; position += 1; }
      if (status === 0xff) {
        const type = bytes[position]; position += 1;
        const length = readLength();
        const data = bytes.slice(position, position + length);
        position += length;
        if (type === 0x51) result.bpm = 60000000 / ((data[0] << 16) | (data[1] << 8) | data[2]);
        if (type === 0x58) result.timeSignature = `${data[0]}/${2 ** data[1]}`;
        if (type === 0x2f) break;
        continue;
      }
      if (status === 0xf0 || status === 0xf7) { position += readLength(); continue; }
      const kind = status & 0xf0;
      const first = bytes[position];
      const second = kind === 0xc0 || kind === 0xd0 ? undefined : bytes[position + 1];
      position += second === undefined ? 1 : 2;
      if (kind === 0x90 && second > 0) {
        if (!open.has(first)) open.set(first, []);
        open.get(first).push({ tick, velocity: second });
      } else if (kind === 0x80 || (kind === 0x90 && second === 0)) {
        const started = open.get(first)?.shift();
        if (started) result.notes.push({ pitch: first, start: started.tick, duration: tick - started.tick, velocity: started.velocity });
      }
    }
    offset = end;
  }
  result.notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  return result;
};

export const downloadBytes = (bytes, fileName, type) => {
  const url = URL.createObjectURL(new Blob([bytes], { type }));
  const link = Object.assign(document.createElement('a'), { href: url, download: fileName });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
};

// Shared descriptions for the browser sample-maker tools. Pages, navigation
// listings, llms.txt and the WebMCP registry all read from here.
export const sampleMakers = {
  melody: {
    title: 'Melody Sample Maker',
    path: '/melody-sample-maker/',
    pageUrl: 'https://alexmercedmusic.com/melody-sample-maker/',
    description: 'Design a three-oscillator synth voice, compose up to 160 bars in a canvas piano roll and export the melody as a WAV rendered through your sound or as a MIDI file.',
    summary: 'A 3xOsc-style synth with a scrollable, zoomable piano roll. Exports a WAV of the designed sound and a Standard MIDI File of the notes.',
    voice: ['Three oscillators: sine, triangle, saw or square', 'Per-oscillator level, coarse tune in semitones, fine tune in cents and octave offset', 'Shared ADSR amplitude envelope', '24 dB/octave low-pass filter with cutoff and resonance'],
    composition: ['Up to 160 bars', '40 to 240 BPM', '3/4, 4/4, 5/4 or 7/4', 'Snap from one bar down to 1/32 notes, including triplets', 'Place, move, resize and delete notes with a mouse, touch or keyboard', 'Save melodies to a library in this browser, load them later and back the library up as a JSON file'],
    exports: [['WAV', '44.1 kHz, 16-bit stereo, rendered offline through the designed voice'], ['MIDI', 'Standard MIDI File with notes, tempo and time signature only']],
  },
  drum: {
    title: 'Drum Sample Maker',
    path: '/drum-sample-maker/',
    pageUrl: 'https://alexmercedmusic.com/drum-sample-maker/',
    description: 'Program a 1- to 4-bar, 16-step-per-bar pattern for a synthesized kick, snare, hi-hat and tom, then render the loop up to ten times as one license-free WAV file.',
    summary: 'A synthesized four-piece kit with a step sequencer of 1 to 4 bars. Exports the loop repeated one to ten times as a WAV.',
    voice: ['Kick: pitched sine with tune, decay and pitch-envelope punch', 'Snare: white noise over a tuned tone with tune, decay and snappy balance', 'Hi-hat: high-passed noise with tone and decay', 'Tom: pitched sine with tune and decay', 'Level for every instrument'],
    composition: ['1 to 4 bars of 16 steps in 4/4', '40 to 240 BPM', 'Every step cycles off, on and accent', 'Pattern presets for four on the floor, backbeat, breakbeat and half-time', 'Save loops to a library in this browser, load them later and back the library up as a JSON file'],
    exports: [['WAV', '44.1 kHz, 16-bit stereo, the loop repeated 1 to 10 times']],
  },
};

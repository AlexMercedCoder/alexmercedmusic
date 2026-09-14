export const sunoPromptingGuide = {
  title: 'Suno Prompting Field Guide',
  edition: 'September 2026',
  scope: 'Suno v6 family and current creation tools',
  pageUrl: 'https://alexmercedmusic.com/suno-prompting-guide/',
  pdfUrl: 'https://alexmercedmusic.com/guides/suno-prompting-field-guide.pdf',
  description: 'A practical guide to writing Suno prompts with clear musical direction for genre, rhythm, instruments, vocals, arrangement and production.',
  evidenceNote: 'Suno documents product controls and a general musical glossary. Descriptive musical terms shape probability rather than guarantee a result.',
  formula: 'GENRE + ERA + TEMPO/GROOVE + INSTRUMENTS + VOCAL + ARRANGEMENT + PRODUCTION + ENDING',
  example: 'Avant-prog and art pop, 104 BPM with alternating 7/8 and 4/4, angular clean guitar, elastic distorted bass, dry acoustic drums, theatrical baritone shifting into whispered harmonies, sparse verses and an explosive final refrain, close-mic vocals, crisp transients, spectral reverb, hard stop.',
  layers: [
    { name: 'Genre and era', question: 'What musical language should dominate?', examples: 'Art rock, 1970s progressive rock, modern alt-pop' },
    { name: 'Tempo and groove', question: 'How should time feel?', examples: '92 BPM, swung pocket, urgent 7/8 pulse' },
    { name: 'Instrumentation', question: 'Who is playing?', examples: 'Baritone guitar, analog synth, upright bass, brushed drums' },
    { name: 'Voice and delivery', question: 'Who is singing and how?', examples: 'Intimate contralto, theatrical baritone, breathy close-mic vocal' },
    { name: 'Arrangement', question: 'How should energy develop?', examples: 'Sparse verse, rising pre-chorus, explosive final chorus' },
    { name: 'Production', question: 'What should the recording feel like?', examples: 'Dry drums, wide guitars, tape saturation, dark room reverb' },
  ],
  fieldGuidance: [
    { field: 'Style', use: 'Put global musical direction here: genre, era, groove, instruments, voice, arrangement, production and ending.' },
    { field: 'Lyrics', use: 'Put singable text here. Use short lines, blank lines between sections and restrained bracketed cues.' },
    { field: 'Exclude', use: 'Name unwanted instruments or traits here instead of repeating negative instructions in the style prompt.' },
  ],
  controls: [
    { name: 'Weirdness', purpose: 'Moves from conventional choices toward unusual timbres, transitions and forms.', method: 'Start near normal. Raise it after the song identity is stable.' },
    { name: 'Style Influence', purpose: 'Changes how closely the result follows the Style field.', method: 'Raise it when the genre or ensemble keeps drifting.' },
    { name: 'Audio Influence', purpose: 'Changes how closely a generation follows uploaded audio.', method: 'Raise it when the melody, voice or groove must remain recognizable.' },
    { name: 'Cover', purpose: 'Changes style while trying to retain the melody of a song you created.', method: 'Use it for a substantial rearrangement of owned material.' },
    { name: 'Inspire', purpose: 'Draws mood, tempo and instrumentation from a playlist.', method: 'Use a small, coherent group of songs for stronger project identity.' },
    { name: 'Extend', purpose: 'Continues from a chosen point with new lyrics or style.', method: 'Use it to repair an ending or develop a promising section.' },
    { name: 'Replace Section', purpose: 'Regenerates one selected part of a song.', method: 'Use it when the larger song works but one verse or transition does not.' },
    { name: 'Remaster', purpose: 'Refines mix, balance, texture or pronunciation.', method: 'Use it for polish, not for a new composition.' },
  ],
  lyricPrinciples: [
    'Use one lyric phrase per line.',
    'Keep verses in consistent blocks and leave a blank line between sections.',
    'Repeat the chorus text when exact recurrence matters.',
    'Use parentheses for likely backing responses, but expect some variation.',
    'Spell unusual names phonetically when pronunciation matters.',
    'Keep prose production notes out of the lyric body because they may be sung.',
  ],
  lyricExample: `[Intro - instrumental, distant radio voice]

[Verse 1 - restrained]
The sunlight gathers on the wire
A yellow theorem catches fire

[Pre-Chorus - rising harmony]
Count the missing beat
Feel the pattern lean

[Chorus - full band]
Lemon yellow, open the sky
Seven steps forward, four passing by

[Outro - guitar feedback, hard stop]`,
  troubleshooting: [
    { symptom: 'The genre sounds generic', revision: 'Add a subgenre, era, groove and one signature instrument.' },
    { symptom: 'The prompt feels ignored', revision: 'Reduce it to one dominant genre and six essential clauses.' },
    { symptom: 'The singer feels wrong', revision: 'Add range, texture, delivery and microphone distance.' },
    { symptom: 'The chorus has no lift', revision: 'Request a thinner verse, rising pre-chorus and full-band chorus.' },
    { symptom: 'The mix is muddy', revision: 'Use fewer foreground parts and request clear separation with open low mids.' },
    { symptom: 'The lyrics are rushed', revision: 'Shorten lines, add breaks, reduce tempo or split each thought.' },
    { symptom: 'An instruction gets sung', revision: 'Move global direction to Style and keep only concise cues in brackets.' },
    { symptom: 'The ending is abrupt', revision: 'Request a short coda, fade or hard stop. Use Extend if the song needs more room.' },
    { symptom: 'The result is predictable', revision: 'Raise Weirdness or test the experimental model after the core identity works.' },
    { symptom: 'An artist name is blocked', revision: 'Replace the name with genre, era, vocal, arrangement and production traits.' },
  ],
  recipes: [
    {
      name: 'Progressive grunge',
      prompt: 'Progressive alternative rock with raw grunge guitar tone, 96 BPM, mixed 7/8 and 4/4, low-tuned electric guitar, melodic bass, roomy acoustic drums, weathered baritone moving from intimate restraint to cracked full-voice choruses, long developmental bridge, clear instrument separation, warm tape saturation, final unresolved feedback sustain.',
    },
    {
      name: 'Theatrical art rock',
      prompt: 'Theatrical art rock and baroque pop, brisk 6/8, grand piano, electric guitar, chamber strings, timpani, expressive baritone, conversational verses and stacked choir refrains, abrupt scene changes, operatic final climax, 1970s analog warmth, wide stereo arrangement, decisive hard stop.',
    },
    {
      name: 'Math-rock glitch',
      prompt: 'Math rock with glitch electronica, tense 7/8 grouped 2+2+3, interlocking clean guitars, elastic bass, dry live drums, granular synth interruptions, clipped androgynous vocal, stop-start verses, brief instrumental calculations, crisp transients, stutter edits, narrow verses expanding into a wide final chorus.',
    },
    {
      name: 'Noir trip-hop',
      prompt: 'Noir trip-hop, 76 BPM, dusty breakbeat, deep sub-bass, minor-key Rhodes, muted trumpet fragments, intimate smoky contralto, restrained verse melody, cinematic bridge, vinyl crackle, tape echo, dark wide mix, long instrumental fade.',
    },
    {
      name: 'Industrial cabaret',
      prompt: 'Industrial cabaret and theatrical post-punk, 118 BPM march, metallic found percussion, distorted synth bass, detuned upright piano, nasal dramatic baritone with megaphone asides, alternating spoken verses and shouted refrains, abrupt machine stops, narrow-band radio intro, saturated mono ending.',
    },
    {
      name: 'Lo-fi folk memory',
      prompt: 'Intimate indie folk, 82 BPM with loose human timing, fingerpicked steel-string guitar, upright bass, brushed snare, distant pump organ, mature close-mic vocal, narrative strophic verses, small harmony refrain, tape hiss, narrow stereo image, audible room, gentle fade.',
    },
  ],
  checklist: [
    'One dominant genre is obvious.',
    'Tempo or groove is specified when rhythm matters.',
    'Three to five defining instruments have clear roles.',
    'Voice includes range, texture, delivery and ensemble role.',
    'Sections have an energy relationship, not just names.',
    'Production directions are audible and compatible.',
    'The ending has an intentional instruction.',
    'Unwanted defaults are placed in Exclude.',
    'Lyrics use short readable lines and restrained section cues.',
    'Each test changes one variable and generates multiple candidates.',
  ],
} as const;

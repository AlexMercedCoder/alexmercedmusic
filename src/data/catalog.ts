/**
 * The catalogue, as it actually exists on the platforms that host it.
 *
 * Everything here was read off the sources rather than remembered: the two
 * YouTube playlists, both SoundCloud accounts, the ReverbNation profile and the
 * Suno page. Counts and titles are theirs, spelling and all, because a
 * catalogue that quietly tidies its own titles stops matching what you find
 * when you go and listen.
 */

import albumsData from './albums.json';
import electronicTracksData from './electronic-tracks.json';

export type Era = 'acoustic' | 'electronic' | 'ai';

export type TrackLink = {
  source: 'youtube' | 'soundcloud' | 'soundcloud-albums' | 'reverbnation' | 'suno';
  url: string;
  /** Optional human-readable distinction when one source hosts several versions. */
  label?: string;
};

export type Track = {
  title: string;
  /** Runtime as the host reports it. */
  length?: string;
  /** How long ago the host says it was posted, at the time this was gathered. */
  posted?: string;
  /** The best direct listening URL when there is only one. */
  url?: string;
  /** Every verified host for this recording. */
  links?: TrackLink[];
};

// ---------------------------------------------------------------- acoustic

/**
 * The acoustic archive, from the Best of Alex Merced Music playlist.
 *
 * Most of it was uploaded to his YouTube channel, which is where these
 * recordings have lived since the mid-2000s.
 */
export const acousticPlaylist = {
  title: 'Best of Alex Merced Music',
  url: 'https://www.youtube.com/playlist?list=PL0DCC201C0F84EB13',
  description: 'A Playlist of some of the best video bits of Alex Merced and his guitar.',
  totalEntries: 44,
  unavailableEntries: 5,
};

export const youtubeArchiveTracks: Track[] = [
  { title: 'Eadd9 Tuning Improv', length: '4:05', posted: '18 years ago', url: 'https://www.youtube.com/watch?v=LzAFKiI72QA' },
  { title: 'Alex Merced - A Beautiful Dying Radio', length: '3:13', posted: '19 years ago', url: 'https://www.youtube.com/watch?v=ZLdugTA_p1s' },
  { title: 'Alex Merced - Tell my heart', length: '2:10', posted: '17 years ago', url: 'https://www.youtube.com/watch?v=D3TLm0TKvdc' },
  { title: 'These Days Video', length: '1:56', posted: '20 years ago', url: 'https://www.youtube.com/watch?v=yd6KNuNul6I' },
  { title: 'NEW SONG Alex Merced - Try to Forget You', length: '3:28', posted: '18 years ago', url: 'https://www.youtube.com/watch?v=-tH0KxLLK6Q' },
  { title: 'Alex Merced - I will Never Hold Your Hand', length: '2:19', posted: '18 years ago', url: 'https://www.youtube.com/watch?v=_c4Yi1KiE34' },
  { title: 'Alex Merced - Scar and Stitches', length: '4:19', posted: '18 years ago', url: 'https://www.youtube.com/watch?v=qQBKfqdd6Rs' },
  { title: 'Alex Merced - Pain', length: '3:26', posted: '17 years ago', url: 'https://www.youtube.com/watch?v=Ku724TEiUTQ' },
  { title: 'Alex Merced - Heart Break by Truth', length: '2:02', posted: '17 years ago', url: 'https://www.youtube.com/watch?v=_vwCCQ0LRJY' },
  { title: 'Alex Merced - Heart to Give You', length: '2:41', posted: '17 years ago', url: 'https://www.youtube.com/watch?v=m19pUNJ4f2g' },
  { title: "ALex Merced - the one who can't be loved", length: '4:03', posted: '18 years ago', url: 'https://www.youtube.com/watch?v=CVawn1nhhEU' },
  { title: 'Alex Merced - My Heart Stopped', length: '3:08', posted: '17 years ago', url: 'https://www.youtube.com/watch?v=9kiATcFOEp8' },
  { title: 'Alex Merced - Through The Darkness', length: '3:22', posted: '17 years ago', url: 'https://www.youtube.com/watch?v=IqcWdaAdV-c' },
  { title: 'Alex Merced - Sweet Melody of Love', length: '3:14', posted: '12 years ago', url: 'https://www.youtube.com/watch?v=d6dQFSSzc4I' },
  { title: 'Alex Merced - A Fun Glitchy Beat', length: '2:55', posted: '12 years ago', url: 'https://www.youtube.com/watch?v=WeR64DocSHQ' },
  { title: 'Alex Merced - Love is Right in Front of Me', length: '2:26', posted: '12 years ago', url: 'https://www.youtube.com/watch?v=PHNR2A3-OMk' },
  { title: 'Alex Merced - A Song Idea', length: '2:41', posted: '17 years ago', url: 'https://www.youtube.com/watch?v=Q3nSrgmmpQk' },
  { title: 'Alex Merced, Bowl Cap, and A Song # 2', length: '2:09', posted: '16 years ago', url: 'https://www.youtube.com/watch?v=O2YhG1D0h0I' },
  { title: 'Alex Merced, Bowl Cap, and A Song # 1', length: '2:11', posted: '16 years ago', url: 'https://www.youtube.com/watch?v=hO6bmOKYWfI' },
  { title: 'Catchy TUne Played by ALex Merced', length: '2:19', posted: '17 years ago', url: 'https://www.youtube.com/watch?v=BYV_HI7qOoM' },
  { title: 'Alex and Guitar 6', length: '2:30', posted: '17 years ago', url: 'https://www.youtube.com/watch?v=FKx3TvZnAOo' },
  { title: 'Alex and Guitar 1', length: '2:58', posted: '17 years ago', url: 'https://www.youtube.com/watch?v=3m6z9nhhx5I' },
  { title: 'ALex Merced Intro - Adlibbing then I will never hold ...', length: '5:46', posted: '18 years ago', url: 'https://www.youtube.com/watch?v=t0GtNCsb1hE' },
  { title: "Alex Merced - The One Who Can't Be Loved", length: '3:04', posted: '18 years ago', url: 'https://www.youtube.com/watch?v=dL57Uh0L4Zo' },
  { title: 'Alex and Guitar 3', length: '2:03', posted: '17 years ago', url: 'https://www.youtube.com/watch?v=f0AYNS1EQR0' },
  { title: '2-15-14: Alex Merced playing guitar', length: '2:35', posted: '12 years ago', url: 'https://www.youtube.com/watch?v=Y7NDtXnX-TQ' },
  { title: 'ALex Merced - Warm Night Warm Piano', length: '1:56', posted: '12 years ago', url: 'https://www.youtube.com/watch?v=s5QeoIfLJGM' },
  { title: 'Alex Merced - The Best of Me', length: '2:55', posted: '12 years ago', url: 'https://www.youtube.com/watch?v=HlU-JA4Sakg' },
  { title: 'Alex Merced - Orchestrated Closing', length: '2:58', posted: '12 years ago', url: 'https://www.youtube.com/watch?v=7w5-JXNjRnQ' },
  { title: 'Alex Merced   Raining Harmony', length: '2:42', posted: '12 years ago', url: 'https://www.youtube.com/watch?v=YvixvlXS-Tg' },
  { title: 'Alex Merced   Power Ballad of Love and Frustration', length: '3:04', posted: '12 years ago', url: 'https://www.youtube.com/watch?v=aKCVGH4OvnA' },
  { title: 'Alex Merced - Mellow 8Bit Afternoon', length: '2:24', posted: '12 years ago', url: 'https://www.youtube.com/watch?v=hcvEBQFmLz8' },
  { title: 'Alex Merced - Epic Hip Hop Orchestra', length: '2:10', posted: '12 years ago', url: 'https://www.youtube.com/watch?v=MrtRCBW3Nkw' },
  { title: 'Alex Merced - An Epic Journey Ends', length: '3:16', posted: '12 years ago', url: 'https://www.youtube.com/watch?v=pgPwKHKpOn4' },
  { title: 'ALex Merced - Video Game Lullaby', length: '2:47', posted: '12 years ago', url: 'https://www.youtube.com/watch?v=Lz4HoFmaps8' },
  { title: 'Alex Merced   Epic Strings Attack', length: '2:32', posted: '12 years ago', url: 'https://www.youtube.com/watch?v=ZpFyRutW8Xg' },
  { title: 'Alex Merced   Fuzzy and Epic', length: '2:07', posted: '12 years ago', url: 'https://www.youtube.com/watch?v=GBb_0rAxJO4' },
  { title: 'Alex Merced   Building a Castle in the Sky', length: '3:28', posted: '12 years ago', url: 'https://www.youtube.com/watch?v=1vqg9H1slLk' },
  { title: 'Alex Merced    Gimme Jingles', length: '2:48', posted: '12 years ago', url: 'https://www.youtube.com/watch?v=GzSzVm1R4rM' },
];

/** Acoustic performances on the music channel that are not in the archive playlist. */
export const channelAcousticTracks: Track[] = [
  { title: 'Name Session 1/26/19 #2', length: '3:36', url: 'https://www.youtube.com/watch?v=WJXsD24qfBE' },
  { title: 'Jam Session 1/26/19 #1', length: '5:23', url: 'https://www.youtube.com/watch?v=dEqUFylnY_E' },
  { title: 'Alex Merced - To Be Alone With You (Sufjan Stevens Cover)', length: '2:39', url: 'https://www.youtube.com/watch?v=LfnVuTAiNNI' },
];

/** Singer-songwriter recordings on the loose-tracks SoundCloud account. */
export const soundcloudAcousticTracks: Track[] = [
  { title: "I've Only Seen Your Eyes", url: 'https://soundcloud.com/alex-merced/ive-only-seen-your-eyes' },
  { title: 'To Say These Words', url: 'https://soundcloud.com/alex-merced/to-say-these-words' },
  { title: 'Sadistic Affirmation', url: 'https://soundcloud.com/alex-merced/sadistic-affirmation' },
  { title: 'But your Still Sleeping', url: 'https://soundcloud.com/alex-merced/but-your-still-sleeping' },
  { title: 'The Most Beautiful Sin', url: 'https://soundcloud.com/alex-merced/the-most-beautiful-sin' },
  { title: 'Your Smile', url: 'https://soundcloud.com/alex-merced/your-smile' },
  { title: 'Your Fairy Tale', url: 'https://soundcloud.com/alex-merced/your-fairy-tale' },
  { title: 'Theorist Lament', url: 'https://soundcloud.com/alex-merced/theorist-lament' },
];

export const acousticTracks: Track[] = [
  ...youtubeArchiveTracks,
  ...channelAcousticTracks,
  ...soundcloudAcousticTracks,
];

// ---------------------------------------------------------------- reimagined

/**
 * The Suno covers, each paired with the acoustic recording it reworks.
 *
 * The YouTube series has seven videos. Suno now exposes those source generations
 * directly and also carries an eighth published archive cover, Tell My Heart.
 * Seven of the eight have an accessible original in the playlist above.
 */
export type Reimagining = Track & {
  /** The style the cover was generated in. */
  style: string;
  /** The acoustic recording it reworks, if that recording is still up. */
  original?: string;
};

export const reimaginedPlaylist = {
  title: 'AI Covers of Alex Merced Songs',
  url: 'https://www.youtube.com/playlist?list=PLl161oA2QyHt1dJRZe81vAF-QHQjmBwjg',
  description: 'AI Covers of Songs Alex wrote',
};

export const reimagined: Reimagining[] = [
  {
    title: 'My Heart Stopped',
    style: 'Disco house',
    length: '3:56',
    original: 'Alex Merced - My Heart Stopped',
    url: 'https://www.youtube.com/watch?v=ZaMnb_fxSmk',
    links: [
      { source: 'youtube', url: 'https://www.youtube.com/watch?v=ZaMnb_fxSmk' },
      { source: 'suno', url: 'https://suno.com/song/f65c17a7-a139-4889-b4ab-51732a23d37e' },
    ],
  },
  {
    title: 'Through the Darkness',
    style: 'Disco house',
    length: '3:29',
    original: 'Alex Merced - Through The Darkness',
    url: 'https://www.youtube.com/watch?v=2f-GLdPuI4k',
    links: [
      { source: 'youtube', url: 'https://www.youtube.com/watch?v=2f-GLdPuI4k' },
      { source: 'suno', url: 'https://suno.com/song/efee051a-123d-4959-9224-a825050305a2', label: 'Suno · earlier' },
      { source: 'suno', url: 'https://suno.com/song/80504323-9333-4c5c-aa42-c69cdd2acbdd', label: 'Suno · latest' },
    ],
  },
  {
    title: 'These Days',
    style: 'Salsa',
    length: '2:12',
    original: 'These Days Video',
    url: 'https://www.youtube.com/watch?v=JtR6OQqjVlk',
    links: [
      { source: 'youtube', url: 'https://www.youtube.com/watch?v=JtR6OQqjVlk' },
      { source: 'suno', url: 'https://suno.com/song/a13448b6-3e13-4aca-85ae-84edb93414c5' },
    ],
  },
  {
    title: 'Scars and Stitches',
    style: 'Rock',
    length: '3:55',
    original: 'Alex Merced - Scar and Stitches',
    url: 'https://www.youtube.com/watch?v=l4cCpDKgb_8',
    links: [
      { source: 'youtube', url: 'https://www.youtube.com/watch?v=l4cCpDKgb_8' },
      { source: 'suno', url: 'https://suno.com/song/df928ef1-1732-41dd-b008-a945eb8c3de0' },
    ],
  },
  {
    title: 'Solemn Thoughts',
    style: 'Indie disco',
    length: '4:17',
    url: 'https://www.youtube.com/watch?v=utHZCYF6FwM',
    links: [
      { source: 'youtube', url: 'https://www.youtube.com/watch?v=utHZCYF6FwM' },
      { source: 'suno', url: 'https://suno.com/song/66a52b97-a1df-41ca-9fc7-978f31ffdd05' },
    ],
  },
  {
    title: "The One Who Can't Be Loved",
    style: 'Sultry indie disco',
    length: '4:29',
    original: "Alex Merced - The One Who Can't Be Loved",
    url: 'https://www.youtube.com/watch?v=MusdQT-AKLU',
    links: [
      { source: 'youtube', url: 'https://www.youtube.com/watch?v=MusdQT-AKLU' },
      { source: 'suno', url: 'https://suno.com/song/ca20d84d-4323-4dbc-b666-862148903723', label: 'Suno · earlier' },
      { source: 'suno', url: 'https://suno.com/song/728e8b4b-2d5d-4107-b713-cadb1956e272', label: 'Suno · latest' },
    ],
  },
  {
    title: 'Try to Forget You',
    style: 'Sultry indie disco',
    length: '3:25',
    original: 'NEW SONG Alex Merced - Try to Forget You',
    url: 'https://www.youtube.com/watch?v=n_BbyWoAvFc',
    links: [
      { source: 'youtube', url: 'https://www.youtube.com/watch?v=n_BbyWoAvFc' },
      { source: 'suno', url: 'https://suno.com/song/bf001c90-0d07-4d82-9eb4-6eeb711a13fd', label: 'Suno · earlier' },
      { source: 'suno', url: 'https://suno.com/song/60e7d648-c733-4114-9125-ba373f8a87c8', label: 'Suno · latest' },
    ],
  },
  {
    title: 'Tell My Heart',
    style: 'AI voice cover',
    original: 'Alex Merced - Tell my heart',
    url: 'https://suno.com/song/372a2bdc-0860-4ba7-877a-673219208e79',
    links: [
      { source: 'suno', url: 'https://suno.com/song/372a2bdc-0860-4ba7-877a-673219208e79' },
    ],
  },
];

// ---------------------------------------------------------------- electronic

export type Album = {
  title: string;
  url: string;
  /** Release date the host reports, ISO. */
  released: string;
  tracks: string[];
};

/**
 * The seven albums on the SoundCloud account that holds the produced work, with
 * complete tracklists. The album pages themselves show five tracks and hide the
 * rest behind a control, so these came from the API instead of the page.
 */
export const albums: Album[] = albumsData;

export type ElectronicTrack = {
  title: string;
  seconds: number;
  /** A track can be present on several hosts. */
  sources: TrackLink['source'][];
  url: string;
  links?: TrackLink[];
  /** Set when the track sits on one of the SoundCloud albums. */
  album?: string;
};

/**
 * Every produced track, merged across ReverbNation, both SoundCloud accounts
 * and the music channel on YouTube
 * and deduplicated on a normalised title, since the same song is often filed as
 * "12 - Alex Merced - WTF" on one platform and "WTF" on another.
 *
 * ReverbNation carries almost all of it. The overlap between the platforms is
 * small, which is why the total is far larger than any single profile suggests.
 * Acoustic recordings that happen to sit on SoundCloud are excluded here and
 * live in acousticTracks instead.
 */
const normaliseTitle = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Secondary direct URLs for tracks found on more than one of the original hosts. */
const additionalLinks: Record<string, TrackLink[]> = {
  [normaliseTitle('Erratic Thoughts')]: [{ source: 'soundcloud-albums', url: 'https://soundcloud.com/alexmerced/erratic-thoughts' }],
  [normaliseTitle('Figure it Out Again')]: [{ source: 'soundcloud', url: 'https://soundcloud.com/alex-merced/figure-it-out-again' }],
  [normaliseTitle("I Won't Shut Up")]: [{ source: 'soundcloud', url: 'https://soundcloud.com/alex-merced/i-wont-shut-up' }],
  [normaliseTitle('Jazzy Dance')]: [{ source: 'soundcloud-albums', url: 'https://soundcloud.com/alexmerced/jazzy-dance' }],
  [normaliseTitle('Liberty I Heard')]: [{ source: 'soundcloud-albums', url: 'https://soundcloud.com/alexmerced/liberty-i-heard' }],
  [normaliseTitle('Sounds of Success')]: [{ source: 'soundcloud', url: 'https://soundcloud.com/alex-merced/sounds-of-success' }],
  [normaliseTitle('Spilling Guts')]: [
    { source: 'soundcloud-albums', url: 'https://soundcloud.com/alexmerced/spilling-guts' },
    { source: 'soundcloud', url: 'https://soundcloud.com/alex-merced/spilling-guts' },
  ],
  [normaliseTitle('Still Figuring It Out')]: [{ source: 'soundcloud', url: 'https://soundcloud.com/alex-merced/still-figuring-it-out' }],
  [normaliseTitle('The Best Of Me')]: [{ source: 'soundcloud', url: 'https://soundcloud.com/alex-merced/the-best-of-me' }],
  [normaliseTitle("The Games I've Played")]: [
    { source: 'soundcloud-albums', url: 'https://soundcloud.com/alexmerced/the-games-ive-played' },
    { source: 'soundcloud', url: 'https://soundcloud.com/alex-merced/the-games-ive-played' },
  ],
  [normaliseTitle('Voice Destruction')]: [{ source: 'soundcloud-albums', url: 'https://soundcloud.com/alexmerced/voice-destruction' }],
  [normaliseTitle('You Heart Give To')]: [{ source: 'soundcloud', url: 'https://soundcloud.com/alex-merced/you-heart-give-to' }],
};

/** Produced-song videos currently published on the Alex Merced Music channel. */
const youtubeProduced: ElectronicTrack[] = [
  { title: 'Funk, Melody and Glitch', seconds: 197, sources: ['youtube'], url: 'https://www.youtube.com/watch?v=wLeDxj6SN6o' },
  { title: 'Tensions and Anxiety', seconds: 211, sources: ['youtube'], url: 'https://www.youtube.com/watch?v=Zp_lLJPzIyU' },
  { title: 'Headache Music', seconds: 140, sources: ['youtube'], url: 'https://www.youtube.com/watch?v=1hr-GpJLrZ4' },
  { title: 'Glitch in the Jazz', seconds: 149, sources: ['youtube'], url: 'https://www.youtube.com/watch?v=VAeaBEbFmcI' },
  { title: 'Glitchy Romance', seconds: 145, sources: ['youtube'], url: 'https://www.youtube.com/watch?v=dtHjzjzzePc' },
  { title: 'Power Ballad Of Love And Frustration', seconds: 182, sources: ['youtube'], url: 'https://www.youtube.com/watch?v=3Lzg7YgpQD8' },
  { title: 'Feels Like the 80s', seconds: 146, sources: ['youtube'], url: 'https://www.youtube.com/watch?v=9abf4ceVgX8' },
  { title: 'Modulate This', seconds: 158, sources: ['youtube'], url: 'https://www.youtube.com/watch?v=VNJsnRj3xpM' },
  { title: 'Sweet Melody of Love', seconds: 194, sources: ['youtube'], url: 'https://www.youtube.com/watch?v=d6dQFSSzc4I' },
  { title: 'Love is Right in Front of Me', seconds: 146, sources: ['youtube'], url: 'https://www.youtube.com/watch?v=PHNR2A3-OMk' },
  { title: 'A Fun Glitchy Beat', seconds: 175, sources: ['youtube'], url: 'https://www.youtube.com/watch?v=WeR64DocSHQ' },
  { title: 'Hipster Dance Party', seconds: 157, sources: ['youtube'], url: 'https://www.youtube.com/watch?v=rbvOZWpOhvQ' },
  { title: 'Spy Step', seconds: 136, sources: ['youtube'], url: 'https://www.youtube.com/watch?v=MO94bZ0N1EE' },
  { title: 'Starlight Dubstep', seconds: 136, sources: ['youtube'], url: 'https://www.youtube.com/watch?v=jiFm-mXqjHE' },
  { title: 'One Small Dubstep for Mankind', seconds: 161, sources: ['youtube'], url: 'https://www.youtube.com/watch?v=qFUVgrpt3kY' },
];

const baseElectronicTracks = (electronicTracksData as ElectronicTrack[]).map((track) => {
  const primarySource: TrackLink['source'] = track.url.includes('reverbnation')
    ? 'reverbnation'
    : track.sources.includes('soundcloud-albums') && track.url.includes('/alexmerced/')
      ? 'soundcloud-albums'
      : 'soundcloud';
  const links = [{ source: primarySource, url: track.url }, ...(additionalLinks[normaliseTitle(track.title)] ?? [])];
  return { ...track, links };
});

for (const youtubeTrack of youtubeProduced) {
  const existing = baseElectronicTracks.find((track) => normaliseTitle(track.title) === normaliseTitle(youtubeTrack.title));
  if (existing) {
    existing.sources = [...new Set([...existing.sources, 'youtube' as const])];
    existing.links = [...(existing.links ?? []), { source: 'youtube', url: youtubeTrack.url }];
  }
}

const youtubeOnly = youtubeProduced
  .filter((track) => !baseElectronicTracks.some((existing) => normaliseTitle(existing.title) === normaliseTitle(track.title)))
  .map((track) => ({ ...track, links: [{ source: 'youtube' as const, url: track.url }] }));

export const electronicTracks: ElectronicTrack[] = [...baseElectronicTracks, ...youtubeOnly];

export const electronicStats = {
  total: electronicTracks.length,
  onReverbNation: electronicTracks.filter((t) => t.sources.includes('reverbnation')).length,
  onSoundCloud: electronicTracks.filter((t) => t.sources.some((s) => s.startsWith('soundcloud'))).length,
  onYouTube: electronicTracks.filter((t) => t.sources.includes('youtube')).length,
  inAlbums: electronicTracks.filter((t) => t.album).length,
  seconds: electronicTracks.reduce((n, t) => n + t.seconds, 0),
};

/** The produced catalogue's runtime, written out. */
export const electronicRuntime = `${Math.floor(electronicStats.seconds / 3600)} hours ${Math.round(
  (electronicStats.seconds % 3600) / 60,
)} minutes`;

/** What ReverbNation puts at the top of the profile. */
export const reverbnationFeatured = [
  'Rock Chaos',
  'Optimistic Thoughts',
  'Melody of Triumph',
  'Intense Piano',
  'Groovy Head Bobber',
];


/** The FL Studio teaching, which outdrew the music it came from. */
export const tutorials: Track[] = [
  { title: 'Revisiting Mixing and Mastering In FLStudio', length: '21:00', url: 'https://www.youtube.com/watch?v=FeY1XuIfWNA' },
  { title: 'Flstudio - Getting the Most of Your Loops and Samples', length: '14:28', url: 'https://www.youtube.com/watch?v=uu_4H-ksCcQ' },
  { title: 'Making of the Song "Crusher" in Flstudio', length: '25:00', url: 'https://www.youtube.com/watch?v=dJ1Q6rGfq9I' },
  { title: 'Fm Synthesis Tutorial (Sytrus, FMMF, FMFour, FM8)', length: '16:00', url: 'https://www.youtube.com/watch?v=v2jlgk0SNG8' },
  { title: '10 Epic Harmor Basses (Download at Freesounds.AlexMerced.com)', length: '1:56', url: 'https://www.youtube.com/watch?v=8qpdcqHNA74' },
  { title: 'Mixing and Mastering in FLstudio (EQUO, Parametric EQ 2, Maximus, Limiter)', length: '15:00', url: 'https://www.youtube.com/watch?v=d5KuhX6Tr-k' },
  { title: 'How Make New Synths Via Samples (Fun Flstudio Sampling Trick)', length: '7:27', url: 'https://www.youtube.com/watch?v=KDnn38rAk5Y' },
  { title: '3 Ways to Sidechain in Flstudio (Limiter, Gross Beat, Peak Controller)', length: '11:26', url: 'https://www.youtube.com/watch?v=tB3LdLzgTaU' },
  { title: '50 Free Dirty Bass Samples at Freesounds.AlexMerced.com', length: '5:36', url: 'https://www.youtube.com/watch?v=iJkqNh6mroU' },
  { title: '10 Flstudio Dirty Bass Presets (7 Harmor, 3 Sytrus Presets)', length: '29:00', url: 'https://www.youtube.com/watch?v=Un3Xh-2nQuM' },
  { title: 'FLStudio 11 - Brief Harmor Plug-in Tutorial', length: '8:33', url: 'https://www.youtube.com/watch?v=04OdOEshk6c' },
  { title: 'How to Make Awesome Dirty Bass Sounds in Flstudio 11 (3xOsc, Sytrus, Harmor)', length: '20:00', url: 'https://www.youtube.com/watch?v=YzosrqcN6Pw' },
  { title: 'Free Presets and Samples from Freesounds.AlexMerced.com', length: '3:31', url: 'https://www.youtube.com/watch?v=2hmOCtONLuA' },
  { title: 'FREE House and Dubstep Samples Starter Pack', length: '2:14', url: 'https://www.youtube.com/watch?v=OqtKGpBwTM8' },
  { title: 'Intro to Music Theory (Scales, Chords, and Progressions)', length: '14:45', url: 'https://www.youtube.com/watch?v=zAMB9-7R8IA' },
  { title: 'Flstudio 101 - Making Dubstep - 3 Ways to Make Wobble Bass', length: '13:41', url: 'https://www.youtube.com/watch?v=App1F6PZKe8' },
  { title: 'Flstudio 101 - Layering Drums sampling Tutorial', length: '6:48', url: 'https://www.youtube.com/watch?v=hWznisvGWS0' },
  { title: 'Flstudio 101 - Making Dubstep 101 For Fellow Noobs', length: '26:00', url: 'https://www.youtube.com/watch?v=iC6FmNRb3PQ' },
];

// ---------------------------------------------------------------- now

/** The non-cover songs currently published on Suno, newest first. */
export const sunoSongs: Track[] = [
  { title: 'Fork in the Road', url: 'https://suno.com/song/a9944874-f578-469a-a535-d1d351babcfd' },
  { title: 'Wide Awake Again', url: 'https://suno.com/song/4a9e15ff-6ee7-46c1-9b4b-9f0d85725002' },
  { title: 'King of the Table', url: 'https://suno.com/song/0c3e6834-c2f9-440e-813c-6627f6245d0c' },
  { title: 'Pixel Dust Memory', url: 'https://suno.com/song/6ac55931-4114-42a7-a32c-bbd97432c850' },
  { title: 'OPEN THE STACK', url: 'https://suno.com/song/4fff3fb9-8ba5-41f9-bec5-f58309d30dc6' },
  { title: 'LET IT GO, LET IT GROW', url: 'https://suno.com/song/833db24a-10ff-4f88-8f2c-5d486f1b250c' },
  { title: 'STEP BY STEP', url: 'https://suno.com/song/6d8e733c-8100-475d-a8f3-f1e34204e959' },
  { title: 'THE LONG WAY HOME', url: 'https://suno.com/song/7a48ad83-ae6a-473f-8030-05f3f716fcbd' },
  { title: 'OUT OF LINE', url: 'https://suno.com/song/ced71ca3-a447-4fca-8d0b-ea19ffe13a88' },
  { title: 'Lives Through The Window', url: 'https://suno.com/song/64217495-cfbb-444f-a440-705518655a9d' },
  { title: 'THE WHOLE DAMN SHOW', url: 'https://suno.com/song/1b6cbd27-df54-4d5a-bca3-dc21ca13b883' },
  { title: 'THE MIRROR LOVES ME BACK', url: 'https://suno.com/song/eb3ab107-fea0-46ea-ba8e-4224534875b9' },
  { title: 'First Light', url: 'https://suno.com/song/ba3e1eab-47fc-47d3-91dd-bce5d8d1e493' },
  { title: 'Tin Roof Weather', url: 'https://suno.com/song/6768254a-03a1-47e5-b5fa-e629ef446172' },
  { title: 'Mirror Habit', url: 'https://suno.com/song/f6fe1f21-589f-47a8-b074-1f20ac571851' },
  { title: 'Table For Nobody', url: 'https://suno.com/song/1606486d-e9e5-4cca-a4b1-c1f8d498a684' },
  { title: 'Not Okay Today', url: 'https://suno.com/song/9558555e-8277-4a92-a1a3-9ba10d70c570' },
  { title: 'Let Them Bloom', url: 'https://suno.com/song/52f592b5-6874-4f5c-9521-b112ed9a813f' },
  { title: 'Peanut Butter Halo', url: 'https://suno.com/song/9f827ea5-bac8-402e-b0f1-14f0d2b98b26' },
  { title: 'Counting My Blessings', url: 'https://suno.com/song/639aaca3-d58d-485a-bcf8-7e778535d0a7' },
  { title: 'Eyes of the World', url: 'https://suno.com/song/57ad9c9c-6c16-4a81-a529-bff6a15c66e1' },
  { title: 'Gold Under Skin', url: 'https://suno.com/song/db734f1d-3b00-47f2-9060-2550ae8671d6' },
  { title: 'More than Pieces', url: 'https://suno.com/song/42e712f6-a452-4100-b70c-c2895829e796' },
  { title: 'Paper Walls', url: 'https://suno.com/song/cef9f1fc-1706-4899-adcc-27ecc480b240' },
  { title: 'Old Scars New Hands', url: 'https://suno.com/song/833b7aed-9afa-4e45-b18a-df25a1d9231b' },
  { title: 'Mirror Bite', url: 'https://suno.com/song/2bb90c12-e4ca-41e9-9ae4-b94a0ca29c63' },
  { title: 'Borrowed Appetite', url: 'https://suno.com/song/462147e6-a804-4ff7-828b-998887219459' },
  { title: 'Say My Name', url: 'https://suno.com/song/55e6203e-9184-4848-a542-fde6179ca11d' },
  { title: 'Bottomless Plate', url: 'https://suno.com/song/5d2401f6-4e71-4531-8696-b2db46825cc2' },
  { title: 'Left Unspent', url: 'https://suno.com/song/c4321f34-4771-4667-874f-06aa3bfd9447' },
  { title: 'Borrowed Smile', url: 'https://suno.com/song/42d33b11-fa91-475d-be00-6c1faeab9449' },
  { title: 'Top Floor Steps', url: 'https://suno.com/song/5897d165-904c-4a27-815f-783f07c88288' },
  { title: 'Glass On My Tongue', url: 'https://suno.com/song/3474b7eb-8a6a-4d19-afeb-2c5e94d968d9' },
  { title: 'Wrong Road Home', url: 'https://suno.com/song/abe6b10d-dfbb-44d8-9173-946586ae5d89' },
  { title: 'To Find My Mind', url: 'https://suno.com/song/f0c0078d-d9d2-4fc0-bd92-18662b652bea' },
  { title: 'Black Hole Love', url: 'https://suno.com/song/1d7ba2fa-8c26-4610-9226-ff15241c38b5' },
  { title: 'Finding the me that once Was', url: 'https://suno.com/song/31dbde6d-e24e-400c-b43d-6f78625ab5dc' },
  { title: 'Second Helpings', url: 'https://suno.com/song/7228591f-a9f1-4e71-840d-0b8bc38c8dde' },
  { title: 'Ambition Habit', url: 'https://suno.com/song/a8b20c9a-e2ce-44ac-86d6-d8a5a0fc5ed0' },
  { title: 'I believe in you', url: 'https://suno.com/song/a81106cc-267a-4a39-8c42-7a2a1a5363ed' },
  { title: 'Heal Your Heart', url: 'https://suno.com/song/98c922aa-2470-42e5-a663-f8c6875fc9cb' },
  { title: 'Today Has Been Good', url: 'https://suno.com/song/12d9ee62-fd89-43c6-ad8e-3266cafaf05b' },
  { title: 'Maps I Cannot Fold', url: 'https://suno.com/song/947c5921-ee15-4338-bd49-73f1b72278a9' },
  { title: 'Karaoke King', url: 'https://suno.com/song/91846c7d-ef22-4048-8681-dfc68ffbefba' },
  { title: 'Built it Up', url: 'https://suno.com/song/fafac817-d29c-424b-bc3c-eaa0b780c319' },
  { title: 'Food is Good', url: 'https://suno.com/song/7f3fd470-bd0c-426e-85b4-afdf5bba4c6c' },
];

export const sunoStyle = 'glitch hop, indie prog, AI-voice covers and experimental generated songs';

/** Published Suno generations, including alternate generations of rebuilt songs. */
export const sunoCoverGenerationCount = reimagined.reduce(
  (total, song) => total + (song.links?.filter((link) => link.source === 'suno').length ?? 0),
  0,
);
export const sunoPublishedCount = sunoSongs.length + sunoCoverGenerationCount;

// ---------------------------------------------------------------- where

export type Platform = {
  label: string;
  url: string;
  era: Era | 'all';
  note: string;
  /** Numbers the platform itself reports. */
  stat?: string;
};

export const platforms: Platform[] = [
  {
    label: 'YouTube, Alex Merced Music',
    url: 'https://www.youtube.com/@AlexMercedMusic',
    era: 'all',
    note: 'The music channel, opened in May 2014. Acoustic recordings, electronic tracks and the FL Studio tutorials, in three sections.',
    stat: '44 videos',
  },
  {
    label: 'Best of Alex Merced Music',
    url: 'https://www.youtube.com/playlist?list=PL0DCC201C0F84EB13',
    era: 'acoustic',
    note: 'The long-running archive playlist. YouTube reports 44 entries, with five unavailable videos hidden.',
    stat: `${youtubeArchiveTracks.length} accessible of ${acousticPlaylist.totalEntries}`,
  },
  {
    label: 'AI Covers of Alex Merced Songs',
    url: 'https://www.youtube.com/playlist?list=PLl161oA2QyHt1dJRZe81vAF-QHQjmBwjg',
    era: 'ai',
    note: 'Seven YouTube videos rebuilt with Suno, each opening with a clip of the recording it came from. Suno also publishes an eighth archive cover.',
    stat: '7 videos',
  },
  {
    label: 'SoundCloud, the albums',
    url: 'https://soundcloud.com/alexmerced',
    era: 'electronic',
    note: 'Seven albums of produced electronic music, all published in April 2014.',
    stat: '7 albums · 35 tracks',
  },
  {
    label: 'SoundCloud, the loose tracks',
    url: 'https://soundcloud.com/alex-merced',
    era: 'electronic',
    note: 'A second account holding singles and one-offs, acoustic and electronic together.',
    stat: '45 tracks',
  },
  {
    label: 'ReverbNation',
    url: 'https://legacy.reverbnation.com/alexmerced',
    era: 'electronic',
    note: 'Filed under Electronica, Electro Pop and Glitch Hop, out of Brooklyn. The profile still lists the featured songs.',
    stat: '6.6K fans',
  },
  {
    label: 'Suno',
    url: 'https://suno.com/@alexmerced',
    era: 'ai',
    note: `The current generated catalog: ${sunoSongs.length} newer songs and ${sunoCoverGenerationCount} published generations of ${reimagined.length} archive covers.`,
    stat: `${sunoPublishedCount} songs`,
  },
  {
    label: 'Instagram',
    url: 'https://www.instagram.com/alexmercedmusic',
    era: 'all',
    note: 'Occasional clips and works in progress.',
  },
];

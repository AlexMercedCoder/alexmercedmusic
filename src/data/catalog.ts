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

export type Track = {
  title: string;
  /** Runtime as the host reports it. */
  length?: string;
  /** How long ago the host says it was posted, at the time this was gathered. */
  posted?: string;
};

// ---------------------------------------------------------------- acoustic

/**
 * The acoustic archive, from the Best of Alex Merced Music playlist.
 *
 * Most of it was uploaded to his YouTube channel, which is where
 * these recordings have lived since the mid-2000s. The playlist states 44
 * videos and hides 5 that are no longer available, so this is what a visitor
 * can actually play.
 */
export const acousticPlaylist = {
  title: 'Best of Alex Merced Music',
  url: 'https://www.youtube.com/playlist?list=PL0DCC201C0F84EB13',
  description: 'A Playlist of some of the best video bits of Alex Merced and his guitar.',
  stated: 44,
  unavailable: 5,
};

export const acousticTracks: Track[] = [
  { title: 'Eadd9 Tuning Improv', length: '4:05', posted: '18 years ago' },
  { title: 'Alex Merced - A Beautiful Dying Radio', length: '3:13', posted: '19 years ago' },
  { title: 'Alex Merced - Sweet Melody of Love', length: '3:14', posted: '12 years ago' },
  { title: 'These Days Video', length: '1:56', posted: '20 years ago' },
  { title: 'Alex Merced - A Fun Glitchy Beat', length: '2:55', posted: '12 years ago' },
  { title: 'Alex Merced - Love is Right in Front of Me', length: '2:26', posted: '12 years ago' },
  { title: 'Alex Merced - A Song Idea', length: '2:41', posted: '17 years ago' },
  { title: 'Alex Merced - Pain', length: '3:26', posted: '17 years ago' },
  { title: 'Alex Merced - Heart to Give You', length: '2:41', posted: '17 years ago' },
  { title: 'Alex Merced - Tell my heart', length: '2:10', posted: '17 years ago' },
  { title: 'NEW SONG Alex Merced - Try to Forget You', length: '3:28', posted: '18 years ago' },
  { title: 'Alex Merced, Bowl Cap, and A Song # 2', length: '2:09', posted: '16 years ago' },
  { title: 'Alex Merced, Bowl Cap, and A Song # 1', length: '2:11', posted: '16 years ago' },
  { title: 'Catchy TUne Played by ALex Merced', length: '2:19', posted: '17 years ago' },
  { title: 'Alex and Guitar 6', length: '2:30', posted: '17 years ago' },
  { title: 'Alex and Guitar 1', length: '2:58', posted: '17 years ago' },
  { title: 'Alex Merced - Through The Darkness', length: '3:22', posted: '17 years ago' },
  { title: 'Alex Merced - My Heart Stopped', length: '3:08', posted: '17 years ago' },
  { title: 'Alex Merced - Heart Break by Truth', length: '2:02', posted: '17 years ago' },
  { title: 'Alex Merced - Scar and Stitches', length: '4:19', posted: '18 years ago' },
  { title: 'ALex Merced Intro - Adlibbing then I will never hold ...', length: '5:46', posted: '18 years ago' },
  { title: "ALex Merced - the one who can't be loved", length: '4:03', posted: '18 years ago' },
  { title: 'Alex Merced - I will Never Hold Your Hand', length: '2:19', posted: '18 years ago' },
  { title: "Alex Merced - The One Who Can't Be Loved", length: '3:04', posted: '18 years ago' },
  { title: 'Alex and Guitar 3', length: '2:03', posted: '17 years ago' },
  { title: '2-15-14: Alex Merced playing guitar', length: '2:35', posted: '12 years ago' },
  { title: 'ALex Merced - Warm Night Warm Piano', length: '1:56', posted: '12 years ago' },
  { title: 'Alex Merced - The Best of Me', length: '2:55', posted: '12 years ago' },
  { title: 'Alex Merced - Orchestrated Closing', length: '2:58', posted: '12 years ago' },
  { title: 'Alex Merced   Raining Harmony', length: '2:42', posted: '12 years ago' },
  { title: 'Alex Merced   Power Ballad of Love and Frustration', length: '3:04', posted: '12 years ago' },
  { title: 'Alex Merced - Mellow 8Bit Afternoon', length: '2:24', posted: '12 years ago' },
  { title: 'Alex Merced - Epic Hip Hop Orchestra', length: '2:10', posted: '12 years ago' },
  { title: 'Alex Merced - An Epic Journey Ends', length: '3:16', posted: '12 years ago' },
  { title: 'ALex Merced - Video Game Lullaby', length: '2:47', posted: '12 years ago' },
  { title: 'Alex Merced   Epic Strings Attack', length: '2:32', posted: '12 years ago' },
  { title: 'Alex Merced   Fuzzy and Epic', length: '2:07', posted: '12 years ago' },
  { title: 'Alex Merced   Building a Castle in the Sky', length: '3:28', posted: '12 years ago' },
  { title: 'Alex Merced    Gimme Jingles', length: '2:48', posted: '12 years ago' },
];

// ---------------------------------------------------------------- reimagined

/**
 * The Suno covers, each paired with the acoustic recording it reworks.
 *
 * Every video opens with a clip of the original, so the pairing is the point
 * rather than a note added afterwards. Six of the seven have their original
 * still sitting in the archive above; Solemn Thoughts is the one whose earlier
 * recording is not in the playlist.
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
  },
  {
    title: 'Through the Darkness',
    style: 'Disco house',
    length: '3:29',
    original: 'Alex Merced - Through The Darkness',
  },
  {
    title: 'These Days',
    style: 'Salsa',
    length: '2:12',
    original: 'These Days Video',
  },
  {
    title: 'Scars and Stitches',
    style: 'Rock',
    length: '3:55',
    original: 'Alex Merced - Scar and Stitches',
  },
  {
    title: 'Solemn Thoughts',
    style: 'Indie disco',
    length: '4:17',
  },
  {
    title: "The One Who Can't Be Loved",
    style: 'Sultry indie disco',
    length: '4:29',
    original: "Alex Merced - The One Who Can't Be Loved",
  },
  {
    title: 'Try to Forget You',
    style: 'Sultry indie disco',
    length: '3:25',
    original: 'NEW SONG Alex Merced - Try to Forget You',
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
  /** reverbnation, soundcloud, or soundcloud-albums. A track can be on several. */
  sources: string[];
  url: string;
  /** Set when the track sits on one of the SoundCloud albums. */
  album?: string;
};

/**
 * Every produced track, merged across ReverbNation and both SoundCloud accounts
 * and deduplicated on a normalised title, since the same song is often filed as
 * "12 - Alex Merced - WTF" on one platform and "WTF" on another.
 *
 * ReverbNation carries almost all of it. The overlap between the platforms is
 * small, which is why the total is far larger than any single profile suggests.
 * Acoustic recordings that happen to sit on SoundCloud are excluded here and
 * live in acousticTracks instead.
 */
export const electronicTracks: ElectronicTrack[] = electronicTracksData;

export const electronicStats = {
  total: electronicTracks.length,
  onReverbNation: electronicTracks.filter((t) => t.sources.includes('reverbnation')).length,
  onSoundCloud: electronicTracks.filter((t) => t.sources.some((s) => s.startsWith('soundcloud'))).length,
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
  { title: 'Free Presets and Samples from Freesounds.AlexMerced.com', posted: '601 views' },
  { title: 'FREE House and Dubstep Samples Starter Pack', posted: '341 views' },
  { title: 'Flstudio 101 - Layering Drums sampling Tutorial', posted: '293 views' },
  { title: 'Flstudio 101 - Making Dubstep 101 For Fellow Noobs', posted: '186 views' },
  { title: 'Intro to Music Theory (Scales, Chords, and Progressions)', posted: '20 views' },
];

// ---------------------------------------------------------------- now

/** What is on Suno now, with the style tags written on the profile. */
export const sunoSongs: Track[] = [
  { title: 'Today Has Been Good' },
  { title: 'Maps I Cannot Fold' },
  { title: 'Karaoke King' },
  { title: 'Built it Up' },
  { title: 'Food is Good' },
];

export const sunoStyle = 'indie prog, metal, glitch, prog metal dub step disco melodic epic with intense guitar piano';

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
    note: 'Two decades of guitar recordings, most of them uploaded to his YouTube channel.',
    stat: '44 videos, 5 no longer available',
  },
  {
    label: 'AI Covers of Alex Merced Songs',
    url: 'https://www.youtube.com/playlist?list=PLl161oA2QyHt1dJRZe81vAF-QHQjmBwjg',
    era: 'ai',
    note: 'Seven songs rebuilt with Suno, each opening with a clip of the recording it came from.',
    stat: '7 videos',
  },
  {
    label: 'SoundCloud, the albums',
    url: 'https://soundcloud.com/alexmerced',
    era: 'electronic',
    note: 'Five albums of produced electronic music: Mid-Life Crisis, An EP, Are You Game, Voices Volume 1 and Spaceman.',
    stat: '35 tracks',
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
    note: 'Where the newer generated songs go, tagged indie prog.',
    stat: '5 songs',
  },
  {
    label: 'Instagram',
    url: 'https://www.instagram.com/alexmercedmusic',
    era: 'all',
    note: 'Occasional clips and works in progress.',
  },
];

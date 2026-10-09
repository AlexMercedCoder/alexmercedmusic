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
import sunoSongsData from './suno-songs.json';
import sunoCoversData from './suno-covers.json';
import sunoPlaylistsData from './suno-playlists.json';
import youtubeMetadataData from './youtube-metadata.json';

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
  /** Exact source timestamps and richer metadata, when the host exposes them. */
  createdAt?: string;
  durationSeconds?: number;
  genres?: string[];
  imageUrl?: string;
  imageLargeUrl?: string;
  embedUrl?: string;
  model?: string;
  lyrics?: string;
};

export type YouTubeMetadata = {
  publishedAt: string;
  title?: string;
  imageUrl?: string;
  durationSeconds?: number;
  channelPosition?: number;
};
export const youtubeMetadata = youtubeMetadataData as Record<string, YouTubeMetadata>;
export type SunoPlaylist = {
  id: string;
  name: string;
  url: string;
  imageUrl?: string;
  songCount: number;
  durationSeconds?: number;
  description: string;
  resourceType: 'album' | 'playlist';
  collectionType: 'album' | 'theme' | 'covers';
  collectionLabel: string;
  trackIds: string[];
  tracks: Array<{ id: string; title: string; url: string; createdAt?: string; durationSeconds?: number; imageUrl?: string }>;
  slug: string;
  pageUrl: string;
};

const playlistSlug = (value: string) => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const sunoPlaylistEditorial: Record<string, Pick<SunoPlaylist, 'description' | 'collectionType' | 'collectionLabel'>> = {
  'abf459c8-27e4-4382-a9a5-77769146b46b': {
    description: 'Songs about nostalgia, memory, food and the familiar comforts that connect them.',
    collectionType: 'theme', collectionLabel: 'Nostalgic collection',
  },
  '53e6aac6-e3b0-4a8c-9f85-427bd47ff4e4': {
    description: 'An educational album exploring economics, markets and the tradeoffs behind economic policy.',
    collectionType: 'album', collectionLabel: 'Economics album',
  },
  '7e4bd076-c713-4a0d-a1bf-b794491be738': {
    description: 'A concept album about the plight of war and what it costs in peace, life and treasure.',
    collectionType: 'album', collectionLabel: 'Concept album',
  },
  'e8453402-b6d4-4064-b599-508a6c2e1edb': {
    description: 'A deeply introspective album exploring Alex’s inner conflicts.',
    collectionType: 'album', collectionLabel: 'Introspective album',
  },
  '73370017-9f5c-4f67-85e6-95e60b13cdba': {
    description: 'A deeply introspective album exploring Alex’s inner conflicts.',
    collectionType: 'album', collectionLabel: 'Introspective album',
  },
  'a146d06a-7f10-4069-87fd-cb7c092c0657': {
    description: 'A deeply introspective album exploring Alex’s inner conflicts.',
    collectionType: 'album', collectionLabel: 'Introspective album',
  },
  'a69850f0-d17e-477e-bcef-37d3705efcfb': {
    description: 'Suno arrangements of songs from Alex’s older acoustic catalog.',
    collectionType: 'covers', collectionLabel: 'Acoustic cover series',
  },
  'cb4ce716-4820-4a79-a1b0-e26285ada284': {
    description: 'Educational songs Alex made about professional topics in technology.',
    collectionType: 'theme', collectionLabel: 'Educational collection',
  },
  'addc06e6-4dfd-47ef-a675-cf5c16f1c350': {
    description: 'Songs about politics and economics.',
    collectionType: 'theme', collectionLabel: 'Topical collection',
  },
  '16797847-dedf-46f4-8a58-1628cc3c64b4': {
    description: 'A broad collection of playful songs.',
    collectionType: 'theme', collectionLabel: 'Playful collection',
  },
  '09aa165b-1ca1-4f80-9903-1046c0e2a649': {
    description: 'A broad collection of Alex’s more introspective songs.',
    collectionType: 'theme', collectionLabel: 'Introspective collection',
  },
  '272034e9-28cb-4b1e-8ca6-7da96e2704e3': {
    description: 'Cover songs arranged around an AI-generated version of Alex’s voice.',
    collectionType: 'covers', collectionLabel: 'AI voice cover series',
  },
  '4f3cf988-b2a8-4e04-b0f7-27fc6e99eb0c': {
    description: 'Eleven original electronic productions made by Alex Merced in FL Studio, each followed by two Suno reimaginings.',
    collectionType: 'covers', collectionLabel: 'Electronic originals and reimaginings',
  },
};

export const sunoCollections: SunoPlaylist[] = (sunoPlaylistsData as Omit<SunoPlaylist, 'collectionType' | 'collectionLabel' | 'slug' | 'pageUrl'>[])
  .map((playlist) => ({
    ...playlist,
    slug: playlistSlug(playlist.name),
    pageUrl: `/suno/${playlist.resourceType === 'album' ? 'albums' : 'playlists'}/${playlistSlug(playlist.name)}/`,
    ...(sunoPlaylistEditorial[playlist.id] ?? {
      description: playlist.description || `A public Suno ${playlist.resourceType} by Alex Merced.`,
      collectionType: playlist.resourceType === 'album' ? 'album' as const : 'theme' as const,
      collectionLabel: playlist.resourceType === 'album' ? 'Official Suno album' : 'Suno collection',
    }),
  }));

export const sunoAlbums = sunoCollections.filter((collection) => collection.resourceType === 'album');
export const sunoPlaylists = sunoCollections.filter((collection) => collection.resourceType === 'playlist');
export const canonicalReimaginingAlbum = sunoAlbums.find((album) => album.id === '51dc8194-9cc8-4d07-8923-ebdaf9bed812');

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

const youtubeArchiveSourceTracks: Track[] = [
  { title: 'Eadd9 Improv', length: '4:05', posted: '18 years ago', url: 'https://www.youtube.com/watch?v=LzAFKiI72QA' },
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

const canonicalAcousticAlbumOriginals: Record<string, string> = {
  'Eadd9 Improv': 'cdc00372-b6d7-4b0e-8fda-7ee8b2ac9ed1',
  'Alex Merced - Scar and Stitches': 'b5f168a1-c523-4ea7-b724-bdcf1f8404e9',
  'Alex Merced - Through The Darkness': '2df45aea-f839-4e1e-b889-f9149b7a8ecc',
  'These Days Video': '4f9c2a6a-e3e1-481d-91fa-92fbca1feba9',
  "Alex Merced - The One Who Can't Be Loved": 'a8cb4c4c-855e-4b85-a946-7e75e4b1a043',
  'NEW SONG Alex Merced - Try to Forget You': '02fd5744-8c42-47b3-8930-9ed4b92abf8d',
  'Alex Merced - My Heart Stopped': '256f1402-721e-44c7-aef8-d1a0f4d22867',
  'Alex Merced - Tell my heart': '1c23ef0f-1145-4d34-b77c-b1132171df94',
  'Alex Merced - Pain': 'ce637846-1210-4cc4-bd34-0e6e2946cb4e',
  'Alex Merced - Heart to Give You': 'b5d409ed-6660-4b9b-ab10-b17cf60cdfb8',
  "I've Only Seen Your Eyes": 'fb52bcbf-a480-4ff2-9291-ed2df90346bb',
  'To Say These Words': '1a162102-12c8-4ccd-8ee2-a6c730be1783',
  'Sadistic Affirmation': 'a8b7fff0-b89d-4a76-ad19-a76f0cdf34cf',
  'But your Still Sleeping': '236f3d00-23f6-4edd-b072-e4aa1f99f2c8',
  'The Most Beautiful Sin': '1fb628da-a92d-4b9a-b644-084c836cd26e',
  'Your Smile': '0425dd0e-a112-4f35-bcf6-70dfde29b535',
  'Your Fairy Tale': '45488dd7-6362-4394-ac4d-88a73e05fe78',
  'Theorist Lament': 'd8ded01f-9628-4236-a48b-d5e34b7598cb',
};

const featuredArchiveAlbumOriginals: Record<string, string> = {
  'Alex Merced - A Beautiful Dying Radio': 'ec3705d9-0f06-4ba2-8009-d1e593ff4a56',
};

export const youtubeArchiveTracks: Track[] = youtubeArchiveSourceTracks.map((track) => {
  const sunoId = canonicalAcousticAlbumOriginals[track.title] ?? featuredArchiveAlbumOriginals[track.title];
  return sunoId ? {
    ...track,
    links: [
      { source: 'youtube', url: track.url!, label: 'YouTube archive' },
      { source: 'suno', url: `https://suno.com/song/${sunoId}`, label: 'Suno album original' },
    ],
  } : track;
});

/** Acoustic performances on the music channel that are not in the archive playlist. */
export const channelAcousticTracks: Track[] = [
  { title: 'Name Session 1/26/19 #2', length: '3:36', url: 'https://www.youtube.com/watch?v=WJXsD24qfBE' },
  { title: 'Jam Session 1/26/19 #1', length: '5:23', url: 'https://www.youtube.com/watch?v=dEqUFylnY_E' },
  { title: 'Alex Merced - To Be Alone With You (Sufjan Stevens Cover)', length: '2:39', url: 'https://www.youtube.com/watch?v=LfnVuTAiNNI' },
];

/** Singer-songwriter recordings on the loose-tracks SoundCloud account. */
const soundcloudAcousticSourceTracks: Track[] = [
  { title: "I've Only Seen Your Eyes", url: 'https://soundcloud.com/alex-merced/ive-only-seen-your-eyes' },
  { title: 'To Say These Words', url: 'https://soundcloud.com/alex-merced/to-say-these-words' },
  { title: 'Sadistic Affirmation', url: 'https://soundcloud.com/alex-merced/sadistic-affirmation' },
  { title: 'But your Still Sleeping', url: 'https://soundcloud.com/alex-merced/but-your-still-sleeping' },
  { title: 'The Most Beautiful Sin', url: 'https://soundcloud.com/alex-merced/the-most-beautiful-sin' },
  { title: 'Your Smile', url: 'https://soundcloud.com/alex-merced/your-smile' },
  { title: 'Your Fairy Tale', url: 'https://soundcloud.com/alex-merced/your-fairy-tale' },
  { title: 'Theorist Lament', url: 'https://soundcloud.com/alex-merced/theorist-lament' },
];

export const soundcloudAcousticTracks: Track[] = soundcloudAcousticSourceTracks.map((track) => {
  const sunoId = canonicalAcousticAlbumOriginals[track.title];
  return sunoId ? {
    ...track,
    links: [
      { source: 'soundcloud', url: track.url!, label: 'SoundCloud original' },
      { source: 'suno', url: `https://suno.com/song/${sunoId}`, label: 'Suno album original' },
    ],
  } : track;
});

export const acousticTracks: Track[] = [
  ...youtubeArchiveTracks,
  ...channelAcousticTracks,
  ...soundcloudAcousticTracks,
];

// ---------------------------------------------------------------- reimagined

/**
 * The Suno covers, each paired with the acoustic recording it reworks.
 *
 * The featured Suno albums pair source recordings with two new arrangements
 * of each. Earlier Suno generations and YouTube videos remain linked as
 * supporting versions where they are available.
 */
export type Reimagining = Track & {
  /** The style the cover was generated in. */
  style: string;
  /** The acoustic recording it reworks, if that recording is still up. */
  original?: string;
  /** Which catalog era contains the source when titles overlap. */
  originalEra?: Era;
};

export const reimaginedPlaylist = {
  title: 'AI Covers of Alex Merced Songs',
  url: 'https://www.youtube.com/playlist?list=PLl161oA2QyHt1dJRZe81vAF-QHQjmBwjg',
  description: 'AI Covers of Songs Alex wrote',
};

export const reimaginedAlbums = [
  {
    title: 'Acoustic Originals and AI Reimagination',
    volume: 'Volume 1',
    url: 'https://suno.com/album/51dc8194-9cc8-4d07-8923-ebdaf9bed812',
    shareUrl: 'https://suno.com/s/DC7l2a3FhMM89kyE',
    description: 'Ten original acoustic recordings from Alex Merced’s singer-songwriter archive, each followed by two AI reimaginings.',
  },
  {
    title: 'Acoustic Originals And Reimaginations Vol.2',
    volume: 'Volume 2',
    url: 'https://suno.com/album/8ed01f70-e1ff-4cd8-aeb8-44f0f8e99fd4',
    shareUrl: 'https://suno.com/s/uL8WD1tCPpG6Tst8',
    description: 'Eight more original acoustic recordings, each followed by two AI reimaginings.',
  },
] as const;

export const electronicReimaginingAlbum = {
  title: 'Electronic Originals And Reimaginations',
  volume: 'Electronic originals',
  url: 'https://suno.com/album/4f3cf988-b2a8-4e04-b0f7-27fc6e99eb0c',
  shareUrl: 'https://suno.com/s/DOe9T1qVrD5GuR6c',
  description: 'Eleven original electronic productions made in FL Studio, each followed by two Suno reimaginings.',
} as const;

export const featuredReimaginingAlbums = [...reimaginedAlbums, electronicReimaginingAlbum].map((album) => ({
  ...album,
  imageUrl: sunoAlbums.find((candidate) => candidate.url === album.url)?.imageUrl,
  pageUrl: sunoAlbums.find((candidate) => candidate.url === album.url)?.pageUrl,
}));

export const reimaginedAlbum = reimaginedAlbums[0];

export const reimagined: Reimagining[] = [
  {
    title: 'My Heart Stopped',
    style: 'Disco house',
    length: '3:56',
    original: 'Alex Merced - My Heart Stopped',
    url: 'https://www.youtube.com/watch?v=ZaMnb_fxSmk',
    links: [
      { source: 'suno', url: 'https://suno.com/song/e9f5de63-c8d6-423e-a249-e7a4d98df861', label: 'Suno album · version 1' },
      { source: 'suno', url: 'https://suno.com/song/83453c2d-ed03-4bfb-8dd2-87b5f190f19d', label: 'Suno album · version 2' },
      { source: 'youtube', url: 'https://www.youtube.com/watch?v=ZaMnb_fxSmk', label: 'YouTube video' },
      { source: 'suno', url: 'https://suno.com/song/f65c17a7-a139-4889-b4ab-51732a23d37e', label: 'Earlier Suno version' },
    ],
  },
  {
    title: 'Through the Darkness',
    style: 'Disco house',
    length: '3:29',
    original: 'Alex Merced - Through The Darkness',
    url: 'https://www.youtube.com/watch?v=2f-GLdPuI4k',
    links: [
      { source: 'suno', url: 'https://suno.com/song/be4adbbf-acf2-4c21-baee-db53df398473', label: 'Suno album · version 1' },
      { source: 'suno', url: 'https://suno.com/song/8c7cf3c4-0ce2-49ac-9185-76a2cc63915e', label: 'Suno album · version 2' },
      { source: 'youtube', url: 'https://www.youtube.com/watch?v=2f-GLdPuI4k', label: 'YouTube video' },
      { source: 'suno', url: 'https://suno.com/song/efee051a-123d-4959-9224-a825050305a2', label: 'Earlier Suno version 1' },
      { source: 'suno', url: 'https://suno.com/song/80504323-9333-4c5c-aa42-c69cdd2acbdd', label: 'Earlier Suno version 2' },
    ],
  },
  {
    title: 'These Days',
    style: 'Salsa',
    length: '2:12',
    original: 'These Days Video',
    url: 'https://www.youtube.com/watch?v=JtR6OQqjVlk',
    links: [
      { source: 'suno', url: 'https://suno.com/song/0cf9295c-0b99-438c-b818-7000bb4b3c73', label: 'Suno album · version 1' },
      { source: 'suno', url: 'https://suno.com/song/ca6122d5-bb3a-414a-abac-9c49afe041c5', label: 'Suno album · version 2' },
      { source: 'youtube', url: 'https://www.youtube.com/watch?v=JtR6OQqjVlk', label: 'YouTube video' },
      { source: 'suno', url: 'https://suno.com/song/a13448b6-3e13-4aca-85ae-84edb93414c5', label: 'Earlier Suno version' },
    ],
  },
  {
    title: 'Scars and Stitches',
    style: 'Rock',
    length: '3:55',
    original: 'Alex Merced - Scar and Stitches',
    url: 'https://www.youtube.com/watch?v=l4cCpDKgb_8',
    links: [
      { source: 'suno', url: 'https://suno.com/song/de0f0342-8eb2-47b1-bc40-c5f7daca36db', label: 'Suno album · version 1' },
      { source: 'suno', url: 'https://suno.com/song/33c68abf-d4e7-4015-a801-7d685bc85e6b', label: 'Suno album · version 2' },
      { source: 'youtube', url: 'https://www.youtube.com/watch?v=l4cCpDKgb_8', label: 'YouTube video' },
      { source: 'suno', url: 'https://suno.com/song/df928ef1-1732-41dd-b008-a945eb8c3de0', label: 'Earlier Suno version' },
    ],
  },
  {
    title: 'Solemn Thoughts',
    style: 'Indie disco',
    length: '4:17',
    original: 'Eadd9 Improv',
    url: 'https://www.youtube.com/watch?v=utHZCYF6FwM',
    links: [
      { source: 'suno', url: 'https://suno.com/song/14c0ea46-b6dd-4c6d-8266-c53a7b921434', label: 'Suno album · version 1' },
      { source: 'suno', url: 'https://suno.com/song/a3d39a25-a00d-4469-8961-c077f0729e54', label: 'Suno album · version 2' },
      { source: 'youtube', url: 'https://www.youtube.com/watch?v=utHZCYF6FwM', label: 'YouTube video' },
      { source: 'suno', url: 'https://suno.com/song/66a52b97-a1df-41ca-9fc7-978f31ffdd05', label: 'Earlier Suno version 1' },
      { source: 'suno', url: 'https://suno.com/song/1213e903-cde2-4068-b31e-02f1db506876', label: 'Earlier Suno version 2' },
    ],
  },
  {
    title: "The One Who Can't Be Loved",
    style: 'Sultry indie disco',
    length: '4:29',
    original: "Alex Merced - The One Who Can't Be Loved",
    url: 'https://www.youtube.com/watch?v=MusdQT-AKLU',
    links: [
      { source: 'suno', url: 'https://suno.com/song/3a5cd5ae-4850-4499-8744-31a13e044f92', label: 'Suno album · version 1' },
      { source: 'suno', url: 'https://suno.com/song/72d25928-f623-416c-90d8-d884b64cf490', label: 'Suno album · version 2' },
      { source: 'youtube', url: 'https://www.youtube.com/watch?v=MusdQT-AKLU', label: 'YouTube video' },
      { source: 'suno', url: 'https://suno.com/song/ca20d84d-4323-4dbc-b666-862148903723', label: 'Earlier Suno version 1' },
      { source: 'suno', url: 'https://suno.com/song/728e8b4b-2d5d-4107-b713-cadb1956e272', label: 'Earlier Suno version 2' },
    ],
  },
  {
    title: 'Try to Forget You',
    style: 'Sultry indie disco',
    length: '3:25',
    original: 'NEW SONG Alex Merced - Try to Forget You',
    url: 'https://www.youtube.com/watch?v=n_BbyWoAvFc',
    links: [
      { source: 'suno', url: 'https://suno.com/song/deec15ec-7027-40cb-bf8a-6099228926c9', label: 'Suno album · version 1' },
      { source: 'suno', url: 'https://suno.com/song/068b09e0-96a4-4a82-bf3d-103579de2c9e', label: 'Suno album · version 2' },
      { source: 'youtube', url: 'https://www.youtube.com/watch?v=n_BbyWoAvFc', label: 'YouTube video' },
      { source: 'suno', url: 'https://suno.com/song/bf001c90-0d07-4d82-9eb4-6eeb711a13fd', label: 'Earlier Suno version 1' },
      { source: 'suno', url: 'https://suno.com/song/60e7d648-c733-4114-9125-ba373f8a87c8', label: 'Earlier Suno version 2' },
    ],
  },
  {
    title: 'Tell My Heart',
    style: 'AI voice cover',
    original: 'Alex Merced - Tell my heart',
    url: 'https://suno.com/song/372a2bdc-0860-4ba7-877a-673219208e79',
    links: [
      { source: 'suno', url: 'https://suno.com/song/409912b2-70d9-4a1f-bec3-520932801850', label: 'Suno album · version 1' },
      { source: 'suno', url: 'https://suno.com/song/2d5aa11b-cbe2-4f30-a6c2-3edc25261b0a', label: 'Suno album · version 2' },
      { source: 'suno', url: 'https://suno.com/song/372a2bdc-0860-4ba7-877a-673219208e79', label: 'Earlier Suno version' },
    ],
  },
  {
    title: 'Pain', style: 'AI voice cover', original: 'Alex Merced - Pain',
    url: 'https://suno.com/song/3442afe7-2b46-45eb-b654-80749980cf01',
    links: [
      { source: 'suno', url: 'https://suno.com/song/3442afe7-2b46-45eb-b654-80749980cf01', label: 'Suno album · version 1' },
      { source: 'suno', url: 'https://suno.com/song/6c2f7a35-2096-4883-9ac5-43463d00d15a', label: 'Suno album · version 2' },
    ],
  },
  {
    title: 'Heart to Give You', style: 'AI voice cover', original: 'Alex Merced - Heart to Give You',
    url: 'https://suno.com/song/f9e7c094-5ce0-4b64-bd8e-2827f73035bc',
    links: [
      { source: 'suno', url: 'https://suno.com/song/f9e7c094-5ce0-4b64-bd8e-2827f73035bc', label: 'Suno album · version 1' },
      { source: 'suno', url: 'https://suno.com/song/dbbf916b-7366-4db0-b940-9982bcef93c8', label: 'Suno album · version 2' },
    ],
  },
  {
    title: "I've Only Seen Your Eyes", style: 'AI voice cover', original: "I've Only Seen Your Eyes",
    url: 'https://suno.com/song/1109875a-5a0f-406a-a87f-12fe391aaa6b',
    links: [
      { source: 'suno', url: 'https://suno.com/song/1109875a-5a0f-406a-a87f-12fe391aaa6b', label: 'Suno album 2 · version 1' },
      { source: 'suno', url: 'https://suno.com/song/a2f73943-420c-409a-aa8f-59f2c585ef4b', label: 'Suno album 2 · version 2' },
    ],
  },
  {
    title: 'To Say These Words', style: 'AI voice cover', original: 'To Say These Words',
    url: 'https://suno.com/song/4a5d4791-920b-46b6-9b90-65e95c233f7d',
    links: [
      { source: 'suno', url: 'https://suno.com/song/4a5d4791-920b-46b6-9b90-65e95c233f7d', label: 'Suno album 2 · version 1' },
      { source: 'suno', url: 'https://suno.com/song/443f7730-203d-4135-b48b-e266fa724703', label: 'Suno album 2 · version 2' },
    ],
  },
  {
    title: 'Sadistic Affirmation', style: 'AI voice cover', original: 'Sadistic Affirmation',
    url: 'https://suno.com/song/c2bdc8a1-472e-4f41-ba6a-7e151e31fa2c',
    links: [
      { source: 'suno', url: 'https://suno.com/song/c2bdc8a1-472e-4f41-ba6a-7e151e31fa2c', label: 'Suno album 2 · version 1' },
      { source: 'suno', url: 'https://suno.com/song/8c5711d7-c288-4486-9836-e97f7a9e1caf', label: 'Suno album 2 · version 2' },
    ],
  },
  {
    title: "But You're Still Sleeping", style: 'AI voice cover', original: 'But your Still Sleeping',
    url: 'https://suno.com/song/1fd34236-3e16-419b-85a5-25fba9cc5738',
    links: [
      { source: 'suno', url: 'https://suno.com/song/1fd34236-3e16-419b-85a5-25fba9cc5738', label: 'Suno album 2 · version 1' },
      { source: 'suno', url: 'https://suno.com/song/b750ac29-a759-4df8-b03e-6265c19b5642', label: 'Suno album 2 · version 2' },
    ],
  },
  {
    title: 'The Most Beautiful Sin', style: 'AI voice cover', original: 'The Most Beautiful Sin',
    url: 'https://suno.com/song/6a3b9a2b-c0e9-4c3a-8f43-66fd65a375ce',
    links: [
      { source: 'suno', url: 'https://suno.com/song/6a3b9a2b-c0e9-4c3a-8f43-66fd65a375ce', label: 'Suno album 2 · version 1' },
      { source: 'suno', url: 'https://suno.com/song/985fc206-3764-40a3-846d-1cc680c151fa', label: 'Suno album 2 · version 2' },
    ],
  },
  {
    title: 'Your Fairy Tale', style: 'AI voice cover', original: 'Your Fairy Tale',
    url: 'https://suno.com/song/54537158-00d1-4220-8264-a18a7a768cef',
    links: [
      { source: 'suno', url: 'https://suno.com/song/54537158-00d1-4220-8264-a18a7a768cef', label: 'Suno album 2 · version 1' },
      { source: 'suno', url: 'https://suno.com/song/116829ad-8a77-4820-a3f0-f3b2bed5d583', label: 'Suno album 2 · version 2' },
    ],
  },
  {
    title: 'Your Smile', style: 'AI voice cover', original: 'Your Smile',
    url: 'https://suno.com/song/5d2263c5-8b89-4261-93ff-4a60e2819eae',
    links: [
      { source: 'suno', url: 'https://suno.com/song/5d2263c5-8b89-4261-93ff-4a60e2819eae', label: 'Suno album 2 · version 1' },
      { source: 'suno', url: 'https://suno.com/song/6bb97a2f-75cc-437d-895e-38e38d2f604f', label: 'Suno album 2 · version 2' },
    ],
  },
  {
    title: "Theorist's Lament", style: 'AI voice cover', original: 'Theorist Lament',
    url: 'https://suno.com/song/bbe2a699-67f9-4b69-b45b-b915f8492d71',
    links: [
      { source: 'suno', url: 'https://suno.com/song/bbe2a699-67f9-4b69-b45b-b915f8492d71', label: 'Suno album 2 · version 1' },
      { source: 'suno', url: 'https://suno.com/song/e45203b1-b09b-405f-aa86-064c98c5cce7', label: 'Suno album 2 · version 2' },
    ],
  },
];

export const electronicReimagined: Reimagining[] = [
  ['Sounds of Success', 'Sounds of Success', 'Prog rock', 'electronic', '015ee314-95fc-4707-b744-a8f62da38878', 'f2e93bc1-e6c1-4732-b300-33d86087b771'],
  ['Spilling Guts', 'Spilling Guts', 'Prog rock and IDM', 'electronic', 'fd37bd65-d84f-4c16-8162-ef2a1f66d47c', '8b3003e6-0b74-4676-b7ae-8fd432886690'],
  ['Power Ballad of Power and Frustration', 'Power Ballad Of Love And Frustration', 'Prog rock and IDM', 'electronic', '2d88142b-5111-4990-808d-d20c56ffea10', '4ea3c3e1-cad0-4c47-9803-a5538316eb60'],
  ['A Beautiful Dying Radio', 'Alex Merced - A Beautiful Dying Radio', 'IDM and prog rock', 'acoustic', 'b6282ba9-31b6-4f9c-b754-c30029f3fb4b', '99febc88-3acd-4319-bf64-c2fb3b05b185'],
  ['Warm Night Warm Piano', 'Warm Night Warm Piano', 'IDM and prog rock', 'electronic', '43cc3561-f368-4519-9068-1d4c16b0d8ab', 'c2333bdb-b8c3-49f0-a7d2-c980087a1f02'],
  ['The Best of Me', 'The Best Of Me', 'IDM and prog rock', 'electronic', '644e8403-0a00-4e4d-bd27-9f57f5a4f8fb', '07a5b30a-c9a8-48f8-a744-c13011f751c0'],
  ['Sweet Melody of Love', 'Sweet Melody of Love', 'IDM and prog rock', 'electronic', 'efc5d442-0aac-4f66-86a4-9d9808f572ae', 'cfdd40a1-12bb-4856-971b-8964beb8bdec'],
  ['Video Game Lullaby', 'Video Game Lullaby', 'IDM and prog rock', 'electronic', 'e2f57365-f03e-4548-a310-14cac5375197', 'cb89e318-6743-47c4-af41-37d601570142'],
  ['Figure it Out Again', 'Figure it Out Again', 'IDM and prog rock', 'electronic', '6a4c47b9-8850-4882-8bfd-67b513641a73', 'aaa096c3-3019-4ec7-bdee-2fd7dabbfe7a'],
  ["The Games I've Played", "The Games I've Played", 'IDM and prog rock', 'electronic', 'bd241ff6-dbc9-461d-8efd-c5df3c7e8a23', 'b4a42754-a670-479f-a333-99f21aa92a59'],
  ['Your Heart Give To', 'You Heart Give To', 'IDM and prog rock', 'electronic', '915ba909-c535-45ea-836e-315e2725752d', 'a8c54445-e618-481a-8ed0-24242ce62a7b'],
].map(([title, original, style, originalEra, versionOne, versionTwo]) => ({
  title,
  original,
  originalEra: originalEra as Era,
  style,
  url: `https://suno.com/song/${versionOne}`,
  links: [
    { source: 'suno', url: `https://suno.com/song/${versionOne}`, label: 'Electronic album · version 1' },
    { source: 'suno', url: `https://suno.com/song/${versionTwo}`, label: 'Electronic album · version 2' },
  ],
}));

export const allReimagined: Reimagining[] = [...reimagined, ...electronicReimagined];

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

const canonicalElectronicAlbumOriginals: Record<string, string> = {
  [normaliseTitle('Sounds of Success')]: '4b862000-d1b2-4920-8452-a4a8280f4cfc',
  [normaliseTitle('Spilling Guts')]: '4d2a7d46-2201-4388-9dfc-4c4e336c67b6',
  [normaliseTitle('Power Ballad Of Love And Frustration')]: 'aeba627b-3f20-4123-bff4-e75e23aabbeb',
  [normaliseTitle('Warm Night Warm Piano')]: '3ab82692-ffdd-43d6-b9e2-465a4cece424',
  [normaliseTitle('The Best Of Me')]: 'b671ffc8-7d08-4097-99b1-a0ea92c6fe05',
  [normaliseTitle('Sweet Melody of Love')]: 'c9f710d4-7bf2-40fb-8095-e6e195e97e58',
  [normaliseTitle('Video Game Lullaby')]: '605fa215-2965-4321-bb93-f7f4c200634b',
  [normaliseTitle('Figure it Out Again')]: '6b55ddbe-e572-4678-8d94-b021967ac224',
  [normaliseTitle("The Games I've Played")]: '593144f0-0ad0-44b5-837b-0032c74ad4e7',
  [normaliseTitle('You Heart Give To')]: 'd342cdd6-37f3-4dcd-9214-cb495ee1d952',
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
  const sunoId = canonicalElectronicAlbumOriginals[normaliseTitle(track.title)];
  const links = [
    { source: primarySource, url: track.url },
    ...(additionalLinks[normaliseTitle(track.title)] ?? []),
    ...(sunoId ? [{ source: 'suno' as const, url: `https://suno.com/song/${sunoId}`, label: 'Suno album original' }] : []),
  ];
  return { ...track, sources: sunoId ? [...new Set([...track.sources, 'suno' as const])] : track.sources, links };
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
export const sunoSongs: Track[] = sunoSongsData as Track[];
export const sunoCovers: Track[] = sunoCoversData as Track[];

export const sunoStyle = 'glitch hop, indie prog, AI-voice covers and experimental generated songs';

/** Published Suno generations, including alternate generations of rebuilt songs. */
export const sunoCoverGenerationCount = allReimagined.reduce(
  (total, song) => total + (song.links?.filter((link) => link.source === 'suno').length ?? 0),
  0,
);
export const sunoCanonicalOriginalCount = Object.keys(canonicalAcousticAlbumOriginals).length
  + Object.keys(featuredArchiveAlbumOriginals).length
  + Object.keys(canonicalElectronicAlbumOriginals).length;
export const sunoPublishedCount = sunoSongs.length + sunoCoverGenerationCount + sunoCanonicalOriginalCount;

// ---------------------------------------------------------------- where

export type Platform = {
  label: string;
  url: string;
  era: Era | 'all';
  note: string;
  /** Numbers the platform itself reports. */
  stat?: string;
};

export type DistributedRelease = {
  title: string;
  released: string;
  trackCount: number;
  upc?: string;
  links: { label: string; url: string }[];
};

/** Exact release pages verified against titles, track lists and distributor UPCs. */
export const distributedReleases: DistributedRelease[] = [
  {
    title: 'Tell My Heart (Actual Original Acoustic Version)',
    released: '2026-10-02',
    trackCount: 1,
    links: [
      { label: 'Spotify', url: 'https://open.spotify.com/album/7kdOTWCYo9EZnlik3QDD57' },
      { label: 'YouTube Music', url: 'https://music.youtube.com/watch?v=pDmSZKG4itU' },
      { label: 'TIDAL', url: 'https://listen.tidal.com/track/566583985' },
    ],
  },
  {
    title: 'The Raw Acoustic Recordings (Original Version)',
    released: '2026-09-30',
    trackCount: 7,
    upc: '700573076852',
    links: [
      { label: 'Spotify', url: 'https://open.spotify.com/album/0oJ6FJpxIxAnloqVmXlx9w' },
      { label: 'YouTube Music', url: 'https://music.youtube.com/playlist?list=OLAK5uy_nWx8xLMXSNa5mrlYptx-TzYH5y8YvGyJ8' },
      { label: 'Amazon Music', url: 'https://music.amazon.com/albums/B0HLN2Z1PD' },
      { label: 'TIDAL', url: 'https://listen.tidal.com/album/565928928' },
      { label: 'Deezer', url: 'https://www.deezer.com/album/1110461172' },
      { label: 'iHeart', url: 'https://www.iheart.com/artist/alex-merced-31814384/albums/the-raw-acoustic-recordings-436670233' },
      { label: 'Boomplay', url: 'https://www.boomplay.com/albums/141517583' },
    ],
  },
  {
    title: 'Songs for your Consideration',
    released: '2026-09-30',
    trackCount: 20,
    upc: '700573079013',
    links: [
      { label: 'Spotify', url: 'https://open.spotify.com/album/4YuwQtNCMflHJ15RQxWPo8' },
      { label: 'YouTube Music', url: 'https://music.youtube.com/playlist?list=OLAK5uy_mWY0snZ7kb7L6lM8jvs15IeNysJU7lPNM' },
      { label: 'Amazon Music', url: 'https://music.amazon.com/albums/B0HLMK67FF' },
      { label: 'TIDAL', url: 'https://listen.tidal.com/album/565929310' },
      { label: 'Deezer', url: 'https://www.deezer.com/album/1110461642' },
      { label: 'iHeart', url: 'https://www.iheart.com/artist/alex-merced-31814384/albums/songs-for-your-consideration-436670315' },
      { label: 'Boomplay', url: 'https://www.boomplay.com/albums/141517646' },
    ],
  },
];

export const platforms: Platform[] = [
  {
    label: 'Spotify, Alex Merced',
    url: 'https://open.spotify.com/artist/7saFKAusZMQg0PnHcO8zm6',
    era: 'all',
    note: 'The official Alex Merced artist profile for current releases on Spotify.',
  },
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
    note: 'Three featured Suno albums hold 29 acoustic and electronic originals beside two new reimaginings of each. Seven earlier YouTube rebuilds remain available.',
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
    note: `The current generated catalog: ${sunoSongs.length} newer songs and ${sunoCoverGenerationCount} published generations of ${allReimagined.length} acoustic and electronic reimaginings.`,
    stat: `${sunoPublishedCount} songs`,
  },
  {
    label: 'Instagram',
    url: 'https://www.instagram.com/alexmercedmusic',
    era: 'all',
    note: 'Occasional clips and works in progress.',
  },
];

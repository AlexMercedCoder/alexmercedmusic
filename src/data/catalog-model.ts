import {
  acousticTracks,
  allReimagined,
  albums,
  distributedReleases,
  electronicRuntime,
  electronicStats,
  electronicTracks,
  platforms,
  featuredReimaginingAlbums,
  sunoCovers,
  sunoAlbums,
  sunoPublishedCount,
  sunoSongs,
  sunoPlaylists,
  sunoStyle,
  youtubeMetadata,
  type Era,
  type TrackLink,
} from './catalog';
import { sunoPromptingGuide } from './suno-prompting-guide';
import { musicTheoryGuide } from './music-theory-guide';

export const SITE = 'https://alexmercedmusic.com';
export const CATALOG_SCHEMA_VERSION = '1.13.0';
export const CATALOG_UPDATED_AT = '2026-10-09';

export type SongKind = 'archive' | 'electronic' | 'reimagined' | 'generated';

export type CatalogLink = TrackLink & {
  label: string;
  versionRole: 'recording' | 'generation';
};

export type CatalogSong = {
  id: string;
  slug: string;
  title: string;
  era: Era;
  kind: SongKind;
  pageUrl: string;
  description: string;
  links: CatalogLink[];
  length?: string;
  seconds?: number;
  posted?: string;
  album?: string;
  albumId?: string;
  albumPageUrl?: string;
  style?: string;
  createdAt?: string;
  durationSeconds?: number;
  catalogedAt: string;
  genres?: string[];
  imageUrl?: string;
  imageLargeUrl?: string;
  embedUrl?: string;
  model?: string;
  lyrics?: string;
  creationMethod: string;
  originalTrackId?: string;
  originalPageUrl?: string;
  reimaginedTrackIds?: string[];
  reimaginedPageUrls?: string[];
  videoIds: string[];
  relatedVideoIds: string[];
};

export type CatalogVideo = {
  id: string;
  youtubeId: string;
  title: string;
  pageUrl: string;
  watchUrl: string;
  embedUrl: string;
  imageUrl: string;
  publishedAt: string;
  durationSeconds?: number;
  channelPosition: number;
  songIds: string[];
  relatedSongIds: string[];
};

export type CatalogAlbum = {
  id: string;
  slug: string;
  title: string;
  pageUrl: string;
  sourceUrl: string;
  released: string;
  trackIds: string[];
};

export const slugify = (value: string) => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '') || 'untitled';

const hash = (value: string) => {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(36);
};

const sourceLabel: Record<TrackLink['source'], string> = {
  youtube: 'YouTube',
  soundcloud: 'SoundCloud',
  'soundcloud-albums': 'SoundCloud album',
  reverbnation: 'ReverbNation',
  suno: 'Suno',
};

const sourceFromUrl = (url: string): TrackLink['source'] => {
  if (url.includes('youtube.com')) return 'youtube';
  if (url.includes('suno.com')) return 'suno';
  if (url.includes('reverbnation.com')) return 'reverbnation';
  return 'soundcloud';
};

const linksFor = (
  links: TrackLink[] | undefined,
  fallback: string | undefined,
  versionRole: CatalogLink['versionRole'],
): CatalogLink[] => {
  const sourceLinks = links?.length
    ? links
    : fallback
      ? [{ source: sourceFromUrl(fallback), url: fallback }]
      : [];
  const seen = new Set<string>();
  return sourceLinks
    .filter((link) => {
      if (seen.has(link.url)) return false;
      seen.add(link.url);
      return true;
    })
    .map((link) => ({
      ...link,
      label: link.label ?? sourceLabel[link.source],
      versionRole,
    }));
};

type SongSeed = Omit<CatalogSong, 'id' | 'slug' | 'pageUrl' | 'originalTrackId' | 'originalPageUrl' | 'reimaginedTrackIds' | 'reimaginedPageUrls' | 'videoIds' | 'relatedVideoIds'> & {
  key: string;
  originalTitle?: string;
  originalEra?: Era;
};

type DerivedSeed = SongSeed & {
  id: string;
  slug: string;
  pageUrl: string;
  originalTrackId?: string;
  originalPageUrl?: string;
};

const albumSlugs = new Map(albums.map((album) => [album.title, slugify(album.title)]));
const youtubeId = (url?: string) => url ? new URL(url).searchParams.get('v') ?? undefined : undefined;
const youtubeDetails = (url?: string) => {
  const id = youtubeId(url);
  return id ? youtubeMetadata[id] : undefined;
};
const youtubeDetailsFromLinks = (links?: TrackLink[]) => youtubeDetails(links?.find((link) => link.source === 'youtube')?.url);
const sunoCoverByUrl = new Map(sunoCovers.map((track) => [track.url, track]));
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(value)) : undefined;
const sunoDescription = (track: (typeof sunoSongs)[number]) => {
  const genre = track.genres?.[0] ? ` blending ${track.genres[0]}` : '';
  const published = track.createdAt ? `, published ${formatDate(track.createdAt)}` : '';
  const suffix = '. Hear it and view its verified details.';
  const detailed = `${track.title} is a Suno song by Alex Merced${genre}${published}${suffix}`;
  return detailed.length <= 160
    ? detailed
    : `${track.title} is a Suno song by Alex Merced${genre}${suffix}`;
};

const seeds: SongSeed[] = [
  ...acousticTracks.map((track) => {
    const source = youtubeDetails(track.url);
    return ({
    key: track.url ?? track.title,
    title: track.title,
    era: 'acoustic' as const,
    kind: 'archive' as const,
    description: `${track.title} is an acoustic archive recording by Alex Merced${source?.publishedAt ? `, published ${formatDate(source.publishedAt)}` : ''}. Hear the verified source and any known reimagining.`,
    links: linksFor(track.links, track.url, 'recording'),
    length: track.length,
    posted: track.posted,
    createdAt: source?.publishedAt,
    catalogedAt: CATALOG_UPDATED_AT,
    imageUrl: source?.imageUrl,
    creationMethod: 'Written and performed by Alex Merced; preserved as an acoustic archive recording.',
  }); }),
  ...electronicTracks.map((track) => {
    const source = youtubeDetailsFromLinks(track.links);
    return ({
    key: track.url,
    title: track.title,
    era: 'electronic' as const,
    kind: 'electronic' as const,
    description: `${track.title} is an electronic track produced by Alex Merced${track.album ? ` for ${track.album}` : ''}. Hear it from every verified source.`,
    links: linksFor(track.links, track.url, 'recording'),
    seconds: track.seconds,
    album: track.album,
    albumId: track.album ? `album:${albumSlugs.get(track.album)}` : undefined,
    albumPageUrl: track.album ? `${SITE}/albums/${albumSlugs.get(track.album)}/` : undefined,
    createdAt: source?.publishedAt,
    catalogedAt: CATALOG_UPDATED_AT,
    imageUrl: source?.imageUrl,
    creationMethod: 'Produced by Alex Merced in FL Studio.',
  }); }),
  ...allReimagined.map((track) => {
    const latestSunoLink = [...(track.links ?? [])].reverse().find((link) => link.label?.startsWith('Suno album'))
      ?? [...(track.links ?? [])].reverse().find((link) => link.source === 'suno');
    const source = latestSunoLink ? sunoCoverByUrl.get(latestSunoLink.url) : undefined;
    return ({
    key: track.url ?? track.title,
    title: track.title,
    era: 'ai' as const,
    kind: 'reimagined' as const,
    description: `${track.title} reimagines an earlier Alex Merced recording as ${track.style.toLowerCase()}. Compare the original and verified rebuilt versions.`,
    links: linksFor(track.links, track.url, 'generation'),
    length: track.length,
    style: track.style,
    originalTitle: track.original,
    originalEra: track.originalEra ?? 'acoustic',
    createdAt: source?.createdAt,
    catalogedAt: CATALOG_UPDATED_AT,
    durationSeconds: source?.durationSeconds,
    genres: source?.genres,
    imageUrl: source?.imageUrl,
    imageLargeUrl: source?.imageLargeUrl,
    embedUrl: source?.embedUrl,
    model: source?.model,
    lyrics: source?.lyrics,
    creationMethod: `An earlier Alex Merced composition rebuilt with Suno as ${track.style.toLowerCase()}; the page keeps the source recording and generated arrangements together.`,
  }); }),
  ...sunoSongs.map((track) => ({
    key: track.url ?? track.title,
    title: track.title,
    era: 'ai' as const,
    kind: 'generated' as const,
    description: sunoDescription(track),
    links: linksFor(track.links, track.url, 'generation'),
    length: track.length,
    posted: track.posted,
    createdAt: track.createdAt,
    catalogedAt: CATALOG_UPDATED_AT,
    durationSeconds: track.durationSeconds,
    genres: track.genres,
    imageUrl: track.imageUrl,
    imageLargeUrl: track.imageLargeUrl,
    embedUrl: track.embedUrl,
    model: track.model,
    lyrics: track.lyrics,
    creationMethod: 'Created by Alex Merced with Suno; style tags, runtime, artwork, model version and lyrics are sourced from the public Suno recording metadata.',
  })),
];

const slugCounts = new Map<string, number>();
for (const seed of seeds) slugCounts.set(slugify(seed.title), (slugCounts.get(slugify(seed.title)) ?? 0) + 1);

const provisional: DerivedSeed[] = seeds.map((seed) => {
  const base = slugify(seed.title);
  const slug = slugCounts.get(base) === 1 ? base : `${base}-${seed.kind}-${hash(seed.key).slice(0, 6)}`;
  const id = `song:${seed.kind}:${hash(seed.key)}`;
  return { ...seed, id, slug, pageUrl: `${SITE}/songs/${slug}/` };
});

const originalsByEraAndTitle = new Map(provisional
  .filter((song) => song.kind === 'archive' || song.kind === 'electronic')
  .map((song) => [`${song.era}:${song.title}`, song]));

const reimaginedWithOriginals: DerivedSeed[] = provisional.map((song) => {
  if (song.kind !== 'reimagined' || !song.originalTitle) return song;
  const original = originalsByEraAndTitle.get(`${song.originalEra ?? 'acoustic'}:${song.originalTitle}`);
  return {
    ...song,
    originalTrackId: original?.id,
    originalPageUrl: original?.pageUrl,
  };
});

const rebuildsByOriginal = new Map<string, typeof reimaginedWithOriginals>();
for (const song of reimaginedWithOriginals) {
  if (!song.originalTrackId) continue;
  const related = rebuildsByOriginal.get(song.originalTrackId) ?? [];
  related.push(song);
  rebuildsByOriginal.set(song.originalTrackId, related);
}

const baseSongs = reimaginedWithOriginals.map(({ key: _key, originalTitle: _originalTitle, originalEra: _originalEra, ...song }) => {
  const rebuilds = rebuildsByOriginal.get(song.id) ?? [];
  return {
    ...song,
    ...(rebuilds.length ? {
      reimaginedTrackIds: rebuilds.map((item) => item.id),
      reimaginedPageUrls: rebuilds.map((item) => item.pageUrl),
    } : {}),
  };
});

const normalizeVideoTitle = (value: string) => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/^new song\s+/i, '')
  .replace(/^alex merced\s*[-–:]\s*/i, '')
  .replace(/\s*[([][^)\]]*(?:cover|music video|theme song|alexmercedmusic\.com)[^)\]]*[)\]]\s*$/i, '')
  .replace(/\s*[([]\s*(?:official\s+)?(?:ai[- ]generated\s+)?(?:music\s+)?(?:video|song)(?:\s+video)?\s*[)\]]\s*$/i, '')
  .replace(/\s+music video\s*$/i, '')
  .replace(/\s*[-–|:]\s*(?:official\s+)?(?:ai[- ]generated\s+)?(?:music\s+)?(?:video|song)(?:\s+video)?\s*$/i, '')
  .replace(/\b(?:official music video|ai[- ]generated song)\b/gi, '')
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/gi, ' ')
  .trim()
  .toLowerCase();

const videoTitleAliases: Record<string, string[]> = {
  'your open hands': ['open hands'],
  'the lake remembers iceberg': ['the lake remembers'],
  'solumn thoughts': ['solemn thoughts'],
  'try to forget': ['try to forget you'],
  'birthday': ['birthday song'],
  'the open lakehouse': ['the iceberg open lakehouse'],
};

const sourceSongByYoutubeId = new Map(baseSongs.flatMap((song) => song.links
  .filter((link) => link.source === 'youtube')
  .flatMap((link) => {
    const id = youtubeId(link.url);
    return id ? [[id, song] as const] : [];
  })));
const songsByNormalizedTitle = new Map<string, typeof baseSongs>();
for (const song of baseSongs) {
  const title = normalizeVideoTitle(song.title);
  const matches = songsByNormalizedTitle.get(title) ?? [];
  matches.push(song);
  songsByNormalizedTitle.set(title, matches);
}
const relatedSongIdsFor = (songIds: string[]) => {
  const ids = new Set(songIds);
  for (const id of songIds) {
    const song = baseSongs.find((candidate) => candidate.id === id);
    if (!song) continue;
    if (song.originalTrackId) ids.add(song.originalTrackId);
    for (const relatedId of song.reimaginedTrackIds ?? []) ids.add(relatedId);
  }
  return [...ids];
};

export const videos: CatalogVideo[] = Object.entries(youtubeMetadata)
  .filter(([, metadata]) => metadata.channelPosition)
  .map(([id, metadata]) => {
    const sourceSong = sourceSongByYoutubeId.get(id);
    const normalizedTitle = normalizeVideoTitle(metadata.title ?? '');
    const matchTitles = [normalizedTitle, ...(videoTitleAliases[normalizedTitle] ?? [])];
    const titleMatches = matchTitles.flatMap((title) => songsByNormalizedTitle.get(title) ?? []);
    const songIds = [...new Set(sourceSong ? [sourceSong.id] : titleMatches.map((song) => song.id))];
    return {
      id: `video:youtube:${id}`,
      youtubeId: id,
      title: metadata.title ?? id,
      pageUrl: `${SITE}/videos/${id.toLowerCase()}/`,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      imageUrl: metadata.imageUrl ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      publishedAt: metadata.publishedAt,
      durationSeconds: metadata.durationSeconds,
      channelPosition: metadata.channelPosition!,
      songIds,
      relatedSongIds: relatedSongIdsFor(songIds),
    };
  })
  .sort((left, right) => left.channelPosition - right.channelPosition);

export const songs: CatalogSong[] = baseSongs.map((song) => ({
  ...song,
  videoIds: videos.filter((video) => video.songIds.includes(song.id)).map((video) => video.id),
  relatedVideoIds: videos.filter((video) => video.relatedSongIds.includes(song.id)).map((video) => video.id),
}));

export const catalogAlbums: CatalogAlbum[] = albums.map((album) => ({
  id: `album:${slugify(album.title)}`,
  slug: slugify(album.title),
  title: album.title,
  pageUrl: `${SITE}/albums/${slugify(album.title)}/`,
  sourceUrl: album.url,
  released: album.released,
  trackIds: songs
    .filter((song) => song.album === album.title)
    .map((song) => song.id),
}));

export const songById = new Map(songs.map((song) => [song.id, song]));
export const songBySlug = new Map(songs.map((song) => [song.slug, song]));
export const songByPrimaryUrl = new Map(songs.flatMap((song) => song.links.map((link) => [link.url, song] as const)));
export const albumById = new Map(catalogAlbums.map((album) => [album.id, album]));
export const videoById = new Map(videos.map((video) => [video.id, video]));
export const videoByYoutubeId = new Map(videos.map((video) => [video.youtubeId, video]));

export const catalogSunoPlaylists = sunoPlaylists.map(({ tracks: sourceTracks, ...playlist }) => ({
  ...playlist,
  pageUrl: `${SITE}${playlist.pageUrl}`,
  sourceTracks,
  trackIds: playlist.trackIds.flatMap((clipId) => {
    const song = songByPrimaryUrl.get(`https://suno.com/song/${clipId}`);
    return song ? [song.id] : [];
  }),
}));

export const catalogSunoAlbums = sunoAlbums.map(({ tracks: sourceTracks, ...album }) => ({
  ...album,
  pageUrl: `${SITE}${album.pageUrl}`,
  sourceTracks,
  trackIds: album.trackIds.flatMap((clipId) => {
    const song = songByPrimaryUrl.get(`https://suno.com/song/${clipId}`);
    return song ? [song.id] : [];
  }),
}));

export const publicCatalog = {
  schemaVersion: CATALOG_SCHEMA_VERSION,
  updatedAt: CATALOG_UPDATED_AT,
  site: SITE,
  counts: {
    songs: songs.length,
    acoustic: songs.filter((song) => song.era === 'acoustic').length,
    electronic: songs.filter((song) => song.era === 'electronic').length,
    reimagined: songs.filter((song) => song.kind === 'reimagined').length,
    generated: songs.filter((song) => song.kind === 'generated').length,
    albums: catalogAlbums.length,
    sunoPublished: sunoPublishedCount,
    sunoPlaylists: sunoPlaylists.length,
    sunoAlbums: sunoAlbums.length,
    videos: videos.length,
  },
  electronic: { stats: electronicStats, runtime: electronicRuntime },
  suno: {
    style: sunoStyle,
    publishedCount: sunoPublishedCount,
    featuredReimaginingAlbums,
    albums: catalogSunoAlbums,
    playlists: catalogSunoPlaylists,
  },
  guides: { sunoPrompting: sunoPromptingGuide, musicTheory: musicTheoryGuide },
  songs,
  videos,
  albums: catalogAlbums,
  distributedReleases,
  platforms,
};

/**
 * Search handling for video pages (P4.9). A video page is a thin view of a song
 * record, so it canonicalizes to the song page when the match is unambiguous:
 * the song lists this exact YouTube video as a source, or the title matches
 * exactly one song. Videos with no song, or with several equally good matches,
 * stay on the site as noindex pages and leave the sitemap.
 */
export const videoCanonicalSong = (video: CatalogVideo): CatalogSong | undefined => {
  const direct = video.songIds.flatMap((id) => songById.get(id) ?? []);
  const source = direct.find((song) => song.links.some((link) => link.url.includes(`v=${video.youtubeId}`)));
  if (source) return source;
  return direct.length === 1 ? direct[0] : undefined;
};

/**
 * How much a song page offers beyond a listing row, used for sitemap priority.
 * Counts only fields that carry real content: lyrics, an on-page player, a video,
 * artwork, album context, style tags, and links to other versions.
 */
export const songRichness = (song: CatalogSong): number => [
  Boolean(song.lyrics && song.lyrics.trim().length > 80),
  Boolean(song.embedUrl || song.links.some((link) => link.source === 'youtube' || link.source.startsWith('soundcloud'))),
  song.videoIds.length > 0,
  Boolean(song.imageUrl || song.imageLargeUrl),
  Boolean(song.album),
  Boolean(song.genres?.length),
  Boolean(song.originalTrackId || song.reimaginedTrackIds?.length),
  song.links.length > 1,
].filter(Boolean).length;

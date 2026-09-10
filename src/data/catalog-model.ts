import {
  acousticTracks,
  albums,
  electronicRuntime,
  electronicStats,
  electronicTracks,
  platforms,
  reimagined,
  sunoPublishedCount,
  sunoSongs,
  sunoStyle,
  type Era,
  type TrackLink,
} from './catalog';

export const SITE = 'https://alexmercedmusic.com';
export const CATALOG_SCHEMA_VERSION = '1.0.0';
export const CATALOG_UPDATED_AT = '2026-09-10';

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
  originalTrackId?: string;
  originalPageUrl?: string;
  reimaginedTrackIds?: string[];
  reimaginedPageUrls?: string[];
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

type SongSeed = Omit<CatalogSong, 'id' | 'slug' | 'pageUrl' | 'originalTrackId' | 'originalPageUrl' | 'reimaginedTrackIds' | 'reimaginedPageUrls'> & {
  key: string;
  originalTitle?: string;
};

type DerivedSeed = SongSeed & {
  id: string;
  slug: string;
  pageUrl: string;
  originalTrackId?: string;
  originalPageUrl?: string;
};

const albumSlugs = new Map(albums.map((album) => [album.title, slugify(album.title)]));

const seeds: SongSeed[] = [
  ...acousticTracks.map((track) => ({
    key: track.url ?? track.title,
    title: track.title,
    era: 'acoustic' as const,
    kind: 'archive' as const,
    description: `${track.title} is an acoustic archive recording written and performed by Alex Merced. This page collects its verified listening source and any known later reimagining.`,
    links: linksFor(track.links, track.url, 'recording'),
    length: track.length,
    posted: track.posted,
  })),
  ...electronicTracks.map((track) => ({
    key: track.url,
    title: track.title,
    era: 'electronic' as const,
    kind: 'electronic' as const,
    description: `${track.title} is an electronic track produced by Alex Merced${track.album ? ` and collected on ${track.album}` : ''}. This page brings together every verified place to hear it.`,
    links: linksFor(track.links, track.url, 'recording'),
    seconds: track.seconds,
    album: track.album,
    albumId: track.album ? `album:${albumSlugs.get(track.album)}` : undefined,
    albumPageUrl: track.album ? `${SITE}/albums/${albumSlugs.get(track.album)}/` : undefined,
  })),
  ...reimagined.map((track) => ({
    key: track.url ?? track.title,
    title: track.title,
    era: 'ai' as const,
    kind: 'reimagined' as const,
    description: `${track.title} reimagines an earlier Alex Merced recording as ${track.style.toLowerCase()}. The original and every verified rebuilt version are linked together here.`,
    links: linksFor(track.links, track.url, 'generation'),
    length: track.length,
    style: track.style,
    originalTitle: track.original,
  })),
  ...sunoSongs.map((track) => ({
    key: track.url ?? track.title,
    title: track.title,
    era: 'ai' as const,
    kind: 'generated' as const,
    description: `${track.title} is a newer song created by Alex Merced with Suno. This page links directly to the published generation.`,
    links: linksFor(track.links, track.url, 'generation'),
    length: track.length,
    posted: track.posted,
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

const acousticByTitle = new Map(provisional
  .filter((song) => song.kind === 'archive')
  .map((song) => [song.title, song]));

const reimaginedWithOriginals: DerivedSeed[] = provisional.map((song) => {
  if (song.kind !== 'reimagined' || !song.originalTitle) return song;
  const original = acousticByTitle.get(song.originalTitle);
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

export const songs: CatalogSong[] = reimaginedWithOriginals.map(({ key: _key, originalTitle: _originalTitle, ...song }) => {
  const rebuilds = rebuildsByOriginal.get(song.id) ?? [];
  return {
    ...song,
    ...(rebuilds.length ? {
      reimaginedTrackIds: rebuilds.map((item) => item.id),
      reimaginedPageUrls: rebuilds.map((item) => item.pageUrl),
    } : {}),
  };
});

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
  },
  electronic: { stats: electronicStats, runtime: electronicRuntime },
  suno: { style: sunoStyle, publishedCount: sunoPublishedCount },
  songs,
  albums: catalogAlbums,
  platforms,
};

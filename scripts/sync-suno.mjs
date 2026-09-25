import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const outputUrl = new URL('src/data/suno-songs.json', root);
const coversOutputUrl = new URL('src/data/suno-covers.json', root);
const playlistsOutputUrl = new URL('src/data/suno-playlists.json', root);
const playlistRegistryUrl = new URL('src/data/suno-playlist-registry.json', root);
const catalogUrl = new URL('src/data/catalog.ts', root);
const catalogModelUrl = new URL('src/data/catalog-model.ts', root);
const astroConfigUrl = new URL('astro.config.mjs', root);
const endpoint = 'https://studio-api.prod.suno.com/api/profiles/alexmerced';
const shouldWrite = process.argv.includes('--write');
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const fetchPage = async (url, label, { allowNotFound = false } = {}) => {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(url, { headers: { 'user-agent': 'AlexMercedMusic catalog sync/1.0 (+https://alexmercedmusic.com)' } });
    if (response.ok || (allowNotFound && response.status === 404)) return response;
    if (response.status !== 429 || attempt === 5) throw new Error(`Suno ${label} failed with HTTP ${response.status}.`);
    const retryAfterSeconds = Number(response.headers.get('retry-after'));
    const delay = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
      ? retryAfterSeconds * 1000
      : 2000 * (2 ** attempt);
    console.warn(`Suno ${label} was rate limited; retrying in ${Math.ceil(delay / 1000)} seconds.`);
    await wait(delay);
  }
};

const catalogSource = await readFile(catalogUrl, 'utf8');
let registeredPlaylistIds = [];
let currentPlaylistRegistry = '';
try {
  currentPlaylistRegistry = await readFile(playlistRegistryUrl, 'utf8');
  registeredPlaylistIds = JSON.parse(currentPlaylistRegistry);
} catch {}
if (!Array.isArray(registeredPlaylistIds) || registeredPlaylistIds.some((id) => typeof id !== 'string')) {
  throw new Error('Suno playlist registry must be an array of playlist ID strings.');
}
const reimaginedSection = catalogSource.split('// ---------------------------------------------------------------- reimagined')[1]
  ?.split('// ---------------------------------------------------------------- electronic')[0] ?? '';
const coverIds = new Set([...reimaginedSection.matchAll(/suno\.com\/song\/([a-f0-9-]{36})/g)].map((match) => match[1]));

const pages = [];
let profilePlaylists = [];
let page = 1;
let total = Infinity;
while (pages.flat().length < total && page <= 100) {
  const url = new URL(endpoint);
  url.searchParams.set('page', String(page));
  url.searchParams.set('playlists_sort_by', 'created_at');
  url.searchParams.set('clips_sort_by', 'created_at');
  const response = await fetchPage(url, `profile page ${page}`);
  const data = await response.json();
  if (data.handle !== 'alexmerced') throw new Error(`Unexpected Suno profile: ${data.handle ?? 'missing handle'}.`);
  total = Number(data.num_total_clips);
  if (page === 1) profilePlaylists = Array.isArray(data.playlists) ? data.playlists : [];
  if (!Array.isArray(data.clips) || data.clips.length === 0) break;
  pages.push(data.clips);
  page += 1;
  await wait(300);
}

const allClips = pages.flat();
if (allClips.length !== total) throw new Error(`Expected ${total} Suno clips but received ${allClips.length}.`);

const cleanGenres = (value) => String(value ?? '')
  .split(',')
  .map((genre) => genre.trim())
  .filter(Boolean)
  .slice(0, 8);

const looksLikeLyrics = (value) => typeof value === 'string'
  && value.length >= 80
  && /\[(verse|chorus|intro|outro|bridge|pre-chorus|hook|refrain)/i.test(value);

const toSong = (clip) => ({
    id: clip.id,
    title: clip.title.trim(),
    url: `https://suno.com/song/${clip.id}`,
    createdAt: clip.created_at,
    durationSeconds: Number(clip.metadata?.duration ?? 0) || undefined,
    genres: cleanGenres(clip.display_tags || clip.metadata?.tags),
    imageUrl: clip.image_url || undefined,
    imageLargeUrl: clip.image_large_url || undefined,
    embedUrl: `https://suno.com/embed/${clip.id}`,
    model: clip.major_model_version || undefined,
    lyrics: looksLikeLyrics(clip.metadata?.prompt) ? clip.metadata.prompt.trim() : undefined,
  });
const toPlaylistTrack = (clip) => ({
  id: clip.id,
  title: clip.title.trim(),
  url: `https://suno.com/song/${clip.id}`,
  createdAt: clip.created_at,
  durationSeconds: Number(clip.metadata?.duration ?? 0) || undefined,
  imageUrl: clip.image_url || undefined,
});

const publicClips = allClips.filter((clip) => clip.is_public && !clip.is_trashed && clip.title);
const songs = publicClips
  .filter((clip) => !coverIds.has(clip.id))
  .map(toSong)
  .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
const coverSongs = publicClips
  .filter((clip) => coverIds.has(clip.id))
  .map(toSong)
  .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
const profilePlaylistIds = profilePlaylists
  .map((playlist) => playlist.id)
  .filter((id) => typeof id === 'string' && id);
const playlistIds = [...new Set([...profilePlaylistIds, ...registeredPlaylistIds])];
const serializedPlaylistRegistry = `${JSON.stringify(playlistIds, null, 2)}\n`;

const playlists = [];
for (const playlistId of playlistIds) {
  const trackIds = [];
  const playlistTracks = [];
  let playlistPage = 1;
  let playlistTotal = Infinity;
  let playlist;
  while (trackIds.length < playlistTotal && playlistPage <= 100) {
    const url = new URL(`https://studio-api.prod.suno.com/api/playlist/${playlistId}/`);
    url.searchParams.set('page', String(playlistPage));
    const response = await fetchPage(url, `playlist ${playlistId} page ${playlistPage}`, { allowNotFound: playlistPage === 1 });
    if (response.status === 404) break;
    const data = await response.json();
    if (playlistPage === 1) {
      if (data.user_handle !== 'alexmerced') throw new Error(`Unexpected owner for Suno playlist ${playlistId}.`);
      if (!data.is_public || data.is_trashed || data.is_hidden || !data.name) break;
      playlist = {
        id: data.id || playlistId,
        name: data.name.trim(),
        url: `https://suno.com/playlist/${data.id || playlistId}`,
        imageUrl: data.image_url || undefined,
        songCount: Number(data.num_total_results ?? data.song_count ?? 0),
        durationSeconds: Number(data.total_duration ?? 0) || undefined,
        description: data.description?.trim() || undefined,
      };
    }
    playlistTotal = Number(data.num_total_results ?? playlistTotal);
    const pageIds = (Array.isArray(data.playlist_clips) ? data.playlist_clips : [])
      .map((item) => item.clip?.id)
      .filter(Boolean);
    playlistTracks.push(...(Array.isArray(data.playlist_clips) ? data.playlist_clips : [])
      .map((item) => item.clip)
      .filter((clip) => clip?.id && clip?.title)
      .map(toPlaylistTrack));
    if (pageIds.length === 0) break;
    trackIds.push(...pageIds);
    playlistPage += 1;
    await wait(300);
  }
  if (!playlist) continue;
  const uniqueTrackIds = [...new Set(trackIds)];
  if (uniqueTrackIds.length !== playlistTotal) {
    throw new Error(`Expected ${playlistTotal} tracks in ${playlist.name} but received ${uniqueTrackIds.length}.`);
  }
  const uniqueTracks = [...new Map(playlistTracks.map((track) => [track.id, track])).values()];
  playlists.push({ ...playlist, songCount: playlistTotal, trackIds: uniqueTrackIds, tracks: uniqueTracks });
}

const ids = new Set(songs.map((song) => song.id));
if (ids.size !== songs.length) throw new Error('Suno returned duplicate public song IDs.');
if (songs.length + coverIds.size !== total) {
  throw new Error(`Expected ${total - coverIds.size} non-cover songs but found ${songs.length}; review the cover classification.`);
}

const serialized = `${JSON.stringify(songs, null, 2)}\n`;
const serializedCovers = `${JSON.stringify(coverSongs, null, 2)}\n`;
const serializedPlaylists = `${JSON.stringify(playlists, null, 2)}\n`;
let current = '';
let currentCovers = '';
let currentPlaylists = '';
try { current = await readFile(outputUrl, 'utf8'); } catch {}
try { currentCovers = await readFile(coversOutputUrl, 'utf8'); } catch {}
try { currentPlaylists = await readFile(playlistsOutputUrl, 'utf8'); } catch {}
const catalogReplacement = 'export const sunoSongs: Track[] = sunoSongsData as Track[];\n\n';
const migratedCatalogSource = catalogSource.includes('export const sunoSongs: Track[] = [')
  ? catalogSource.replace(/export const sunoSongs: Track\[\] = \[[\s\S]*?(?=export const sunoStyle)/, catalogReplacement)
  : catalogSource;

const previous = current ? JSON.parse(current) : [];
const previousIds = new Set(previous.map((song) => song.id));
const added = songs.filter((song) => !previousIds.has(song.id));
const removed = previous.filter((song) => !ids.has(song.id));
const changed = songs.filter((song) => {
  const old = previous.find((candidate) => candidate.id === song.id);
  return old && JSON.stringify(old) !== JSON.stringify(song);
});

console.log(`Suno: ${total} public songs; ${songs.length} catalog songs; ${coverIds.size} cover generations; ${playlists.length} public playlists.`);
console.log(`Diff: ${added.length} added, ${removed.length} removed, ${changed.length} metadata changes.`);
for (const song of added) console.log(`+ ${song.title} (${song.id})`);
for (const song of removed) console.log(`- ${song.title} (${song.id})`);
for (const song of changed.slice(0, 20)) console.log(`~ ${song.title} (${song.id})`);

if (current === serialized && currentCovers === serializedCovers && currentPlaylists === serializedPlaylists && currentPlaylistRegistry === serializedPlaylistRegistry && migratedCatalogSource === catalogSource) process.exit(0);
if (!shouldWrite) {
  console.error('Run npm run sync:suno -- --write to accept this reviewed catalog update.');
  process.exit(1);
}
await writeFile(outputUrl, serialized);
await writeFile(coversOutputUrl, serializedCovers);
await writeFile(playlistsOutputUrl, serializedPlaylists);
await writeFile(playlistRegistryUrl, serializedPlaylistRegistry);
if (migratedCatalogSource !== catalogSource) await writeFile(catalogUrl, migratedCatalogSource);
if (current !== serialized || currentCovers !== serializedCovers || currentPlaylists !== serializedPlaylists || currentPlaylistRegistry !== serializedPlaylistRegistry) {
  const modelSource = await readFile(catalogModelUrl, 'utf8');
  const astroConfigSource = await readFile(astroConfigUrl, 'utf8');
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  await writeFile(catalogModelUrl, modelSource.replace(/CATALOG_UPDATED_AT = '\d{4}-\d{2}-\d{2}'/, `CATALOG_UPDATED_AT = '${today}'`));
  await writeFile(astroConfigUrl, astroConfigSource.replace(/item\.lastmod = '\d{4}-\d{2}-\d{2}'/, `item.lastmod = '${today}'`));
}
console.log(`Wrote ${fileURLToPath(outputUrl)}.`);

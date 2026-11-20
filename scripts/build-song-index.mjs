import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(await fs.readFile(path.join(repo, 'dist/catalog.json'), 'utf8'));
const sunoSongs = JSON.parse(await fs.readFile(path.join(repo, 'src/data/suno-songs.json'), 'utf8'));
const sunoCovers = JSON.parse(await fs.readFile(path.join(repo, 'src/data/suno-covers.json'), 'utf8'));
const sunoAlbums = JSON.parse(await fs.readFile(path.join(repo, 'src/data/suno-playlists.json'), 'utf8'));
const sunoOutput = path.join(repo, 'local-index/published-suno-songs.csv');
const websiteOutput = path.join(repo, 'local-index/website-songs.csv');
const videosById = new Map(catalog.videos.map((video) => [video.id, video]));
const sunoTitlesById = new Map([...sunoSongs, ...sunoCovers, ...sunoAlbums.flatMap((album) => album.tracks)]
  .map((track) => [track.id, track.title]));
const rows = [];
const websiteRows = [];
const seenSunoIds = new Set();

for (const song of catalog.songs) {
  const sunoLinks = song.links.filter((link) => link.source === 'suno');
  const videos = song.videoIds.map((id) => videosById.get(id));
  if (videos.some((video) => !video)) throw new Error(`Missing video for ${song.title}.`);
  const fullVideos = videos.filter((video) => video.videoType === 'video').map((video) => video.watchUrl);
  const shorts = videos.filter((video) => video.videoType === 'short').map((video) => video.watchUrl);
  const mp3Urls = song.downloads.map((download) => download.url);
  const albumNames = song.albumLinks.filter((album) => album.platform === 'Suno').map((album) => album.title);
  websiteRows.push({
    song_id: song.id,
    title: song.title,
    song_kind: song.kind,
    song_page: song.pageUrl,
    published_on_suno: sunoLinks.length ? 'yes' : 'no',
    suno_urls: sunoLinks.map((link) => link.url).join(' | '),
    suno_albums: albumNames.join(' | '),
    has_mp3: mp3Urls.length ? 'yes' : 'no',
    mp3_urls: mp3Urls.join(' | '),
    has_full_video: fullVideos.length ? 'yes' : 'no',
    full_video_urls: fullVideos.join(' | '),
    has_short: shorts.length ? 'yes' : 'no',
    short_urls: shorts.join(' | '),
  });
  for (const link of sunoLinks) {
    const sunoId = new URL(link.url).pathname.split('/').filter(Boolean).at(-1);
    if (!sunoId || seenSunoIds.has(sunoId)) throw new Error(`Duplicate or missing Suno ID for ${song.title}.`);
    seenSunoIds.add(sunoId);
    rows.push({
      suno_id: sunoId,
      suno_title: sunoTitlesById.get(sunoId) ?? song.title,
      website_song_title: song.title,
      song_kind: song.kind,
      song_page: song.pageUrl,
      suno_url: link.url,
      suno_albums: albumNames.join(' | '),
      song_page_has_mp3: mp3Urls.length ? 'yes' : 'no',
      song_page_mp3_urls: mp3Urls.join(' | '),
      song_page_has_full_video: fullVideos.length ? 'yes' : 'no',
      song_page_full_video_urls: fullVideos.join(' | '),
      song_page_has_short: shorts.length ? 'yes' : 'no',
      song_page_short_urls: shorts.join(' | '),
    });
  }
}

if (rows.length !== catalog.counts.sunoPublished) {
  throw new Error(`Indexed ${rows.length} Suno recordings, but the catalog reports ${catalog.counts.sunoPublished}.`);
}
if (websiteRows.length !== catalog.counts.songs) {
  throw new Error(`Indexed ${websiteRows.length} website songs, but the catalog reports ${catalog.counts.songs}.`);
}
rows.sort((a, b) => a.suno_title.localeCompare(b.suno_title) || a.suno_id.localeCompare(b.suno_id));
websiteRows.sort((a, b) => a.title.localeCompare(b.title) || a.song_id.localeCompare(b.song_id));
const csvCell = (value) => `"${String(value).replaceAll('"', '""')}"`;
const writeCsv = async (output, items) => {
  const columns = Object.keys(items[0]);
  const csv = [columns.join(','), ...items.map((row) => columns.map((column) => csvCell(row[column])).join(','))].join('\n') + '\n';
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, csv);
};
await Promise.all([writeCsv(sunoOutput, rows), writeCsv(websiteOutput, websiteRows)]);
console.log(`Indexed ${rows.length} published Suno recordings: ${rows.filter((row) => row.song_page_has_mp3 === 'yes').length} with MP3s on their song pages, ${rows.filter((row) => row.song_page_has_full_video === 'yes').length} with full videos, ${rows.filter((row) => row.song_page_has_short === 'yes').length} with Shorts.`);
console.log(`Indexed ${websiteRows.length} website songs: ${websiteRows.filter((row) => row.has_mp3 === 'yes').length} with MP3s, ${websiteRows.filter((row) => row.has_full_video === 'yes').length} with full videos, ${websiteRows.filter((row) => row.has_short === 'yes').length} with Shorts.`);
console.log(sunoOutput);
console.log(websiteOutput);

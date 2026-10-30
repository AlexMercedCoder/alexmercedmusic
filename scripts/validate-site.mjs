import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const catalog = JSON.parse(read('dist/catalog.json'));
const songIds = new Set(catalog.songs.map((song) => song.id));
const songSlugs = new Set(catalog.songs.map((song) => song.slug));
const songPages = new Set(catalog.songs.map((song) => song.pageUrl));
const albumIds = new Set(catalog.albums.map((album) => album.id));
const videoIds = new Set(catalog.videos.map((video) => video.id));
const youtubeIds = new Set(catalog.videos.map((video) => video.youtubeId));
const songMetaTitles = new Set();

assert.equal(catalog.schemaVersion, '2.2.0');
assert.match(catalog.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
assert.equal(songIds.size, catalog.songs.length, 'Song IDs must be unique.');
assert.equal(songSlugs.size, catalog.songs.length, 'Song slugs must be unique.');
assert.equal(albumIds.size, catalog.albums.length, 'Album IDs must be unique.');
assert.equal(videoIds.size, catalog.videos.length, 'Video IDs must be unique.');
assert.equal(youtubeIds.size, catalog.videos.length, 'YouTube IDs must be unique.');
assert.equal(catalog.counts.songs, catalog.songs.length);
assert.equal(catalog.counts.albums, catalog.albums.length);
for (const [songId, slug] of [
  ['song:generated:hpmovg', 'goodbye-to-the-almost'],
  ['song:generated:1ghvtok', 'another-life'],
]) {
  assert.equal(catalog.songs.find((song) => song.id === songId)?.slug, slug, `${slug} must keep its established URL.`);
}
const renamedSongRedirects = read('dist/_redirects').trim().split('\n').map((line) => line.trim().split(/\s+/));
assert.ok(renamedSongRedirects.length >= 38, 'Renamed song links must remain available.');
assert.equal(new Set(renamedSongRedirects.map(([from]) => from)).size, renamedSongRedirects.length, 'Song redirects must have unique sources.');
for (const [from, to, status] of renamedSongRedirects) {
  assert.match(from, /^\/songs\/[a-z0-9-]+\/$/);
  assert.match(to, /^\/songs\/[a-z0-9-]+\/$/);
  assert.equal(status, '301');
  assert.ok(existsSync(new URL(`dist${to}index.html`, root)), `${from} redirects to a missing song page.`);
}
const mp3Uploads = JSON.parse(read('src/data/mp3-uploads.json'));
const mp3Matches = JSON.parse(read('src/data/mp3-matches.json'));
assert.equal(catalog.counts.mp3Files, mp3Uploads.files.length);
assert.equal(catalog.counts.songsWithMp3, catalog.songs.filter((song) => song.downloads.length).length);
assert.equal(new Set(mp3Uploads.files.map((file) => file.sourcePath)).size, mp3Uploads.files.length);
assert.equal(new Set(mp3Uploads.files.map((file) => file.url)).size, mp3Uploads.files.length);
for (const file of mp3Uploads.files) {
  assert.ok(file.url.startsWith('https://mp3.alexmercedcloud.com/tracks/'), `${file.sourcePath} has the wrong host.`);
  assert.match(file.sha256, /^[a-f0-9]{64}$/);
  assert.ok(file.sizeBytes > 0);
  const songId = mp3Matches[file.sourcePath];
  if (!songId) continue;
  const song = catalog.songs.find((candidate) => candidate.id === songId);
  assert.ok(song?.downloads.some((download) => download.url === file.url), `${file.sourcePath} is not connected to its song.`);
}
const downloadsPage = read('dist/downloads/index.html');
for (const file of mp3Uploads.files) assert.ok(downloadsPage.includes(file.url), `${file.sourcePath} is missing from downloads.`);
for (const title of ['Stacked Up', 'Work in the Ordinary', 'Because I Knew You', 'The Firm Edge']) {
  const song = catalog.songs.find((item) => item.title === title && item.links.some((link) => link.source === 'suno'));
  assert.ok(song?.downloads.length, `${title} needs its original-song MP3 download.`);
}
const sufjanCover = catalog.songs.find((song) => song.title.includes('To Be Alone With You (Sufjan Stevens Cover)'));
assert.equal(sufjanCover?.downloads.length, 0, 'The Sufjan Stevens cover must not offer an MP3 download.');
assert.equal(catalog.distributedReleases.length, 10);
assert.ok(catalog.distributedReleases.every((release) => release.title && release.released && release.trackCount > 0 && release.links.length > 0));
for (const release of catalog.distributedReleases) {
  for (const link of release.links) assert.equal(new URL(link.url).protocol, 'https:', `${release.title} has a non-HTTPS store link.`);
  assert.equal(release.tracks.length, release.trackCount, `${release.title} is missing Spotify track mappings.`);
}
const spotifyTracks = JSON.parse(read('src/data/spotify-tracks.json'));
assert.equal(spotifyTracks.length, 127);
assert.equal(new Set(spotifyTracks.map((track) => track.id)).size, spotifyTracks.length);
for (const track of spotifyTracks) {
  const linked = catalog.songs.filter((song) => song.links.some((link) => link.source === 'spotify' && link.url === track.url));
  assert.equal(linked.length, 1, `${track.title} must link to exactly one song page.`);
  assert.ok(linked[0].albumLinks.some((album) => album.id === `spotify:album:${track.albumId}` && album.platform === 'Spotify'));
  assert.ok(catalog.distributedReleases.some((release) => release.tracks.some((item) => item.url === track.url && item.songId === linked[0].id)));
}
const spotifyOriginal = catalog.songs.find((song) => song.links.some((link) => link.url === 'https://open.spotify.com/track/7tk2vjN5FJJH8RdVGLNHyt'));
assert.equal(spotifyOriginal?.title, 'Eadd9 Improv', 'Solumn Thoughts must point to its original Eadd9 Improv recording.');
const spotifyTinRoof = catalog.songs.find((song) => song.links.some((link) => link.url === 'https://open.spotify.com/track/6Edh8bgB6YIlJe4pjhryQr'));
assert.ok(Math.abs((spotifyTinRoof?.durationSeconds ?? 0) - 202.76) < 1, 'The Spotify Tin Roof Weather track must select the matching take.');
const spotifyHope = catalog.songs.find((song) => song.links.some((link) => link.url === 'https://open.spotify.com/track/2hZla3Hvj8iVDFtde2LZN4'));
assert.equal(spotifyHope?.title, 'Hope', 'The otherwise unmatched Spotify song needs its own page.');
const spotifyVoiceReimagining = catalog.songs.find((song) => song.links.some((link) => link.url === 'https://open.spotify.com/track/2q19Zd3SJaCYhqrhjeRYhb'));
assert.equal(spotifyVoiceReimagining?.title, "The One Who Can't Be Love", 'The voice AI single needs its own version page.');
assert.ok(spotifyVoiceReimagining?.originalTrackId, 'The voice AI single must link to its acoustic original.');

for (const song of catalog.songs) {
  assert.equal(song.pageUrl, `${catalog.site}/songs/${song.slug}/`);
  assert.ok(song.links.length, `${song.title} must have a listening source.`);
  for (const link of song.links) {
    assert.equal(new URL(link.url).protocol, 'https:', `${song.title} has a non-HTTPS listening link.`);
    assert.ok(link.label && link.versionRole, `${song.title} has an incomplete source record.`);
  }
  if (song.originalTrackId) {
    assert.ok(songIds.has(song.originalTrackId), `${song.title} points to a missing original.`);
    assert.ok(songPages.has(song.originalPageUrl), `${song.title} has a missing original page.`);
    const original = catalog.songs.find((candidate) => candidate.id === song.originalTrackId);
    assert.ok(original.reimaginedTrackIds?.includes(song.id), `${song.title} is missing its reverse relationship.`);
  }
  for (const relatedId of song.reimaginedTrackIds ?? []) assert.ok(songIds.has(relatedId));
  if (song.acousticSourceId) {
    const source = catalog.songs.find((candidate) => candidate.id === song.acousticSourceId);
    assert.ok(source, `${song.title} points to a missing earlier song.`);
    assert.equal(song.acousticSourcePageUrl, source.pageUrl);
    assert.ok(source.acousticVersionIds?.includes(song.id), `${song.title} is missing its reverse acoustic relationship.`);
  }
  for (const versionId of song.acousticVersionIds ?? []) {
    const version = catalog.songs.find((candidate) => candidate.id === versionId);
    assert.equal(version?.acousticSourceId, song.id, `${song.title} has an invalid acoustic version.`);
  }
  for (const videoId of song.videoIds) assert.ok(videoIds.has(videoId), `${song.title} points to a missing video.`);
  for (const videoId of song.relatedVideoIds) assert.ok(videoIds.has(videoId), `${song.title} points to a missing related video.`);

  const pagePath = new URL(`dist/songs/${song.slug}/index.html`, root);
  assert.ok(existsSync(pagePath), `Missing built page for ${song.title}.`);
  const html = readFileSync(pagePath, 'utf8');
  const metaTitle = html.match(/<title>(.*?)<\/title>/)?.[1];
  const metaDescription = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  assert.ok(metaTitle && !songMetaTitles.has(metaTitle), `${song.title} has a missing or duplicate page title.`);
  songMetaTitles.add(metaTitle);
  assert.ok(metaDescription && metaDescription.length <= 160, `${song.title} has an oversized meta description.`);
  assert.ok(!/<iframe[^>]+src=/.test(html), `${song.title} loads a third-party player before user intent.`);
  assert.ok(html.includes(`<link rel="canonical" href="${song.pageUrl}">`), `${song.title} has the wrong canonical.`);
  assert.ok(html.includes('BreadcrumbList'), `${song.title} is missing breadcrumb structured data.`);
  assert.ok(html.includes('MusicRecording'), `${song.title} is missing recording structured data.`);
  assert.ok(existsSync(new URL(`dist/social/songs/${song.slug}.png`, root)), `${song.title} is missing its social image.`);
  for (const link of song.links) assert.ok(html.includes(link.url.replaceAll('&', '&amp;')) || html.includes(link.url), `${song.title} is missing ${link.url}.`);
  for (const download of song.downloads) assert.ok(html.includes(download.url), `${song.title} is missing its MP3 download.`);
}

assert.equal(catalog.counts.videos, catalog.videos.length);
assert.equal(catalog.counts.shorts, catalog.videos.filter((video) => video.videoType === 'short').length);
assert.equal(catalog.counts.longFormVideos, catalog.videos.filter((video) => video.videoType === 'video').length);
assert.ok(catalog.counts.shorts > 0, 'The public YouTube Shorts inventory is unexpectedly empty.');
assert.ok(catalog.videos.length > 150, 'The public YouTube inventory is unexpectedly small.');
assert.ok(catalog.videos.filter((video) => video.relatedSongIds.length).length >= 140, 'Too few videos are connected to song records.');
for (const video of catalog.videos) {
  assert.equal(video.id, `video:youtube:${video.youtubeId}`);
  assert.equal(video.pageUrl, `${catalog.site}/videos/${video.youtubeId.toLowerCase()}/`);
  assert.ok(['short', 'video'].includes(video.videoType), `${video.youtubeId} has an invalid video type.`);
  assert.equal(video.watchUrl, video.videoType === 'short' ? `https://www.youtube.com/shorts/${video.youtubeId}` : `https://www.youtube.com/watch?v=${video.youtubeId}`);
  assert.ok(video.title && video.imageUrl && video.publishedAt && video.channelPosition > 0, `${video.youtubeId} has incomplete metadata.`);
  for (const songId of video.songIds) assert.ok(songIds.has(songId), `${video.title} points to a missing song.`);
  for (const songId of video.relatedSongIds) assert.ok(songIds.has(songId), `${video.title} points to a missing related song.`);
  const html = read(`dist/videos/${video.youtubeId.toLowerCase()}/index.html`);
  assert.ok(html.includes('VideoObject') && html.includes('BreadcrumbList'), `${video.title} is missing structured data.`);
  assert.ok(!/<iframe[^>]+src=/.test(html), `${video.title} loads YouTube before user intent.`);
  assert.ok(html.includes(video.watchUrl.replaceAll('&', '&amp;')) || html.includes(video.watchUrl), `${video.title} is missing its YouTube source.`);
  for (const songId of video.relatedSongIds) {
    const song = catalog.songs.find((candidate) => candidate.id === songId);
    assert.ok(html.includes(song.pageUrl.replace(catalog.site, '')), `${video.title} is missing its ${song.title} relationship.`);
  }
}
for (const [youtubeId, title] of [
  ['lGyQrIVk_YY', 'I Name The Room'],
  ['tqz4v-ICnAA', 'The Hole Still Knows My Name'],
  ['PYlVvwxnkr8', 'Paper Smile'],
  ['aGuXLEIMM1s', 'Back To Empty'],
  ['UYkkIfVS-u0', 'Wild Crazy Place'],
]) {
  const short = catalog.videos.find((video) => video.youtubeId === youtubeId);
  assert.equal(short?.videoType, 'short', `${title} must appear in the Shorts catalog.`);
  const song = catalog.songs.find((item) => item.title.toLowerCase() === title.toLowerCase() && short.songIds.includes(item.id));
  assert.ok(song, `${title} Short must connect to its song page.`);
  assert.ok(read(`dist/songs/${song.slug}/index.html`).includes(short.watchUrl), `${title} song page must link back to the Short.`);
}
for (const [youtubeId, songId] of [
  ['_Hg2jFO-Dgs', 'song:reimagined:1yvbn2f'],
  ['AB9jQTgjerQ', 'song:reimagined:vr0f0k'],
  ['FxkmCRc7jdU', 'song:reimagined:vx8k44'],
  ['rPxDk6b8NNA', 'song:reimagined:juufpu'],
  ['ohHAfq6SMog', 'song:reimagined:p221tf'],
]) {
  const short = catalog.videos.find((video) => video.youtubeId === youtubeId);
  assert.deepEqual(short?.songIds, [songId], `${youtubeId} must link to the verified reimagining.`);
  const song = catalog.songs.find((item) => item.id === songId);
  assert.ok(read(`dist/songs/${song.slug}/index.html`).includes(short.watchUrl), `${song.title} must link back to its Short.`);
}
for (const [youtubeId, songId] of [
  ['6F7LEzvYHO8', 'song:electronic:7vm4c7'],
  ['3TeD5aylkSY', 'song:archive:1xqe7he'],
  ['fxyrrNnGYVE', 'song:archive:2td6he'],
  ['6J_cAqkxIcg', 'song:electronic:x0cg5f'],
]) {
  const video = catalog.videos.find((item) => item.youtubeId === youtubeId);
  assert.deepEqual(video?.songIds, [songId], `${youtubeId} must link to its original recording.`);
}
const stillHereVideo = catalog.videos.find((video) => video.youtubeId === 'KzIDlYp1-yI');
assert.equal(stillHereVideo?.songIds.length, 1, "The new I'm Still Here video must link to one verified recording.");
assert.ok(catalog.songs.find((song) => song.id === stillHereVideo.songIds[0])?.links.some((link) => link.url.endsWith('6a9613aa-0dae-4154-b7db-8aea5a0f244c')));
for (const [youtubeId, title] of [
  ['5Eok3O17lKw', 'You Deserve a Love That Stays'],
  ['35oZGj30avg', 'Break The Frame and Come Through'],
  ['FoBba_zoVJQ', 'Where the Map Runs Thin (v2)'],
  ['AP7pdZQAjIA', 'Pho and Banh Mi'],
]) {
  const video = catalog.videos.find((item) => item.youtubeId === youtubeId);
  const song = catalog.songs.find((item) => item.title === title);
  assert.ok(video?.songIds.includes(song?.id), `${video?.title ?? youtubeId} must link to ${title}.`);
}
for (const [youtubeId, title] of [
  ['3mIoaUnzpn0', 'Head Held High'],
  ['HznYpTO2Xb0', 'I’ll Take This Life Instead'],
  ['KzIDlYp1-yI', "I'm Still Here"],
  ['QwjkX3W9TW0', 'Ghosts of Choices'],
  ['246HZb0UZr4', 'The Misprinted Stamp'],
  ['CrI5fWl8bBI', 'Elevator to a Secret Floor'],
  ['TyJGBTMUr6o', 'Jellyfish Orchestra'],
  ['cySU07bWJxc', 'Uninvited Firework'],
  ['Ho22DHW3p_4', 'Be Weird, Be Wonderful'],
  ['x6ELTD-FRLI', 'Paper Planets'],
  ['u52veeC1bLE', 'Make Some Room'],
  ['2b955JYiYkQ', 'Stay Strange, Stay Kind'],
]) {
  const video = catalog.videos.find((item) => item.youtubeId === youtubeId);
  assert.equal(video?.videoType, 'video', `${title} must appear in the full-length video catalog.`);
  const song = catalog.songs.find((item) => item.title.toLowerCase() === title.toLowerCase() && video.songIds.includes(item.id));
  assert.ok(song, `${title} video must connect to its song page.`);
  assert.ok(read(`dist/songs/${song.slug}/index.html`).includes(video.watchUrl), `${title} song page must link back to the video.`);
}
const ghostsVideo = catalog.videos.find((video) => video.youtubeId === 'QwjkX3W9TW0');
const ghostsAcoustic = catalog.songs.find((song) => song.title === 'Ghosts of Choices (acoustic)');
assert.ok(ghostsVideo?.relatedSongIds.includes(ghostsAcoustic?.id), 'Ghosts of Choices video must link to its generated acoustic version.');

for (const album of catalog.albums) {
  for (const trackId of album.trackIds) assert.ok(songIds.has(trackId), `${album.title} references a missing track.`);
  const pagePath = new URL(`dist/albums/${album.slug}/index.html`, root);
  assert.ok(existsSync(pagePath), `Missing built album page for ${album.title}.`);
  const html = readFileSync(pagePath, 'utf8');
  assert.ok(html.includes('MusicAlbum'));
  assert.ok(html.includes('BreadcrumbList'));
  assert.ok(existsSync(new URL(`dist/social/albums/${album.slug}.png`, root)), `${album.title} is missing its social image.`);
}

const generatedSongs = catalog.songs.filter((song) => song.kind === 'generated' && song.links.some((link) => link.source === 'suno'));
const sourceSunoSongs = JSON.parse(read('src/data/suno-songs.json'));
assert.equal(generatedSongs.length, sourceSunoSongs.length);
assert.ok(generatedSongs.every((song) => song.createdAt && song.imageUrl && song.embedUrl), 'Every generated Suno song must retain its available public metadata.');
assert.ok(generatedSongs.filter((song) => song.durationSeconds).length >= Math.floor(generatedSongs.length * 0.99), 'The Suno duration metadata recovery rate is unexpectedly low.');
assert.ok(generatedSongs.filter((song) => song.genres?.length).length >= Math.floor(generatedSongs.length * 0.95), 'The Suno style metadata recovery rate is unexpectedly low.');
assert.equal(JSON.parse(read('src/data/suno-covers.json')).length, 70);
assert.equal(catalog.counts.sunoPublished, generatedSongs.length + 70 + 29);
const sourceSunoPlaylists = JSON.parse(read('src/data/suno-playlists.json'));
const sunoAlbums = catalog.suno.albums;
assert.equal(sunoAlbums.length, sourceSunoPlaylists.length);
assert.ok(sourceSunoPlaylists.every((collection) => collection.resourceType === 'album'));
assert.ok(!('playlists' in catalog.suno));
assert.equal(catalog.counts.sunoAlbums, sunoAlbums.length);
assert.equal(sunoAlbums.length, sourceSunoPlaylists.filter((collection) => collection.resourceType === 'album').length);
assert.ok(sunoAlbums.length >= 19, 'The official Suno album catalog unexpectedly lost albums.');
assert.ok(sunoAlbums.every((album) => album.url === `https://suno.com/album/${album.id}` && album.songCount > 0 && album.sourceTracks.length === album.songCount && album.pageUrl && album.imageUrl), 'Every official Suno album must retain its album art and complete track metadata.');
const acceptanceAlbum = sunoAlbums.find((album) => album.id === '29d59401-2f6f-4c51-a53e-8dfa1304d1a6');
assert.equal(acceptanceAlbum?.name, 'Acceptance of the Life Being Lived');
assert.equal(acceptanceAlbum?.songCount, 47);
const libertyAlbum = sunoAlbums.find((album) => album.id === '01d1b567-ab42-4d0f-8036-e8dc9494aa86');
assert.equal(libertyAlbum?.name, 'Manifesto of Love and Liberty');
assert.equal(libertyAlbum?.songCount, 10);
assert.equal(libertyAlbum?.sourceTracks[0]?.title, 'Free Enough');
assert.equal(libertyAlbum?.sourceTracks.at(-1)?.title, 'A Sky Wide Enough');
for (const [id, name, count] of [
  ['4e059c40-1e3b-4379-a5b0-fbeff797df37', 'Make A Better World', 50],
  ['96df8b9d-469e-4b4a-a92d-d96884093350', 'The Lives Never Lived', 23],
  ['d8bdf764-1645-42de-9908-abdf7094dad7', 'Misplaced Temporally', 21],
]) {
  const album = sunoAlbums.find((item) => item.id === id);
  assert.equal(album?.name, name);
  assert.equal(album?.songCount, count);
  assert.ok(album?.description && album.description !== '…', `${name} needs a useful description.`);
}
for (const album of sunoAlbums) {
  const path = `dist/suno/albums/${album.slug}/index.html`;
  assert.ok(existsSync(new URL(path, root)), `Missing Suno album page for ${album.name}.`);
  const html = read(path);
  assert.ok(html.includes(album.imageUrl) && html.includes(`Artwork for ${album.name}`), `${album.name} is missing its album art.`);
  assert.ok(html.includes('srcset='), `${album.name} needs responsive cover art.`);
  for (const trackId of album.trackIds) {
    const song = catalog.songs.find((candidate) => candidate.id === trackId);
    assert.ok(song?.albumLinks.some((membership) => membership.id === album.id && membership.pageUrl === album.pageUrl), `${album.name} is missing a two-way song link for ${trackId}.`);
  }
}
const acousticAlbum = sunoAlbums.find((album) => album.id === '1b7a483c-4a8e-40a0-9d59-b3d5d1b65a71');
assert.equal(acousticAlbum?.songCount, 26, 'The generated acoustic album must contain all 26 songs.');
const acousticAlbumHtml = read(`dist/suno/albums/${acousticAlbum.slug}/index.html`);
for (const versionId of acousticAlbum.trackIds) {
  const version = catalog.songs.find((song) => song.id === versionId);
  const source = catalog.songs.find((song) => song.id === version?.acousticSourceId);
  assert.ok(source, `${version?.title} needs a verified earlier song.`);
  assert.ok(acousticAlbumHtml.includes(source.pageUrl.replace(catalog.site, '')), `${version.title} needs its earlier song linked from the album.`);
  assert.ok(read(`dist/songs/${version.slug}/index.html`).includes(source.pageUrl.replace(catalog.site, '')), `${version.title} needs its earlier song on the song page.`);
  assert.ok(read(`dist/songs/${source.slug}/index.html`).includes(version.pageUrl.replace(catalog.site, '')), `${source.title} needs its acoustic version on the song page.`);
}
const pieceAcoustic = catalog.songs.find((song) => song.links.some((link) => link.url.endsWith('ea20960d-3ae7-4947-9ca7-46c2fb1c21cc')));
const mapAcoustic = catalog.songs.find((song) => song.links.some((link) => link.url.endsWith('1a47c72e-0ff6-4c76-9409-a8a781d3fea0')));
assert.ok(catalog.songs.find((song) => song.id === pieceAcoustic?.acousticSourceId)?.links.some((link) => link.url.endsWith('204cc035-a481-4d21-9963-a8f8e45888d0')));
assert.ok(catalog.songs.find((song) => song.id === mapAcoustic?.acousticSourceId)?.links.some((link) => link.url.endsWith('7e47b964-26a7-4bbd-acbc-c2e56d200fa5')));
assert.ok(catalog.songs.filter((song) => song.albumLinks.length).length > 1000, 'Verified Suno album memberships unexpectedly dropped.');
const songsPage = read('dist/songs/index.html');
assert.equal(catalog.platforms.find((platform) => platform.label === 'YouTube, Alex Merced Music')?.stat, `${catalog.videos.length} cataloged uploads`);
assert.ok(!read('dist/listen/index.html').includes('none of it has been consolidated'), 'The listening page must describe the song pages accurately.');
assert.ok(!read('dist/stories/from-guitar-to-fl-studio/index.html').includes('274-track'), 'The electronic story must not hard-code an old track count.');
const tiktokUrl = 'https://www.tiktok.com/@alexmercedmusic';
const xUrl = 'https://x.com/alexmercedmusic';
assert.ok(catalog.platforms.some((platform) => platform.label === 'TikTok' && platform.url === tiktokUrl));
assert.ok(read('dist/index.html').includes(tiktokUrl), 'The home page must link to Alex Merced Music on TikTok.');
assert.ok(read('dist/listen/index.html').includes(tiktokUrl), 'The platform directory must link to Alex Merced Music on TikTok.');
assert.ok(catalog.platforms.some((platform) => platform.label === 'X' && platform.url === xUrl));
assert.ok(read('dist/index.html').includes(xUrl), 'The home page must link to Alex Merced Music on X.');
assert.ok(read('dist/listen/index.html').includes(xUrl), 'The platform directory must link to Alex Merced Music on X.');
const homePage = read('dist/index.html');
assert.ok(homePage.includes('id="closing-note-title"') && homePage.includes('your love of music fades'), 'The homepage is missing its closing music statement.');
assert.ok(homePage.includes('href="https://www.youtube.com/watch?v=bKih8QFcEb4"'), 'The closing statement must link to the Side Hustle Hobby music video.');
assert.ok(homePage.indexOf('id="closing-note-title"') > homePage.indexOf('Where to listen'), 'The closing statement must appear at the bottom of the homepage.');
assert.ok(homePage.includes('href="https://www.youtube.com/@alexmercedmusic" aria-label="Follow Alex Merced on YouTube Profile"'), 'The home page must show a YouTube Profile button.');
assert.ok(homePage.includes('href="https://www.instagram.com/alexmercedmusic" aria-label="Follow Alex Merced on Instagram"'), 'The home page must show an Instagram button.');
assert.ok(homePage.includes('platform-mark--youtubeprofile') && homePage.includes('platform-mark--instagram'), 'The new social buttons must include icons.');
for (const release of catalog.distributedReleases) {
  assert.ok(songsPage.includes(release.links.find((link) => link.label === 'Spotify')?.url), `${release.title} is missing its Spotify album link on the songs page.`);
  assert.ok(read('dist/listen/index.html').includes(release.tracks[0].url), `${release.title} is missing its direct Spotify track links.`);
}
assert.ok(!/class="hero-album"[^>]*aria-label=/.test(read('dist/index.html')), 'Hero album links should use visible link text as their accessible name.');
assert.ok(!/<h4>This site<\/h4>/.test(read('dist/index.html')), 'Footer headings should not skip from h2 to h4.');
const sourceYoutubeMetadata = JSON.parse(read('src/data/youtube-metadata.json'));
assert.ok(Object.keys(sourceYoutubeMetadata).length >= catalog.videos.length);
assert.equal(Object.values(sourceYoutubeMetadata).filter((video) => video.channelPosition).length, catalog.videos.length);
assert.ok(Object.values(sourceYoutubeMetadata).filter((video) => video.channelPosition).every((video) => ['short', 'video'].includes(video.videoType)), 'Every public YouTube upload must retain its tab classification.');

for (const path of ['dist/songs/index.html', 'dist/videos/index.html', 'dist/suno/index.html', 'dist/suno-prompting-guide/index.html', 'dist/music-theory/index.html', 'dist/stories/index.html', 'dist/webmcp/index.html', 'dist/feed.xml', 'dist/feed.json', 'dist/song-index.json', 'dist/video-index.json', 'dist/catalog-summary.json', 'dist/catalog.schema.json', 'dist/llms-full.txt']) {
  assert.ok(existsSync(new URL(path, root)), `Missing built discovery surface: ${path}`);
}
const promptingPage = read('dist/suno-prompting-guide/index.html');
assert.ok(promptingPage.includes('TechArticle') && promptingPage.includes('FAQPage'), 'The prompting guide is missing structured data.');
assert.ok(!promptingPage.includes('.pdf'), 'The prompting guide must not publish or link to the source PDF.');
assert.ok(!existsSync(new URL('dist/guides/suno-prompting-field-guide.pdf', root)), 'The source PDF must not be included in the built site.');
for (const section of ['Interactive workbench', 'Genre atlas', 'Keys and chord progressions', 'Time signatures and beat grouping', 'Odd-meter drum maps', 'Melody and vocal writing', 'Arrangement blueprints', 'Prompt, edit or produce?', 'Control boundary', 'Studio production', 'Reimagine an owned recording', 'Choose a reference method for the whole album', 'Build and check a vocal performance', 'Prompt individual sounds', 'Finish a promising song', 'Generation diagnosis', 'Before and after', 'Project-level prompting', 'Instrumentation and voice', 'Rhythm, harmony and form', 'References and hybrid genres', 'Master vocabulary', 'Score each candidate']) {
  assert.ok(promptingPage.includes(section), `The prompting guide is missing the ${section} section.`);
}
assert.ok(promptingPage.includes('not sent to the generative model'), 'The prompting guide must explain the Studio time-signature limitation.');
assert.ok(promptingPage.includes('i-VI-III-VII') && promptingPage.includes('7/8 grouped 2+2+3'), 'The prompting guide is missing practical harmony or meter examples.');
assert.ok(promptingPage.includes('Midwest emo') && promptingPage.includes('Gamelan-inspired') && promptingPage.includes('Pedal steel') && promptingPage.includes('Darbuka'), 'The expanded genre and instrument atlas is incomplete.');
for (const id of ['owned-audio', 'album-consistency', 'vocal-production', 'suno-sounds', 'finishing']) {
  assert.ok(promptingPage.includes(`id="${id}"`), `The prompting guide is missing its ${id} section.`);
}
assert.equal((promptingPage.match(/<button[^>]+data-tab=/g) ?? []).length, 4, 'The prompting workbench must render four interactive tabs.');
for (const marker of ['data-suno-workbench', 'data-output="style"', 'data-output="chords"', 'data-meter-grid', 'data-diagnosis-output']) {
  assert.ok(promptingPage.includes(marker), `The prompting workbench is missing ${marker}.`);
}
const workbenchSource = read('src/components/SunoPromptWorkbench.astro');
const workbenchScript = workbenchSource.match(/<script is:inline>([\s\S]*?)<\/script>/)?.[1];
assert.ok(workbenchScript, 'The prompting workbench client script is missing.');
assert.doesNotThrow(() => new Function(workbenchScript), 'The prompting workbench client script contains invalid JavaScript.');
for (const path of ['src/pages/suno-prompting-guide.astro', 'src/data/suno-prompting-guide.ts', 'src/components/SunoPromptWorkbench.astro']) {
  const source = read(path);
  assert.ok(!source.includes('—'), `${path} contains an em dash.`);
  assert.ok(!/\b(delv(?:e|es|ing)|unlock(?:s|ed|ing)?|tapestry|game-changer|seamless(?:ly)?|revolutioni[sz]e|embark)\b/i.test(source), `${path} contains an AI writing cliche.`);
}
const theoryPage = read('dist/music-theory/index.html');
assert.ok(theoryPage.includes('TechArticle') && theoryPage.includes('FAQPage'), 'The music theory guide is missing structured data.');
for (const section of ['Interactive theory lab', 'Scale atlas', 'Diatonic modes', 'Chord construction', 'Roman numerals and function', 'Progression library', 'Beyond diatonic harmony', 'Scale and progression tendencies', 'Melody and chord-scale connection', 'From theory to sound']) {
  assert.ok(theoryPage.includes(section), `The music theory guide is missing the ${section} section.`);
}
assert.equal((theoryPage.match(/<button[^>]+data-theory-tab=/g) ?? []).length, 5, 'The theory workbench must render five interactive tabs.');
for (const marker of ['data-theory-workbench', 'data-scale-notes', 'data-chord-notes', 'data-progression-chords', 'data-palette-title', 'Circle of fifths', 'Progression player and downloads', 'data-audio-action="wav"', 'data-audio-action="midi"']) assert.ok(theoryPage.includes(marker), `The theory workbench is missing ${marker}.`);
const theoryWorkbenchSource = read('src/components/MusicTheoryWorkbench.astro');
const theoryWorkbenchScript = theoryWorkbenchSource.match(/<script is:inline[^>]*>([\s\S]*?)<\/script>/)?.[1];
assert.ok(theoryWorkbenchScript, 'The theory workbench client script is missing.');
assert.doesNotThrow(() => new Function(theoryWorkbenchScript), 'The theory workbench client script contains invalid JavaScript.');
for (const path of ['src/pages/music-theory/index.astro', 'src/data/music-theory-guide.ts', 'src/components/MusicTheoryWorkbench.astro']) {
  const source = read(path);
  assert.ok(!source.includes('—'), `${path} contains an em dash.`);
  assert.ok(!/\b(delv(?:e|es|ing)|unlock(?:s|ed|ing)?|tapestry|game-changer|seamless(?:ly)?|revolutioni[sz]e|embark)\b/i.test(source), `${path} contains an AI writing cliche.`);
}
const theoryAudio = await import(new URL('../public/scripts/theory-audio.js', import.meta.url));
assert.ok(existsSync(new URL('dist/scripts/theory-audio.js', root)), 'The browser audio module is missing from the built site.');
const audioPlan = theoryAudio.makeProgressionPlan({ tonicMidi: 62, specs: [[0, ''], [7, ''], [9, 'm'], [5, '']], voicing: 'voice-led' });
assert.equal(audioPlan.length, 4);
assert.ok(audioPlan.every((chord) => chord.length === 3 && chord.every((note) => Number.isInteger(note) && note >= 0 && note <= 127)));
const wavFixture = theoryAudio.encodeWavFromChannels([new Float32Array(4410), new Float32Array(4410)], 44100);
assert.equal(new TextDecoder().decode(wavFixture.slice(0, 4)), 'RIFF');
assert.equal(new TextDecoder().decode(wavFixture.slice(8, 12)), 'WAVE');
assert.equal(wavFixture.length, 44 + (4410 * 2 * 2));
const midiFixture = theoryAudio.encodeMidi({ plan: audioPlan, bpm: 100, beatsPerChord: 4, repeats: 2, instrument: 'keys' });
assert.equal(new TextDecoder().decode(midiFixture.slice(0, 4)), 'MThd');
assert.equal(new TextDecoder().decode(midiFixture.slice(14, 18)), 'MTrk');
const explorer = read('dist/songs/index.html');
assert.equal((explorer.match(/<article class="song-card/g) ?? []).length, 48, 'The initial song explorer payload must stay paginated.');
const songIndex = JSON.parse(read('dist/song-index.json'));
assert.equal(songIndex.count, catalog.songs.length);
for (const pageUrl of songPages) assert.ok(songIndex.songs.some((song) => song.pageUrl === pageUrl.replace(catalog.site, '')), `${pageUrl} is missing from the lightweight song index.`);
const videoIndex = JSON.parse(read('dist/video-index.json'));
assert.equal(videoIndex.count, catalog.videos.length);
assert.equal(videoIndex.shortsCount, catalog.counts.shorts);
assert.equal(videoIndex.videosCount, catalog.counts.longFormVideos);
for (const video of catalog.videos) assert.ok(videoIndex.videos.some((item) => item.id === video.id && item.pageUrl === video.pageUrl.replace(catalog.site, '') && item.videoType === video.videoType), `${video.title} is missing from the lightweight video index.`);
const videosPage = read('dist/videos/index.html');
assert.ok(videosPage.indexOf('id="shorts-section"') < videosPage.indexOf('id="videos-section"'), 'The Videos page must list Shorts before full videos.');
assert.match(read('dist/feed.xml'), /<rss version="2\.0"/);
assert.equal(JSON.parse(read('dist/feed.json')).version, 'https://jsonfeed.org/version/1.1');
const sunoPage = read('dist/suno/index.html');
const featuredAlbumUrls = [
  'https://suno.com/album/51dc8194-9cc8-4d07-8923-ebdaf9bed812',
  'https://suno.com/album/8ed01f70-e1ff-4cd8-aeb8-44f0f8e99fd4',
  'https://suno.com/album/4f3cf988-b2a8-4e04-b0f7-27fc6e99eb0c',
];
const homepage = read('dist/index.html');
const heroStart = homepage.indexOf('<section class="section hero"');
const heroEnd = homepage.indexOf('</section>', heroStart);
const heroHtml = homepage.slice(heroStart, heroEnd);
assert.ok(heroHtml.includes('class="hero-albums"'), 'The homepage hero is missing the featured album-cover grid.');
assert.ok(heroHtml.indexOf('class="hero-albums"') > heroHtml.indexOf('<h1'), 'The featured album covers must appear after the homepage headline.');
assert.ok(heroHtml.indexOf('class="hero-albums"') < heroHtml.indexOf('href="/reimagined/"'), 'The featured album covers must appear before the homepage CTA buttons.');
for (const album of catalog.suno.featuredReimaginingAlbums) {
  assert.ok(heroHtml.includes(album.url), `The homepage hero is missing ${album.title}.`);
  // Covers are re-encoded at build time as responsive WebP named after the Suno image.
  const coverName = album.imageUrl.split('/').pop().replace(/\.\w+$/, '');
  assert.ok(heroHtml.includes(album.imageUrl) || new RegExp(`/_astro/${coverName}_[^"]+\\.webp`).test(heroHtml), `The homepage hero is missing the cover for ${album.title}.`);
}
for (const path of ['dist/index.html', 'dist/acoustic/index.html', 'dist/electronic/index.html', 'dist/reimagined/index.html', 'dist/suno/index.html', 'dist/listen/index.html', 'dist/about/index.html', 'dist/stories/originals-and-reimaginings/index.html', 'dist/stories/revisiting-songs-with-suno/index.html', 'dist/llms.txt', 'dist/llms-full.txt']) {
  const html = read(path);
  for (const url of featuredAlbumUrls) assert.ok(html.includes(url), `${path} is missing featured reimagining album ${url}.`);
}
for (const album of sunoAlbums) {
  assert.ok(sunoPage.includes(album.url), `${album.name} is missing from the Suno page.`);
  assert.ok(sunoPage.includes(album.imageUrl) && sunoPage.includes(`Artwork for ${album.name}`), `${album.name} is missing artwork from the Suno album listing.`);
}
assert.ok(!existsSync(new URL('dist/suno/playlists/', root)), 'Retired playlist pages must not be built.');

const sitemap = read('dist/sitemap-0.xml');
for (const pageUrl of songPages) assert.ok(sitemap.includes(`<loc>${pageUrl}</loc>`), `${pageUrl} is missing from the sitemap.`);
for (const album of catalog.albums) assert.ok(sitemap.includes(`<loc>${album.pageUrl}</loc>`));
for (const album of sunoAlbums) assert.ok(sitemap.includes(`<loc>${album.pageUrl}</loc>`));
// P4.9: video pages canonicalize to their song page or are noindexed, so they stay out of the sitemap.
for (const video of catalog.videos) {
  assert.ok(!sitemap.includes(`<loc>${video.pageUrl}</loc>`), `${video.title} should not be in the sitemap.`);
  const html = read(`dist/videos/${video.youtubeId.toLowerCase()}/index.html`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  const noindex = /<meta name="robots" content="noindex, follow">/.test(html);
  assert.ok(noindex || (canonical && songPages.has(canonical)), `${video.title} must canonicalize to a song page or be noindex.`);
}
assert.ok(sitemap.includes('<loc>https://alexmercedmusic.com/suno-prompting-guide/</loc>'));
assert.ok(sitemap.includes('<loc>https://alexmercedmusic.com/ethics-of-ai-music/</loc>'), 'The ethics essay is missing from the sitemap.');
assert.ok(read('dist/index.html').includes('href="/ethics-of-ai-music/"'), 'The ethics essay is missing from the navigation.');
assert.ok(!read('src/pages/ethics-of-ai-music.astro').includes('\u2014'), 'The ethics essay must not use em dashes.');
const aiPerspectiveUrl = 'https://amdatalakehouse.substack.com/p/when-hard-becomes-easy-ai-art-and';
for (const path of ['dist/suno/index.html', 'dist/stories/index.html', 'dist/stories/revisiting-songs-with-suno/index.html', 'dist/about/index.html', 'dist/ethics-of-ai-music/index.html', 'dist/llms.txt', 'dist/llms-full.txt']) {
  assert.ok(read(path).includes(aiPerspectiveUrl), `${path} is missing Alex's AI and music perspective article.`);
}

const webMcpSource = read('src/components/WebMCP.astro');
const script = webMcpSource.match(/<script is:inline>([\s\S]*)<\/script>/)?.[1];
assert.ok(script, 'Could not locate the WebMCP client script.');
const registered = [];
const context = {
  registerTool: async (tool, options) => {
    registered.push({ tool, options });
  },
};
const windowMock = {
  addEventListener() {},
  setInterval,
  clearInterval,
};
runInNewContext(script, {
  document: { modelContext: context },
  navigator: {},
  window: windowMock,
  fetch: async () => ({ ok: true, json: async () => catalog }),
  AbortController,
  DOMException,
  Error,
  console,
  Promise,
  Map,
  Set,
  Number,
  String,
  JSON,
  Math,
  Date,
});
await new Promise((resolve) => setTimeout(resolve, 0));

const expectedTools = ['music_overview', 'get_song', 'search_songs', 'list_songs', 'get_recent_songs', 'list_videos', 'get_video', 'compare_versions', 'list_suno_albums', 'get_suno_album', 'get_catalog_updates_since', 'get_suno_prompting_guide', 'get_suno_prompting_section', 'search_suno_prompting_guide', 'compose_suno_prompt', 'transpose_chord_progression', 'design_meter_prompt', 'diagnose_suno_result', 'build_arrangement_blueprint', 'create_album_style_bible', 'get_music_theory_guide', 'get_music_theory_section', 'build_scale', 'build_chord', 'translate_roman_progression', 'suggest_theory_palette', 'list_reimaginings', 'list_albums', 'where_to_listen', 'get_ai_music_perspective', 'navigate_catalog'];
assert.deepEqual(registered.map(({ tool }) => tool.name), expectedTools);
for (const { tool, options } of registered) {
  assert.equal(tool.annotations.readOnlyHint, true);
  assert.equal(tool.annotations.consequentialHint, false);
  assert.ok(options.signal instanceof AbortSignal);
}

const getTool = (name) => registered.find(({ tool }) => tool.name === name).tool;
const overview = JSON.parse(await getTool('music_overview').execute({}));
assert.equal(overview.counts.songs, catalog.songs.length);
const solemn = catalog.songs.find((song) => song.title === 'Solemn Thoughts' && song.kind === 'reimagined');
const exact = JSON.parse(await getTool('get_song').execute({ id: solemn.id }));
assert.equal(exact.song.originalPageUrl, `${catalog.site}/songs/eadd9-improv/`);
const search = JSON.parse(await getTool('search_songs').execute({ query: 'thoughts', limit: 2 }));
assert.ok(search.totalResults >= 2);
assert.ok(search.items.length <= 2);
const generated = JSON.parse(await getTool('list_songs').execute({ kind: 'generated', limit: 5 }));
assert.equal(generated.totalResults, catalog.counts.generated);
assert.equal(generated.items.length, 5);
const recent = JSON.parse(await getTool('get_recent_songs').execute({ limit: 5 }));
assert.equal(recent.items.length, 5);
assert.ok(recent.items.every((song) => song.createdAt));
const listedVideos = JSON.parse(await getTool('list_videos').execute({ connection: 'linked', limit: 5 }));
assert.ok(listedVideos.totalResults >= 140 && listedVideos.items.length === 5);
assert.ok(listedVideos.items.every((video) => video.relatedSongIds.length));
const listedShorts = JSON.parse(await getTool('list_videos').execute({ videoType: 'short', limit: 100 }));
assert.equal(listedShorts.totalResults, catalog.counts.shorts);
assert.ok(listedShorts.items.every((video) => video.videoType === 'short'));
const exactVideo = JSON.parse(await getTool('get_video').execute({ youtubeId: '6CjtRMTSjTw' }));
assert.equal(exactVideo.video.youtubeId, '6CjtRMTSjTw');
assert.ok(exactVideo.songs.some((song) => song.title === 'Solemn Thoughts'));
assert.ok(exactVideo.otherVersions.some((song) => song.title === 'Eadd9 Improv'));
const comparison = JSON.parse(await getTool('compare_versions').execute({ id: solemn.id }));
assert.equal(comparison.original.id, solemn.originalTrackId);
assert.ok(comparison.reimagined.some((song) => song.id === solemn.id));
const reimaginingList = JSON.parse(await getTool('list_reimaginings').execute({}));
assert.equal(reimaginingList.pairs.length, 30);
assert.deepEqual(reimaginingList.primaryAlbums.map((album) => album.url), featuredAlbumUrls);
const albumResult = JSON.parse(await getTool('list_suno_albums').execute({}));
assert.equal(albumResult.count, sunoAlbums.length);
const canonicalSunoAlbum = sunoAlbums.find((album) => album.id === '51dc8194-9cc8-4d07-8923-ebdaf9bed812');
assert.ok(canonicalSunoAlbum && canonicalSunoAlbum.songCount === 30);
const canonicalSunoAlbumTwo = sunoAlbums.find((album) => album.id === '8ed01f70-e1ff-4cd8-aeb8-44f0f8e99fd4');
assert.ok(canonicalSunoAlbumTwo && canonicalSunoAlbumTwo.songCount === 24);
const canonicalElectronicAlbum = sunoAlbums.find((album) => album.id === '4f3cf988-b2a8-4e04-b0f7-27fc6e99eb0c');
assert.ok(canonicalElectronicAlbum && canonicalElectronicAlbum.songCount === 33 && canonicalElectronicAlbum.imageUrl);
assert.deepEqual(catalog.suno.featuredReimaginingAlbums.map((album) => album.url), [canonicalSunoAlbum.url, canonicalSunoAlbumTwo.url, canonicalElectronicAlbum.url]);
const sunoAlbum = JSON.parse(await getTool('get_suno_album').execute({ id: canonicalSunoAlbum.id }));
assert.equal(sunoAlbum.tracks.length, 30);
assert.ok(sunoAlbum.tracks.every((track) => track.catalogSong));
const albumSongs = JSON.parse(await getTool('list_songs').execute({ album: canonicalSunoAlbum.name }));
assert.equal(albumSongs.totalResults, new Set(canonicalSunoAlbum.trackIds).size);
assert.ok(albumSongs.items.every((song) => song.albumLinks.some((membership) => membership.id === canonicalSunoAlbum.id)));
const sunoAlbumTwo = JSON.parse(await getTool('get_suno_album').execute({ id: canonicalSunoAlbumTwo.id }));
assert.equal(sunoAlbumTwo.tracks.length, 24);
assert.ok(sunoAlbumTwo.tracks.every((track) => track.catalogSong));
const sunoElectronicAlbum = JSON.parse(await getTool('get_suno_album').execute({ id: canonicalElectronicAlbum.id }));
assert.equal(sunoElectronicAlbum.tracks.length, 33);
assert.ok(sunoElectronicAlbum.tracks.every((track) => track.catalogSong));
const updates = JSON.parse(await getTool('get_catalog_updates_since').execute({ since: '2026-01-01', kind: 'generated', limit: 5 }));
assert.ok(updates.totalResults > 0 && updates.items.length === 5);
const promptingResult = JSON.parse(await getTool('get_suno_prompting_guide').execute({}));
assert.equal(promptingResult.guide.formula, catalog.guides.sunoPrompting.formula);
assert.equal(promptingResult.guide.pageUrl, `${catalog.site}/suno-prompting-guide/`);
assert.equal(promptingResult.guide.genreFamilies.length, 4);
assert.equal(promptingResult.guide.recipes.length, 16);
const promptingSections = JSON.parse(await getTool('get_suno_prompting_section').execute({}));
assert.ok(promptingSections.sections.includes('vocals') && promptingSections.sections.includes('troubleshooting'));
const vocals = JSON.parse(await getTool('get_suno_prompting_section').execute({ section: 'vocals' }));
assert.equal(vocals.section, 'vocals');
assert.equal(vocals.content.dimensions.length, catalog.guides.sunoPrompting.vocalDimensions.length);
const promptingSearch = JSON.parse(await getTool('search_suno_prompting_guide').execute({ query: 'close-mic', limit: 5 }));
assert.ok(promptingSearch.totalResults > 0);
assert.ok(promptingSearch.items.every((item) => item.value.toLowerCase().includes('close-mic')));
const parenthesesSearch = JSON.parse(await getTool('search_suno_prompting_guide').execute({ query: 'parentheses', limit: 10 }));
assert.ok(parenthesesSearch.totalResults > 0);
assert.ok(parenthesesSearch.items.some((item) => item.path.includes('lyrics.parentheticalRhythm')));
assert.ok(promptingPage.includes('id="parenthetical-rhythm"'));
assert.ok(promptingPage.includes('Write a vocal rhythm the model can sing'));
assert.ok(promptingPage.includes('(TA-ta-ta, TA-ta-ta, TA-ta)'));
const composedPrompt = JSON.parse(await getTool('compose_suno_prompt').execute({ genre: 'art rock', tempoGroove: '104 BPM in 7/8', instruments: 'angular clean guitar and elastic bass', vocal: 'theatrical baritone', ending: 'hard stop', exclude: 'arena drums' }));
assert.equal(composedPrompt.stylePrompt, 'art rock, 104 BPM in 7/8, angular clean guitar and elastic bass, theatrical baritone, hard stop');
assert.equal(composedPrompt.exclude, 'arena drums');
const composedPromptWithLists = JSON.parse(await getTool('compose_suno_prompt').execute({ genre: 'indie folk', instruments: ['fingerpicked acoustic guitar', 'upright bass'], production: ['warm tape saturation'], exclude: ['EDM drops', 'trap hi-hats'] }));
assert.equal(composedPromptWithLists.stylePrompt, 'indie folk, fingerpicked acoustic guitar, upright bass, warm tape saturation');
assert.equal(composedPromptWithLists.exclude, 'EDM drops, trap hi-hats');
const transposed = JSON.parse(await getTool('transpose_chord_progression').execute({ key: 'D', progression: 'I-V-vi-IV' }));
assert.deepEqual(transposed.chords, ['D', 'A', 'Bm', 'G']);
const meterPrompt = JSON.parse(await getTool('design_meter_prompt').execute({ meter: '7/8', grouping: '2+2+3', bpm: 112 }));
assert.deepEqual(meterPrompt.accentPositions, [1, 3, 5]);
assert.ok(meterPrompt.promptClause.includes('7/8 grouped 2+2+3'));
const invalidMeter = JSON.parse(await getTool('design_meter_prompt').execute({ meter: '7/8', grouping: '3+3' }));
assert.ok(invalidMeter.error);
const diagnosis = JSON.parse(await getTool('diagnose_suno_result').execute({ symptom: 'odd meter sounds like 4/4' }));
assert.ok(diagnosis.nextExperiment.includes('grouping'));
const blueprint = JSON.parse(await getTool('build_arrangement_blueprint').execute({ form: 'Concept-album finale' }));
assert.equal(blueprint.blueprint.name, 'Concept-album finale');
const styleBible = JSON.parse(await getTool('create_album_style_bible').execute({ identity: 'theatrical art rock', harmonicPalette: 'D minor and F major', motif: 'rising three-note figure' }));
assert.equal(styleBible.styleBible.length, 3);
const theoryGuide = JSON.parse(await getTool('get_music_theory_guide').execute({}));
assert.equal(theoryGuide.guide.pageUrl, `${catalog.site}/music-theory/`);
assert.ok(theoryGuide.guide.scaleFamilies.length >= 18);
const theorySections = JSON.parse(await getTool('get_music_theory_section').execute({}));
assert.ok(theorySections.sections.includes('scales') && theorySections.sections.includes('progressions'));
const dMajor = JSON.parse(await getTool('build_scale').execute({ root: 'D', scale: 'Major' }));
assert.deepEqual(dMajor.notes, ['D', 'E', 'F-sharp', 'G', 'A', 'B', 'C-sharp']);
const cMinor7 = JSON.parse(await getTool('build_chord').execute({ root: 'C', chord: 'Minor 7' }));
assert.deepEqual(cMinor7.notes, ['C', 'E-flat', 'G', 'B-flat']);
const romanProgression = JSON.parse(await getTool('translate_roman_progression').execute({ root: 'D', progression: 'I-V-vi-IV' }));
assert.deepEqual(romanProgression.chords, ['D', 'A', 'Bm', 'G']);
const theoryPalette = JSON.parse(await getTool('suggest_theory_palette').execute({ vibe: 'dreamlike' }));
assert.ok(theoryPalette.matches.length > 0);
const pairs = JSON.parse(await getTool('list_reimaginings').execute({}));
assert.equal(pairs.pairs.length, catalog.counts.reimagined);
assert.ok(pairs.pairs.every((pair) => pair.original?.pageUrl));
const perspective = JSON.parse(await getTool('get_ai_music_perspective').execute({}));
assert.equal(perspective.url, aiPerspectiveUrl);
assert.equal(perspective.author, 'Alex Merced');

console.log(`Validated ${catalog.songs.length} song pages, ${catalog.videos.length} video pages, ${catalog.albums.length} album pages, ${catalog.songs.reduce((count, song) => count + song.links.length, 0)} listening links, rich source metadata, feeds, social images, sitemap coverage, structured data, and ${registered.length} WebMCP tools.`);

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

assert.equal(catalog.schemaVersion, '1.1.0');
assert.match(catalog.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
assert.equal(songIds.size, catalog.songs.length, 'Song IDs must be unique.');
assert.equal(songSlugs.size, catalog.songs.length, 'Song slugs must be unique.');
assert.equal(albumIds.size, catalog.albums.length, 'Album IDs must be unique.');
assert.equal(catalog.counts.songs, catalog.songs.length);
assert.equal(catalog.counts.albums, catalog.albums.length);

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

  const pagePath = new URL(`dist/songs/${song.slug}/index.html`, root);
  assert.ok(existsSync(pagePath), `Missing built page for ${song.title}.`);
  const html = readFileSync(pagePath, 'utf8');
  assert.ok(html.includes(`<link rel="canonical" href="${song.pageUrl}">`), `${song.title} has the wrong canonical.`);
  assert.ok(html.includes('BreadcrumbList'), `${song.title} is missing breadcrumb structured data.`);
  assert.ok(html.includes('MusicRecording'), `${song.title} is missing recording structured data.`);
  assert.ok(existsSync(new URL(`dist/social/songs/${song.slug}.png`, root)), `${song.title} is missing its social image.`);
  for (const link of song.links) assert.ok(html.includes(link.url.replaceAll('&', '&amp;')) || html.includes(link.url), `${song.title} is missing ${link.url}.`);
}

for (const album of catalog.albums) {
  for (const trackId of album.trackIds) assert.ok(songIds.has(trackId), `${album.title} references a missing track.`);
  const pagePath = new URL(`dist/albums/${album.slug}/index.html`, root);
  assert.ok(existsSync(pagePath), `Missing built album page for ${album.title}.`);
  const html = readFileSync(pagePath, 'utf8');
  assert.ok(html.includes('MusicAlbum'));
  assert.ok(html.includes('BreadcrumbList'));
  assert.ok(existsSync(new URL(`dist/social/albums/${album.slug}.png`, root)), `${album.title} is missing its social image.`);
}

const generatedSongs = catalog.songs.filter((song) => song.kind === 'generated');
assert.equal(generatedSongs.length, 145);
assert.ok(generatedSongs.every((song) => song.createdAt && song.durationSeconds && song.imageUrl && song.embedUrl), 'Every generated Suno song must retain its public metadata.');
assert.ok(generatedSongs.filter((song) => song.genres?.length).length >= 140, 'The Suno style metadata recovery rate is unexpectedly low.');
assert.equal(JSON.parse(read('src/data/suno-covers.json')).length, 12);
assert.equal(Object.keys(JSON.parse(read('src/data/youtube-metadata.json'))).length, 79);

for (const path of ['dist/songs/index.html', 'dist/stories/index.html', 'dist/webmcp/index.html', 'dist/feed.xml', 'dist/feed.json']) {
  assert.ok(existsSync(new URL(path, root)), `Missing built discovery surface: ${path}`);
}
const explorer = read('dist/songs/index.html');
for (const pageUrl of songPages) assert.ok(explorer.includes(pageUrl.replace(catalog.site, '')), `${pageUrl} is missing from the song explorer.`);
assert.match(read('dist/feed.xml'), /<rss version="2\.0"/);
assert.equal(JSON.parse(read('dist/feed.json')).version, 'https://jsonfeed.org/version/1.1');

const sitemap = read('dist/sitemap-0.xml');
for (const pageUrl of songPages) assert.ok(sitemap.includes(`<loc>${pageUrl}</loc>`), `${pageUrl} is missing from the sitemap.`);
for (const album of catalog.albums) assert.ok(sitemap.includes(`<loc>${album.pageUrl}</loc>`));

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

const expectedTools = ['music_overview', 'get_song', 'search_songs', 'list_songs', 'get_recent_songs', 'compare_versions', 'list_reimaginings', 'list_albums', 'where_to_listen', 'navigate_catalog'];
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
const comparison = JSON.parse(await getTool('compare_versions').execute({ id: solemn.id }));
assert.equal(comparison.original.id, solemn.originalTrackId);
assert.ok(comparison.reimagined.some((song) => song.id === solemn.id));
const pairs = JSON.parse(await getTool('list_reimaginings').execute({}));
assert.equal(pairs.pairs.length, catalog.counts.reimagined);
assert.ok(pairs.pairs.every((pair) => pair.original?.pageUrl));

console.log(`Validated ${catalog.songs.length} song pages, ${catalog.albums.length} album pages, ${catalog.songs.reduce((count, song) => count + song.links.length, 0)} listening links, rich source metadata, feeds, social images, sitemap coverage, structured data, and ${registered.length} WebMCP tools.`);

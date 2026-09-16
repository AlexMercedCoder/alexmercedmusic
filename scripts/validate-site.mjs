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
const songMetaTitles = new Set();

assert.equal(catalog.schemaVersion, '1.7.0');
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
const sourceSunoSongs = JSON.parse(read('src/data/suno-songs.json'));
assert.equal(generatedSongs.length, sourceSunoSongs.length);
assert.ok(generatedSongs.every((song) => song.createdAt && song.durationSeconds && song.imageUrl && song.embedUrl), 'Every generated Suno song must retain its public metadata.');
assert.ok(generatedSongs.filter((song) => song.genres?.length).length >= Math.floor(generatedSongs.length * 0.95), 'The Suno style metadata recovery rate is unexpectedly low.');
assert.equal(JSON.parse(read('src/data/suno-covers.json')).length, 12);
const sourceSunoPlaylists = JSON.parse(read('src/data/suno-playlists.json'));
const sunoPlaylists = catalog.suno.playlists;
assert.equal(sunoPlaylists.length, sourceSunoPlaylists.length);
assert.equal(catalog.counts.sunoPlaylists, sunoPlaylists.length);
assert.ok(sunoPlaylists.every((playlist) => playlist.url === `https://suno.com/playlist/${playlist.id}` && playlist.songCount > 0 && playlist.description && playlist.collectionType && playlist.collectionLabel && playlist.trackIds.length > 0 && playlist.sourceTracks.length === playlist.songCount && playlist.pageUrl));
assert.equal(sunoPlaylists.filter((playlist) => playlist.collectionType === 'album').length, 5);
assert.equal(Object.keys(JSON.parse(read('src/data/youtube-metadata.json'))).length, 79);

for (const path of ['dist/songs/index.html', 'dist/suno/index.html', 'dist/suno-prompting-guide/index.html', 'dist/stories/index.html', 'dist/webmcp/index.html', 'dist/feed.xml', 'dist/feed.json', 'dist/song-index.json', 'dist/catalog-summary.json', 'dist/catalog.schema.json', 'dist/llms-full.txt']) {
  assert.ok(existsSync(new URL(path, root)), `Missing built discovery surface: ${path}`);
}
const promptingPage = read('dist/suno-prompting-guide/index.html');
assert.ok(promptingPage.includes('TechArticle') && promptingPage.includes('FAQPage'), 'The prompting guide is missing structured data.');
assert.ok(!promptingPage.includes('.pdf'), 'The prompting guide must not publish or link to the source PDF.');
assert.ok(!existsSync(new URL('dist/guides/suno-prompting-field-guide.pdf', root)), 'The source PDF must not be included in the built site.');
for (const section of ['Genre atlas', 'Instrumentation and voice', 'Rhythm, harmony and form', 'References and hybrid genres', 'Master vocabulary', 'Score each candidate']) {
  assert.ok(promptingPage.includes(section), `The prompting guide is missing the ${section} section.`);
}
for (const path of ['src/pages/suno-prompting-guide.astro', 'src/data/suno-prompting-guide.ts']) {
  const source = read(path);
  assert.ok(!source.includes('—'), `${path} contains an em dash.`);
  assert.ok(!/\b(delv(?:e|es|ing)|unlock(?:s|ed|ing)?|tapestry|game-changer|seamless(?:ly)?|revolutioni[sz]e|embark)\b/i.test(source), `${path} contains an AI writing cliche.`);
}
const explorer = read('dist/songs/index.html');
assert.equal((explorer.match(/<article class="song-card/g) ?? []).length, 48, 'The initial song explorer payload must stay paginated.');
const songIndex = JSON.parse(read('dist/song-index.json'));
assert.equal(songIndex.count, catalog.songs.length);
for (const pageUrl of songPages) assert.ok(songIndex.songs.some((song) => song.pageUrl === pageUrl.replace(catalog.site, '')), `${pageUrl} is missing from the lightweight song index.`);
assert.match(read('dist/feed.xml'), /<rss version="2\.0"/);
assert.equal(JSON.parse(read('dist/feed.json')).version, 'https://jsonfeed.org/version/1.1');
const sunoPage = read('dist/suno/index.html');
for (const playlist of sunoPlaylists) assert.ok(sunoPage.includes(playlist.url), `${playlist.name} is missing from the Suno page.`);
for (const playlist of sunoPlaylists) {
  const path = `dist/suno/playlists/${playlist.slug}/index.html`;
  assert.ok(existsSync(new URL(path, root)), `${playlist.name} is missing its local page.`);
  const html = read(path);
  assert.ok(html.includes(playlist.url) && html.includes('BreadcrumbList'), `${playlist.name} is missing source or structured data.`);
}

const sitemap = read('dist/sitemap-0.xml');
for (const pageUrl of songPages) assert.ok(sitemap.includes(`<loc>${pageUrl}</loc>`), `${pageUrl} is missing from the sitemap.`);
for (const album of catalog.albums) assert.ok(sitemap.includes(`<loc>${album.pageUrl}</loc>`));
assert.ok(sitemap.includes('<loc>https://alexmercedmusic.com/suno-prompting-guide/</loc>'));

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

const expectedTools = ['music_overview', 'get_song', 'search_songs', 'list_songs', 'get_recent_songs', 'compare_versions', 'list_suno_playlists', 'get_suno_playlist', 'get_catalog_updates_since', 'get_suno_prompting_guide', 'get_suno_prompting_section', 'search_suno_prompting_guide', 'compose_suno_prompt', 'list_reimaginings', 'list_albums', 'where_to_listen', 'navigate_catalog'];
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
const playlistResult = JSON.parse(await getTool('list_suno_playlists').execute({}));
assert.equal(playlistResult.count, sunoPlaylists.length);
assert.ok(playlistResult.playlists.every((item) => !('trackIds' in item) && !('sourceTracks' in item)));
assert.deepEqual(playlistResult.playlists.map((item) => item.id), sunoPlaylists.map((item) => item.id));
const playlist = JSON.parse(await getTool('get_suno_playlist').execute({ id: sunoPlaylists[0].id }));
assert.equal(playlist.playlist.id, sunoPlaylists[0].id);
assert.equal(playlist.tracks.length, sunoPlaylists[0].sourceTracks.length);
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
assert.equal(vocals.content.length, catalog.guides.sunoPrompting.vocalDimensions.length);
const promptingSearch = JSON.parse(await getTool('search_suno_prompting_guide').execute({ query: 'close-mic', limit: 5 }));
assert.ok(promptingSearch.totalResults > 0);
assert.ok(promptingSearch.items.every((item) => item.value.toLowerCase().includes('close-mic')));
const composedPrompt = JSON.parse(await getTool('compose_suno_prompt').execute({ genre: 'art rock', tempoGroove: '104 BPM in 7/8', instruments: 'angular clean guitar and elastic bass', vocal: 'theatrical baritone', ending: 'hard stop', exclude: 'arena drums' }));
assert.equal(composedPrompt.stylePrompt, 'art rock, 104 BPM in 7/8, angular clean guitar and elastic bass, theatrical baritone, hard stop');
assert.equal(composedPrompt.exclude, 'arena drums');
const composedPromptWithLists = JSON.parse(await getTool('compose_suno_prompt').execute({ genre: 'indie folk', instruments: ['fingerpicked acoustic guitar', 'upright bass'], production: ['warm tape saturation'], exclude: ['EDM drops', 'trap hi-hats'] }));
assert.equal(composedPromptWithLists.stylePrompt, 'indie folk, fingerpicked acoustic guitar, upright bass, warm tape saturation');
assert.equal(composedPromptWithLists.exclude, 'EDM drops, trap hi-hats');
const pairs = JSON.parse(await getTool('list_reimaginings').execute({}));
assert.equal(pairs.pairs.length, catalog.counts.reimagined);
assert.ok(pairs.pairs.every((pair) => pair.original?.pageUrl));

console.log(`Validated ${catalog.songs.length} song pages, ${catalog.albums.length} album pages, ${catalog.songs.reduce((count, song) => count + song.links.length, 0)} listening links, rich source metadata, feeds, social images, sitemap coverage, structured data, and ${registered.length} WebMCP tools.`);

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

assert.equal(catalog.schemaVersion, '1.11.0');
assert.match(catalog.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
assert.equal(songIds.size, catalog.songs.length, 'Song IDs must be unique.');
assert.equal(songSlugs.size, catalog.songs.length, 'Song slugs must be unique.');
assert.equal(albumIds.size, catalog.albums.length, 'Album IDs must be unique.');
assert.equal(videoIds.size, catalog.videos.length, 'Video IDs must be unique.');
assert.equal(youtubeIds.size, catalog.videos.length, 'YouTube IDs must be unique.');
assert.equal(catalog.counts.songs, catalog.songs.length);
assert.equal(catalog.counts.albums, catalog.albums.length);
assert.equal(catalog.distributedReleases.length, 3);
assert.ok(catalog.distributedReleases.every((release) => release.title && release.released && release.trackCount > 0 && release.links.length > 0));
for (const release of catalog.distributedReleases) {
  for (const link of release.links) assert.equal(new URL(link.url).protocol, 'https:', `${release.title} has a non-HTTPS store link.`);
}

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
}

assert.equal(catalog.counts.videos, catalog.videos.length);
assert.ok(catalog.videos.length > 150, 'The public YouTube inventory is unexpectedly small.');
assert.ok(catalog.videos.filter((video) => video.relatedSongIds.length).length >= 140, 'Too few videos are connected to song records.');
for (const video of catalog.videos) {
  assert.equal(video.id, `video:youtube:${video.youtubeId}`);
  assert.equal(video.pageUrl, `${catalog.site}/videos/${video.youtubeId.toLowerCase()}/`);
  assert.equal(video.watchUrl, `https://www.youtube.com/watch?v=${video.youtubeId}`);
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
assert.ok(generatedSongs.every((song) => song.createdAt && song.imageUrl && song.embedUrl), 'Every generated Suno song must retain its available public metadata.');
assert.ok(generatedSongs.filter((song) => song.durationSeconds).length >= Math.floor(generatedSongs.length * 0.99), 'The Suno duration metadata recovery rate is unexpectedly low.');
assert.ok(generatedSongs.filter((song) => song.genres?.length).length >= Math.floor(generatedSongs.length * 0.95), 'The Suno style metadata recovery rate is unexpectedly low.');
assert.equal(JSON.parse(read('src/data/suno-covers.json')).length, 32);
const sourceSunoPlaylists = JSON.parse(read('src/data/suno-playlists.json'));
const sunoPlaylists = catalog.suno.playlists;
const sunoAlbums = catalog.suno.albums;
assert.equal(sunoPlaylists.length + sunoAlbums.length, sourceSunoPlaylists.length);
assert.equal(catalog.counts.sunoPlaylists, sunoPlaylists.length);
assert.equal(catalog.counts.sunoAlbums, sunoAlbums.length);
assert.ok(sunoPlaylists.every((playlist) => playlist.url === `https://suno.com/playlist/${playlist.id}` && playlist.songCount > 0 && playlist.description && playlist.collectionType && playlist.collectionLabel && playlist.trackIds.length > 0 && playlist.sourceTracks.length === playlist.songCount && playlist.pageUrl));
assert.equal(sunoPlaylists.filter((playlist) => playlist.collectionType === 'album').length, 5);
assert.equal(sunoAlbums.length, 3);
assert.ok(sunoAlbums.every((album) => album.url === `https://suno.com/album/${album.id}` && album.songCount > 0 && album.sourceTracks.length === album.songCount && album.pageUrl));
for (const album of sunoAlbums) assert.ok(existsSync(new URL(`dist/suno/albums/${album.slug}/index.html`, root)), `Missing Suno album page for ${album.name}.`);
const sourceYoutubeMetadata = JSON.parse(read('src/data/youtube-metadata.json'));
assert.ok(Object.keys(sourceYoutubeMetadata).length >= catalog.videos.length);
assert.equal(Object.values(sourceYoutubeMetadata).filter((video) => video.channelPosition).length, catalog.videos.length);

for (const path of ['dist/songs/index.html', 'dist/videos/index.html', 'dist/suno/index.html', 'dist/suno-prompting-guide/index.html', 'dist/music-theory/index.html', 'dist/stories/index.html', 'dist/webmcp/index.html', 'dist/feed.xml', 'dist/feed.json', 'dist/song-index.json', 'dist/video-index.json', 'dist/catalog-summary.json', 'dist/catalog.schema.json', 'dist/llms-full.txt']) {
  assert.ok(existsSync(new URL(path, root)), `Missing built discovery surface: ${path}`);
}
const promptingPage = read('dist/suno-prompting-guide/index.html');
assert.ok(promptingPage.includes('TechArticle') && promptingPage.includes('FAQPage'), 'The prompting guide is missing structured data.');
assert.ok(!promptingPage.includes('.pdf'), 'The prompting guide must not publish or link to the source PDF.');
assert.ok(!existsSync(new URL('dist/guides/suno-prompting-field-guide.pdf', root)), 'The source PDF must not be included in the built site.');
for (const section of ['Interactive workbench', 'Genre atlas', 'Keys and chord progressions', 'Time signatures and beat grouping', 'Odd-meter drum maps', 'Melody and vocal writing', 'Arrangement blueprints', 'Prompt, edit or produce?', 'Control boundary', 'Studio production', 'Generation diagnosis', 'Before and after', 'Project-level prompting', 'Instrumentation and voice', 'Rhythm, harmony and form', 'References and hybrid genres', 'Master vocabulary', 'Score each candidate']) {
  assert.ok(promptingPage.includes(section), `The prompting guide is missing the ${section} section.`);
}
assert.ok(promptingPage.includes('not sent to the generative model'), 'The prompting guide must explain the Studio time-signature limitation.');
assert.ok(promptingPage.includes('i-VI-III-VII') && promptingPage.includes('7/8 grouped 2+2+3'), 'The prompting guide is missing practical harmony or meter examples.');
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
for (const video of catalog.videos) assert.ok(videoIndex.videos.some((item) => item.id === video.id && item.pageUrl === video.pageUrl.replace(catalog.site, '')), `${video.title} is missing from the lightweight video index.`);
assert.match(read('dist/feed.xml'), /<rss version="2\.0"/);
assert.equal(JSON.parse(read('dist/feed.json')).version, 'https://jsonfeed.org/version/1.1');
const sunoPage = read('dist/suno/index.html');
for (const playlist of sunoPlaylists) assert.ok(sunoPage.includes(playlist.url), `${playlist.name} is missing from the Suno page.`);
for (const album of sunoAlbums) assert.ok(sunoPage.includes(album.url), `${album.name} is missing from the Suno page.`);
for (const playlist of sunoPlaylists) {
  const path = `dist/suno/playlists/${playlist.slug}/index.html`;
  assert.ok(existsSync(new URL(path, root)), `${playlist.name} is missing its local page.`);
  const html = read(path);
  assert.ok(html.includes(playlist.url) && html.includes('BreadcrumbList'), `${playlist.name} is missing source or structured data.`);
}

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
const aiPerspectiveUrl = 'https://amdatalakehouse.substack.com/p/when-hard-becomes-easy-ai-art-and';
for (const path of ['dist/suno/index.html', 'dist/stories/index.html', 'dist/stories/revisiting-songs-with-suno/index.html', 'dist/about/index.html', 'dist/llms.txt', 'dist/llms-full.txt']) {
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

const expectedTools = ['music_overview', 'get_song', 'search_songs', 'list_songs', 'get_recent_songs', 'list_videos', 'get_video', 'compare_versions', 'list_suno_playlists', 'get_suno_playlist', 'list_suno_albums', 'get_suno_album', 'get_catalog_updates_since', 'get_suno_prompting_guide', 'get_suno_prompting_section', 'search_suno_prompting_guide', 'compose_suno_prompt', 'transpose_chord_progression', 'design_meter_prompt', 'diagnose_suno_result', 'build_arrangement_blueprint', 'create_album_style_bible', 'get_music_theory_guide', 'get_music_theory_section', 'build_scale', 'build_chord', 'translate_roman_progression', 'suggest_theory_palette', 'list_reimaginings', 'list_albums', 'where_to_listen', 'get_ai_music_perspective', 'navigate_catalog'];
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
const exactVideo = JSON.parse(await getTool('get_video').execute({ youtubeId: '6CjtRMTSjTw' }));
assert.equal(exactVideo.video.youtubeId, '6CjtRMTSjTw');
assert.ok(exactVideo.songs.some((song) => song.title === 'Solemn Thoughts'));
assert.ok(exactVideo.otherVersions.some((song) => song.title === 'Eadd9 Improv'));
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
const albumResult = JSON.parse(await getTool('list_suno_albums').execute({}));
assert.equal(albumResult.count, sunoAlbums.length);
const canonicalSunoAlbum = sunoAlbums.find((album) => album.id === '51dc8194-9cc8-4d07-8923-ebdaf9bed812');
assert.ok(canonicalSunoAlbum && canonicalSunoAlbum.songCount === 30);
const sunoAlbum = JSON.parse(await getTool('get_suno_album').execute({ id: canonicalSunoAlbum.id }));
assert.equal(sunoAlbum.tracks.length, 30);
assert.ok(sunoAlbum.tracks.every((track) => track.catalogSong));
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

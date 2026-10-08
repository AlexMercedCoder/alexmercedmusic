import { readFile } from 'node:fs/promises';

const catalog = JSON.parse(await readFile(new URL('../dist/catalog.json', import.meta.url), 'utf8'));
const urls = [...new Set([
  ...catalog.songs.flatMap((song) => song.links.map((link) => link.url)),
  ...catalog.albums.map((album) => album.sourceUrl),
  ...catalog.platforms.map((platform) => platform.url),
  ...catalog.suno.playlists.map((playlist) => playlist.url),
  ...catalog.suno.albums.map((album) => album.url),
])];
const failures = [];
let cursor = 0;

async function worker() {
  while (cursor < urls.length) {
    const url = urls[cursor++];
    try {
      const sunoCollectionId = new URL(url).hostname === 'suno.com'
        ? new URL(url).pathname.match(/^\/(?:album|playlist)\/([a-f0-9-]{36})\/?$/)?.[1]
        : undefined;
      if (sunoCollectionId) {
        const response = await fetch(`https://studio-api.prod.suno.com/api/playlist/${sunoCollectionId}/?page=1`, { signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'AlexMercedMusic link monitor/1.0' } });
        if (response.status >= 400 && ![401, 403, 405, 429].includes(response.status)) failures.push({ url, status: response.status });
        continue;
      }
      let response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'AlexMercedMusic link monitor/1.0' } });
      // Suno's page edge sometimes returns 404 to HEAD while the same public URL
      // returns 200 to GET. Verify those responses before reporting a broken link.
      if (response.status === 404 && new URL(url).hostname === 'suno.com') {
        response = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'AlexMercedMusic link monitor/1.0' } });
      }
      if (response.status >= 400 && ![401, 403, 405, 429].includes(response.status)) failures.push({ url, status: response.status });
    } catch (error) {
      failures.push({ url, error: error instanceof Error ? error.message : String(error) });
    }
  }
}

await Promise.all(Array.from({ length: 6 }, () => worker()));
console.log(`Checked ${urls.length} unique external links; ${failures.length} actionable failures.`);
for (const failure of failures) console.error(JSON.stringify(failure));
if (failures.length) process.exit(1);

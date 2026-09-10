import { readFile } from 'node:fs/promises';

const catalog = JSON.parse(await readFile(new URL('../dist/catalog.json', import.meta.url), 'utf8'));
const urls = [...new Set([
  ...catalog.songs.flatMap((song) => song.links.map((link) => link.url)),
  ...catalog.albums.map((album) => album.sourceUrl),
  ...catalog.platforms.map((platform) => platform.url),
  ...catalog.suno.playlists.map((playlist) => playlist.url),
])];
const failures = [];
let cursor = 0;

async function worker() {
  while (cursor < urls.length) {
    const url = urls[cursor++];
    try {
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'AlexMercedMusic link monitor/1.0' } });
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

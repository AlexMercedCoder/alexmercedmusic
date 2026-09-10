import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const catalogSource = await readFile(new URL('src/data/catalog.ts', root), 'utf8');
const outputUrl = new URL('src/data/youtube-metadata.json', root);
const shouldWrite = process.argv.includes('--write');
const ids = [...new Set([...catalogSource.matchAll(/youtube\.com\/watch\?v=([\w-]{11})/g)].map((match) => match[1]))];
const results = {};
let cursor = 0;

const decode = (value) => value
  ?.replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'")
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>');

async function worker() {
  while (cursor < ids.length) {
    const id = ids[cursor++];
    const response = await fetch(`https://www.youtube.com/watch?v=${id}`, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; AlexMercedMusic metadata sync/1.0)' },
    });
    if (!response.ok) throw new Error(`YouTube ${id} failed with HTTP ${response.status}.`);
    const html = await response.text();
    const published = html.match(/itemprop="uploadDate" content="([^"]+)"/)?.[1]
      ?? html.match(/"uploadDate":"([^"]+)"/)?.[1];
    const title = decode(html.match(/<meta name="title" content="([^"]+)"/)?.[1]);
    const imageUrl = decode(html.match(/<meta property="og:image" content="([^"]+)"/)?.[1]);
    if (!published) throw new Error(`YouTube ${id} did not expose an upload date.`);
    results[id] = { publishedAt: published, title, imageUrl };
  }
}

await Promise.all(Array.from({ length: 6 }, () => worker()));
const ordered = Object.fromEntries(ids.map((id) => [id, results[id]]));
const serialized = `${JSON.stringify(ordered, null, 2)}\n`;
let current = '';
try { current = await readFile(outputUrl, 'utf8'); } catch {}
console.log(`YouTube: recovered exact upload dates and thumbnails for ${ids.length} videos.`);
if (serialized === current) process.exit(0);
if (!shouldWrite) {
  console.error('Run npm run sync:youtube -- --write to accept the metadata update.');
  process.exit(1);
}
await writeFile(outputUrl, serialized);
console.log(`Wrote ${fileURLToPath(outputUrl)}.`);

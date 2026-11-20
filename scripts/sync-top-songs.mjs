import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('../src/data/top-songs.json', import.meta.url);
const endpoint = 'https://activity.alexmercedcloud.com/top';
const validItem = (item) => item && /^[a-z0-9][a-z0-9-]{0,119}$/.test(item.song)
  && ['total', 'views', 'plays', 'listens', 'downloads'].every((key) => Number.isSafeInteger(item[key]) && item[key] >= 0);

try {
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (data.windowDays !== 90 || !Array.isArray(data.items) || data.items.length > 100 || !data.items.every(validItem)) {
    throw new Error('Unexpected ranking response');
  }
  const snapshot = { schemaVersion: 1, windowDays: 90, asOf: data.asOf, items: data.items };
  await writeFile(path, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Top songs: refreshed ${snapshot.items.length} ranked songs.`);
} catch (error) {
  await readFile(path, 'utf8');
  console.warn(`Top songs: keeping the last snapshot (${error.message}).`);
}

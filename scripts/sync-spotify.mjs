import { readFile, writeFile } from 'node:fs/promises';

const output = new URL('../src/data/spotify-tracks.json', import.meta.url);
const albums = [
  { id: '09kE4PLWoT4M9UDBclJGJL', title: 'A Collection of Songs that Exist, Vol. 1', count: 35 },
  { id: '4A5oDUq04pE1vFf0B9thsF', title: 'A Collection of Songs that Exist, Vol. 3', count: 21 },
  { id: '6lk2RMsRfFrjKN4NuNQZ9l', title: 'Food, Nostalgia and Paris', count: 15 },
  { id: '4zphlfEYn9MeKkS4IC3eGO', title: "I'm Secure I Know My Insecurities", count: 12 },
  { id: '4HvrKAzdMrXrQwUuYqk97Q', title: "Yes. I'm Weird.", count: 10 },
  { id: '09y38lZaA6LHoVY5H4FMvh', title: 'Everyone is Worth It', count: 5 },
  { id: '7mrtyIrS1g3sEHiGdB0Unz', title: "The One Who Can't Be Love (Alex's Voice AI Reimagined)", count: 1 },
  { id: '0oJ6FJpxIxAnloqVmXlx9w', title: 'The Raw Acoustic Recordings (Original Version)', count: 7 },
  { id: '4YuwQtNCMflHJ15RQxWPo8', title: 'Songs for your Consideration', count: 20 },
  { id: '7kdOTWCYo9EZnlik3QDD57', title: 'Tell My Heart (Actual Original Acoustic Version)', count: 1 },
];

const tracks = [];
for (const album of albums) {
  const response = await fetch(`https://open.spotify.com/embed/album/${album.id}`, {
    headers: { 'user-agent': 'AlexMercedMusic catalog sync/1.0 (+https://alexmercedmusic.com)' },
  });
  if (!response.ok) throw new Error(`Spotify album ${album.id} returned HTTP ${response.status}.`);
  const html = await response.text();
  const embeddedData = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/)?.[1];
  if (!embeddedData) throw new Error(`Spotify album ${album.id} had no readable track data.`);
  const entity = JSON.parse(embeddedData).props?.pageProps?.state?.data?.entity;
  if (entity?.id !== album.id || entity?.title !== album.title || entity?.subtitle !== 'Alex Merced' || entity?.trackList?.length !== album.count) {
    throw new Error(`Unexpected Spotify album identity or track count for ${album.id}.`);
  }
  for (const track of entity.trackList) {
    const id = track.uri?.match(/^spotify:track:([A-Za-z0-9]{22})$/)?.[1];
    if (!id || !track.title || track.subtitle !== 'Alex Merced') throw new Error(`Unexpected track in ${album.title}.`);
    tracks.push({
      albumId: album.id,
      id,
      title: track.title,
      url: `https://open.spotify.com/track/${id}`,
      durationSeconds: Math.round(track.duration / 1000),
    });
  }
}

const serialized = `${JSON.stringify(tracks, null, 2)}\n`;
const previous = await readFile(output, 'utf8').catch(() => '');
if (process.argv.includes('--write')) {
  if (serialized !== previous) await writeFile(output, serialized);
  console.log(`Spotify: saved ${tracks.length} tracks from ${albums.length} verified releases.`);
} else {
  console.log(`Spotify: ${tracks.length} verified tracks; ${serialized === previous ? 'catalog is current' : 'catalog differs, run with --write'}.`);
  if (serialized !== previous) process.exitCode = 1;
}

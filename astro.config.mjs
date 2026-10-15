// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';
import { songs, videos, songRichness, songById, albumById, catalogAlbums, catalogSunoAlbums } from './src/data/catalog-model';

// P4.9: video pages canonicalize to their song page or are noindexed, so none
// belong in the sitemap. Song pages are weighted by how much they offer.
const videoPages = new Set(videos.map((video) => video.pageUrl));
const songPriority = new Map(songs.map((song) => {
  const score = songRichness(song);
  return [song.pageUrl, score >= 5 ? 0.8 : score >= 4 ? 0.6 : 0.4];
}));
// Sitemap lastmod is the content's own date, never the build time (network rule).
// Catalog pages take the newest publish date among the recordings they show;
// hand-written pages use scripts/page-dates.mjs (last content commit).
/** @param {unknown} value @returns {string | undefined} */
const day = (value) => (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : undefined);
/** @param {unknown[]} values */
const newest = (values) => values.map(day).filter(Boolean).sort().at(-1);
// Electronic tracks carry no upload date; fall back to their album's release date.
/** @param {import('./src/data/catalog-model').CatalogSong} song */
const songDate = (song) => newest([
  song.createdAt ?? (song.albumId ? albumById.get(song.albumId)?.released : undefined),
  ...(song.reimaginedTrackIds ?? []).map((id) => songById.get(id)?.createdAt),
]);
/** @type {Map<string, string | undefined>} */
const lastmod = new Map();
for (const song of songs) lastmod.set(song.pageUrl, songDate(song));
for (const album of catalogAlbums) lastmod.set(album.pageUrl, newest([album.released, ...album.trackIds.map((id) => songById.get(id)?.createdAt)]));
for (const collection of catalogSunoAlbums) {
  lastmod.set(collection.pageUrl, newest(collection.sourceTracks.map((track) => track.createdAt)));
}
/** @param {(song: import('./src/data/catalog-model').CatalogSong) => boolean} filter */
const songsOf = (filter) => newest(songs.filter(filter).map(songDate));
const latestVideo = newest(videos.map((video) => video.publishedAt));
/** @type {Record<string, string | undefined>} */
const sectionDates = {
  '/': newest([songsOf(() => true), latestVideo]),
  '/listen/': songsOf(() => true),
  '/songs/': songsOf(() => true),
  '/suno/': songsOf((song) => song.era === 'ai'),
  '/reimagined/': songsOf((song) => song.kind === 'reimagined'),
  '/acoustic/': songsOf((song) => song.era === 'acoustic'),
  '/electronic/': songsOf((song) => song.era === 'electronic'),
  '/videos/': latestVideo,
  ...JSON.parse(readFileSync('./src/data/page-dates.json', 'utf8')),
};

const sectionPages = new Set(['/', '/acoustic/', '/electronic/', '/reimagined/', '/suno/', '/songs/', '/videos/', '/stories/', '/about/', '/listen/']);

export default defineConfig({
  site: 'https://alexmercedmusic.com',
  image: { remotePatterns: [{ protocol: 'https', hostname: '**.suno.ai' }] },
  trailingSlash: 'always',
  integrations: [sitemap({
    filter: (page) => !videoPages.has(page),
    serialize(item) {
      const path = new URL(item.url).pathname;
      if (songPriority.has(item.url)) item.priority = songPriority.get(item.url);
      else if (path === '/') item.priority = 1.0;
      else if (sectionPages.has(path)) item.priority = 0.9;
      else if (path.startsWith('/albums/') || path.startsWith('/stories/')) item.priority = 0.7;
      const date = lastmod.get(item.url) ?? sectionDates[path];
      if (date) item.lastmod = date;
      return item;
    },
  })],
  build: { format: 'directory' },
});

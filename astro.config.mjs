// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { songs, videos, songRichness } from './src/data/catalog-model';

// P4.9: video pages canonicalize to their song page or are noindexed, so none
// belong in the sitemap. Song pages are weighted by how much they offer.
const videoPages = new Set(videos.map((video) => video.pageUrl));
const songPriority = new Map(songs.map((song) => {
  const score = songRichness(song);
  return [song.pageUrl, score >= 5 ? 0.8 : score >= 4 ? 0.6 : 0.4];
}));
const sectionPages = new Set(['/', '/acoustic/', '/electronic/', '/reimagined/', '/suno/', '/songs/', '/videos/', '/stories/', '/about/', '/listen/']);

export default defineConfig({
  site: 'https://alexmercedmusic.com',
  trailingSlash: 'always',
  integrations: [sitemap({
    filter: (page) => !videoPages.has(page),
    serialize(item) {
      const path = new URL(item.url).pathname;
      if (songPriority.has(item.url)) item.priority = songPriority.get(item.url);
      else if (path === '/') item.priority = 1.0;
      else if (sectionPages.has(path)) item.priority = 0.9;
      else if (path.startsWith('/albums/') || path.startsWith('/stories/')) item.priority = 0.7;
      return item;
    },
  })],
  build: { format: 'directory' },
});

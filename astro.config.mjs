// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://alexmercedmusic.com',
  trailingSlash: 'always',
  integrations: [sitemap({
    serialize(item) {
      if (item.url.includes('/songs/') || item.url.includes('/albums/')) {
        item.lastmod = '2026-09-12';
      }
      return item;
    },
  })],
  build: { format: 'directory' },
});

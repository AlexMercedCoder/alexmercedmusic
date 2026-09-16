import type { APIRoute } from 'astro';
import { publicCatalog } from '../data/catalog-model';

export const GET: APIRoute = () => new Response(JSON.stringify({
  schemaVersion: publicCatalog.schemaVersion,
  updatedAt: publicCatalog.updatedAt,
  site: publicCatalog.site,
  counts: publicCatalog.counts,
  endpoints: {
    fullCatalog: `${publicCatalog.site}/catalog.json`,
    schema: `${publicCatalog.site}/catalog.schema.json`,
    songIndex: `${publicCatalog.site}/song-index.json`,
    llms: `${publicCatalog.site}/llms.txt`,
    llmsFull: `${publicCatalog.site}/llms-full.txt`,
  },
  recentSongs: publicCatalog.songs.filter((song) => song.createdAt).slice().sort((a, b) => Date.parse(b.createdAt!) - Date.parse(a.createdAt!)).slice(0, 20).map((song) => ({ id: song.id, title: song.title, pageUrl: song.pageUrl, createdAt: song.createdAt, kind: song.kind })),
  sunoPlaylists: publicCatalog.suno.playlists.map(({ trackIds: _trackIds, sourceTracks: _sourceTracks, ...playlist }) => playlist),
}), { headers: { 'content-type': 'application/json; charset=utf-8' } });

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
    videoIndex: `${publicCatalog.site}/video-index.json`,
    llms: `${publicCatalog.site}/llms.txt`,
    llmsFull: `${publicCatalog.site}/llms-full.txt`,
  },
  recentSongs: publicCatalog.songs.filter((song) => song.createdAt).slice().sort((a, b) => Date.parse(b.createdAt!) - Date.parse(a.createdAt!)).slice(0, 20).map((song) => ({ id: song.id, title: song.title, pageUrl: song.pageUrl, createdAt: song.createdAt, kind: song.kind })),
  recentVideos: publicCatalog.videos.slice(0, 20).map((video) => ({ id: video.id, title: video.title, pageUrl: video.pageUrl, publishedAt: video.publishedAt, songIds: video.songIds, relatedSongIds: video.relatedSongIds })),
  sunoPlaylists: publicCatalog.suno.playlists.map(({ trackIds: _trackIds, sourceTracks: _sourceTracks, ...playlist }) => playlist),
}), { headers: { 'content-type': 'application/json; charset=utf-8' } });

import { SITE, videos } from '../data/catalog-model';

export const prerender = true;

export function GET() {
  return new Response(JSON.stringify({
    count: videos.length,
    videos: videos.map((video) => ({
      id: video.id,
      youtubeId: video.youtubeId,
      title: video.title,
      pageUrl: video.pageUrl.replace(SITE, ''),
      watchUrl: video.watchUrl,
      imageUrl: video.imageUrl,
      publishedAt: video.publishedAt,
      durationSeconds: video.durationSeconds ?? 0,
      songIds: video.songIds,
      relatedSongIds: video.relatedSongIds,
    })),
  }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}

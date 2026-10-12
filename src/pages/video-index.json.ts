import { SITE, videos } from '../data/catalog-model';

export const prerender = true;

export function GET() {
  return new Response(JSON.stringify({
    count: videos.length,
    shortsCount: videos.filter((video) => video.videoType === 'short').length,
    videosCount: videos.filter((video) => video.videoType === 'video').length,
    videos: videos.map((video) => ({
      id: video.id,
      youtubeId: video.youtubeId,
      title: video.title,
      pageUrl: video.pageUrl.replace(SITE, ''),
      watchUrl: video.watchUrl,
      imageUrl: video.imageUrl,
      publishedAt: video.publishedAt,
      durationSeconds: video.durationSeconds ?? 0,
      videoType: video.videoType,
      songIds: video.songIds,
      relatedSongIds: video.relatedSongIds,
    })),
  }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}

import type { APIRoute } from 'astro';
import { CATALOG_UPDATED_AT, SITE, songs } from '../data/catalog-model';

const embedFor = (song: (typeof songs)[number]) => {
  const youtube = song.links.find((link) => link.source === 'youtube');
  if (youtube) return `https://www.youtube-nocookie.com/embed/${new URL(youtube.url).searchParams.get('v')}`;
  if (song.embedUrl) return song.embedUrl;
  const soundcloud = song.links.find((link) => link.source.startsWith('soundcloud'));
  return soundcloud ? `https://w.soundcloud.com/player/?url=${encodeURIComponent(soundcloud.url)}&auto_play=false&hide_related=true&show_comments=false` : undefined;
};

export const GET: APIRoute = () => new Response(JSON.stringify({
  updatedAt: CATALOG_UPDATED_AT,
  count: songs.length,
  songs: songs.map((song, index) => ({
    id: song.id,
    index,
    title: song.title,
    pageUrl: song.pageUrl.replace(SITE, ''),
    era: song.era,
    kind: song.kind,
    album: song.album ?? null,
    genres: song.genres ?? [],
    style: song.style ?? null,
    sources: [...new Set(song.links.map((link) => link.source.replace('soundcloud-albums', 'soundcloud'))) ],
    sourceUrl: song.links[0].url,
    createdAt: song.createdAt ?? null,
    duration: song.seconds ?? song.durationSeconds ?? 0,
    embedUrl: embedFor(song) ?? null,
  })),
}), { headers: { 'content-type': 'application/json; charset=utf-8' } });

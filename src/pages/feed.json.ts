import type { APIRoute } from 'astro';
import { songs } from '../data/catalog-model';

const recent = songs.filter((song) => song.createdAt).sort((a, b) => Date.parse(b.createdAt!) - Date.parse(a.createdAt!)).slice(0, 50);
export const GET: APIRoute = () => new Response(JSON.stringify({
  version: 'https://jsonfeed.org/version/1.1',
  title: 'Alex Merced Music — recently published',
  home_page_url: 'https://alexmercedmusic.com/',
  feed_url: 'https://alexmercedmusic.com/feed.json',
  description: 'Recently published and cataloged music by Alex Merced.',
  items: recent.map((song) => ({
    id: song.id,
    url: song.pageUrl,
    title: song.title,
    content_text: song.description,
    date_published: song.createdAt,
    image: song.imageLargeUrl ?? song.imageUrl,
    tags: song.genres,
  })),
}, null, 2), { headers: { 'content-type': 'application/feed+json; charset=utf-8' } });

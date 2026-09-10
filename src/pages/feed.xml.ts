import type { APIRoute } from 'astro';
import { songs } from '../data/catalog-model';

const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const recent = songs.filter((song) => song.createdAt).sort((a, b) => Date.parse(b.createdAt!) - Date.parse(a.createdAt!)).slice(0, 50);

export const GET: APIRoute = () => new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>Alex Merced Music — recently published</title>
<link>https://alexmercedmusic.com/</link>
<description>Recently published and cataloged music by Alex Merced.</description>
<language>en-us</language>
<lastBuildDate>${new Date(recent[0]?.createdAt ?? Date.now()).toUTCString()}</lastBuildDate>
${recent.map((song) => `<item><title>${escape(song.title)}</title><link>${song.pageUrl}</link><guid isPermaLink="false">${escape(song.id)}</guid><pubDate>${new Date(song.createdAt!).toUTCString()}</pubDate><description>${escape(song.description)}</description></item>`).join('\n')}
</channel></rss>`, { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } });

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const catalogSource = await readFile(new URL('src/data/catalog.ts', root), 'utf8');
const outputUrl = new URL('src/data/youtube-metadata.json', root);
const shouldWrite = process.argv.includes('--write');
const channelUrl = 'https://www.youtube.com/@alexmercedmusic/videos';
const userAgent = 'Mozilla/5.0 (compatible; AlexMercedMusic catalog sync/2.0)';

const decode = (value) => value
  ?.replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'")
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>');

const parseInitialData = (html) => {
  const marker = 'var ytInitialData = ';
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) throw new Error('YouTube did not expose its initial channel data.');
  const start = markerIndex + marker.length;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < html.length; index += 1) {
    const character = html[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
    } else if (character === '"') inString = true;
    else if (character === '{') depth += 1;
    else if (character === '}' && --depth === 0) return JSON.parse(html.slice(start, index + 1));
  }
  throw new Error('YouTube channel data was incomplete.');
};

const parseDuration = (value) => {
  if (!/^\d+(?::\d+){1,2}$/.test(value ?? '')) return undefined;
  return value.split(':').reduce((total, part) => total * 60 + Number(part), 0);
};

const scanChannelPage = (data) => {
  const videos = [];
  let continuation;
  const walk = (value) => {
    if (!value || typeof value !== 'object') return;
    const video = value.lockupViewModel;
    if (video?.contentId && video.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO') {
      const badges = video.contentImage?.thumbnailViewModel?.overlays
        ?.flatMap((overlay) => overlay.thumbnailBottomOverlayViewModel?.badges ?? []) ?? [];
      videos.push({
        id: video.contentId,
        title: video.metadata?.lockupMetadataViewModel?.title?.content,
        durationSeconds: parseDuration(badges.map((badge) => badge.thumbnailBadgeViewModel?.text).find(Boolean)),
      });
    }
    if (!continuation && value.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token) {
      continuation = value.continuationItemRenderer.continuationEndpoint.continuationCommand.token;
    }
    for (const nested of Object.values(value)) walk(nested);
  };
  walk(data);
  return { videos, continuation };
};

const channelResponse = await fetch(channelUrl, { headers: { 'user-agent': userAgent } });
if (!channelResponse.ok) throw new Error(`YouTube channel failed with HTTP ${channelResponse.status}.`);
const channelHtml = await channelResponse.text();
const apiKey = channelHtml.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
const clientVersion = channelHtml.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1];
const visitorData = channelHtml.match(/"VISITOR_DATA":"([^"]+)"/)?.[1];
if (!apiKey || !clientVersion) throw new Error('YouTube did not expose channel pagination settings.');

let page = scanChannelPage(parseInitialData(channelHtml));
const channelVideos = [];
const seenChannelIds = new Set();
while (true) {
  for (const video of page.videos) {
    if (seenChannelIds.has(video.id)) continue;
    seenChannelIds.add(video.id);
    channelVideos.push(video);
  }
  if (!page.continuation) break;
  const response = await fetch(`https://www.youtube.com/youtubei/v1/browse?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': userAgent,
      'x-youtube-client-name': '1',
      'x-youtube-client-version': clientVersion,
    },
    body: JSON.stringify({
      context: { client: { clientName: 'WEB', clientVersion, ...(visitorData ? { visitorData } : {}) } },
      continuation: page.continuation,
    }),
  });
  if (!response.ok) throw new Error(`YouTube channel pagination failed with HTTP ${response.status}.`);
  page = scanChannelPage(await response.json());
}

const embeddedIds = [...new Set([...catalogSource.matchAll(/youtube\.com\/watch\?v=([\w-]{11})/g)].map((match) => match[1]))];
const discovered = new Map(channelVideos.map((video, index) => [video.id, { ...video, channelPosition: index + 1 }]));
for (const id of embeddedIds) if (!discovered.has(id)) discovered.set(id, { id });
const ids = [...discovered.keys()];
const results = {};
let cursor = 0;

async function worker() {
  while (cursor < ids.length) {
    const id = ids[cursor++];
    const response = await fetch(`https://www.youtube.com/watch?v=${id}`, { headers: { 'user-agent': userAgent } });
    if (!response.ok) throw new Error(`YouTube ${id} failed with HTTP ${response.status}.`);
    const html = await response.text();
    const publishedAt = html.match(/itemprop="uploadDate" content="([^"]+)"/)?.[1]
      ?? html.match(/"uploadDate":"([^"]+)"/)?.[1];
    const title = discovered.get(id)?.title ?? decode(html.match(/<meta name="title" content="([^"]+)"/)?.[1]);
    const seconds = discovered.get(id)?.durationSeconds ?? Number(html.match(/"lengthSeconds":"(\d+)"/)?.[1]);
    if (!publishedAt || !title) throw new Error(`YouTube ${id} did not expose complete public metadata.`);
    results[id] = {
      publishedAt,
      title,
      imageUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      ...(Number.isFinite(seconds) && seconds > 0 ? { durationSeconds: seconds } : {}),
      ...(discovered.get(id)?.channelPosition ? { channelPosition: discovered.get(id).channelPosition } : {}),
    };
  }
}

await Promise.all(Array.from({ length: 10 }, () => worker()));
const ordered = Object.fromEntries(ids.map((id) => [id, results[id]]));
const serialized = `${JSON.stringify(ordered, null, 2)}\n`;
let current = '';
try { current = await readFile(outputUrl, 'utf8'); } catch {}
console.log(`YouTube: discovered ${channelVideos.length} public channel videos and recovered metadata for ${ids.length} videos.`);
if (serialized === current) process.exit(0);
if (!shouldWrite) {
  console.error('Run npm run sync:youtube -- --write to accept the metadata update.');
  process.exit(1);
}
await writeFile(outputUrl, serialized);
console.log(`Wrote ${fileURLToPath(outputUrl)}.`);

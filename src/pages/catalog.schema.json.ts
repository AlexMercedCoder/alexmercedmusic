import type { APIRoute } from 'astro';

export const GET: APIRoute = () => new Response(JSON.stringify({
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  '$id': 'https://alexmercedmusic.com/catalog.schema.json',
  title: 'Alex Merced Music catalog',
  type: 'object',
  required: ['schemaVersion', 'updatedAt', 'site', 'counts', 'songs', 'albums', 'suno'],
  properties: {
    schemaVersion: { type: 'string' }, updatedAt: { type: 'string', format: 'date' }, site: { type: 'string', format: 'uri' },
    counts: { type: 'object' }, songs: { type: 'array', items: { '$ref': '#/$defs/song' } }, albums: { type: 'array' }, suno: { type: 'object' }, guides: { type: 'object' }, platforms: { type: 'array' },
  },
  '$defs': { song: { type: 'object', required: ['id', 'slug', 'title', 'era', 'kind', 'pageUrl', 'links'], properties: { id: { type: 'string' }, slug: { type: 'string' }, title: { type: 'string' }, era: { enum: ['acoustic', 'electronic', 'ai'] }, kind: { enum: ['archive', 'electronic', 'reimagined', 'generated'] }, pageUrl: { type: 'string', format: 'uri' }, links: { type: 'array', minItems: 1 } } } },
}), { headers: { 'content-type': 'application/schema+json; charset=utf-8' } });

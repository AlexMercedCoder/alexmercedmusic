import type { APIRoute } from 'astro';
import { publicCatalog } from '../data/catalog-model';

export const prerender = true;

export const GET: APIRoute = () => new Response(JSON.stringify(publicCatalog, null, 2), {
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
  },
});

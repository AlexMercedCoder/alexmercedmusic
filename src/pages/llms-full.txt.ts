import type { APIRoute } from 'astro';
import { publicCatalog } from '../data/catalog-model';

export const GET: APIRoute = () => {
  const body = `# Alex Merced Music: full catalog guide

Catalog updated: ${publicCatalog.updatedAt}
Schema version: ${publicCatalog.schemaVersion}

## Counts

${Object.entries(publicCatalog.counts).map(([name, count]) => `- ${name}: ${count}`).join('\n')}

## Suno playlists

${publicCatalog.suno.playlists.map((playlist) => `### ${playlist.name}\n\n${playlist.description}\n\n- Local page: ${playlist.pageUrl}\n- Suno source: ${playlist.url}\n- Songs: ${playlist.songCount}\n- Stable track IDs: ${playlist.trackIds.join(', ')}`).join('\n\n')}

## Electronic albums

${publicCatalog.albums.map((album) => `### ${album.title}\n\n- Page: ${album.pageUrl}\n- Source: ${album.sourceUrl}\n- Released: ${album.released}\n- Track IDs: ${album.trackIds.join(', ')}`).join('\n\n')}

## Every song

${publicCatalog.songs.map((song) => `### ${song.title}\n\n- ID: ${song.id}\n- Page: ${song.pageUrl}\n- Era: ${song.era}\n- Kind: ${song.kind}\n- Description: ${song.description}\n- Sources: ${song.links.map((link) => `${link.label}: ${link.url}`).join('; ')}${song.createdAt ? `\n- Published: ${song.createdAt}` : ''}${song.album ? `\n- Album: ${song.album}` : ''}${song.originalPageUrl ? `\n- Original: ${song.originalPageUrl}` : ''}${song.reimaginedPageUrls?.length ? `\n- Reimagined versions: ${song.reimaginedPageUrls.join(', ')}` : ''}`).join('\n\n')}

## API resources

- ${publicCatalog.site}/catalog-summary.json
- ${publicCatalog.site}/catalog.json
- ${publicCatalog.site}/catalog.schema.json
- ${publicCatalog.site}/song-index.json
- ${publicCatalog.site}/webmcp/
`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};

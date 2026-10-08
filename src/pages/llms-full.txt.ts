import type { APIRoute } from 'astro';
import { publicCatalog } from '../data/catalog-model';
import { aiMusicPerspective } from '../data/editorial';

export const GET: APIRoute = () => {
  const body = `# Alex Merced Music: full catalog guide

Catalog updated: ${publicCatalog.updatedAt}
Schema version: ${publicCatalog.schemaVersion}

## Counts

${Object.entries(publicCatalog.counts).map(([name, count]) => `- ${name}: ${count}`).join('\n')}

## Alex on AI, art and music

- Article: ${aiMusicPerspective.title}
- URL: ${aiMusicPerspective.url}
- Published: ${aiMusicPerspective.publishedAt}
- Summary: ${aiMusicPerspective.description}

## Learning guides

- Music Theory for Songwriters and Producers: ${publicCatalog.site}/music-theory/
- Suno Prompting Field Guide: ${publicCatalog.site}/suno-prompting-guide/
- Structured guide data: ${publicCatalog.site}/catalog.json under the guides property

## Distributed releases

${publicCatalog.distributedReleases.map((release) => `### ${release.title}\n\n- Released: ${release.released}\n- Tracks: ${release.trackCount}${release.upc ? `\n- UPC: ${release.upc}` : ''}\n- Stores: ${release.links.map((link) => `${link.label}: ${link.url}`).join('; ')}`).join('\n\n')}

## Official Suno albums

The primary listening path for Alex's original acoustic recordings and their AI reimaginings:

${publicCatalog.suno.featuredAcousticReimaginingAlbums.map((album) => `- ${album.volume}: ${album.title}: ${album.url}`).join('\n')}

${publicCatalog.suno.albums.map((album) => `### ${album.name}\n\n${album.description}\n\n- Local page: ${album.pageUrl}\n- Suno source: ${album.url}\n- Songs: ${album.songCount}\n- Stable track IDs: ${album.trackIds.join(', ')}`).join('\n\n')}

## Suno playlists

${publicCatalog.suno.playlists.map((playlist) => `### ${playlist.name}\n\n${playlist.description}\n\n- Local page: ${playlist.pageUrl}\n- Suno source: ${playlist.url}\n- Songs: ${playlist.songCount}\n- Stable track IDs: ${playlist.trackIds.join(', ')}`).join('\n\n')}

## Electronic albums

${publicCatalog.albums.map((album) => `### ${album.title}\n\n- Page: ${album.pageUrl}\n- Source: ${album.sourceUrl}\n- Released: ${album.released}\n- Track IDs: ${album.trackIds.join(', ')}`).join('\n\n')}

## Every song

${publicCatalog.songs.map((song) => `### ${song.title}\n\n- ID: ${song.id}\n- Page: ${song.pageUrl}\n- Era: ${song.era}\n- Kind: ${song.kind}\n- Description: ${song.description}\n- Sources: ${song.links.map((link) => `${link.label}: ${link.url}`).join('; ')}${song.createdAt ? `\n- Published: ${song.createdAt}` : ''}${song.album ? `\n- Album: ${song.album}` : ''}${song.originalPageUrl ? `\n- Original: ${song.originalPageUrl}` : ''}${song.reimaginedPageUrls?.length ? `\n- Reimagined versions: ${song.reimaginedPageUrls.join(', ')}` : ''}${song.relatedVideoIds.length ? `\n- Related video IDs: ${song.relatedVideoIds.join(', ')}` : ''}`).join('\n\n')}

## Every music video

${publicCatalog.videos.map((video) => `### ${video.title}\n\n- ID: ${video.id}\n- Page: ${video.pageUrl}\n- YouTube: ${video.watchUrl}\n- Published: ${video.publishedAt}\n- Matching song IDs: ${video.songIds.join(', ') || 'None'}\n- Related song IDs: ${video.relatedSongIds.join(', ') || 'None'}`).join('\n\n')}

## API resources

- ${publicCatalog.site}/catalog-summary.json
- ${publicCatalog.site}/catalog.json
- ${publicCatalog.site}/catalog.schema.json
- ${publicCatalog.site}/song-index.json
- ${publicCatalog.site}/video-index.json
- ${publicCatalog.site}/music-theory/
- ${publicCatalog.site}/suno-prompting-guide/
- ${publicCatalog.site}/webmcp/
`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};

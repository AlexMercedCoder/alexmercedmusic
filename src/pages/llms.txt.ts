import type { APIRoute } from 'astro';
import { publicCatalog } from '../data/catalog-model';
import { aiMusicPerspective } from '../data/editorial';

export const GET: APIRoute = () => {
  const recent = publicCatalog.songs.filter((song) => song.createdAt).slice().sort((a, b) => Date.parse(b.createdAt!) - Date.parse(a.createdAt!)).slice(0, 12);
  const body = `# Alex Merced Music

> A public index of Alex Merced's acoustic archive, electronic productions, Suno songs, reimagined recordings, practical music theory and Suno prompting references.

Catalog updated: ${publicCatalog.updatedAt}
Catalog schema: ${publicCatalog.schemaVersion}
Songs: ${publicCatalog.counts.songs}
Public Suno generations: ${publicCatalog.counts.sunoPublished}
Public YouTube videos: ${publicCatalog.counts.videos}

## Primary pages

- [Home](${publicCatalog.site}/)
- [Explore songs](${publicCatalog.site}/songs/)
- [Music videos](${publicCatalog.site}/videos/)
- [Acoustic archive](${publicCatalog.site}/acoustic/)
- [Electronic catalog](${publicCatalog.site}/electronic/)
- [Reimagined songs](${publicCatalog.site}/reimagined/)
${publicCatalog.suno.featuredReimaginingAlbums.map((album) => `- [${album.title}](${album.url})`).join('\n')}
- [Suno albums and playlists](${publicCatalog.site}/suno/)
- [Suno Prompting Field Guide](${publicCatalog.site}/suno-prompting-guide/)
- [Music Theory for Songwriters and Producers](${publicCatalog.site}/music-theory/)
- [${aiMusicPerspective.title}](${aiMusicPerspective.url})
- [WebMCP guide](${publicCatalog.site}/webmcp/)

## Distributed releases

${publicCatalog.distributedReleases.map((release) => `- ${release.title}, ${release.released}: ${release.links.map((link) => `[${link.label}](${link.url})`).join(', ')}`).join('\n')}

## Machine-readable resources

- [Catalog summary](${publicCatalog.site}/catalog-summary.json)
- [Full versioned catalog](${publicCatalog.site}/catalog.json)
- [Catalog JSON Schema](${publicCatalog.site}/catalog.schema.json)
- [Lightweight song index](${publicCatalog.site}/song-index.json)
- [Lightweight video index](${publicCatalog.site}/video-index.json)
- [Full text catalog guide](${publicCatalog.site}/llms-full.txt)
- [RSS feed](${publicCatalog.site}/feed.xml)
- [JSON Feed](${publicCatalog.site}/feed.json)

## Official Suno albums

${publicCatalog.suno.albums.map((album) => `- [${album.name}](${album.pageUrl}): ${album.songCount} songs. ${album.description}`).join('\n')}

## Suno playlists

${publicCatalog.suno.playlists.map((playlist) => `- [${playlist.name}](${playlist.pageUrl}): ${playlist.songCount} songs. ${playlist.description}`).join('\n')}

## Recent songs

${recent.map((song) => `- [${song.title}](${song.pageUrl})${song.createdAt ? `, ${song.createdAt.slice(0, 10)}` : ''}`).join('\n')}

## Browser agent tools

The site registers 33 read-only WebMCP tools. Use music_overview for orientation, search_songs or list_songs for song discovery, list_videos and get_video for music video connections, get_suno_album or get_suno_playlist for ordered collections, get_catalog_updates_since for polling, the Suno prompting tools for creation guidance, and the music theory tools for scales, chords, progressions and harmonic palettes. Tool results return stable IDs and canonical URLs.
`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};

import type { APIRoute } from 'astro';
import {
  acousticTracks, acousticPlaylist, reimagined, reimaginedPlaylist,
  albums, electronicTracks, electronicStats, electronicRuntime,
  sunoSongs, sunoStyle, platforms, tutorials,
} from '../data/catalog';
import { networkGroups } from '../data/network';

const SITE = 'https://alexmercedmusic.com';

export const GET: APIRoute = async () => {
  const paired = reimagined.filter((r) => r.original);

  const body = `# Alex Merced Music

> Two decades of music by Alex Merced: acoustic songs recorded from the mid-2000s, electronic albums produced in FL Studio, and seven of those same songs rebuilt with the AI model Suno. This site catalogues all three and points at the platforms that host them.

Alex Merced is better known now for data and AI, where he works in developer relations and writes about lakehouse architecture. Music came first and has never entirely stopped. The catalogue divides into three eras, and the third folds back into the first: the Suno covers rework songs from the acoustic archive, and each one opens with a clip of the original recording.

Nothing on this site is hosted here. Every recording lives on the platform it was uploaded to at the time, and this site is the index.

## Pages

- [Home](${SITE}/): the three eras, and the songs that exist in two of them at once.
- [The acoustic archive](${SITE}/acoustic): ${acousticTracks.length} guitar and voice recordings, listed in full.
- [Reimagined with Suno](${SITE}/reimagined): ${reimagined.length} rebuilds paired with the recordings they came from.
- [The electronic catalogue](${SITE}/electronic): ${electronicStats.total} produced tracks, ${albums.length} albums, and the FL Studio tutorials.
- [Where to listen](${SITE}/listen): every platform, with the counts each one reports.

## Era one: the acoustic archive

Guitar and voice, written and performed by Alex Merced, uploaded from the mid-2000s onward. Most went to his YouTube channel. ${acousticTracks.length} recordings are listed here.

Titles are recorded here as they were typed at the time, including the inconsistent capitalisation, because that is what you find when you go and look.

${acousticTracks.map((t) => `- ${t.title}${t.length ? ` (${t.length})` : ''}`).join('\n')}

Playlist: ${acousticPlaylist.url}

## Era two: the electronic catalogue

Produced electronic music, made largely in FL Studio. ReverbNation files it under electronica, electro pop and glitch hop, out of Brooklyn, and reports 6.6 thousand fans.

${electronicStats.total} tracks survive in total, ${electronicRuntime} of runtime. They are spread across three profiles and no single one holds them all: ${electronicStats.onReverbNation} are on ReverbNation, ${electronicStats.onSoundCloud} on SoundCloud, and ${electronicStats.inAlbums} sit on one of the ${albums.length} albums. The list below is the merged set, deduplicated on title, since the same track is filed as "12 - Alex Merced - WTF" on one platform and "WTF" on another.

### The albums

${albums.map((a) => `#### ${a.title} (${a.released.slice(0, 4)})\n${a.tracks.map((t) => `- ${t}`).join('\n')}`).join('\n\n')}

### Every produced track

${electronicTracks.map((t) => `- ${t.title} (${Math.floor(t.seconds / 60)}:${String(t.seconds % 60).padStart(2, '0')})`).join('\n')}

### FL Studio tutorials

Recorded alongside the music, and by view count the most watched thing on the channel.

${tutorials.map((t) => `- ${t.title} (${t.posted})`).join('\n')}

## Era three: rebuilt with Suno

${reimagined.length} songs from the archive run through Suno in styles they were never written for. ${paired.length} of the ${reimagined.length} have their original recording still in the archive above.

${reimagined.map((r) => `- ${r.title}, as ${r.style.toLowerCase()}${r.original ? `, from "${r.original}"` : ', original not in the archive'}`).join('\n')}

Playlist: ${reimaginedPlaylist.url}

Newer songs written with Suno rather than rebuilt, filed under "${sunoStyle}":

${sunoSongs.map((t) => `- ${t.title}`).join('\n')}

## Where the music is hosted

${platforms.map((p) => `- [${p.label}](${p.url})${p.stat ? ` (${p.stat})` : ''}: ${p.note}`).join('\n')}

## The rest of Alex Merced's work

Music is the older half. The current work is data and AI.

${networkGroups.map((g) => `### ${g.title}\n${g.links.map((l) => `- [${l.label}](${l.url})`).join('\n')}`).join('\n\n')}

## Notes for machines

This site is static, has no login, and every page listed here is public. It also registers WebMCP tools in the browser, so an agent on the page can query the catalogue directly: music_overview, search_songs, list_reimaginings, list_albums and where_to_listen.
`;

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};

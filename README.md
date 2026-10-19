# AlexMercedMusic.com

The music side of [Alex Merced](https://alexmerced.com): twenty years of archive
recordings, electronic production, and a recent set of older songs rebuilt with
Suno. Every accessible song links directly to each verified hosting source.

Part of the Alex Merced network of sites.

## Stack

- Astro 7, static output, zero runtime JavaScript frameworks
- Hand-written CSS, no utility framework
- SEO surfaces: canonical tags, unique social artwork, Open Graph, JSON-LD
  (`WebSite`, `Person`, `MusicGroup`, `MusicRecording`, `MusicPlaylist`,
  `MusicAlbum`, `VideoObject`), sitemap, RSS/JSON feeds, and `llms.txt`
- Thirty-one read-only WebMCP tools so an agent can query albums, poll for new publications, use the prompting guide and navigate the catalog
- Stable canonical pages for every song and album, connected with JSON-LD
- Versioned machine-readable catalog at `/catalog.json`, with a JSON Schema, compact summary and lightweight song index
- Search and filtering across the complete catalogue at `/songs/`
- Embedded playback and a session-persistent mini-player

## Develop

```
npm install
npm run dev
```

## Build

```
npm run build
```

Output lands in `dist/`. `npm run check` runs `tsc --noEmit`.

`npm test` performs the full build and validates every song/album page, catalog
relationship, sitemap entry, social image, feed, and WebMCP registration.

## Refresh source metadata

```
npm run sync:suno -- --write
npm run sync:spotify -- --write
npm run sync:youtube -- --write
```

The Suno command walks the public profile API, preserves rich public metadata,
distinguishes catalog songs from reimagining generations, captures public
albums with their current counts and runtimes, and reports
additions, removals, and metadata changes. The catalog-refresh GitHub Action can
be run manually and attempts to open a tested pull request when something changes.
The YouTube command refreshes exact public upload dates and thumbnails.
The Spotify command verifies the configured release identities and track counts,
then refreshes direct track links used by the release and song pages.

## MP3 downloads

MP3 binaries stay outside this Git repository and Netlify. They are served from
Cloudflare R2 at `mp3.alexmercedcloud.com`. The local source folder is
`/home/alexmerced/development/music/mp3` by default. Set `MP3_SOURCE` to use
another folder.

After adding files, with Wrangler logged in, run:

```
npm run sync:mp3
npm run match:mp3
npm test
```

`sync:mp3` uploads only new or changed files and records each successful upload,
checksum, size and URL in `src/data/mp3-uploads.json`. It can be rerun safely
after an interruption. `match:mp3` connects uniquely identifiable files to
song pages in `src/data/mp3-matches.json` and reports files needing a manual
match. If the song catalog changed, build it before running `match:mp3` so
`dist/catalog.json` is current. The `/downloads/` page lists every uploaded
file, including recordings without a verified song-page match. Push the tested
source changes to GitHub to let the connected Netlify site deploy them.

`npm run check:external-links` checks unique listening, album, and platform URLs.
The manually triggered site-health workflow runs this after the complete test suite. See
`docs/production-monitoring.md` for Search Console and operational setup.

## Where the data lives

The hand-curated catalog and direct archive links live in `src/data/catalog.ts`.
Public Suno and YouTube metadata are generated into `src/data/suno-songs.json`,
`src/data/suno-covers.json`, and `src/data/youtube-metadata.json`. The larger SoundCloud/ReverbNation merge lives in
`src/data/electronic-tracks.json`, and album ordering lives in
`src/data/albums.json`. The data mirrors what is currently published on YouTube,
SoundCloud, ReverbNation, and Suno; refresh it when those catalogs change.

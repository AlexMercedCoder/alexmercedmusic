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
- Ten read-only WebMCP tools so an agent can query and navigate the catalogue
- Stable canonical pages for every song and album, connected with JSON-LD
- Versioned machine-readable catalog at `/catalog.json`
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
npm run sync:youtube -- --write
```

The Suno command walks the public profile API, preserves rich public metadata,
distinguishes catalog songs from the 12 reimagining generations, and reports
additions, removals, and metadata changes. A scheduled GitHub Action runs this
daily and opens a tested catalog-refresh pull request when something changes.
The YouTube command refreshes exact public upload dates and thumbnails.

`npm run check:external-links` checks unique listening, album, and platform URLs.
The weekly site-health workflow runs this after the complete test suite. See
`docs/production-monitoring.md` for Search Console and operational setup.

## Where the data lives

The hand-curated catalog and direct archive links live in `src/data/catalog.ts`.
Public Suno and YouTube metadata are generated into `src/data/suno-songs.json`,
`src/data/suno-covers.json`, and `src/data/youtube-metadata.json`. The larger SoundCloud/ReverbNation merge lives in
`src/data/electronic-tracks.json`, and album ordering lives in
`src/data/albums.json`. The data mirrors what is currently published on YouTube,
SoundCloud, ReverbNation, and Suno; refresh it when those catalogs change.

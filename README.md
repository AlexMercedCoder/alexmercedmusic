# AlexMercedMusic.com

The music side of [Alex Merced](https://alexmerced.com): twenty years of archive
recordings, electronic production, and a recent set of older songs rebuilt with
Suno. Every accessible song links directly to each verified hosting source.

Part of the Alex Merced network of sites.

## Stack

- Astro 7, static output, zero runtime JavaScript frameworks
- Hand-written CSS, no utility framework
- SEO surfaces: canonical tags, Open Graph, JSON-LD (`WebSite`, `Person`,
  `MusicGroup`, `MusicPlaylist`, `MusicAlbum`), `sitemap.xml`, `llms.txt`
- WebMCP tools so an agent visiting the page can query the catalogue

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

## Where the data lives

The hand-curated catalog and direct YouTube/Suno links live in
`src/data/catalog.ts`. The larger SoundCloud/ReverbNation merge lives in
`src/data/electronic-tracks.json`, and album ordering lives in
`src/data/albums.json`. The data mirrors what is currently published on YouTube,
SoundCloud, ReverbNation, and Suno; refresh it when those catalogs change.

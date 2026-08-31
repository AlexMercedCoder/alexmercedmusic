# AlexMercedMusic.com

The music side of [Alex Merced](https://alexmerced.com): twenty years of acoustic
singer-songwriter recordings, electronic production, and a recent set of the same
songs rebuilt with Suno.

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

Everything the site renders comes from `src/data/catalog.ts`, which mirrors what
is actually published on YouTube, SoundCloud, ReverbNation, and Suno. Nothing in
there is invented; update it when the catalogue changes.

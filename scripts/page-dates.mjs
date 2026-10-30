// Writes src/data/page-dates.json: the last content commit date for each
// hand-written page (about, stories, guides), keyed by URL path. The sitemap
// uses it for <lastmod>; catalog pages take their dates from the track data.
// Commits that only touch shared chrome (footer, nav, consent, network head,
// WebMCP, analytics) or carry [mechanical] do not re-date a page.
// On a shallow clone the committed JSON is kept as is.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, writeFileSync } from 'node:fs';

const OUT = 'src/data/page-dates.json';
const CHROME = /\[mechanical\]|\[metadata-only\]|footer|webmcp|navigation|\bnav\b|cta strip|consent mode|network head|network plumbing|person @id|person block|ga4|analytics|redirect old urls|image sizes|responsive cover/i;
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

let shallow = true;
try { shallow = git('rev-parse', '--is-shallow-repository') !== 'false'; } catch { shallow = true; }
if (shallow) {
  console.log(`[page-dates] shallow or no git history; keeping ${existsSync(OUT) ? 'committed' : 'no'} ${OUT}`);
  if (!existsSync(OUT)) writeFileSync(OUT, '{}\n');
  process.exit(0);
}

const pages = {
  '/about/': ['src/pages/about.astro'],
  '/stories/': ['src/pages/stories/index.astro'],
  '/ethics-of-ai-music/': ['src/pages/ethics-of-ai-music.astro'],
  '/suno-prompting-guide/': ['src/pages/suno-prompting-guide.astro', 'src/data/suno-prompting-guide.ts', 'src/components/SunoPromptWorkbench.astro'],
  '/music-theory/': ['src/pages/music-theory/index.astro', 'src/data/music-theory-guide.ts', 'src/components/MusicTheoryWorkbench.astro'],
};
for (const f of readdirSync('src/pages/stories').filter((f) => f.endsWith('.astro') && f !== 'index.astro')) {
  pages[`/stories/${f.replace(/\.astro$/, '')}/`] = [`src/pages/stories/${f}`];
}

const out = {};
for (const [path, files] of Object.entries(pages)) {
  const rows = git('log', '--format=%ad%x09%s', '--date=short', '--', ...files.filter(existsSync))
    .split('\n').filter(Boolean).map((line) => line.split('\t'));
  const hit = rows.find(([, subject]) => !CHROME.test(subject)) ?? rows.at(-1);
  if (hit) out[path] = hit[0];
}
const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(OUT, JSON.stringify(sorted, null, 2) + '\n');
console.log(`[page-dates] wrote ${Object.keys(sorted).length} entries to ${OUT}`);

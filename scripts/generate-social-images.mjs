import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('dist/catalog.json', root), 'utf8'));
const outputRoot = new URL('dist/social/', root);
await mkdir(new URL('songs/', outputRoot), { recursive: true });
await mkdir(new URL('albums/', outputRoot), { recursive: true });

const palette = { acoustic: '#e0a458', electronic: '#4fc4b8', ai: '#a78bda' };
const escape = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const wrap = (value, limit = 27) => {
  const words = String(value).split(/\s+/);
  const lines = [];
  for (const word of words) {
    const line = lines.at(-1);
    if (!line || `${line} ${word}`.length > limit) lines.push(word);
    else lines[lines.length - 1] = `${line} ${word}`;
  }
  return lines.slice(0, 3);
};

const render = async ({ title, label, accent, output }) => {
  const lines = wrap(title);
  const fontSize = lines.length > 2 ? 66 : lines.some((line) => line.length > 22) ? 72 : 82;
  const text = lines.map((line, index) => `<text x="76" y="${265 + index * (fontSize + 12)}" font-size="${fontSize}" font-weight="750" fill="#e8edf3">${escape(line)}</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#080c11"/><rect x="0" y="0" width="18" height="630" fill="${accent}"/>
    <circle cx="1040" cy="90" r="250" fill="${accent}" opacity=".08"/><circle cx="1110" cy="570" r="330" fill="${accent}" opacity=".05"/>
    <text x="76" y="92" font-family="monospace" font-size="23" font-weight="700" letter-spacing="5" fill="${accent}">${escape(label.toUpperCase())}</text>
    <g font-family="Arial, Helvetica, sans-serif">${text}</g>
    <line x1="76" y1="536" x2="1124" y2="536" stroke="#263140"/>
    <text x="76" y="585" font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="700" fill="#a9b6c4">Alex Merced Music</text>
    <text x="1124" y="585" text-anchor="end" font-family="monospace" font-size="20" fill="#6f7f8f">alexmercedmusic.com</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toFile(fileURLToPath(output));
};

const jobs = [
  ...catalog.songs.map((song) => ({ title: song.title, label: song.kind === 'generated' ? 'New with Suno' : song.kind, accent: palette[song.era], output: new URL(`songs/${song.slug}.png`, outputRoot) })),
  ...catalog.albums.map((album) => ({ title: album.title, label: 'Electronic album', accent: palette.electronic, output: new URL(`albums/${album.slug}.png`, outputRoot) })),
];
let nextJob = 0;
await Promise.all(Array.from({ length: 12 }, async () => {
  while (nextJob < jobs.length) {
    const job = jobs[nextJob];
    nextJob += 1;
    await render(job);
  }
}));
console.log(`Generated ${jobs.length} social images.`);

import { promises as fs } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(process.env.MP3_SOURCE ?? path.join(repo, '../../../../music/mp3'));
const uploads = JSON.parse(await fs.readFile(path.join(repo, 'src/data/mp3-uploads.json'), 'utf8'));
const catalog = JSON.parse(await fs.readFile(path.join(repo, 'dist/catalog.json'), 'utf8'));
const output = path.join(repo, 'src/data/mp3-matches.json');
const existing = JSON.parse(await fs.readFile(output, 'utf8').catch((error) => {
  if (error.code === 'ENOENT') return '{}';
  throw error;
}));

const normalize = (value) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[‘’']/g, '').replace(/^new song\s+/i, '')
  .replace(/^alex merced\s*[-–:]\s*/i, '')
  .replace(/\s*\[[^\]]+\]/g, '')
  .replace(/\s*\((?:alex(?:s)?\s*)?(?:ai\s*)?(?:voice\s*)?(?:ai\s*)?cover(?:\s*ii)?\)/gi, '')
  .replace(/\s*\((?:original|reimagined|1|alexmercedmusic\.com|alexmerced\.com)\)/gi, '')
  .replace(/\s+(?:original|reimagined|video)$/i, '')
  .replace(/\s*\(v\d+\)$/i, '')
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/gi, ' ').trim().toLowerCase();

const songsByTitle = new Map();
for (const song of catalog.songs) {
  const title = normalize(song.title);
  const matches = songsByTitle.get(title) ?? [];
  matches.push(song);
  songsByTitle.set(title, matches);
}

function kindHint(sourcePath) {
  const name = path.basename(sourcePath).toLowerCase();
  if (/\b(reimagined|ai.{0,14}cover|voice ai cover)\b/.test(name)) return 'reimagined';
  if (sourcePath.startsWith('Acoustic1/')) return 'archive';
  if (sourcePath.startsWith('Electronic1/')) return 'electronic';
  return null;
}

function runtime(song) {
  if (song.durationSeconds) return song.durationSeconds;
  if (song.seconds) return song.seconds;
  if (song.length) {
    const [minutes, seconds] = song.length.split(':').map(Number);
    return minutes * 60 + seconds;
  }
  return null;
}

function matchByRuntime(file, candidates) {
  const seconds = Number(execFileSync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file,
  ], { encoding: 'utf8' }).trim());
  if (!Number.isFinite(seconds)) return null;
  const ranked = candidates.map((song) => ({ song, gap: Math.abs((runtime(song) ?? Infinity) - seconds) }))
    .sort((a, b) => a.gap - b.gap);
  return ranked[0].gap <= 3 && ranked[1].gap - ranked[0].gap > 2 ? ranked[0].song : null;
}

const next = { ...existing };
const ambiguous = [];
const unmatched = [];
for (const upload of uploads.files) {
  if (next[upload.sourcePath]) continue;
  const filename = path.basename(upload.sourcePath, '.mp3');
  const youtubeId = filename.match(/\[([A-Za-z0-9_-]{11})\]/)?.[1];
  const video = youtubeId ? catalog.videos.find((item) => item.youtubeId === youtubeId) : undefined;
  let matches = video?.songIds.length === 1
    ? catalog.songs.filter((song) => song.id === video.songIds[0])
    : youtubeId
      ? catalog.songs.filter((song) => song.links.some((link) => link.source === 'youtube' && new URL(link.url).searchParams.get('v') === youtubeId))
      : [];
  if (!matches.length) matches = songsByTitle.get(normalize(filename)) ?? [];
  const hint = kindHint(upload.sourcePath);
  if (matches.length > 1 && hint) {
    const narrowed = matches.filter((song) => song.kind === hint);
    if (narrowed.length) matches = narrowed;
  }
  if (matches.length > 1) {
    const timed = matchByRuntime(path.join(source, upload.sourcePath), matches);
    if (timed) matches = [timed];
  }
  if (matches.length === 1 && hint && matches[0].kind !== hint) matches = [];
  if (matches.length === 1) next[upload.sourcePath] = matches[0].id;
  else if (matches.length > 1) ambiguous.push({ file: upload.sourcePath, candidates: matches.map((song) => `${song.kind}: ${song.title} (${song.id})`) });
  else unmatched.push(upload.sourcePath);
}

const validIds = new Set(catalog.songs.map((song) => song.id));
for (const [file, id] of Object.entries(next)) {
  if (!uploads.files.some((upload) => upload.sourcePath === file)) throw new Error(`Match has no uploaded file: ${file}`);
  if (!validIds.has(id)) throw new Error(`Match has no catalog song: ${file} -> ${id}`);
}
console.log(`${uploads.files.length} uploaded files; ${Object.keys(next).length} matched; ${ambiguous.length} ambiguous; ${unmatched.length} unmatched.`);
for (const item of ambiguous) console.log(`AMBIGUOUS ${item.file}: ${item.candidates.join(' | ')}`);
for (const item of unmatched) console.log(`UNMATCHED ${item}`);
if (process.argv.includes('--write')) {
  await fs.writeFile(output, `${JSON.stringify(Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b))), null, 2)}\n`);
  console.log(`Wrote ${output}`);
}

import { promises as fs } from 'node:fs';
import { spawn, execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(process.env.MP3_SOURCE ?? path.join(repo, '../../../../music/mp3'));
const destination = path.join(source, 'YouTube');
const catalog = JSON.parse(await fs.readFile(path.join(repo, 'dist/catalog.json'), 'utf8'));
const songs = new Map(catalog.songs.map((song) => [song.id, song]));
const shouldWrite = process.argv.includes('--write');

const safeName = (value) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
const candidates = catalog.videos.flatMap((video) => {
  if (video.videoType !== 'video' || video.songIds.length !== 1) return [];
  const song = songs.get(video.songIds[0]);
  if (!song || song.downloads.length || /\bcover\b/i.test(song.title)) return [];
  return [{ video, song, filename: `${safeName(song.title)} [${video.youtubeId}].mp3` }];
});
const targets = [...new Map(candidates.map((item) => [item.song.id, item])).values()];
console.log(`${targets.length} songs have a full YouTube video but no MP3; cover recordings are excluded.`);
for (const item of targets) console.log(`${item.song.title} <- ${item.video.watchUrl}`);
if (!shouldWrite) process.exit(0);

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with status ${code}`)));
  });
}

await fs.mkdir(destination, { recursive: true });
let created = 0;
const failures = [];
for (const { video, song, filename } of targets) {
  const output = path.join(destination, filename);
  try {
    await fs.access(output);
    console.log(`Already present: ${filename}`);
    continue;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const temporary = await fs.mkdtemp(path.join(destination, '.staging-'));
  try {
    const temporaryOutput = path.join(temporary, `${safeName(song.title)} [${video.youtubeId}].%(ext)s`);
    const downloadArgs = (format) => ['-m', 'yt_dlp', '--no-playlist', '--no-progress',
      '-f', format, '-x', '--audio-format', 'mp3', '--audio-quality', '192K',
      '-o', temporaryOutput, video.watchUrl];
    try {
      await run('python3', downloadArgs('bestaudio/best'));
    } catch {
      console.log(`Retrying ${filename} with the alternate YouTube audio stream.`);
      await run('python3', downloadArgs('140'));
    }
    const encoded = path.join(temporary, filename);
    const stat = await fs.stat(encoded);
    const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1', encoded], { encoding: 'utf8' }).trim());
    if (stat.size < 100_000 || !Number.isFinite(duration)
      || (video.durationSeconds && Math.abs(duration - video.durationSeconds) > 8)) {
      throw new Error(`Audio validation failed for ${filename}: ${stat.size} bytes, ${duration} seconds.`);
    }
    await fs.rename(encoded, output);
    created += 1;
    console.log(`Saved ${filename} (${duration.toFixed(1)} seconds).`);
  } catch (error) {
    failures.push(`${filename}: ${error.message}`);
    console.error(`Failed ${filename}: ${error.message}`);
  } finally {
    await fs.rm(temporary, { recursive: true, force: true });
  }
}
console.log(`Created ${created} MP3s in ${destination}; ${failures.length} failed.`);
if (failures.length) process.exitCode = 1;

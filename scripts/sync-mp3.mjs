import { createHash } from 'node:crypto';
import { createReadStream, promises as fs } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(process.env.MP3_SOURCE ?? path.join(repo, '../../../../music/mp3'));
const manifestPath = path.join(repo, 'src/data/mp3-uploads.json');
const bucket = 'alexmercedmusic-mp3';
const baseUrl = 'https://mp3.alexmercedcloud.com';
const concurrency = 4;

async function listMp3s(directory, prefix = '') {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await listMp3s(path.join(directory, entry.name), relative));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.mp3')) files.push(relative);
  }
  return files.sort((a, b) => a.localeCompare(b));
}

async function hashFile(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}

function slug(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'track';
}

function put(file, key, downloadName) {
  return new Promise((resolve, reject) => {
    const child = spawn('wrangler', [
      'r2', 'object', 'put', `${bucket}/${key}`, '--remote', '--force', '--file', file,
      '--content-type', 'audio/mpeg',
      '--content-disposition', `attachment; filename="${downloadName}"`,
      '--cache-control', 'public, max-age=31536000, immutable',
    ], { stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.stderr.on('data', (chunk) => { output += chunk; });
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`Upload failed for ${file}: ${output.trim()}`)));
  });
}

async function save(manifest) {
  manifest.updatedAt = new Date().toISOString();
  manifest.files.sort((a, b) => a.sourcePath.localeCompare(b.sourcePath));
  const temporary = `${manifestPath}.tmp`;
  await fs.writeFile(temporary, `${JSON.stringify(manifest, null, 2)}\n`);
  await fs.rename(temporary, manifestPath);
}
let saveQueue = Promise.resolve();
function queueSave(manifest) {
  saveQueue = saveQueue.then(() => save(manifest));
  return saveQueue;
}

const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8').catch((error) => {
  if (error.code === 'ENOENT') return '{"schemaVersion":1,"files":[]}';
  throw error;
}));
if (manifest.schemaVersion !== 1) throw new Error('Unsupported MP3 manifest schema.');
if (manifest.bucket && manifest.bucket !== bucket) throw new Error('Manifest bucket differs from configured bucket.');
manifest.bucket = bucket;
manifest.baseUrl = baseUrl;

const existingByPath = new Map(manifest.files.map((entry) => [entry.sourcePath, entry]));
const existingByHash = new Map(manifest.files.map((entry) => [entry.sha256, entry]));
const sourcePaths = await listMp3s(source);
const jobs = [];
for (const sourcePath of sourcePaths) {
  const file = path.join(source, sourcePath);
  const [sha256, stat] = await Promise.all([hashFile(file), fs.stat(file)]);
  const previous = existingByPath.get(sourcePath);
  if (previous?.sha256 === sha256 && previous.sizeBytes === stat.size) continue;
  const sameContent = existingByHash.get(sha256);
  const objectKey = sameContent?.objectKey ?? `tracks/${slug(path.basename(sourcePath, '.mp3'))}-${sha256.slice(0, 16)}.mp3`;
  jobs.push({ sourcePath, file, sha256, sizeBytes: stat.size, objectKey, upload: !sameContent });
}

console.log(`${sourcePaths.length} local MP3s; ${jobs.length} new or changed files; ${jobs.filter((job) => job.upload).length} objects to upload.`);
let next = 0;
let completed = 0;
const failures = [];
async function worker() {
  while (next < jobs.length) {
    const job = jobs[next++];
    try {
      if (job.upload) await put(job.file, job.objectKey, `${slug(path.basename(job.sourcePath, '.mp3'))}.mp3`);
      const entry = {
        sourcePath: job.sourcePath,
        sha256: job.sha256,
        sizeBytes: job.sizeBytes,
        objectKey: job.objectKey,
        url: `${baseUrl}/${job.objectKey}`,
        uploadedAt: new Date().toISOString(),
      };
      manifest.files = manifest.files.filter((item) => item.sourcePath !== job.sourcePath);
      manifest.files.push(entry);
      existingByHash.set(job.sha256, entry);
      await queueSave(manifest);
      completed += 1;
      if (completed % 10 === 0 || completed === jobs.length) console.log(`Recorded ${completed}/${jobs.length} files.`);
    } catch (error) {
      failures.push({ sourcePath: job.sourcePath, message: error.message });
      console.error(error.message);
    }
  }
}
await Promise.all(Array.from({ length: concurrency }, () => worker()));
console.log(`Manifest: ${manifestPath}`);
if (failures.length) {
  console.error(`${failures.length} uploads failed. Rerun this script to retry only missing files.`);
  process.exitCode = 1;
}

import { spawn } from 'node:child_process';
import { readdirSync, readFileSync, watch, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const root = fileURLToPath(new URL('..', import.meta.url));
const output = join(root, 'src', 'app', 'core', 'foot-photos.generated.ts');
const tiers = ['pretty', 'ugly'];
const imageExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp']);

function photosIn(tier) {
  const directory = join(root, 'public', 'feet', tier);
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && imageExtensions.has(extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'fr', { numeric: true, sensitivity: 'base' }))
    .map((name) => ({
      id: `${tier}-${name}`,
      src: `feet/${tier}/${name}`,
      tier,
    }));
}

function quote(value) {
  return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
}

function render() {
  const photos = tiers.flatMap(photosIn);
  const lines = photos.map(
    (photo) =>
      `  { id: ${quote(photo.id)}, src: ${quote(photo.src)}, tier: ${quote(photo.tier)} },`,
  );
  return `import type { FootPhoto } from './ptp.config';

// Généré par scripts/scan-feet.mjs à partir de public/feet/pretty et public/feet/ugly.
export const FOOT_PHOTOS: readonly FootPhoto[] = [
${lines.join('\n')}
];
`;
}

export async function writeCatalog() {
  const next = await prettier.format(render(), { filepath: output });
  let previous = null;
  try {
    previous = readFileSync(output, 'utf8');
  } catch {
    previous = null;
  }
  if (previous === next) {
    return false;
  }
  writeFileSync(output, next);
  return true;
}

function startWatch() {
  let timer;
  const refresh = () => {
    clearTimeout(timer);
    timer = setTimeout(() => writeCatalog(), 150);
  };
  const watchers = tiers.map((tier) => watch(join(root, 'public', 'feet', tier), refresh));
  return () => watchers.forEach((watcher) => watcher.close());
}

const args = process.argv.slice(2);
const serve = args.includes('--serve');

await writeCatalog();

if (!serve && !args.includes('--watch')) {
  process.exit(0);
}

const stopWatch = startWatch();

if (!serve) {
  process.stdin.resume();
} else {
  const ngArgs = args.filter((arg) => arg !== '--serve' && arg !== '--watch');
  const child = spawn('ng', ['serve', ...ngArgs], { stdio: 'inherit', cwd: root });
  const stop = (signal) => {
    stopWatch();
    child.kill(signal);
  };
  process.on('SIGINT', () => stop('SIGINT'));
  process.on('SIGTERM', () => stop('SIGTERM'));
  child.on('exit', (code) => {
    stopWatch();
    process.exit(code ?? 0);
  });
}

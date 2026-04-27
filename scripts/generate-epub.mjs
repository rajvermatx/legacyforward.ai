/**
 * Generate EPUB for any book section.
 * Usage: node scripts/generate-epub.mjs <section>
 * Example: node scripts/generate-epub.mjs agenticai
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const section = process.argv[2];
if (!section) {
  console.error('Usage: node scripts/generate-epub.mjs <section>');
  console.error('Example: node scripts/generate-epub.mjs agenticai');
  process.exit(1);
}

const CONTENT_DIR = join(ROOT, 'content', section);
if (!existsSync(CONTENT_DIR)) {
  console.error(`Content directory not found: ${CONTENT_DIR}`);
  process.exit(1);
}

const TEMP_DIR = join(ROOT, `.epub-tmp-${section}`);
const OUTPUT_DIR = join(ROOT, 'public', 'books', 'epub');
const OUTPUT = join(OUTPUT_DIR, `${section}.epub`);
const COVER = join(ROOT, 'public', 'books', 'covers', 'png', `${section}.png`);
const META = join(ROOT, 'scripts', `${section}-epub-meta.yaml`);

if (!existsSync(META)) {
  console.error(`Metadata file not found: ${META}`);
  process.exit(1);
}

// Build reading order: prologue first, then numeric chapters in order, then capstones
function getOrderedFiles() {
  const all = readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.md') && f !== '_meta.json');

  const prologue = all.filter(f => f.match(/^00-prologue/));
  const preface = all.filter(f => f.match(/^00-preface/));
  const chapters = all.filter(f => f.match(/^[0-9]/) && !f.match(/^00-/)).sort();
  const capstones = all.filter(f => f.match(/^00-capstone/)).sort();

  return [...prologue, ...preface, ...chapters, ...capstones];
}

// Strip YAML frontmatter, return { title, content }
function processFile(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { title: null, content: raw };

  const frontmatter = match[1];
  const body = match[2];

  const titleMatch = frontmatter.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  const title = titleMatch ? titleMatch[1] : null;

  return { title, content: body };
}

// Setup
mkdirSync(OUTPUT_DIR, { recursive: true });
rmSync(TEMP_DIR, { recursive: true, force: true });
mkdirSync(TEMP_DIR, { recursive: true });

const orderedFiles = getOrderedFiles();
console.log(`\nGenerating EPUB for: ${section} (${orderedFiles.length} files)`);
console.log('Processing chapters...');

const tempFiles = [];

for (const filename of orderedFiles) {
  const srcPath = join(CONTENT_DIR, filename);
  const { title, content } = processFile(srcPath);

  // Rewrite absolute /diagrams/ paths to local filesystem paths
  const rewritten = content.replace(
    /!\[([^\]]*)\]\(\/diagrams\//g,
    `![$1](${join(ROOT, 'public', 'diagrams')}/`
  );

  // Prepend H1 only if the body doesn't already have one (avoids duplicate TOC entries)
  const bodyHasH1 = /^#\s+/m.test(rewritten);
  const h1 = (title && !bodyHasH1) ? `# ${title}\n\n` : '';

  const cleaned = h1 + rewritten.trimStart();
  const destPath = join(TEMP_DIR, filename);
  writeFileSync(destPath, cleaned, 'utf-8');
  tempFiles.push(destPath);
  console.log(`  ✓ ${filename}${title ? ` — "${title}"` : ''}`);
}

// Build Pandoc command
const coverFlag = existsSync(COVER) ? `--epub-cover-image="${COVER}"` : '';
const CSS = join(ROOT, 'scripts', 'epub-style.css');
const fileArgs = tempFiles.map(f => `"${f}"`).join(' \\\n  ');

const cmd = [
  'pandoc',
  `"${META}"`,
  fileArgs,
  `--output "${OUTPUT}"`,
  coverFlag,
  `--css "${CSS}"`,
  '--number-sections',
  '--toc',
  '--toc-depth=2',
  '--split-level=1',
].filter(Boolean).join(' \\\n  ');

console.log('\nRunning Pandoc...');
try {
  execSync(cmd, { stdio: 'inherit', shell: true });
  const { statSync } = await import('fs');
  const size = (statSync(OUTPUT).size / 1024).toFixed(0);
  console.log(`\nEPUB generated: ${OUTPUT} (${size} KB)`);
} finally {
  rmSync(TEMP_DIR, { recursive: true, force: true });
}

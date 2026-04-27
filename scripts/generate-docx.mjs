/**
 * Generate DOCX for any book section using pandoc.
 * Usage: node scripts/generate-docx.mjs <section>
 * Example: node scripts/generate-docx.mjs agenticai
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync, statSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const section = process.argv[2];
if (!section) {
  console.error('Usage: node scripts/generate-docx.mjs <section>');
  console.error('Example: node scripts/generate-docx.mjs agenticai');
  process.exit(1);
}

const CONTENT_DIR = join(ROOT, 'content', section);
if (!existsSync(CONTENT_DIR)) {
  console.error(`Content directory not found: ${CONTENT_DIR}`);
  process.exit(1);
}

const META = join(ROOT, 'scripts', `${section}-epub-meta.yaml`);
if (!existsSync(META)) {
  console.error(`Metadata file not found: ${META}`);
  process.exit(1);
}

const TEMP_DIR = join(ROOT, `.docx-tmp-${section}`);
const OUTPUT_DIR = join(ROOT, 'public', 'books', 'docx');
const OUTPUT = join(OUTPUT_DIR, `${section}.docx`);

function getOrderedFiles() {
  const all = readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.md') && f !== '_meta.json');

  const prologue = all.filter(f => f.match(/^00-prologue/));
  const preface  = all.filter(f => f.match(/^00-preface/));
  const chapters = all.filter(f => f.match(/^[0-9]/) && !f.match(/^00-/)).sort();
  const capstones = all.filter(f => f.match(/^00-capstone/)).sort();

  return [...prologue, ...preface, ...chapters, ...capstones];
}

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

mkdirSync(OUTPUT_DIR, { recursive: true });
mkdirSync(join(TEMP_DIR, '_diagrams'), { recursive: true });

const orderedFiles = getOrderedFiles();
console.log(`\nGenerating DOCX for: ${section} (${orderedFiles.length} files)`);
console.log('Processing chapters...');

const tempFiles = [];

for (const filename of orderedFiles) {
  const srcPath = join(CONTENT_DIR, filename);
  const { title, content } = processFile(srcPath);

  // Convert SVG diagrams to PNG (DOCX doesn't support SVG); use sips (macOS built-in)
  const rewritten = content.replace(
    /!\[([^\]]*)\]\(\/diagrams\/([^)]+\.svg)\)/g,
    (match, alt, svgRelPath) => {
      const svgAbs = join(ROOT, 'public', 'diagrams', svgRelPath);
      const pngName = svgRelPath.replace(/\//g, '__').replace(/\.svg$/, '.png');
      const pngAbs = join(TEMP_DIR, '_diagrams', pngName);
      if (existsSync(svgAbs) && !existsSync(pngAbs)) {
        try {
          execSync(`sips -s format png "${svgAbs}" --out "${pngAbs}" 2>/dev/null`, { shell: true });
        } catch { /* skip */ }
      }
      return existsSync(pngAbs) ? `![${alt}](${pngAbs})` : '';
    }
  );

  const bodyHasH1 = /^#\s+/m.test(rewritten);
  const h1 = (title && !bodyHasH1) ? `# ${title}\n\n` : '';

  const cleaned = h1 + rewritten.trimStart();
  const destPath = join(TEMP_DIR, filename);
  writeFileSync(destPath, cleaned, 'utf-8');
  tempFiles.push(destPath);
  console.log(`  ✓ ${filename}${title ? ` — "${title}"` : ''}`);
}

const metaRaw = readFileSync(META, 'utf-8');
const titleMatch = metaRaw.match(/^title:\s*["']?(.+?)["']?\s*$/m);
const authorMatch = metaRaw.match(/^author:\s*["']?(.+?)["']?\s*$/m);
const bookTitle = titleMatch ? titleMatch[1] : section;
const bookAuthor = authorMatch ? authorMatch[1] : 'LegacyForward.ai';

const fileArgs = tempFiles.map(f => `"${f}"`).join(' \\\n  ');

const cmd = [
  'pandoc',
  fileArgs,
  `--output "${OUTPUT}"`,
  '--to docx',
  `--metadata title="${bookTitle}"`,
  `--metadata author="${bookAuthor}"`,
  '--toc',
  '--toc-depth=2',
].join(' \\\n  ');

console.log('\nRunning Pandoc (DOCX)...');
execSync(cmd, { stdio: 'inherit', shell: true });

rmSync(TEMP_DIR, { recursive: true, force: true });

const size = (statSync(OUTPUT).size / 1024).toFixed(0);
console.log(`\nDOCX generated: ${OUTPUT} (${size} KB)`);

/**
 * Generate PDF for any book section using pandoc (HTML) + headless Chrome.
 * Usage: node scripts/generate-pdf.mjs <section>
 * Example: node scripts/generate-pdf.mjs agenticai
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync, statSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const section = process.argv[2];
if (!section) {
  console.error('Usage: node scripts/generate-pdf.mjs <section>');
  console.error('Example: node scripts/generate-pdf.mjs agenticai');
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

const TEMP_DIR = join(ROOT, `.pdf-tmp-${section}`);
const OUTPUT_DIR = join(ROOT, 'public', 'books', 'pdf');
const TEMP_HTML = join(TEMP_DIR, 'book.html');
const OUTPUT = join(OUTPUT_DIR, `${section}.pdf`);

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

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
rmSync(TEMP_DIR, { recursive: true, force: true });
mkdirSync(TEMP_DIR, { recursive: true });

const orderedFiles = getOrderedFiles();
console.log(`\nGenerating PDF for: ${section} (${orderedFiles.length} files)`);
console.log('Processing chapters...');

const tempFiles = [];

for (const filename of orderedFiles) {
  const srcPath = join(CONTENT_DIR, filename);
  const { title, content } = processFile(srcPath);

  // Rewrite /diagrams/ paths to local filesystem paths for pandoc
  const rewritten = content.replace(
    /!\[([^\]]*)\]\(\/diagrams\//g,
    `![$1](${join(ROOT, 'public', 'diagrams')}/`
  );

  const bodyHasH1 = /^#\s+/m.test(rewritten);
  const h1 = (title && !bodyHasH1) ? `# ${title}\n\n` : '';

  const cleaned = h1 + rewritten.trimStart();
  const destPath = join(TEMP_DIR, filename);
  writeFileSync(destPath, cleaned, 'utf-8');
  tempFiles.push(destPath);
  console.log(`  ✓ ${filename}${title ? ` — "${title}"` : ''}`);
}

// Read book title from meta yaml
const metaRaw = readFileSync(META, 'utf-8');
const titleMatch = metaRaw.match(/^title:\s*["']?(.+?)["']?\s*$/m);
const authorMatch = metaRaw.match(/^author:\s*["']?(.+?)["']?\s*$/m);
const bookTitle = titleMatch ? titleMatch[1] : section;
const bookAuthor = authorMatch ? authorMatch[1] : 'LegacyForward.ai';

const CSS = `
  body { font-family: Georgia, serif; font-size: 11pt; line-height: 1.6; max-width: 700px; margin: 40px auto; color: #1a1a1a; }
  h1 { font-size: 22pt; color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 8px; page-break-before: always; margin-top: 40px; }
  h1:first-of-type { page-break-before: avoid; }
  h2 { font-size: 15pt; color: #2c5282; margin-top: 28px; }
  h3 { font-size: 12pt; color: #2d3748; margin-top: 20px; }
  h4 { font-size: 11pt; color: #4a5568; margin-top: 16px; }
  p { margin: 10px 0; }
  code { font-family: 'Courier New', monospace; font-size: 9pt; background: #f4f4f4; padding: 1px 4px; border-radius: 3px; }
  pre { background: #f4f4f4; padding: 12px; border-radius: 4px; font-size: 9pt; overflow: auto; }
  blockquote { border-left: 4px solid #cbd5e0; padding-left: 16px; color: #4a5568; margin: 16px 0; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 10pt; }
  th { background: #2c5282; color: white; padding: 8px 12px; text-align: left; }
  td { border: 1px solid #e2e8f0; padding: 7px 12px; }
  tr:nth-child(even) td { background: #f7fafc; }
  img { max-width: 100%; height: auto; display: block; margin: 16px auto; }
  strong { color: #1a202c; }
  .cover { text-align: center; padding: 120px 0; page-break-after: always; }
  .cover h1 { border: none; font-size: 28pt; page-break-before: avoid; }
  .cover .author { font-size: 14pt; color: #4a5568; margin-top: 20px; }
  .cover .year { font-size: 11pt; color: #718096; margin-top: 40px; }
  @media print { body { margin: 0; } }
`;

const coverHtml = `<div class="cover"><h1>${bookTitle}</h1><div class="author">${bookAuthor}</div><div class="year">© 2026 LegacyForward.ai</div></div>\n`;

const fileArgs = tempFiles.map(f => `"${f}"`).join(' \\\n  ');
const pandocCmd = [
  'pandoc',
  fileArgs,
  `--output "${TEMP_HTML}"`,
  '--to html5',
  '--standalone',
  '--embed-resources',
  `--metadata title="${bookTitle}"`,
  `--variable css="${TEMP_DIR}/style.css"`,
  '--toc',
  '--toc-depth=2',
].join(' \\\n  ');

writeFileSync(join(TEMP_DIR, 'style.css'), CSS, 'utf-8');

console.log('\nRunning Pandoc (HTML)...');
execSync(pandocCmd, { stdio: 'inherit', shell: true });

// Inject cover page before the body content
let html = readFileSync(TEMP_HTML, 'utf-8');
html = html.replace('<body>', `<body>\n${coverHtml}`);
writeFileSync(TEMP_HTML, html, 'utf-8');

console.log('Running headless Chrome (PDF)...');
const chromeCmd = [
  `"${CHROME}"`,
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--run-all-compositor-stages-before-draw',
  `--print-to-pdf="${OUTPUT}"`,
  '--print-to-pdf-no-header',
  `"file://${TEMP_HTML}"`,
].join(' ');

execSync(chromeCmd, { stdio: 'inherit', shell: true });

rmSync(TEMP_DIR, { recursive: true, force: true });

const size = (statSync(OUTPUT).size / 1024).toFixed(0);
console.log(`\nPDF generated: ${OUTPUT} (${size} KB)`);

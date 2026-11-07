// Stamp every hand-written HTML page with an invisible provenance marker.
// Idempotent: an existing marker is replaced, never duplicated.
// Blog pages are generated — their markers come from tools/blog/build.py.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.argv[2] || '.';
const ORIGIN_REF = 'ESB-2F7C91A4';
const SITE = 'https://esubutech.online';

const marker = path =>
  `<!-- \u00a9 2025 Esubu Tech \u00b7 esubutech.online \u00b7 proof-of-origin ${ORIGIN_REF} \u00b7 page:${path} -->`;

const MARKER_RE = /<!-- \u00a9 2025 Esubu Tech \u00b7 esubutech\.online \u00b7 proof-of-origin ESB-2F7C91A4 \u00b7 page:[^ ]* -->\n?/g;

// file path -> url path served by Pages
function urlPath(rel) {
  const p = rel.split(sep).join('/');
  if (p === 'index.html') return '/';
  if (p.endsWith('/index.html')) return '/' + p.slice(0, -'index.html'.length);
  return '/' + p;
}

const html = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) html.push(p);
  }
})(ROOT);

let stamped = 0, skipped = 0, already = 0;
const problems = [];

for (const file of html) {
  const rel = relative(ROOT, file);
  let s = readFileSync(file, 'utf8');
  const url = urlPath(rel);
  const mark = marker(url);

  const hadMarker = MARKER_RE.test(s);
  MARKER_RE.lastIndex = 0;
  if (hadMarker) { s = s.replace(MARKER_RE, ''); already++; }

  // 1. head: immediately after the charset meta
  const headRe = /(<meta charset=["']UTF-8["'][^>]*>)(\r?\n)?/i;
  if (!headRe.test(s)) { problems.push(`${rel}: no <meta charset>`); skipped++; continue; }
  s = s.replace(headRe, (m, tag) => `${tag}\n${mark}\n`);

  // 2. tail: just before </body>, so removing one marker is not enough
  if (/<\/body>/i.test(s)) {
    s = s.replace(/<\/body>/i, `${mark}\n</body>`);
  } else {
    problems.push(`${rel}: no </body> — head marker only`);
  }

  writeFileSync(file, s, 'utf8');
  stamped++;
}

console.log(`pages found : ${html.length}`);
console.log(`stamped     : ${stamped}  (previously marked: ${already})`);
console.log(`skipped     : ${skipped}`);
if (problems.length) { console.log('\nnotes:'); problems.forEach(p => console.log('  ' + p)); }

#!/usr/bin/env node
// Prove whether a website is a copy of esubutech.online.
//
//   node tools/verify-origin.mjs https://suspicious-site.com
//   node tools/verify-origin.mjs https://a.com https://b.com
//
// How it works: every page we publish carries an invisible HTML comment with our
// origin reference (see NOTICE). If a copy keeps the comment, provenance is proven
// outright. If the comment was stripped but the wording survives, the fingerprint
// check flags it for manual review.

const ORIGIN_REF = 'ESB-2F7C91A4';
const CANONICAL = 'esubutech.online';

// Distinctive phrases from our own copy. Two or more together is strong evidence.
const FINGERPRINTS = [
  'First we loosen the ground',
  'A wrong belief is harder to fix than a missing one',
  'proof-of-origin',
  'KES 12,000 a month',
  'does-chess-make-kids-smarter',
  'Esubu Tech Academy',
  'esubumedia@gmail.com',
  'One child per session',
];

const UA = 'Mozilla/5.0 (compatible; EsubuProvenanceCheck/1.0)';

function normalise(input) {
  return /^https?:\/\//i.test(input) ? input : `https://${input}`;
}

async function inspect(url) {
  const target = normalise(url);
  let res, body;
  try {
    res = await fetch(target, { headers: { 'User-Agent': UA }, redirect: 'follow' });
    body = await res.text();
  } catch (e) {
    return { target, error: e.message };
  }
  const host = new URL(res.url || target).hostname.replace(/^www\./, '');
  const marks = [...body.matchAll(new RegExp(`proof-of-origin ${ORIGIN_REF} · page:(\\S+)`, 'g'))].map(m => m[1]);
  const anyOrigin = new RegExp(`proof-of-origin ${ORIGIN_REF}`).test(body);
  const hits = FINGERPRINTS.filter(f => body.includes(f));

  let verdict, detail;
  if (marks.length && host === CANONICAL) {
    verdict = 'ORIGINAL';
    detail = `our markers present on our own domain (${marks.length} found)`;
  } else if (marks.length) {
    verdict = 'COPY — PROVEN';
    detail = `our markers retained on a foreign domain (${marks.length} found): ${marks.slice(0, 3).join(', ')}`;
  } else if (anyOrigin) {
    verdict = 'COPY — PROVEN (partial)';
    detail = 'origin reference present but page path unreadable';
  } else if (hits.length >= 2) {
    verdict = 'SUSPECTED COPY — markers stripped';
    detail = `${hits.length} fingerprints match: ${hits.slice(0, 4).join(' | ')}`;
  } else if (hits.length === 1) {
    verdict = 'INCONCLUSIVE';
    detail = `one weak match: ${hits[0]}`;
  } else {
    verdict = 'NO EVIDENCE';
    detail = 'no markers and no fingerprints found';
  }
  return { target, status: res.status, host, verdict, detail, marks };
}

const args = process.argv.slice(2);
if (!args.length) {
  console.log('usage: node tools/verify-origin.mjs <url> [url...]');
  console.log(`checks pages for proof-of-origin ${ORIGIN_REF}`);
  process.exit(1);
}

let suspicious = 0;
for (const arg of args) {
  const r = await inspect(arg);
  console.log(`\n${r.target}`);
  if (r.error) { console.log(`  UNREACHABLE — ${r.error}`); continue; }
  console.log(`  status : ${r.status}   host: ${r.host}`);
  console.log(`  verdict: ${r.verdict}`);
  console.log(`  detail : ${r.detail}`);
  if (r.marks?.length) console.log(`  pages  : ${r.marks.join(', ')}`);
  if (r.verdict.startsWith('COPY') || r.verdict.startsWith('SUSPECTED')) suspicious++;
}

console.log(`\n${suspicious ? `${suspicious} site(s) flagged.` : 'No copies detected.'}`);
console.log(`Markers are copyright notices. If a copy retains them, that is proof it came from us.`);
process.exit(suspicious ? 1 : 0);

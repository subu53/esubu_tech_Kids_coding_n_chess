# SEO work log — Esubu Tech Academy

For any tool or person picking this up. Records **what changed, why, and what is still open**.
Last updated: 12 November 2026.

---

## How this site is built (read before editing)

- **Host:** GitHub Pages, custom domain `esubutech.online` (see `CNAME`). Push to `main` → `.github/workflows/deploy.yml` publishes the repo root.
- **Two workflows fire on push.** `deploy.yml` succeeds. A second, legacy `pages build and deployment` job **fails every time** — it does not affect the site, but it is noise. Not yet resolved.
- **The blog is generated, not hand-written.** Source of truth is `academy/blog/_posts/*.md` + `tools/blog/build.py`. Running the script rewrites:
  - `academy/blog/index.html`
  - `academy/blog/<slug>/index.html` (30 posts)
  - `academy/blog/feed.xml`
  - blog entries inside `sitemap.xml` (it deletes and re-adds only blog `<url>` blocks — the rest of the sitemap is left alone)
- **Never hand-edit `academy/blog/<slug>/index.html`.** Rebuild instead. (`tools/blog/README.md` has the authoring notes.)
- **Rebuilding needs `markdown` and `pyyaml`,** which are not installed system-wide. They were extracted into `site-work/pylibs` (outside this repo) from wheels. To rebuild:

  ```powershell
  $env:PYTHONPATH = 'C:\Users\User\OneDrive\Documents\deepseek-harness\default-workspace\site-work\pylibs'
  python tools/blog/build.py
  ```

  If that path is gone, `pip install markdown pyyaml` into any venv works.
- **Validation:** `node validate-repo.mjs <repo-root>` checks every internal link resolves, every JSON-LD block parses, the sitemap matches real files, and canonicals exist. It lives in `site-work/` (outside this repo) and reports `PASS: 0 problem(s)` as of the last commit.

---

## Done

### 12 Nov 2026 — commit `d0a26b9` (PR #6)

- **New `/academy/fees/` page.** Targets *"how much do coding and chess classes cost in Nairobi"*. KES 12,000/month and ~KES 1,000 a class in the first 150 words, M-Pesa till 680985, what the fee includes, the per-hour comparison, the week-three objection, and a sentence a parent can repeat at home. FAQPage + BreadcrumbList schema, self-canonical. 1,199 words.
- **`sitemap.xml`:** added `/academy/fees/`, removed `/healthyliving/`. 38 URLs.
- **`/academy/`:** linked to the fee page from nav, the fee detail box and the pricing card (4 links).

### 12 Nov 2026 — commit `16f6606`

- **All 30 blog posts link to the fee page** — soft CTA reads "How applying works · What it costs", pointing at `/academy/fees/?from=<slug>`, matching the existing signup attribution.
- **`tools/blog/build.py`:** new `fees()` helper so a rebuild reproduces it.
- **Homepage:** `Organization` + `WebSite` JSON-LD added (it had none).
- **`/academy/`:** `EducationalOrganization` now declares `parentOrganization`.
- **Canonicals** added to `/techsolutions/` and `/datascience/`.
- **`404.html`:** `noindex, follow`.

### 12 Nov 2026 — commit `6044a43`, merged as `6f36f22`

- **One-to-one published as the format** (owner decision). 45 files:
  - `/academy/`: meta description, Class Size box, pricing card
  - `/academy/signup/`: 15 replacements — meta + og descriptions, fee-table row "Group → Class", the "never more than 15" band, ability/age paragraphs, and every "group" reference now reads "level"
  - 10 posts: `invite_text` front matter de-grouped
  - `build.py`: default soft CTA now "one child per session"
- **Signup page** gained a "Not ready to fill in a form?" block linking three parent posts + the fees page; footer now links Fees.
- **Blog rebuilt from source** with `markdown` + `pyyaml`.
- Verified live: 0 residual "up to 15" / "max 15" strings, 0 broken links.

### Supplements wing hidden (owner decision)

`/healthyliving/` is `noindex, nofollow`; removed from the sitemap and from all navigation. Deliberately **not** blocked in `robots.txt` — a Disallow would stop crawlers seeing the noindex, which is the opposite of hiding it. Owner is moving the shop to its own domain.

---

### 12 Nov 2026 — method page

- **New `/academy/method/`** — "Test, build, review". Three stages, in the order they happen: find out what the child already believes, build from a blank screen, then review the mistake out loud. Grounded in Papert/Resnick constructionism and MIT Scratch's learning spiral, both linked. FAQPage + BreadcrumbList schema, self-canonical.
- **Teaching strategy added above the stages:** "First we loosen the ground." Nothing grows in hard soil — a child who is afraid of being wrong will not take in a concept however clearly it is explained, so the first job is loosening (small wins, permission to break things, no marks attached) before the ideas arrive in order, each resting on the last.
- **Process strip** shows the full shape: Loosen → Test → Build → Review → Grow. Deliberately unnumbered so it does not compete with the numbered stages below.
- **Two outcomes** named explicitly: *Project-focused* (every stretch ends in a finished game) and *Tournament-ready* (a child can sit at a board, record the game and return after a loss).
- **Mobile:** custom CSS carries its own breakpoints — the process strip and outcome cards stack to one column under 640–720px, stage cards lose padding and reflow their heading. The hero's floating cards are already hidden below 900px by `styles.css`.
- **Typography corrected.** The site's real system is `body { Nunito }` but headings are explicitly `Inter` (~31 rules). The page's scoped CSS had headings in Nunito, so they clashed with every other heading on the site. All scoped heading declarations on `/academy/method/` and `/academy/fees/` now use Inter. Each page uses exactly one font family in its own CSS.
- **Credibility block added:** who is in the room. Founder credentials (BSc Data Science KCA University; MSc AI, Open University of Kenya, ongoing; co-founder of Soko Huru) and the hiring standard — bachelor's degree as the floor with a preference for BSc, and an education background must carry a science or mathematics specialisation. Phrased honestly: the founder teaches every session now, and the standard is written down for when teachers join. `Person` schema added to the page's `@graph`.
- Deliberate omissions: nothing about testing at scale, product research or future plans. The page describes practice only. It ends with a "what we don't publish" note about the sequence itself — intrigue without a false claim.
- Linked from academy nav (desktop + mobile), fees page nav, and its own footer. Added to `sitemap.xml` (39 URLs).

### Repo settings changed

- **Pages `build_type` switched from `legacy` to `workflow`.** Both a branch build and `deploy.yml` were publishing on every push, and the legacy one had started failing. Now there is one publisher. If Pages ever looks stale, check this setting first.

---

## Not done yet

| # | Item | Status | Blocked by |
|---|---|---|---|
| 1 | `/academy/holiday-camp/` | **Cancelled** — owner wants CTAs pointed at signup instead | — |
| 2 | `/academy/students/` | **On hold** — owner is deciding whether to ask parents for recording consent. No names, quotes or photos go live without it | Owner |
| 3 | `/academy/method/` | **Done** — live | — |
| 4 | `/academy/curriculum/` | Not started — `chess-coding-curriculum/` in the workspace can seed it | Owner review |
| 5 | `/academy/faq/` | Not started — assemble from the FAQ already on the signup page | — |
| 6 | `/academy/chess/` + `/academy/coding/` hubs | Not started — the 30 posts have no parent page | — |
| 7 | Answer-first rewrites of the 10 highest-traffic posts | Not started | Owner review of the voice |
| 8 | Swahili pages (`/sw/chess/`, `/sw/coding/`) | Not started | — |
| 9 | YouTube (strongest correlate of AI visibility in the largest study available) | Not started | Owner filming |
| 10 | Google Business Profile | **Not applicable** — online-only, not eligible | — |
| 11 | `llms.txt` | **Do not build** — 97% never fetched; Google ignores it | — |
| 12 | Fee page claims | Registration fee: **confirmed none** (12 Nov). Missed-class wording: **still unconfirmed** | Owner |
| 13 | Legacy `pages build and deployment` workflow | **Done** — Pages switched to Actions-only | — |

---

## Decisions recorded

1. **One-to-one is the published format.** Groups return as staff are added; the fee page states "Capped at 15. One-to-one while numbers are small."
2. **Supplements shop is coming off the domain.** Noindex until it has its own domain.
3. **Holiday camp page deprioritised** in favour of driving everything to signup.
4. **No public R&D narrative.** The method may be described publicly, but never as "we are testing on children before scaling" — a parent does not want to be a guinea pig. Any method copy must describe practice, not experiments.
5. **No invented testimonials.** See below.

---

## Note on the evidence base

The strategy came from a teardown of `heyvisibly.com` and a 2026 evidence brief on AI citation. Two findings worth remembering before adding features:

- **Price pages are the most repeated traffic winner** across every case study that company publishes — and almost no Nairobi provider has one. That is why `/academy/fees/` came first.
- **Schema does not measurably increase AI citations.** The best causal test (Ahrefs, matched difference-in-differences, 1,885 pages vs 4,000 controls) found no uplift. Schema was added for entity clarity and rich-result eligibility, not as a growth lever. Do not sell it as one.
- **Do not build:** `llms.txt`, word-count targets, FAQ/HowTo schema for rich results (both rich results are dead), bulk "chunking" rewrites.

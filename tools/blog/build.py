#!/usr/bin/env python3
"""Build the Esubu Tech Academy blog from Markdown posts.

Posts live in academy/blog/_posts/<slug>.md. Running this script writes:
  academy/blog/index.html            the contents page
  academy/blog/<slug>/index.html     one page per post
  academy/blog/feed.xml              RSS feed
  sitemap.xml                        blog entries replaced, the rest left alone
  academy/blog/covers/<slug>.jpg     share images, only with --covers

Usage (from the repo root):
  pip install markdown pyyaml
  python3 tools/blog/build.py
  python3 tools/blog/build.py --covers    # also redraw share images
                                          # (needs: pip install playwright,
                                          #  then: playwright install chromium)

Writing a new post: copy any file in academy/blog/_posts, change the front
matter, write the body, run the script, commit. Custom blocks:

  :::pull                 a sentence marked with the highlighter
  One line of text.
  :::

  :::note                 a handwritten note, in the margin on wide screens
  Short line.
  :::

  :::board fen="<FEN>" caption="<text>"
  :::                     a chess diagram

  ```scratch              Scratch-style blocks, two spaces per nesting level
  when green flag clicked
  repeat (10)
    move (10) steps
  end
  ```
"""
import argparse
import datetime as dt
import hashlib
import html
import json
import math
import re
import sys
from pathlib import Path
from urllib.parse import quote

import markdown
import yaml

import figures as figs

ROOT = Path(__file__).resolve().parents[2]
BLOG = ROOT / "academy" / "blog"
POSTS = BLOG / "_posts"
COVERS = BLOG / "covers"
FIGURES = BLOG / "figures"
FONTS = ROOT / "academy" / "fonts"
SITE = "https://esubutech.online"
BLOG_URL = SITE + "/academy/blog/"
WA_NUMBER = "254720811346"
GA_ID = "G-GHFDG299C1"
AUTHOR = {
    "name": "Sammy Subu",
    "role": "Founder and programmes director",
    "photo": "/sammy-subu.jpg",
    "linkedin": "https://www.linkedin.com/in/samsubu",
}
REQUIRED = ["title", "seo_title", "description", "slug", "date", "category",
            "dek", "invite_title", "invite_text", "sources"]
MONTHS = ["January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]


# ---------------------------------------------------------------- helpers

def esc(s):
    return html.escape(str(s), quote=True)


def nice_date(d):
    return f"{d.day} {MONTHS[d.month - 1]} {d.year}"


def as_date(v):
    if isinstance(v, dt.date):
        return v
    return dt.date.fromisoformat(str(v))


def wa_link(text):
    return f"https://wa.me/{WA_NUMBER}?text={quote(text)}"


def signup(slug, anchor=""):
    return f"/academy/signup/?from={quote(slug)}{anchor}"


# ---------------------------------------------------------------- blocks

PIECES_W = {"k": "\u2654", "q": "\u2655", "r": "\u2656", "b": "\u2657", "n": "\u2658", "p": "\u2659"}
PIECES_B = {"k": "\u265A", "q": "\u265B", "r": "\u265C", "b": "\u265D", "n": "\u265E", "p": "\u265F"}
NAMES = {"k": "king", "q": "queen", "r": "rook", "b": "bishop", "n": "knight", "p": "pawn"}


def board_html(fen, caption):
    """Chess diagram from a FEN string: outlined pieces for White, filled for Black."""
    rows = fen.split()[0].split("/")
    if len(rows) != 8:
        raise ValueError(f"bad FEN: {fen}")
    labels, squares, white, black = [], [], [], []
    for r_i, row in enumerate(rows):
        rank = 8 - r_i
        labels.append(f'<span class="board__lbl" style="grid-column:1;grid-row:{r_i + 1}">{rank}</span>')
        f = 0
        for ch in row:
            if ch.isdigit():
                for _ in range(int(ch)):
                    squares.append(_square(f, rank, ""))
                    f += 1
                continue
            sq = "abcdefgh"[f] + str(rank)
            if ch.isupper():
                white.append(f"{NAMES[ch.lower()]} {sq}")
                glyph = PIECES_W[ch.lower()]
            else:
                black.append(f"{NAMES[ch]} {sq}")
                glyph = PIECES_B[ch]
            squares.append(_square(f, rank, f"{glyph}\uFE0E"))
            f += 1
        if f != 8:
            raise ValueError(f"bad FEN row {row} in {fen}")
    for f in range(8):
        labels.append(f'<span class="board__lbl" style="grid-column:{f + 2};grid-row:9">{"abcdefgh"[f]}</span>')
    label = ("Chess diagram. White: " + (", ".join(white) or "no pieces")
             + ". Black: " + (", ".join(black) or "no pieces") + ".")
    return (f'<figure class="board"><div class="board__grid" role="img" aria-label="{esc(label)}">'
            + "".join(labels) + '<div class="board__frame">' + "".join(squares) + "</div>"
            + f'</div><figcaption>{esc(caption)}</figcaption></figure>')


def _square(f, rank, glyph):
    dark = (f + rank) % 2 == 1
    return f'<span class="board__sq{" d" if dark else ""}">{glyph}</span>'


SCRATCH_RULES = [
    ("event", r"^when\b"),
    ("end", r"^end$"),
    ("control", r"^(repeat|forever|if|else|wait|stop)\b"),
    ("motion", r"^(move|turn|go to|glide|point|change [xy]|set [xy]|if on edge)\b"),
    ("looks", r"^(say|think|switch|show|hide|next costume|change size|set size)\b"),
    ("sound", r"^(play|start sound)\b"),
    ("sensing", r"^(ask|touching)\b"),
    ("var", r"^(set|change)\b"),
]


def scratch_html(src):
    out, plain = [], []
    for raw in src.splitlines():
        if not raw.strip():
            continue
        depth = (len(raw) - len(raw.lstrip(" "))) // 2
        text = raw.strip()
        plain.append(text)
        kind = "control"
        for k, pat in SCRATCH_RULES:
            if re.search(pat, text):
                kind = k
                break
        t = esc(text)
        t = re.sub(r"\[([^\]]*)\]", r"<i>\1</i>", t)
        t = re.sub(r"\(([^)]*)\)", r"<i>\1</i>", t)
        t = re.sub(r"&lt;(.*?)&gt;", r"<i>\1</i>", t)
        if kind == "end":
            t = ""
        out.append(f'<span class="blk blk--{kind}" data-depth="{min(depth, 3)}">{t}</span>')
    label = "Scratch blocks: " + ", then ".join(plain)
    return f'<div class="blocks" role="img" aria-label="{esc(label)}">' + "".join(out) + "</div>"


def inline_md(text):
    out = markdown.markdown(text.strip(), extensions=["smarty"])
    return re.sub(r"^<p>(.*)</p>$", r"\1", out.strip(), flags=re.S)


def figure_html(slug, fid, specs):
    if fid not in specs:
        raise ValueError(f"{slug}: figure '{fid}' is not in the front matter")
    spec = specs[fid]
    src = f"/academy/blog/figures/{slug}-{fid}.webp"
    cap = spec.get("caption", "")
    if spec.get("source"):
        cap = (cap + " " if cap else "") + f"Source: {spec['source']}."
    return (f'<figure class="fig"><a href="{src}" target="_blank" rel="noopener" aria-label="Open the full-size figure">'
            f'<img src="{src}" width="{figs.W}" height="{figs.H}" '
            f'alt="{esc(figs.alt_text(spec))}" loading="lazy" decoding="async"></a>'
            + (f"<figcaption>{inline_md(cap)}</figcaption>" if cap else "") + "</figure>")


def preprocess(body, slug="", specs=None):
    """Swap custom blocks for placeholders. Markdown never sees them."""
    stash = []
    specs = specs or {}

    def keep(fragment):
        stash.append(fragment)
        return f"\n\nXBLOCKX{len(stash) - 1}XBLOCKX\n\n"

    body = re.sub(r"```scratch\n(.*?)\n```",
                  lambda m: keep(scratch_html(m.group(1))), body, flags=re.S)
    body = re.sub(r'^:::board\s+fen="([^"]+)"\s+caption="([^"]*)"\s*\n:::\s*$',
                  lambda m: keep(board_html(m.group(1), m.group(2))), body, flags=re.M)
    body = re.sub(r"^:::pull\s*\n(.*?)\n:::\s*$",
                  lambda m: keep(f'<blockquote class="pull"><p><span class="hl">{inline_md(m.group(1))}</span></p></blockquote>'),
                  body, flags=re.M | re.S)
    body = re.sub(r'^:::figure\s+id="([a-z0-9-]+)"\s*\n:::\s*$',
                  lambda m: keep(figure_html(slug, m.group(1), specs)), body, flags=re.M)
    body = re.sub(r"^:::note\s*\n(.*?)\n:::\s*$",
                  lambda m: keep(f'<aside class="note"><p>{inline_md(m.group(1))}</p></aside>'),
                  body, flags=re.M | re.S)
    if ":::" in body:
        line = body[body.index(":::"):].splitlines()[0]
        raise ValueError(f"unclosed or unknown block: {line}")
    return body, stash


def render_body(body, slug, soft_text, specs=None):
    body, stash = preprocess(body, slug, specs)
    md = markdown.Markdown(
        extensions=["tables", "fenced_code", "toc", "sane_lists", "smarty"],
        extension_configs={"toc": {"toc_depth": "2-2"}},
    )
    out = md.convert(body)
    for i, frag in enumerate(stash):
        out = out.replace(f"<p>XBLOCKX{i}XBLOCKX</p>", frag)
    out = out.replace("<table>", '<div class="table-scroll"><table>').replace("</table>", "</table></div>")
    heads = [(t["id"], t["name"]) for t in md.toc_tokens if t["level"] == 2]
    # One quiet line about the academy, before the third section.
    starts = [m.start() for m in re.finditer(r"<h2[ >]", out)]
    if len(starts) >= 3:
        soft = (f'<aside class="soft"><p>{soft_text} '
                f'<a href="{signup(slug)}" data-cta="soft">How applying works</a></p></aside>\n')
        out = out[:starts[2]] + soft + out[starts[2]:]
    words = len(re.findall(r"\b\w+\b", re.sub(r"<[^>]+>", " ", out)))
    return out, heads, words


# ---------------------------------------------------------------- loading

def load_posts():
    posts = []
    for path in sorted(POSTS.glob("*.md")):
        raw = path.read_text(encoding="utf-8")
        m = re.match(r"^---\n(.*?)\n---\n(.*)$", raw, re.S)
        if not m:
            raise ValueError(f"{path.name}: missing front matter")
        meta = yaml.safe_load(m.group(1))
        missing = [k for k in REQUIRED if not meta.get(k)]
        if missing:
            raise ValueError(f"{path.name}: missing {', '.join(missing)}")
        if meta["slug"] != path.stem:
            raise ValueError(f"{path.name}: slug must match the file name")
        if meta.get("draft"):
            continue
        meta["date"] = as_date(meta["date"])
        meta["updated"] = as_date(meta.get("updated", meta["date"]))
        meta["body"] = m.group(2)
        meta["url"] = f"{BLOG_URL}{meta['slug']}/"
        meta["path"] = f"/academy/blog/{meta['slug']}/"
        meta.setdefault("weight", 100)
        meta.setdefault("related", [])
        meta["figures"] = meta.get("figures") or {}
        meta.setdefault("soft", "If you'd like a teacher to take this further with your child, our coding and chess classes run live on Zoom in groups of up to 15.")
        posts.append(meta)
    slugs = {p["slug"] for p in posts}
    for p in posts:
        for r in p["related"]:
            if r not in slugs:
                raise ValueError(f"{p['slug']}: related post '{r}' not found")
        for k, limit in (("seo_title", 62), ("description", 160)):
            if len(p[k]) > limit:
                print(f"  note: {p['slug']} {k} is {len(p[k])} characters (aim for under {limit})")
    posts.sort(key=lambda p: (p["weight"], -p["date"].toordinal(), p["title"]))
    return posts


def cover_url(p):
    name = f"{p['slug']}.jpg" if p else "blog.jpg"
    return f"{SITE}/academy/blog/covers/{name}"


# ---------------------------------------------------------------- page parts

SPRITE = """<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-wa" viewBox="0 0 24 24"><path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.59-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41Z"/></symbol>
  <symbol id="i-fb" viewBox="0 0 24 24"><path fill="currentColor" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z"/></symbol>
  <symbol id="i-link" viewBox="0 0 24 24"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
</svg>"""


def head(title, desc, url, image, og_type, jsonld, css_v, extra_meta=""):
    return f"""<!DOCTYPE html>
<html lang="en-KE">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{esc(url)}">
<meta property="og:type" content="{og_type}">
<meta property="og:url" content="{esc(url)}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:image" content="{esc(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="Esubu Tech Academy">
<meta property="og:locale" content="en_KE">
{extra_meta}<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#173A2A">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="apple-touch-icon" href="/favicon.png">
<link rel="alternate" type="application/rss+xml" title="Esubu Tech Academy blog" href="/academy/blog/feed.xml">
<link rel="preload" href="/academy/fonts/bricolage-grotesque-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/academy/blog/blog.css?v={css_v}">
<script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());
  gtag('config', '{GA_ID}');
</script>
<script type="application/ld+json">{json.dumps(jsonld, ensure_ascii=False, separators=(",", ":"))}</script>
</head>
<body>
{SPRITE}
"""


def header(slug, wa_text):
    return f"""<header class="hd">
  <div class="wrap hd__in">
    <a class="brand" href="/academy/" aria-label="Esubu Tech Academy home">&#9889;&nbsp;Esubu<span>Tech</span><small>Academy blog</small></a>
    <div class="hd__act">
      <a class="hd__link" data-cta="whatsapp-header" target="_blank" rel="noopener" href="{esc(wa_link(wa_text))}"><svg aria-hidden="true"><use href="#i-wa"/></svg><span>WhatsApp</span></a>
      <a class="btn btn--sm" data-cta="book-header" href="{signup(slug, '#book')}"><span class="long">Apply for a place</span><span class="short">Apply</span></a>
    </div>
  </div>
</header>
"""


def invite(slug, title, text, wa_text):
    return f"""<section class="invite" aria-labelledby="invite-title">
  <div class="wrap invite__in">
    <div>
      <h2 id="invite-title">{esc(title)}</h2>
      <p>{esc(text)}</p>
      <p><a href="{signup(slug)}" data-cta="signup-page" style="color:#fff;font-weight:600">See the timetable, fees and parents' questions</a></p>
    </div>
    <div class="invite__btns">
      <a class="btn btn--hl" data-cta="book" href="{signup(slug, '#book')}">Apply for a place</a>
      <a class="btn btn--wa" data-cta="whatsapp" target="_blank" rel="noopener" href="{esc(wa_link(wa_text))}"><svg aria-hidden="true"><use href="#i-wa"/></svg>Ask Sammy on WhatsApp</a>
      <small>Two minutes to apply. I reply on WhatsApp with the group, fees and start details.</small>
    </div>
  </div>
</section>
"""


FOOTER = """<footer class="ft">
  <div class="wrap">
    <div class="ft__grid">
      <div>
        <a class="brand" href="/">&#9889;&nbsp;Esubu<span>Tech</span></a>
        <p>Live online coding and chess classes for Kenyan children, ages 6 to 16.</p>
      </div>
      <div>
        <h4>Academy</h4>
        <ul>
          <li><a href="/academy/">Academy home</a></li>
          <li><a href="/academy/blog/">Blog</a></li>
          <li><a href="/academy/signup/">Apply for a place</a></li>
          <li><a href="/academy/blog/feed.xml">RSS feed</a></li>
        </ul>
      </div>
      <div>
        <h4>Esubu Tech</h4>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/techsolutions">Tech Solutions</a></li>
          <li><a href="/datascience">Data Science</a></li>
        </ul>
      </div>
      <div>
        <h4>Contact</h4>
        <ul>
          <li><a target="_blank" rel="noopener" href="https://wa.me/254720811346">WhatsApp +254 720 811 346</a></li>
          <li><a href="mailto:esubumedia@gmail.com">esubumedia@gmail.com</a></li>
          <li>Nairobi, Kenya</li>
        </ul>
      </div>
    </div>
    <div class="ft__bot">
      <p style="margin:0;max-width:none">&copy; 2026 Esubu Tech, run by Esubu Media, registered in Kenya. <a href="https://esubutech.online">esubutech.online</a></p>
    </div>
  </div>
</footer>
"""


def entry(p, tag="li"):
    mins = p["minutes"]
    return (f'<{tag} class="entry" data-cat="{esc(p["category"])}">'
            f'<a href="{p["path"]}"><span class="hand">{esc(p["category"])}</span>'
            f'<div><h3>{esc(p["title"])}</h3><p>{esc(p["dek"])}</p></div>'
            f'<span class="mins">{mins} min read</span></a></{tag}>')


def scripts(slug):
    return f'<script src="/academy/blog/blog.js?v={JS_V}" data-post="{esc(slug)}" defer></script>\n</body>\n</html>\n'


# ---------------------------------------------------------------- pages

def post_page(p, by_slug, css_v):
    body, heads, words = render_body(p["body"], p["slug"], p["soft"], p["figures"])
    p["minutes"] = max(3, math.ceil(words / 220))
    wa_text = f'Hello Sammy, I read "{p["title"]}" on your blog. I\'d like to ask about classes. My child\'s age: '
    jsonld = {"@context": "https://schema.org", "@graph": [
        {"@type": "BlogPosting", "@id": p["url"] + "#article", "headline": p["title"],
         "description": p["description"], "image": [cover_url(p)],
         "datePublished": p["date"].isoformat(), "dateModified": p["updated"].isoformat(),
         "inLanguage": "en-KE", "articleSection": p["category"], "keywords": p.get("keyword", ""),
         "wordCount": words, "mainEntityOfPage": p["url"],
         "author": {"@type": "Person", "name": AUTHOR["name"], "jobTitle": AUTHOR["role"],
                    "sameAs": [AUTHOR["linkedin"]]},
         "publisher": {"@type": "Organization", "name": "Esubu Tech Academy",
                       "url": SITE + "/academy/",
                       "logo": {"@type": "ImageObject", "url": SITE + "/esubu-logo.jpg"}},
         "isPartOf": {"@id": BLOG_URL + "#blog"},
         "citation": [s["url"] for s in p["sources"]]},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Academy", "item": SITE + "/academy/"},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": BLOG_URL},
            {"@type": "ListItem", "position": 3, "name": p["title"], "item": p["url"]}]},
    ]}
    toc_items = "".join(f'<li><a href="#{i}">{esc(re.sub("<[^>]+>", "", n))}</a></li>' for i, n in heads)
    sources = "".join(
        f'<li><a href="{esc(s["url"])}" target="_blank" rel="noopener">{esc(s["title"])}</a>'
        + (f'<small>{esc(s["note"])}</small>' if s.get("note") else "") + "</li>"
        for s in p["sources"])
    share_text = f'{p["title"]} {p["url"]}'
    related = [by_slug[s] for s in p["related"]]
    related_html = ""
    if related:
        related_html = ('<section class="related" aria-labelledby="related-title"><div class="wrap">'
                        '<h2 id="related-title">Read next</h2><ul class="contents">'
                        + "".join(entry(r) for r in related) + "</ul></div></section>")
    updated = ""
    if p["updated"] != p["date"]:
        updated = f', updated {nice_date(p["updated"])}'
    return (head(p["seo_title"] + " | Esubu Academy" if len(p["seo_title"]) < 46 else p["seo_title"],
                 p["description"], p["url"], cover_url(p), "article", jsonld, css_v,
                 f'<meta property="article:published_time" content="{p["date"].isoformat()}">\n'
                 f'<meta property="article:modified_time" content="{p["updated"].isoformat()}">\n'
                 f'<meta property="article:section" content="{esc(p["category"])}">\n'
                 f'<meta name="author" content="{AUTHOR["name"]}">\n')
            + header(p["slug"], wa_text) + f"""<main>
<article>
  <header class="post-hero ruled">
    <div class="wrap">
      <div class="post-hero__grid">
        <nav aria-label="Breadcrumb"><ol class="crumbs"><li><a href="/academy/">Academy</a></li><li><a href="/academy/blog/">Blog</a></li></ol></nav>
        <span class="post-cat hand">{esc(p["category"])}</span>
        <h1>{esc(p["title"])}</h1>
        <p class="dek">{esc(p["dek"])}</p>
        <div class="byline"><img src="{AUTHOR["photo"]}" alt="" width="44" height="44" loading="lazy">
          <div><b>{AUTHOR["name"]}</b>{AUTHOR["role"]}<br><time datetime="{p["date"].isoformat()}">{nice_date(p["date"])}</time>{updated}, {p["minutes"]} min read</div>
        </div>
      </div>
    </div>
  </header>
  <div class="post-main">
    <div class="wrap">
      <div class="post-grid">
        <nav class="toc" aria-label="On this page"><b>On this page</b><ol>{toc_items}</ol></nav>
        <div class="prose">
          <details class="toc-mini"><summary>On this page</summary><ol>{toc_items}</ol></details>
{body}
        </div>
        <div class="after">
          <div class="share">
            <span>Send this to a parent</span>
            <a class="btn btn--wa btn--sm" data-cta="share-whatsapp" target="_blank" rel="noopener" href="https://wa.me/?text={quote(share_text)}"><svg aria-hidden="true"><use href="#i-wa"/></svg>WhatsApp</a>
            <a class="btn btn--wa btn--fb btn--sm" data-cta="share-facebook" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u={quote(p["url"])}"><svg aria-hidden="true"><use href="#i-fb"/></svg>Facebook</a>
            <button class="btn btn--ghost btn--sm" type="button" data-cta="copy-link" data-copy="{esc(p["url"])}"><svg aria-hidden="true"><use href="#i-link"/></svg><span>Copy link</span></button>
          </div>
          <section class="check" aria-labelledby="check-title">
            <h2 id="check-title">Check this yourself</h2>
            <p>The sources behind this post. Read them, and read the people who disagree, before you decide.</p>
            <ol>{sources}</ol>
          </section>
          <div class="author">
            <img src="{AUTHOR["photo"]}" alt="Sammy Subu" width="72" height="72" loading="lazy">
            <div><b>Written by {AUTHOR["name"]}</b>
              <p>Sammy founded Esubu Tech Academy and designs its coding and chess curriculum. He holds a BSc in Data Science from KCA University and is studying for an MSc in Artificial Intelligence at the Open University of Kenya. He learned to code as an adult, after years of unfinished tutorials, and teaches children so they start sooner.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</article>
{invite(p["slug"], p["invite_title"], p["invite_text"], wa_text)}
{related_html}
</main>
{FOOTER}{scripts(p["slug"])}""")


def index_page(posts, css_v):
    featured = next((p for p in posts if p.get("featured")), posts[0])
    rest = posts
    cats = []
    for p in posts:
        if p["category"] not in cats:
            cats.append(p["category"])
    jsonld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Blog", "@id": BLOG_URL + "#blog", "url": BLOG_URL,
         "name": "Esubu Tech Academy blog", "inLanguage": "en-KE",
         "description": "Guides for Kenyan parents on kids coding, chess, screen time and school.",
         "publisher": {"@type": "Organization", "name": "Esubu Tech Academy", "url": SITE + "/academy/"},
         "blogPost": [{"@type": "BlogPosting", "headline": p["title"], "url": p["url"],
                       "datePublished": p["date"].isoformat()} for p in posts]},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Academy", "item": SITE + "/academy/"},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": BLOG_URL}]},
    ]}
    wa_text = "Hello Sammy, I've been reading your blog. I'd like to ask about classes. My child's age: "
    buttons = '<li><button type="button" aria-pressed="true" data-filter="all">All</button></li>' + "".join(
        f'<li><button type="button" aria-pressed="false" data-filter="{esc(c)}">{esc(c)}</button></li>' for c in cats)
    feat_num = featured.get("feature_number", "")
    feat_small = featured.get("feature_caption", "")
    num_html = (f'<div class="featured__num"><span class="featured__circle">{esc(feat_num)}'
                f'<svg viewBox="0 0 300 160" aria-hidden="true" preserveAspectRatio="none"><path d="M40 92C30 40 120 14 190 22c70 8 104 46 92 82-14 40-110 52-176 40C52 134 18 112 30 76c10-28 52-46 90-52" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>'
                f'</span><small>{esc(feat_small)}</small></div>'
                if feat_num else "")
    return (head("Kids Coding and Chess Blog for Kenyan Parents | Esubu Academy",
                 "Straight answers for Kenyan parents on kids coding, chess, screen time and school, with every source linked so you check the evidence yourself.",
                 BLOG_URL, cover_url(None), "website", jsonld, css_v)
            + header("blog-index", wa_text) + f"""<main>
<section class="blog-hero ruled">
  <div class="wrap">
    <nav aria-label="Breadcrumb"><ol class="crumbs"><li><a href="/academy/">Academy</a></li><li>Blog</li></ol></nav>
    <h1>Coding, chess and screens: straight answers for Kenyan parents</h1>
    <p class="dek">Written by Sammy Subu, founder of Esubu Tech Academy. Every post links its sources, so you check the evidence and make up your own mind.</p>
  </div>
</section>
<div class="blog-body">
  <div class="wrap">
    <article class="featured" style="margin-top:clamp(2rem,5vw,3rem)">
      <div>
        <span class="hand">This month</span>
        <h2><a href="{featured["path"]}">{esc(featured["title"])}</a></h2>
        <p>{esc(featured["dek"])}</p>
        <p><a class="btn btn--sm" href="{featured["path"]}">Read the plan</a></p>
      </div>
      {num_html}
    </article>
    <div class="list-head"><h2 id="all-posts">All posts</h2></div>
    <ul class="filters" hidden aria-label="Filter posts by topic">{buttons}</ul>
    <ul class="contents" id="post-list">
      {"".join(entry(p) for p in rest)}
    </ul>
  </div>
</div>
{invite("blog-index", "Tell me about your child", "Live coding and chess classes on Zoom, groups of up to 15, one teacher. Apply in two minutes and I reply on WhatsApp with the right group for your child.", wa_text)}
</main>
{FOOTER}{scripts("blog-index")}""")


def feed(posts):
    items = []
    for p in sorted(posts, key=lambda p: p["date"], reverse=True):
        pub = dt.datetime.combine(p["date"], dt.time(6, 0), dt.timezone.utc).strftime("%a, %d %b %Y %H:%M:%S +0000")
        items.append(f"""  <item>
    <title>{esc(p["title"])}</title>
    <link>{p["url"]}</link>
    <guid isPermaLink="true">{p["url"]}</guid>
    <pubDate>{pub}</pubDate>
    <category>{esc(p["category"])}</category>
    <description>{esc(p["description"])}</description>
  </item>""")
    now = dt.datetime.now(dt.timezone.utc).strftime("%a, %d %b %Y %H:%M:%S +0000")
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Esubu Tech Academy blog</title>
  <link>{BLOG_URL}</link>
  <atom:link href="{BLOG_URL}feed.xml" rel="self" type="application/rss+xml"/>
  <description>Straight answers for Kenyan parents on kids coding, chess, screen time and school.</description>
  <language>en-ke</language>
  <lastBuildDate>{now}</lastBuildDate>
{chr(10).join(items)}
</channel>
</rss>
"""


def update_sitemap(posts):
    path = ROOT / "sitemap.xml"
    xml = path.read_text(encoding="utf-8")
    xml = re.sub(r"\s*<url>\s*<loc>https://esubutech\.online/academy/blog/[^<]*</loc>.*?</url>", "", xml, flags=re.S)
    newest = max(p["updated"] for p in posts).isoformat()
    blocks = [f"""  <url>
    <loc>{BLOG_URL}</loc>
    <lastmod>{newest}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>"""]
    for p in posts:
        blocks.append(f"""  <url>
    <loc>{p["url"]}</loc>
    <lastmod>{p["updated"].isoformat()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>""")
    xml = xml.replace("</urlset>", "\n".join(blocks) + "\n</urlset>")
    path.write_text(xml, encoding="utf-8")


# ---------------------------------------------------------------- covers

COVER_HTML = """<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:B;src:url(data:font/woff2;base64,{font_b}) format("woff2");font-weight:200 800}}
@font-face{{font-family:C;src:url(data:font/woff2;base64,{font_c}) format("woff2");font-weight:600}}
html,body{{margin:0;width:1200px;height:630px;overflow:hidden}}
body{{position:relative;background:#FBFCFA;font-family:B;
  background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 41px,#DCE6EE 41px,#DCE6EE 42px)}}
.m{{position:absolute;left:196px;top:0;bottom:0;width:3px;background:rgba(200,16,46,.45)}}
.cat{{position:absolute;right:1030px;top:112px;max-width:160px;text-align:right;font-family:C;font-weight:600;color:#C8102E;font-size:{catsize}px;transform:rotate(-5deg);transform-origin:right;white-space:nowrap}}
.t{{position:absolute;left:240px;right:{right}px;top:96px;bottom:120px;display:flex;align-items:center}}
.t h1{{margin:0;font-weight:770;font-size:{size}px;line-height:1.02;letter-spacing:-.03em;color:#173A2A;text-wrap:balance}}
.bar{{position:absolute;left:0;right:0;bottom:0;height:88px;background:#173A2A;display:flex;align-items:center;justify-content:space-between;padding:0 56px 0 240px;color:#B4C8BA;font-size:26px}}
.bar b{{color:#fff;font-weight:800;letter-spacing:-.02em;font-size:32px}} .bar b span{{color:#FF6B6B}}
.motif{{position:absolute;right:56px;top:72px}}
.sq{{display:grid;grid-template-columns:repeat(3,52px);grid-template-rows:repeat(3,52px);border:3px solid #173A2A;border-radius:6px;overflow:hidden;transform:rotate(6deg)}}
.sq i{{background:#E8EFE4;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:40px;color:#14201A}}
.sq i.d{{background:#7A9E7C}}
.bl span{{display:block;width:max-content;padding:12px 18px;margin-bottom:4px;border-radius:8px;font-weight:650;font-size:22px;color:#fff}}
.tick svg{{width:150px;height:150px;color:#C8102E}}
</style></head><body><div class="m"></div><div class="cat">{cat}</div>
<div class="t"><h1>{title}</h1></div><div class="motif">{motif}</div>
<div class="bar"><b>&#9889;&nbsp;Esubu<span>Tech</span> Academy</b><span>esubutech.online/academy/blog</span></div></body></html>"""

MOTIFS = {
    "Chess": '<div class="sq"><i></i><i class="d"></i><i></i><i class="d"></i><i>♞︎</i><i class="d"></i><i></i><i class="d"></i><i></i></div>',
    "Coding": ('<div class="bl"><span style="background:#FFBF00;color:#2E2200;border-radius:18px 18px 8px 8px">when clicked</span>'
               '<span style="background:#FFAB19;color:#2E1C00">repeat 10</span>'
               '<span style="background:#4C97FF;margin-left:22px">move 10 steps</span></div>'),
}
TICK = '<div class="tick"><svg viewBox="0 0 24 24"><path d="M3.2 13.6c2.1 1.2 3.9 3.1 5.2 5.4C11 12.6 15.5 7.3 21.2 3.6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'


def draw_covers(posts):
    from playwright.sync_api import sync_playwright
    COVERS.mkdir(exist_ok=True)
    import base64
    fdir = ROOT / "academy" / "fonts"
    font_b = base64.b64encode((fdir / "bricolage-grotesque-var.woff2").read_bytes()).decode()
    font_c = base64.b64encode((fdir / "caveat-600-latin.woff2").read_bytes()).decode()
    jobs = [(p["slug"], p.get("cover_line") or p["title"], p["category"]) for p in posts]
    jobs.append(("blog", "Straight answers for Kenyan parents", "Blog"))
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1200, "height": 630})
        for slug, title, cat in jobs:
            motif = MOTIFS.get(cat, TICK)
            right = 300 if cat in MOTIFS else 260
            size = 92 if len(title) <= 26 else 80 if len(title) <= 40 else 68
            catsize = 50 if len(cat) <= 7 else 42
            page.set_content(COVER_HTML.format(font_b=font_b, font_c=font_c, title=esc(title), cat=esc(cat),
                                               motif=motif, right=right, size=size, catsize=catsize))
            page.evaluate("document.fonts.ready.then(() => true)")
            page.wait_for_timeout(150)
            page.screenshot(path=str(COVERS / f"{slug}.jpg"), type="jpeg", quality=86)
            print(f"  cover {slug}.jpg")
        browser.close()


# ---------------------------------------------------------------- main

def file_hash(path):
    return hashlib.sha1(path.read_bytes()).hexdigest()[:8]


JS_V = ""


def main():
    global JS_V
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--covers", action="store_true", help="redraw share images with Playwright")
    ap.add_argument("--figures", action="store_true", help="redraw post figures with Playwright")
    args = ap.parse_args()

    posts = load_posts()
    by_slug = {p["slug"]: p for p in posts}
    css_v = file_hash(BLOG / "blog.css")
    JS_V = file_hash(BLOG / "blog.js")
    # minutes are needed for related lists, so measure every post first
    for p in posts:
        _, _, words = render_body(p["body"], p["slug"], p["soft"], p["figures"])
        p["minutes"] = max(3, math.ceil(words / 220))
    for p in posts:
        out = BLOG / p["slug"] / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(post_page(p, by_slug, css_v), encoding="utf-8")
        print(f"  wrote {out.relative_to(ROOT)}")
    (BLOG / "index.html").write_text(index_page(posts, css_v), encoding="utf-8")
    (BLOG / "feed.xml").write_text(feed(posts), encoding="utf-8")
    update_sitemap(posts)
    print(f"  wrote blog index, feed.xml, sitemap.xml ({len(posts)} posts)")
    if args.covers:
        draw_covers(posts)
    if args.figures:
        jobs = [(f"{p['slug']}-{fid}", spec) for p in posts for fid, spec in p["figures"].items()]
        figs.draw(jobs, FONTS, FIGURES)
    missing_figs = [f"{p['slug']}-{fid}" for p in posts for fid in p["figures"]
                    if not (FIGURES / f"{p['slug']}-{fid}.webp").exists()]
    if missing_figs:
        print("  note: figures not drawn yet: " + ", ".join(missing_figs) + ". Run with --figures.")
    missing = [p["slug"] for p in posts if not (COVERS / f"{p['slug']}.jpg").exists()]
    if missing:
        print("  note: no share image yet for " + ", ".join(missing) + ". Run with --covers.")


if __name__ == "__main__":
    try:
        main()
    except ValueError as e:
        sys.exit(f"build stopped: {e}")

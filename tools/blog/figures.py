"""Draw the blog's data figures as WebP images.

Each post lists its figures in the front matter under `figures:`, keyed by an
id, and places one in the body with:

  :::figure id="maths-subjects"
  :::

Figure types and their fields (all take tag, title, source, caption):

  bars     data: [[label, value], ...], unit, highlight (label to mark in red),
           max (optional scale top)
  stats    items: [[big number, label], ...]   two to four numbers side by side
  list     items: [text, ...], numbered (true/false)
  compare  columns: [{name, good: [...], bad: [...]}, ...]
  steps    items: [[short label, text], ...]   a sequence, such as weeks

Images are 1200 x 675, the same exercise-book look as the share covers, so
they also work as Facebook and WhatsApp images.
"""
import base64
import html
from pathlib import Path

W, H = 1200, 675


def _esc(s):
    return html.escape(str(s), quote=True)


def _fmt(v, unit):
    if isinstance(v, float) and not v.is_integer():
        s = f"{v:,.2f}".rstrip("0").rstrip(".")
    else:
        s = f"{int(v):,}"
    return s + (unit or "")


CSS = """
@font-face{font-family:B;src:url(data:font/woff2;base64,%(b)s) format("woff2");font-weight:200 800}
@font-face{font-family:C;src:url(data:font/woff2;base64,%(c)s) format("woff2");font-weight:600}
*{box-sizing:border-box}
html,body{margin:0;width:1200px;height:675px;overflow:hidden}
body{position:relative;background:#FBFCFA;font-family:B;color:#173A2A;
  background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 41px,#DCE6EE 41px,#DCE6EE 42px)}
.m{position:absolute;left:150px;top:0;bottom:0;width:3px;background:rgba(200,16,46,.45)}
.tag{position:absolute;right:1066px;top:40px;max-width:140px;text-align:right;font-family:C;color:#C8102E;font-size:40px;line-height:1;transform:rotate(-5deg);transform-origin:right}
.wrap{position:absolute;left:190px;right:60px;top:40px;bottom:76px;display:flex;flex-direction:column}
h1{margin:0 0 24px;font-size:50px;line-height:1.04;font-weight:770;letter-spacing:-.025em;max-width:950px;text-wrap:balance}
.src{position:absolute;left:190px;right:330px;bottom:22px;font-size:22px;line-height:1.2;color:#56665C}
.src b{color:#173A2A;font-weight:700}
.brand{position:absolute;right:60px;bottom:20px;font-weight:800;font-size:26px;letter-spacing:-.02em}
.brand span{color:#D32F2F}
/* bars */
.bars{display:grid;gap:16px;flex:1;align-content:center}
.bar{display:grid;grid-template-columns:330px 1fr 150px;align-items:center;gap:20px;font-size:30px}
.bar .l{text-align:right;font-weight:600;line-height:1.1}
.bar .t{height:48px;position:relative}
.bar .f{position:absolute;left:0;top:0;bottom:0;border-radius:6px;background:linear-gradient(100deg,rgba(255,224,102,.55),rgba(255,224,102,.95))}
.bar .v{font-weight:780;font-size:38px}
.bar.hi .f{background:linear-gradient(100deg,#E0566B,#C8102E)}
.bar.hi .v,.bar.hi .l{color:#C8102E}
/* stats */
.stats{display:grid;gap:40px;flex:1;align-items:center}
.st b{display:block;font-size:96px;line-height:.95;font-weight:790;letter-spacing:-.04em}
.st span{display:block;margin-top:14px;font-size:30px;line-height:1.22;color:#2B3A31;max-width:360px}
.st:first-child b{color:#C8102E}
/* list and steps */
.list{margin:0;padding:0;list-style:none;display:grid;gap:16px;flex:1;align-content:center}
.list li{display:grid;grid-template-columns:56px 1fr;gap:14px;align-items:baseline;font-size:35px;line-height:1.18;font-weight:600}
.list .n{font-family:C;color:#C8102E;font-size:48px;line-height:1;text-align:right}
.list svg{width:40px;height:40px;color:#C8102E;transform:translateY(7px)}
.steps{display:grid;gap:18px;margin:auto 0;align-items:stretch}
.sp{border:3px solid #173A2A;border-radius:12px;background:#fff;padding:18px 18px 22px;display:flex;flex-direction:column}
.sp b{font-family:C;color:#C8102E;font-size:46px;line-height:.95}
.sp span{margin-top:12px;font-size:30px;line-height:1.16;font-weight:600}
/* compare */
.cmp{display:grid;gap:22px;flex:1;align-items:start}
.col{border:3px solid #173A2A;border-radius:12px;background:#fff;padding:18px 20px 22px}
.col h2{margin:0 0 12px;font-size:36px;line-height:1.05;font-weight:770}
.col ul{margin:0;padding:0;list-style:none;display:grid;gap:10px}
.col li{display:grid;grid-template-columns:34px 1fr;gap:8px;font-size:29px;line-height:1.16;font-weight:560}
.col li i{font-style:normal;font-weight:800}
.col li.g i{color:#1B5E20}
.col li.x i{color:#C8102E}
"""

TICK = ('<svg viewBox="0 0 24 24"><path d="M3.2 13.6c2.1 1.2 3.9 3.1 5.2 5.4C11 12.6 15.5 7.3 21.2 3.6" '
        'fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>')


def _bars(spec):
    data = spec["data"]
    unit = spec.get("unit", "")
    top = spec.get("max") or max(v for _, v in data)
    rows = []
    for label, v in data:
        hi = " hi" if label == spec.get("highlight") else ""
        rows.append(f'<div class="bar{hi}"><span class="l">{_esc(label)}</span>'
                    f'<span class="t"><span class="f" style="width:{max(2, 100 * v / top):.1f}%"></span></span>'
                    f'<span class="v">{_esc(_fmt(v, unit))}</span></div>')
    return f'<div class="bars">{"".join(rows)}</div>'


def _stats(spec):
    items = spec["items"]
    cols = f"grid-template-columns:repeat({len(items)},1fr)"
    return (f'<div class="stats" style="{cols}">'
            + "".join(f'<div class="st"><b>{_esc(n)}</b><span>{_esc(t)}</span></div>' for n, t in items)
            + "</div>")


def _list(spec):
    out = []
    for i, t in enumerate(spec["items"], 1):
        mark = f'<span class="n">{i}</span>' if spec.get("numbered") else f'<span class="n">{TICK}</span>'
        out.append(f"<li>{mark}<span>{_esc(t)}</span></li>")
    return f'<ul class="list">{"".join(out)}</ul>'


def _steps(spec):
    items = spec["items"]
    cols = f"grid-template-columns:repeat({len(items)},1fr)"
    return (f'<div class="steps" style="{cols}">'
            + "".join(f'<div class="sp"><b>{_esc(a)}</b><span>{_esc(b)}</span></div>' for a, b in items)
            + "</div>")


def _compare(spec):
    cols = spec["columns"]
    out = []
    for c in cols:
        lis = "".join(f'<li class="g"><i>&#10003;</i><span>{_esc(t)}</span></li>' for t in c.get("good", []))
        lis += "".join(f'<li class="x"><i>&#10007;</i><span>{_esc(t)}</span></li>' for t in c.get("bad", []))
        out.append(f'<div class="col"><h2>{_esc(c["name"])}</h2><ul>{lis}</ul></div>')
    return f'<div class="cmp" style="grid-template-columns:repeat({len(cols)},1fr)">{"".join(out)}</div>'


KINDS = {"bars": _bars, "stats": _stats, "list": _list, "steps": _steps, "compare": _compare}


def alt_text(spec):
    """Plain-language description for screen readers and search."""
    t = spec.get("title", "")
    kind = spec["type"]
    if kind == "bars":
        unit = spec.get("unit", "")
        parts = [f"{label} {_fmt(v, unit)}" for label, v in spec["data"]]
        return f"Bar chart: {t}. " + ", ".join(parts) + "."
    if kind == "stats":
        return f"{t}. " + ". ".join(f"{n}: {lab}" for n, lab in spec["items"]) + "."
    if kind in ("list",):
        return f"{t}. " + ". ".join(spec["items"]) + "."
    if kind == "steps":
        return f"{t}. " + ". ".join(f"{a}: {b}" for a, b in spec["items"]) + "."
    if kind == "compare":
        bits = []
        for c in spec["columns"]:
            bits.append(c["name"] + ": " + ", ".join(c.get("good", []) + ["not " + x for x in c.get("bad", [])]))
        return f"{t}. " + ". ".join(bits) + "."
    return t


def page_html(spec, font_b, font_c):
    body = KINDS[spec["type"]](spec)
    src = f'<div class="src"><b>Source:</b> {_esc(spec["source"])}</div>' if spec.get("source") else ""
    return (f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS % {"b": font_b, "c": font_c}}</style></head>'
            f'<body><div class="m"></div><div class="tag">{_esc(spec.get("tag", ""))}</div>'
            f'<div class="wrap"><h1>{_esc(spec["title"])}</h1>{body}</div>{src}'
            f'<div class="brand">&#9889;&nbsp;Esubu<span>Tech</span> Academy</div></body></html>')


def draw(jobs, fonts_dir, out_dir):
    """jobs: list of (file stem, spec). Writes <out_dir>/<stem>.webp."""
    from playwright.sync_api import sync_playwright
    from PIL import Image

    out_dir.mkdir(parents=True, exist_ok=True)
    font_b = base64.b64encode((fonts_dir / "bricolage-grotesque-var.woff2").read_bytes()).decode()
    font_c = base64.b64encode((fonts_dir / "caveat-600-latin.woff2").read_bytes()).decode()
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": W, "height": H})
        for stem, spec in jobs:
            if spec["type"] not in KINDS:
                raise ValueError(f"figure {stem}: unknown type {spec['type']}")
            page.set_content(page_html(spec, font_b, font_c))
            page.evaluate("document.fonts.ready.then(() => true)")
            page.wait_for_timeout(120)
            overflow = page.evaluate("document.querySelector('.wrap').scrollHeight > document.querySelector('.wrap').clientHeight + 2")
            if overflow:
                print(f"  warning: figure {stem} content overflows, shorten it")
            png = out_dir / f"{stem}.png"
            page.screenshot(path=str(png))
            Image.open(png).save(out_dir / f"{stem}.webp", "WEBP", quality=82, method=6)
            png.unlink()
            print(f"  figure {stem}.webp")
        browser.close()

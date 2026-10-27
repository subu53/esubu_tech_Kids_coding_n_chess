# Academy blog

The blog at esubutech.online/academy/blog/ is plain HTML, built from Markdown by one Python script. GitHub Pages serves whatever is committed, so you build on your computer and commit the result.

## Add a post

1. Copy any file in `academy/blog/_posts/` and rename it to the new slug, for example `holiday-chess-puzzles.md`. The slug becomes the web address.
2. Change the front matter at the top: title, seo_title (under 62 characters), description (under 160), slug, date, category, keyword, dek, cover_line, related, invite_title, invite_text and sources. Set `weight` to place it in the list (lower comes first). Remove `featured` unless the post replaces the featured one.
3. Write the body in Markdown. Extra blocks: `:::pull`, `:::note`, `:::board fen="..." caption="..."` and ```` ```scratch ```` fences. The top of `build.py` shows each one.
4. Check the house style: `python3 tools/blog/stylecheck.py academy/blog/_posts/*.md`
5. Build: `python3 tools/blog/build.py --covers`
6. Open the page locally: `python3 -m http.server 8000`, then visit http://localhost:8000/academy/blog/
7. Commit and push. The site updates in a minute or two.

First time on a new computer: `pip install markdown pyyaml playwright`, then `playwright install chromium`. Without Playwright, leave off `--covers` and the share image step is skipped.

## What the build writes

- `academy/blog/index.html` and one folder per post
- `academy/blog/feed.xml`
- blog entries in `/sitemap.xml` (other entries stay as they are)
- `academy/blog/covers/<slug>.jpg`, the image WhatsApp and Facebook show in link previews

## Tracking

Every button on a blog page sends a GA4 event called `blog_cta_click` with the post slug and the button name. Links to the signup page carry `?from=<slug>`, and the booking email includes it as `from_post`, so you see which post brought each parent.

#!/usr/bin/env python3
"""Flag house-style problems in blog posts before they go live.

Checks the post body and the reader-facing front matter fields for the words,
punctuation and phrases on the Esubu writing style sheet. Source titles are
skipped, because they are other people's words.

Usage: python3 tools/blog/stylecheck.py academy/blog/_posts/*.md
"""
import re
import sys

BANNED = [
    "can", "can't", "cannot", "may", "just", "that", "very", "really", "literally",
    "actually", "certainly", "probably", "basically", "could", "maybe", "delve",
    "embark", "enlightening", "esteemed", "shed light", "craft", "crafting",
    "imagine", "realm", "game-changer", "unlock", "discover", "skyrocket",
    "skyrocketing", "abyss", "not alone", "in a world where", "revolutionize",
    "disruptive", "utilize", "utilizing", "dive deep", "tapestry", "illuminate",
    "unveil", "pivotal", "intricate", "elucidate", "hence", "furthermore",
    "however", "harness", "exciting", "groundbreaking", "cutting-edge",
    "remarkable", "it remains to be seen", "glimpse into", "navigating",
    "landscape", "stark", "testament", "in summary", "moreover", "boost",
    "opened up", "powerful", "inquiries", "ever-evolving", "conclusion",
    "here's the thing", "let that sink in", "the key takeaway", "in conclusion",
]
READER_FIELDS = ("title", "seo_title", "description", "dek", "cover_line",
                 "invite_title", "invite_text")


def reader_text(raw):
    """Return (front matter reader fields, body) with source blocks removed."""
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", raw, re.S)
    if not m:
        return "", raw
    fm, body = m.group(1), m.group(2)
    keep = []
    for line in fm.splitlines():
        key = line.split(":", 1)[0].strip()
        if key in READER_FIELDS:
            keep.append(line)
    # code blocks are code, not prose
    body = re.sub(r"```.*?```", "", body, flags=re.S)
    return "\n".join(keep), body


def check(path):
    raw = open(path, encoding="utf-8").read()
    fm, body = reader_text(raw)
    text = fm + "\n" + body
    problems = []
    for n, line in enumerate(text.splitlines(), 1):
        low = line.lower()
        if "—" in line:
            problems.append((n, "em dash", line))
        if ";" in re.sub(r"&\w+;|&#\d+;", "", line):
            problems.append((n, "semicolon", line))
        for w in BANNED:
            pat = r"(?<![\w-])" + re.escape(w) + r"(?![\w-])"
            if re.search(pat, low):
                problems.append((n, "banned: " + w, line))
        if re.search(r"\bnot just\b.*\bbut\b", low):
            problems.append((n, "not just X but Y", line))
        if re.search(r"\bit'?s not\b.*,\s*it'?s\b", low):
            problems.append((n, "it's not X, it's Y", line))
    words = len(re.findall(r"\b\w+\b", body))
    return problems, words


def main(paths):
    total = 0
    for p in paths:
        problems, words = check(p)
        total += len(problems)
        print(f"{p}: {words} words, {len(problems)} issues")
        for n, kind, line in problems:
            print(f"  {n:>4} [{kind}] {line.strip()[:110]}")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

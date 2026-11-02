---
title: "What your child builds in the first four weeks of coding and chess classes"
seo_title: "What Do Kids Learn in Coding Classes? The First 4 Weeks"
description: "We don't run trial classes, so here is the work instead: what your child learns in coding and chess, week by week, and what you see at home by week four."
slug: first-four-weeks-of-coding
weight: 3
date: 2026-10-29
category: Coding
keyword: what do kids learn in coding classes
dek: "We don't run trial classes. So here is the next best thing: the work your child does, week by week, and what lands on your table at home."
cover_line: "Week 1 to week 4: the work"
related: [free-coding-for-kids-kenya, how-to-choose-a-coding-class-kenya]
invite_title: "See the work, then decide"
invite_text: "Tell me your child's age and what they've tried before. I reply on WhatsApp with the right group for your child, the fees and when your child starts."
soft: "Groups are set by ability after a short conversation about your child."
figures:
  four-weeks:
    type: steps
    tag: "The plan"
    title: "The first four weeks, coding and chess side by side"
    items:
      - ["Week 1", "Grids and coordinates. A character moves. Every chess piece, and notation"]
      - ["Week 2", "A score which counts up. Forks on the chessboard"]
      - ["Week 3", "Rules, game over and fixing bugs. Pins, skewers, a full recorded game"]
      - ["Week 4", "A second level, shown to the family. A mini tournament, then a review"]
    source: "Esubu Tech Academy curriculum"
  at-home:
    type: list
    tag: "At home"
    title: "What you see by the end of week four"
    items:
      - "A game your child designed, to play with you"
      - "A chess game written in notation, replayed for you move by move"
      - "Written notes from the teacher on what your child is working on"
      - "A child who explains why the score went up, in their own words"
    source: "Esubu Tech Academy"
sources:
  - title: "Scratch, information for parents (MIT)"
    url: "https://scratch.mit.edu/help/parents/"
    note: "The free block-coding tool our younger groups use, designed for ages 8 to 16."
  - title: "80% of parents aware of online schooling, but uptake remains low (Citizen Digital, February 2026)"
    url: "https://www.citizen.digital/news/80-of-parents-aware-of-online-schooling-but-uptake-remains-low-study-n377059"
    note: "Koa Academy study: parents rank the teacher about as high as the content."
  - title: "About Lichess"
    url: "https://lichess.org/about"
    note: "Free chess puzzles for practice between classes."
---

When you choose a school for your child, you walk the corridors. You look into a classroom, see the books, ask about the syllabus and meet a teacher. Then you pay the fees.

An online class gives you none of this. There's a Zoom link, a till number and a stranger asking for KES 12,000. A study by Koa Academy found about 80% of Kenyan parents know online schooling exists, and only 9% have enrolled a child. Parents in the study ranked the teacher about as high as the content.

We don't run free trial classes. So this post is the corridor walk: the work your child does in the first four weeks, and what you see at home.

## "If my child enjoys it, it's working"

Most parents judge a children's class by one question at the end of the day. "Did you enjoy it?"

Enjoyment is easy to buy. Any video game delivers it, for free, for hours. A class which aims at fun alone gives you a happy child and nothing to show at the end of the month.

Ask a different question after class. "Show me." A child who learned something shows you a thing which works, and explains why. A child who only had fun shows you a screen and shrugs.

:::pull
Would you judge a school by whether your child liked break time?
:::

## The four weeks, side by side

Here is the plan every new group follows. Holiday groups meet every weekday morning and move faster. Term groups meet three evenings a week. Groups are set by ability, so a child who already codes starts further along.

:::figure id="four-weeks"
:::

### Week 1: preparing the soil

Before any game, we work on the maths underneath it. Counting steps. Turning left and right. A grid with an x and a y. I call it preparing the soil, because the coding grows out of it.

By the end of the week your child's character moves around the screen with the arrow keys. On the chessboard, they learn how every piece moves and how to write a move down: knight to f3, pawn to e4. The chessboard is a grid too, which helps both subjects.

### Week 2: a score which counts

Now the game needs a reason to play. Your child adds an apple to catch and a score which goes up by one each time. This is a child's first variable, a box with a name which holds a number.

```scratch
when green flag clicked
set [score] to (0)
forever
  if touching [Apple] then
    change [score] by (1)
    go to (random position)
  end
end
```

On the chessboard, week two brings the first real tactic: the fork. One piece attacks two at once.

:::board fen="r3k3/2N5/8/8/8/8/5PPP/6K1 b - - 0 1" caption="The white knight on c7 checks the king and attacks the rook at the same time. Black has to save the king, and the rook falls."
:::

### Week 3: rules, bugs and a full game

Week three is where I quit free online courses, years ago, more than once. The game gets rules: lose three lives and it ends, touch the edge and bounce back. Things break. Your child learns the habit at the centre of all programming: guess why it broke, test the guess, fix it.

In chess, pins and skewers join the fork, and your child plays a full game and records every move.

### Week 4: a finished game, shown at home

Your child adds a second level, tidies the game and shows it to the family. In chess, the group plays a mini tournament, and we replay one game from each child to find the move where it turned.

:::figure id="at-home"
:::

## What to check at home

You don't need to understand code to check the work. Sit with your child on Friday and ask three things.

- "Show me the game." Then play it yourself.
- "Why does the score go up?" Listen for the word "if".
- "Replay your best chess game for me." Watch them read the moves off the paper.

A child who answers all three has learned something. A child who struggles with all three tells you something too, and I want to hear it.

:::note
Try week one yourself this weekend: make the Scratch cat move with the arrow keys. Notice how long the first bug takes you.
:::

## Ask every academy for its plan

Ask any coding school you're considering, us included, for its week-by-week plan. Ask what your child will show you at the end of week four. A school with no plan to show you is selling hours.

Then try the free route for a fortnight with the Scratch website and Lichess puzzles. Watch where your child gets stuck, and whether anyone notices. Our post on [free coding for kids in Kenya](/academy/blog/free-coding-for-kids-kenya/) shows how to give the free route a fair test.

If you'd rather see the work before committing to a month, ask me on WhatsApp about paying week by week.

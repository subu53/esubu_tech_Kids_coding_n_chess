---
title: "Scratch or Python first? How to choose for your child"
seo_title: "Scratch or Python First? How to Choose for Your Child"
description: "Scratch or Python first for your child? What a 15-week classroom study found, a simple rule based on typing and reading, and signs it's time to switch."
slug: scratch-or-python-first
weight: 9
date: 2026-10-27
category: Coding
keyword: Scratch vs Python for kids
dek: "Some parents worry Scratch is a toy. Others worry Python is too hard. A classroom study gives a clearer answer than either worry."
cover_line: "Blocks or typing first?"
related: [what-age-should-a-child-start-coding, should-kids-learn-coding-ai]
invite_title: "Scratch first, Python when your child is ready"
invite_text: "Younger children start with blocks in the browser. Older children who type comfortably move on to Python. The free placement session tells us which group fits."
sources:
  - title: "Weintrop and Wilensky, transitioning from blocks to text (Computers and Education, 2019)"
    url: "https://www.terpconnect.umd.edu/~weintrop/papers/Weintrop&Wilensky_2019_C&E.pdf"
    note: "60 high school students, 5 weeks of blocks or text, then 10 weeks of Java."
  - title: "At what age can a child start coding? (Raspberry Pi Foundation, 2022)"
    url: "https://www.raspberrypi.org/blog/what-age-can-a-child-start-coding/"
    note: "Typing skills are often ready for text languages around nine or ten."
  - title: "Scratch, information for parents (MIT)"
    url: "https://scratch.mit.edu/help/parents/"
    note: "Free, in the browser, designed for ages 8 to 16."
---

The same small program, written two ways. A cat says hello, then walks across the screen.

In Scratch, your child snaps these blocks together:

```scratch
when green flag clicked
say [Hello!] for (2) seconds
repeat (10)
  move (10) steps
end
```

In Python, your child types this:

```python
import turtle

cat = turtle.Turtle()
cat.write("Hello!")
for step in range(10):
    cat.forward(10)
```

Both do the same job. Now picture a seven-year-old with the Python version. Leave out the colon after `range(10)` and Python refuses to run the program. Forget a bracket, misspell `forward`, indent a line by the wrong amount, and the same thing happens. The blocks in Scratch only snap together where they fit, so most of those mistakes never happen.

## The worry on each side

Parents tend to land on one of two worries.

The first: Scratch is a toy. Real programmers type. Why spend months dragging coloured blocks when the jobs need Python?

The second: Python is for teenagers. My child is eight. Typing code will crush them.

Both worries contain something true. Neither holds up as a rule.

## What happened in one classroom

The best study I know on this question comes from David Weintrop and Uri Wilensky. They followed 60 high school students in two classes with the same teacher. For the first five weeks, one class learned with blocks and the other learned the same ideas by typing. Then both classes spent ten weeks learning Java, a typed language.

After five weeks, the blocks group knew more: 66.6 percent on the concepts test against 58.8 percent for the typing group. The blocks group also showed more interest in taking computing further.

After the ten weeks of Java, the two groups were level, 64.9 percent and 64.7 percent. Interest flipped too: the blocks group cooled once they hit typed code, and the typing group warmed up. Both groups made the same common errors in Java, at the same rate.

Blocks gave a faster start in understanding. The head start didn't carry over to typed code on its own. Starting with blocks did no harm either. Nobody fell behind for starting with Scratch.

:::pull
Blocks help a child understand faster. They don't teach typing. Your child needs both, in the right order.
:::

The study used teenagers at a selective school, mostly boys, so it says little about seven-year-olds directly. It does undercut both worries. Scratch is no dead end, and typing first is no disaster for a teenager.

## The real risk is quitting

The language matters less than whether your child keeps going. Picture two children.

A seven-year-old fights Python for a month. Every session ends in red error messages about colons. She decides she is bad at computers. She is wrong, but she believes it, and she stops.

A thirteen-year-old spends a year in Scratch after he has outgrown it. He wants to save scores to a file and build bigger games. The blocks feel babyish to him. He decides coding is for little kids, and he stops.

Same result, opposite causes. The right first language is the one your child won't quit.

## A better rule than age

Look at two things before age: how well your child types, and how well they read.

- Under nine, or slow at typing: start with Scratch.
- Ten and up, typing comfortably, has finished a Scratch project or two: move to Python.
- Ten and up, never coded, slow at typing: a short run of Scratch first, a term at most, then Python.
- A teenager who types fast and reads well: Python from the start is fine.

The ideas carry over. Sequences, loops, conditions and variables mean the same thing in both. A child who built a Scratch game with a score already knows what a variable is. In Python they learn to write it out by hand.

:::note
Signs your child has outgrown Scratch: they want more than one save file, they copy the same blocks again and again, they ask how "real" games work.
:::

## Try both at home this week

Scratch is free at scratch.mit.edu and runs in the browser. Give your child twenty minutes to make the cat move and talk.

For Python, many free browser editors exist, and a search for "Python online editor" finds one in seconds. Ask your child to type `print("Hello")` and press run, then to make it print their own name five times.

Watch their face in each one. Delight, boredom and frustration each tell you something. Then read the study for yourself and decide what fits your child, not what fits a poster.

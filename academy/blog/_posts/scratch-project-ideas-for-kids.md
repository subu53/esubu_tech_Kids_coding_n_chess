---
title: "Scratch project ideas for kids, by age: from a talking matatu to a platform game"
seo_title: "Scratch Project Ideas for Kids by Age: 10 Kenyan Projects"
description: "Ten Scratch project ideas sorted by age, from ScratchJr at five to clones and lists at thirteen. Kenyan themes, the skill each one teaches, and how to finish them."
slug: scratch-project-ideas-for-kids
weight: 4
date: 2026-11-16
category: Coding
keyword: scratch project ideas for kids
dek: "Your child opens Scratch, drags the cat around the screen, and stalls. A project pitched at the right age, with one new skill inside it, keeps them building."
cover_line: "What to build next in Scratch"
related: [first-four-weeks-of-coding, what-comes-after-scratch]
invite_title: "One finished game at a time"
invite_text: "In our classes every child finishes a game they designed, one new idea at a time, live on Zoom with one teacher. Tell me your child's age and what they've built so far, and I'll say which level fits."
figures:
  age-ladder:
    type: steps
    tag: "By age"
    title: "What to build at each age, in years"
    items:
      - ["5 to 7", "ScratchJr stories on a tablet"]
      - ["8 to 9", "Animations with loops and speech"]
      - ["10 to 11", "Games with a score"]
      - ["12 to 13", "Clones, lists and levels"]
      - ["14 up", "Python next"]
    source: "Scratch Foundation age ranges, Esubu Tech Academy"
sources:
  - title: "Scratch tools and age ranges (Scratch Foundation)"
    url: "https://scratchfoundation.org/tools"
    note: "ScratchJr for ages 5 to 7. Scratch for ages 8 and up."
  - title: "Scratch, information for parents (MIT)"
    url: "https://scratch.mit.edu/help/parents/"
    note: "Free, in the browser, designed for ages 8 to 16."
  - title: "Creative Computing Curriculum (Harvard Graduate School of Education)"
    url: "https://creativecomputing.gse.harvard.edu/creative-computing-curriculum"
    note: "Seven units of Scratch activities, free to download and adapt."
  - title: "Scratch ideas and tutorials (MIT)"
    url: "https://scratch.mit.edu/ideas"
    note: "Step-by-step tutorials from the Scratch team."
---

Sit beside a child the first time they open Scratch. The cat appears. They make it move ten steps, then spin, then say "Hello!". They laugh. Ten minutes later they're clicking through the costume menu with no plan, and by the next weekend the laptop stays shut.

The child didn't lose interest in coding. They ran out of ideas, and nobody gave them a project which asked a bit more of them than the last one.

## "Copying a tutorial teaches my child to code"

Tutorials are a fine start. Scratch's own site has dozens, and a child who follows one ends up with a working game in an afternoon.

Then ask your child to change the game. Make the player faster. Add a second level. Many children freeze, because following steps and making decisions are different skills. A tutorial teaches the first. A project your child changes, breaks and fixes teaches the second.

:::pull
A tutorial gives your child someone else's game. Changing it is where the game becomes theirs.
:::

One rule applies to every idea below: after the tutorial or the first version, change three things nobody asked for. A new sprite, a new sound, a new rule. Those three changes are where the learning happens.

## The age ladder

The Scratch Foundation pitches ScratchJr at ages five to seven and Scratch at eight and up. Within Scratch, the skills stack in a rough order: movement and speech first, then scores, then copies of sprites and lists.

:::figure id="age-ladder"
:::

Age is a starting guess. A careful nine-year-old with a year of Scratch behind them belongs further up. A twelve-year-old opening Scratch for the first time starts at the beginning, and moves fast.

## Ages 5 to 7: ScratchJr

**1. The cow goes to the river.** A cow walks across a farm, stops at the river and drinks. Your child learns to join movement blocks in order, the idea every program rests on.

**2. A two-page story.** On page one, a hen meets a goat and they greet each other. On page two, they go to the market. Your child learns pages, speech and timing.

## Ages 8 to 9: animations and stories

**3. Animate your name.** Each letter of your child's name is a sprite. Clicking a letter makes it spin, change colour or play a sound. One idea, repeated with small changes, teaches events and loops.

**4. The talking matatu.** A matatu drives across a Nairobi backdrop, stops at a stage, and the conductor calls out the route. Your child learns glide blocks, waits, speech bubbles and broadcasts, the message one sprite sends to another.

## Ages 10 to 11: games with a score

**5. Catch the mandazi.** Mandazi fall from the top of the screen. A basket slides left and right with the arrow keys. Each catch adds a point. Here is the falling mandazi's script:

```scratch
when green flag clicked
go to x: (0) y: (170)
forever
  change y by (-4)
  if touching [Basket] then
    change [score] by (1)
    go to x: (pick random -200 to 200) y: (170)
  end
end
```

Your child will spot the gap within a minute: a mandazi which hits the floor never comes back. Fixing it with a second "if" block is the lesson.

**6. A Kiswahili vocabulary quiz.** The sprite asks "What is 'book' in Kiswahili?" and waits for an answer. Right answers add to the score, wrong ones show the correct word. Your child learns the ask block, if and else, and keeping score.

**7. The maze.** A sprite moves with the arrow keys through a maze your child draws. Touching a wall's colour sends it back. Drawing the maze is half the fun, and testing it teaches patience.

## Ages 12 to 13: bigger games

**8. A kikoy pattern machine.** With the pen extension, a loop draws coloured stripes across the screen, then repeats them with a new width each time. Your child learns nested loops and sees maths turn into a pattern.

**9. A platform game.** A character runs and jumps between platforms, pulled down by gravity. Your child builds gravity with a variable for speed, the same idea game engines use.

**10. Times-table trainer with a high-score list.** Ten quick questions against the clock, and the best scores saved in a list. Your child learns lists, timers and keeping the best scores in order.

## How to tell a project is finished

Children start ten projects and finish one. A finished project passes one test: someone else plays it without your child standing beside them to explain.

Ask for a title screen with instructions, a way to win or lose, and an ending. Then hand it to a cousin, a grandparent or a sibling, and watch without helping. Every question they ask is a fix for the next version.

:::note
Pick one idea from your child's age band this weekend. Agree on the three changes before they start, and write them on paper next to the laptop.
:::

## Look at the curriculum yourself

Harvard's Creative Computing Curriculum gives seven units of Scratch activities, free to download and adapt. Scratch's own ideas page has the tutorials. Read through one unit before you choose for your child.

For what a child's first month of coding looks like week by week, read [the first four weeks of coding](/academy/blog/first-four-weeks-of-coding/). Once the projects above feel easy, [what comes after Scratch](/academy/blog/what-comes-after-scratch/) covers the move to typed code.

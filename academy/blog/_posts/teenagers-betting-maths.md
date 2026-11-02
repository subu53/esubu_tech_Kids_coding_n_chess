---
title: "Your teenager and betting: the maths the odds don't show"
seo_title: "Teenagers and Betting in Kenya: The Maths Behind the Odds"
description: "82.81% of young Kenyans surveyed had placed a bet. Teach your teenager the maths in the odds, the built-in margin, and a 1,000-bet test they run in Python."
slug: teenagers-betting-maths
weight: 2
date: 2026-11-02
category: Maths
keyword: how to stop my child from betting
dek: "Lectures about betting bounce off teenagers. Maths doesn't. Show your child what the odds hide, in numbers they check themselves."
cover_line: "Betting: the maths in the odds"
related: [help-your-child-with-maths-at-home, future-jobs-kenya-developer-salary]
invite_title: "Maths your teenager puts to work"
invite_text: "Older students in our coding classes write programs like the one in this post: simulations, scores, chances. Tell me about your teenager and I'll say which group fits."
figures:
  betting-kenya:
    type: stats
    tag: "Kenya"
    title: "Young people, betting, and the new rules"
    items:
      - ["82.81%", "of young Kenyan respondents had placed a bet, the highest of six countries"]
      - ["76.53%", "of bettors across the six countries chose football"]
      - ["6am to 10pm", "no gambling adverts on TV or radio, except during live sport"]
    source: "GeoPoll, March 2024; Gambling Control Act 2025 via Afriwise"
  odds-margin:
    type: bars
    tag: "The maths"
    title: "Chances hidden inside one match's odds"
    unit: "%"
    max: 110
    highlight: "All three together"
    data:
      - ["Home win at 2.10", 47.6]
      - ["Draw at 3.30", 30.3]
      - ["Away win at 3.40", 29.4]
      - ["All three together", 107.3]
    source: "Worked example: chance = 1 divided by the odds"
    caption: "Real chances add up to 100%. The extra 7.3% is the margin built into the odds."
sources:
  - title: "Report: Betting in Africa 2024 (GeoPoll)"
    url: "https://www.geopoll.com/blog/report-betting-in-africa-2024/"
    note: "3,070 young people in six countries, March 2024. Kenya: 82.81% had placed a bet."
  - title: "Key provisions of the Gambling Control Act, 2025 (Afriwise)"
    url: "https://www.afriwise.com/blog/key-provisions-of-the-gambling-control-act-2025"
    note: "In force 26 August 2025. Under-age protection, no ads near learning institutions, no TV or radio ads from 06:00 to 22:00 except live sport."
  - title: "Gambling regulations to operationalise the Act (Afriwise, July 2026)"
    url: "https://www.afriwise.com/blog/introduction-of-comprehensive-gambling-regulations-to-operationalise-the-gambling-control-act-2025"
    note: "In force 30 June 2026: no ads targeting minors, no celebrities or influencers in ads."
  - title: "Kenya's new gambling law (TechCabal, November 2025)"
    url: "https://techcabal.com/2025/11/05/kenyas-new-gambling-law-wants-to-force-gamblers-to-save/"
    note: "The Gambling Regulatory Authority replaces the Betting Control and Licensing Board."
---

Your son comes home from school buzzing. A boy in his class turned 50 shillings into 4,000 on a weekend multibet. Everyone saw the screenshot. Your son wants to know why you won't let him try, when the boy's father doesn't mind.

You say betting is bad. He hears an adult who doesn't understand football. The conversation ends there, and the screenshot stays in his head.

## "My child is good with numbers, so he'll win"

Betting sells itself as a skill. Know your teams, read the form, pick well, and you beat the system. A teenager who knows every Premier League table believes it, and young Kenyans bet more than most. In a GeoPoll survey of young adults in six African countries in March 2024, 82.81% of the Kenyan respondents had placed a bet, the highest of the six.

:::figure id="betting-kenya"
:::

The law has moved. The Gambling Control Act came into force in August 2025, and rules in force since June 2026 ban gambling adverts aimed at minors and adverts with celebrities or influencers. Rules don't reach the screenshot in the WhatsApp group, though. Maths does.

## Show him the number inside the odds

Sit down with your teenager and one match. Say the odds read 2.10 for a home win, 3.30 for a draw and 3.40 for an away win.

Every odd hides a chance. Divide 1 by the odd and you get the chance the odds imply:

- Home win: 1 ÷ 2.10 = 47.6%
- Draw: 1 ÷ 3.30 = 30.3%
- Away win: 1 ÷ 3.40 = 29.4%

Now add them up. One of the three results always happens, so the real chances add up to exactly 100%. These add up to 107.3%.

:::figure id="odds-margin"
:::

The extra 7.3% is the margin, built into every set of odds. Work it through for the home win: take the margin out, and the true chance sits near 44.4%. Over many bets, every 100 shillings placed on it at 2.10 comes back as about 93. Your son loses close to seven shillings in every hundred, on average, no matter how well he knows the teams.

:::pull
The odds are a price, and the price already includes the company's cut. Knowing the teams changes which bet you lose on. The margin stays.
:::

## Let him run 1,000 bets in two minutes

A teenager trusts a result they produced more than one you told them. The short Python program below does the work. It starts with 1,000 shillings, places 10 shillings on the home win again and again, and stops after 1,000 bets or when the money runs out.

```python
import random

balance = 1000
bets = 0
while bets < 1000 and balance >= 10:
    balance -= 10
    bets += 1
    if random.random() < 0.444:   # the true chance of a home win
        balance += 10 * 2.10       # the payout at odds of 2.10
print("Bets placed:", bets, "Money left:", round(balance))
```

I ran it five times. The 1,000 shillings ended at 6, 93, 555, 345 and 702. One run went broke before the 1,000th bet. Not one run ended above where it started.

Then ask your son the question which matters. The run ending at 702 had good weeks along the way. If this player posted a screenshot on a good Saturday, what would the class see? Only the wins. The losses rarely reach the group.

:::note
Run the program together and change one number: the odds, or the size of each bet. Ask him to predict the result before pressing run.
:::

## Talk about money, and about who pays

Ask where the money for the adverts, the jerseys and the bonuses comes from. Bettors pay for all of it, through the margin, every week.

If your child is already betting, stay calm and keep talking. Ask to see the account, together. If there's debt or secrecy, bring in the school counsellor. The aim is a teenager who tells you the truth, not one who hides the phone.

## Check the maths yourself

Take any odds from any match, divide 1 by each one and add them up. You'll find the margin every time. Read the GeoPoll report and the summaries of the new law, linked below.

If your teenager has a gift for numbers, point it at something which rewards it: the same maths, used in data science, pays people to find patterns instead of paying a company to hide one. Our post on [the jobs growing fastest by 2030](/academy/blog/future-jobs-kenya-developer-salary/) is a good one to read together.
